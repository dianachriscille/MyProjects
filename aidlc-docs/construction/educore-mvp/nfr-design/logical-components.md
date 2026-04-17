# EduCore ERP — Logical Components

## Component Map

```
+---------------------------------------------------------------+
|                     Single Render Service                     |
|                                                               |
|  +-------------------------+  +----------------------------+  |
|  |     NestJS API          |  |    Nuxt 3 Static Output    |  |
|  |     (Port 3000)         |  |    (Served by NestJS)      |  |
|  |                         |  |                            |  |
|  |  /api/v1/* -> Controllers|  |  /* -> Static HTML/JS/CSS  |  |
|  +-------------------------+  +----------------------------+  |
|                                                               |
|  +----------------------------------------------------------+ |
|  |              NestJS Middleware Pipeline                    | |
|  |  SecurityHeaders -> Throttler -> AuthGuard -> RolesGuard  | |
|  |  -> ValidationPipe -> Controller -> AuditInterceptor      | |
|  |  -> ExceptionFilter                                       | |
|  +----------------------------------------------------------+ |
+---------------------------------------------------------------+
         |                    |                    |
         v                    v                    v
+----------------+  +------------------+  +----------------+
| Supabase DB    |  | Supabase Auth    |  | Supabase       |
| (PostgreSQL)   |  | (JWT Provider)   |  | Storage        |
|                |  |                  |  | (CSV exports)  |
| - organizations|  | - User accounts  |  |                |
| - users        |  | - JWT tokens     |  | - 1GB free     |
| - students     |  | - Password hash  |  |                |
| - enrollments  |  | - MFA (admin)    |  |                |
| - billing      |  | - 50K MAU free   |  |                |
| - billing_items|  |                  |  |                |
| - payments     |  |                  |  |                |
| - audit_logs   |  |                  |  |                |
| - school_years |  |                  |  |                |
+----------------+  +------------------+  +----------------+
         |
         v
+----------------+
| Cloudflare     |
| (CDN/DNS/SSL)  |
|                |
| - DNS routing  |
| - SSL/TLS      |
| - DDoS protect |
| - Edge cache   |
+----------------+
```

## Logical Component Inventory

### 1. Application Components (NestJS)

| Component | Type | Responsibility | SECURITY Rule |
|-----------|------|---------------|---------------|
| SecurityHeadersMiddleware | Middleware | HTTP security headers | SECURITY-04 |
| ThrottlerGuard | Guard | Rate limiting on auth endpoints | SECURITY-11, 12 |
| SupabaseAuthGuard | Guard | JWT validation, user extraction | SECURITY-08 |
| RolesGuard | Guard | RBAC enforcement per endpoint | SECURITY-06, 08 |
| ValidationPipe | Pipe | Input validation, whitelist | SECURITY-05 |
| AuditInterceptor | Interceptor | Mutation logging to audit_logs | SECURITY-13, 14 |
| PrismaExceptionFilter | Filter | Prisma error → HTTP error mapping | SECURITY-09, 15 |
| GlobalExceptionFilter | Filter | Catch-all, safe error responses | SECURITY-09, 15 |
| PrismaService | Provider | Database connection lifecycle | — |
| EventEmitterService | Provider | Domain event publishing | — |

### 2. External Service Components

| Component | Provider | Integration | Free Tier |
|-----------|----------|-------------|-----------|
| PostgreSQL Database | Supabase | Prisma ORM via DATABASE_URL | 500MB |
| Authentication | Supabase Auth | @supabase/supabase-js SDK | 50K MAU |
| File Storage | Supabase Storage | @supabase/supabase-js SDK | 1GB |
| DNS + CDN + SSL | Cloudflare | DNS records pointing to Render | Unlimited |
| App Hosting | Render | Docker container deployment | 750 hrs/mo |
| CI/CD | GitHub Actions | Workflow on push to main | 2000 min/mo |
| Source Control | GitHub | Git repository | Free |

### 3. Data Flow Components

| Flow | Source | Destination | Pattern |
|------|--------|-------------|---------|
| API Request | Browser | NestJS Controller | HTTP REST via Cloudflare |
| DB Query | NestJS Service | Supabase PostgreSQL | Prisma Client (SSL) |
| Auth Login | Browser | Supabase Auth | Direct SDK call |
| Auth Verify | NestJS Guard | Supabase Auth | getUser(token) API |
| Audit Write | AuditInterceptor | audit_logs table | Prisma insert (async) |
| Event Publish | Service | EventEmitter2 | In-process async |
| Event Subscribe | EventEmitter2 | Listener Service | In-process async |
| CSV Export | ReportService | Browser | Stream response |
| Static Assets | Nuxt .output | Browser | NestJS static serve |

### 4. Configuration Components

| Config | Source | Scope |
|--------|--------|-------|
| DATABASE_URL | Render env var | Prisma connection |
| SUPABASE_URL | Render env var | Auth + Storage SDK |
| SUPABASE_ANON_KEY | Render env var | Frontend auth client |
| SUPABASE_SERVICE_ROLE_KEY | Render env var | Backend admin operations |
| NODE_ENV | Render env var | production/development |
| CORS_ORIGIN | Render env var | Allowed frontend origin |
| THROTTLE_TTL | Render env var | Rate limit window (60s) |
| THROTTLE_LIMIT | Render env var | Rate limit max (10) |

## Resilience Patterns (MVP)

| Pattern | Implementation | Scope |
|---------|---------------|-------|
| Graceful degradation | GlobalExceptionFilter returns safe errors | All endpoints |
| Connection retry | Prisma auto-reconnect on transient DB errors | Database |
| Input sanitization | ValidationPipe whitelist strips unknown fields | All endpoints |
| Fail closed | Auth/RBAC guards deny by default | All protected endpoints |
| Idempotency | Unique constraints prevent duplicate billing/enrollment | Business logic |

## Scalability Path (Post-MVP)

| Current | Future | Trigger |
|---------|--------|---------|
| Single Render service | Separate API + Frontend services | Need independent scaling |
| In-process EventEmitter | Redis pub/sub or message queue | Extract to microservices |
| Prisma direct connection | PgBouncer connection pooling | > 60 concurrent connections |
| Single region | Multi-region Render | PH latency requirements |
| No cache | Redis cache (Upstash free) | Repeated expensive queries |
