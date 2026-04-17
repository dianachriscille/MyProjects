# EduCore ERP — NFR Design Patterns

## 1. NestJS Request Pipeline (Implementation Detail)

### Middleware → Guard → Interceptor → Pipe → Controller → Filter

```
Incoming Request
    |
    v
[1] SecurityHeadersMiddleware (global)
    - Sets CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
    - Applied to ALL routes
    |
    v
[2] ThrottlerGuard (selective)
    - Applied to auth-related endpoints only (/api/v1/auth/*)
    - Config: 10 requests per 60 seconds per IP
    - Returns 429 Too Many Requests when exceeded
    |
    v
[3] SupabaseAuthGuard (global, with exceptions)
    - Validates JWT from Authorization: Bearer <token> header
    - Calls Supabase to verify token signature, expiration, audience
    - Attaches decoded user payload to request.user
    - Skips: GET /api/v1/health (public)
    - Returns 401 Unauthorized on failure
    |
    v
[4] RolesGuard (per-endpoint via @Roles decorator)
    - Reads @Roles('admin','registrar') metadata from handler
    - Checks request.user.role against required roles
    - Returns 403 Forbidden if role not authorized
    |
    v
[5] ValidationPipe (global)
    - Transforms request body to DTO class instance
    - Validates using class-validator decorators
    - whitelist: true (strips unknown properties — SECURITY-13)
    - forbidNonWhitelisted: true (rejects unknown properties)
    - Returns 400 Bad Request with validation error details
    |
    v
[6] Controller Method
    - Executes business logic via injected service
    |
    v
[7] AuditInterceptor (global, POST/PATCH/DELETE only)
    - Captures: request.user.id, HTTP method, entity type (from route), entity ID (from params)
    - For PATCH: fetches old values before service call, captures new values after
    - Writes to audit_logs table via AuditService
    - Runs AFTER successful response (does not audit failed requests)
    |
    v
[8] GlobalExceptionFilter (global, catches all)
    - Catches HttpException: returns structured error response
    - Catches PrismaClientKnownRequestError: maps to HTTP error (see below)
    - Catches unknown errors: logs full error, returns generic 500
    - NEVER exposes stack traces, internal paths, or DB details in production
    |
    v
Response to Client
```

### Registration in AppModule

```typescript
// main.ts bootstrap pattern
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
app.useGlobalFilters(new GlobalExceptionFilter(), new PrismaExceptionFilter());
app.useGlobalInterceptors(new AuditInterceptor(auditService));
app.useGlobalGuards(new SupabaseAuthGuard(reflector), new RolesGuard(reflector));
// Middleware registered in AppModule.configure()
```

---

## 2. Error Handling Patterns

### Centralized PrismaExceptionFilter

```
Prisma Error Code → HTTP Response Mapping:

P2002 (Unique constraint)  → 409 Conflict
  { statusCode: 409, message: "Record already exists", field: <constraint_field> }

P2003 (Foreign key)        → 400 Bad Request
  { statusCode: 400, message: "Referenced record not found" }

P2025 (Record not found)   → 404 Not Found
  { statusCode: 404, message: "Record not found" }

All other Prisma errors    → 500 Internal Server Error
  { statusCode: 500, message: "An unexpected error occurred" }
  (full error logged server-side, never exposed to client)
```

### Standard Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "email must be a valid email address" },
    { "field": "firstName", "message": "firstName should not be empty" }
  ],
  "timestamp": "2025-04-17T15:00:00.000Z"
}
```

### Business Logic Exceptions

```
Custom exception classes extending HttpException:

EnrollmentStateException (400) — invalid state transition
  e.g., "Cannot approve enrollment with status 'draft'"

BillingOverpaymentException (400) — payment exceeds balance
  e.g., "Payment amount 5000 exceeds outstanding balance 3000"

DuplicateBillingException (409) — billing already exists
  e.g., "Billing already exists for this student and school year"
```

---

## 3. Deployment Architecture (Single Render Service)

### Build Pipeline

```
GitHub Push (main branch)
    |
    v
GitHub Actions Workflow
    |
    +-- Step 1: Checkout code
    +-- Step 2: Setup Node.js 20
    +-- Step 3: Install dependencies (npm ci)
    +-- Step 4: Run npm audit --audit-level=high
    +-- Step 5: TypeScript compilation check (npx tsc --noEmit)
    +-- Step 6: Run unit tests (npm test)
    +-- Step 7: Run Prisma migrate deploy (against Supabase)
    +-- Step 8: Trigger Render deploy hook (curl POST)
    |
    v
Render Build
    |
    +-- Step 1: Build Docker image from Dockerfile
    +-- Step 2: Deploy container
    +-- Step 3: Health check on /api/v1/health
```

### Monorepo Structure (Single Service)

```
educore-erp/
+-- apps/
|   +-- api/                    # NestJS backend
|   |   +-- src/
|   |   +-- prisma/
|   |   +-- tsconfig.json
|   +-- web/                    # Nuxt 3 frontend
|       +-- pages/
|       +-- components/
|       +-- nuxt.config.ts
+-- packages/
|   +-- shared/                 # Shared TypeScript types/DTOs
|       +-- src/
|       +-- tsconfig.json
+-- Dockerfile
+-- docker-compose.yml          # Local dev
+-- package.json                # Workspace root
+-- turbo.json                  # Turborepo (optional, for build orchestration)
```

### Dockerfile (Single Service Pattern)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci
COPY . .
RUN npm run build:web          # Build Nuxt 3 → .output/
RUN npm run build:api          # Build NestJS → dist/

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/web/.output ./public
COPY --from=builder /app/apps/api/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### NestJS Serves Nuxt Output

```typescript
// In main.ts or AppModule
// NestJS serves Nuxt 3 pre-rendered output as static files
// API routes: /api/v1/* handled by NestJS controllers
// All other routes: serve Nuxt .output/public/ (SSG/SSR output)
app.useStaticAssets(join(__dirname, '..', 'public', 'public'));
// Fallback: serve index.html for client-side routing
```

### Docker Compose (Local Development)

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NODE_ENV=development
    volumes:
      - ./apps/api/src:/app/apps/api/src
      - ./apps/web:/app/apps/web
```

---

## 4. Database Patterns

### Connection Pooling
- Prisma default connection pool (pool_size based on CPU cores)
- Supabase free tier: max 60 direct connections
- Connection string: `postgresql://...?pgbouncer=true&connection_limit=10`

### Migration Strategy (CI/CD)
```
GitHub Actions Step 7:
  npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

This runs BEFORE Render deployment:
- If migration fails → GitHub Actions fails → Render deploy NOT triggered
- If migration succeeds → Render deploy triggered
- Rollback: revert migration in code, push, CI/CD runs new migration
```

### Query Optimization Patterns
- Always use `select` to fetch only needed fields
- Use `include` sparingly (only when relations are needed)
- Pagination: cursor-based for large datasets, offset-based for MVP simplicity
- Indexes defined in Prisma schema:
  ```
  @@index([orgId, status])           // Student queries
  @@index([orgId, gradeLevel])       // Student filter
  @@index([studentId, schoolYearId]) // Billing lookup
  @@index([billingId])               // Payment lookup
  @@index([entityType, entityId])    // Audit log queries
  @@index([orgId, createdAt])        // Audit log date filter
  ```

---

## 5. Authentication Flow (Supabase Integration)

### Login Flow
```
Browser                    Nuxt 3                  Supabase Auth
   |                         |                         |
   |-- Enter email/password ->|                         |
   |                         |-- signInWithPassword() ->|
   |                         |                         |-- Validate credentials
   |                         |                         |-- Generate JWT + refresh
   |                         |<-- { access_token,    --|
   |                         |     refresh_token }     |
   |                         |                         |
   |                         |-- Store in cookie       |
   |<-- Redirect to dashboard|                         |
```

### API Request Flow
```
Browser                    Nuxt 3                  NestJS API            Supabase
   |                         |                         |                    |
   |-- Click "Students"   -->|                         |                    |
   |                         |-- GET /api/v1/students ->|                    |
   |                         |   Authorization: Bearer  |                    |
   |                         |   <access_token>         |                    |
   |                         |                         |-- Verify JWT ------>|
   |                         |                         |<-- User payload ----|
   |                         |                         |                    |
   |                         |                         |-- Check @Roles()   |
   |                         |                         |-- Query Prisma     |
   |                         |<-- 200 { students[] } --|                    |
   |<-- Render student list --|                         |                    |
```

### Token Refresh Pattern
```
Nuxt 3 middleware (auth.global.ts):
  - On every route navigation, check if access_token is expired
  - If expired: call Supabase refreshSession()
  - If refresh fails: redirect to /login
  - If refresh succeeds: update cookie, continue navigation
```

### SupabaseAuthGuard Implementation Pattern
```typescript
// Extracts JWT from Authorization header
// Calls supabase.auth.getUser(token) to validate
// Attaches user metadata (id, email, role) to request
// Role stored in Supabase user_metadata or app_metadata
// Throws UnauthorizedException on invalid/expired token
```
