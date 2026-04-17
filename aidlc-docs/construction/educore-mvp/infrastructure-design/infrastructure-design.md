# EduCore ERP — Infrastructure Design

## 1. Infrastructure Service Mapping

| Logical Component | Infrastructure Service | Tier | Config |
|-------------------|----------------------|------|--------|
| Application Server | Render Web Service | Free | Docker, auto-deploy from GitHub |
| PostgreSQL Database | Supabase (managed) | Free | 500MB, SSL required, daily backups |
| Authentication | Supabase Auth | Free | 50K MAU, email/password, MFA |
| File Storage | Supabase Storage | Free | 1GB, private buckets |
| DNS | Cloudflare | Free | Render subdomain (no custom domain) |
| SSL/TLS | Render (auto) | Free | Auto-provisioned Let's Encrypt |
| DDoS Protection | Cloudflare | Free | Basic DDoS mitigation |
| CI/CD | GitHub Actions | Free | 2000 min/month |
| Source Control | GitHub | Free | Private repository |
| Container Registry | Render (built-in) | Free | Builds from Dockerfile |

## 2. Network Architecture

```
+-----------------------------------------------------------+
|                        Internet                           |
+-----------------------------------------------------------+
                           |
                           v
+-----------------------------------------------------------+
|                  Cloudflare (DNS only)                    |
|  educore-mvp.onrender.com -> Render IP                   |
|  (No custom domain for MVP)                              |
+-----------------------------------------------------------+
                           |
                           | HTTPS (TLS 1.2+)
                           v
+-----------------------------------------------------------+
|              Render Web Service (Free Tier)               |
|                                                           |
|  Docker Container (Node.js 20 Alpine)                    |
|  +-----------------------------------------------------+ |
|  |  Port 3000                                           | |
|  |                                                      | |
|  |  /api/v1/*  --> NestJS Controllers                   | |
|  |  /*         --> Nuxt 3 Static Output                 | |
|  +-----------------------------------------------------+ |
|                                                           |
|  RAM: 512MB | CPU: 0.1 | Auto-sleep: 15 min             |
+-----------------------------------------------------------+
         |                              |
         | SSL (Prisma)                 | HTTPS
         v                              v
+--------------------+      +--------------------+
| Supabase DB        |      | Supabase Auth      |
| (PostgreSQL 15)    |      | + Storage           |
|                    |      |                    |
| Region: Southeast  |      | JWT issuer         |
| Asia (Singapore)   |      | File uploads       |
| 500MB storage      |      | 1GB storage        |
| 60 max connections |      | 50K MAU            |
+--------------------+      +--------------------+
```

## 3. Environment Configuration

### Strategy
- `.env.development` — committed to repo with LOCAL/non-sensitive values only
- `.env.production` — NOT committed; values set directly in Render dashboard env vars
- `.gitignore` includes `.env.production` and `.env.local`

### .env.development (committed — safe local values)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/educore_dev
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-key
JWT_SECRET=dev-jwt-secret-not-for-production
CORS_ORIGIN=http://localhost:3000
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### Render Environment Variables (production — never in git)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=<supabase-production-connection-string>
SUPABASE_URL=<supabase-production-url>
SUPABASE_ANON_KEY=<supabase-production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-production-service-key>
JWT_SECRET=<supabase-production-jwt-secret>
CORS_ORIGIN=https://educore-mvp.onrender.com
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### .gitignore additions
```
.env.production
.env.local
.env*.local
```

**SECURITY-12 compliance**: No production credentials in source code. `.env.development` contains only local dev values. Production secrets managed exclusively via Render dashboard.

## 4. Local Development Setup (Docker Compose)

### docker-compose.yml
```yaml
version: "3.8"
services:
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: educore_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/educore_dev
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    volumes:
      - ./apps/api/src:/app/apps/api/src
      - ./apps/web:/app/apps/web
      - ./packages:/app/packages
    depends_on:
      - db
    command: npm run dev

volumes:
  pgdata:
```

### Dockerfile.dev (development — hot reload)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install
COPY . .
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### Developer Workflow
```
1. Clone repo:     git clone <repo-url> && cd educore-erp
2. Copy env:       cp .env.development .env
3. Start stack:    docker-compose up -d
4. Run migrations: docker-compose exec app npx prisma migrate dev
5. Seed data:      docker-compose exec app npx prisma db seed
6. Open browser:   http://localhost:3000
7. Develop:        Edit files in apps/api/src or apps/web — hot reload active
8. Stop:           docker-compose down
```

## 5. CI/CD Pipeline (GitHub Actions)

### .github/workflows/deploy.yml
```yaml
name: Deploy EduCore ERP

on:
  push:
    branches: [main]

env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Security audit
        run: npm audit --audit-level=high

      - name: TypeScript check
        run: npx tsc --noEmit --project apps/api/tsconfig.json

      - name: Run unit tests
        run: npm test

      - name: Run database migrations
        run: npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

      - name: Trigger Render deploy
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

### GitHub Secrets Required
| Secret | Description |
|--------|-------------|
| DATABASE_URL | Supabase production connection string (for migrations) |
| RENDER_DEPLOY_HOOK_URL | Render deploy hook URL (from Render dashboard) |

## 6. Production Dockerfile

```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/web
RUN npm run build --workspace=apps/api
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/web/.output/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Image Size Optimization
- Alpine base: ~50MB
- Multi-stage build: only production artifacts in final image
- `npm ci` with `--production` not needed (deps already pruned by multi-stage)
- Expected final image: ~150-200MB

## 7. Supabase Project Setup

### Required Configuration
```
1. Create Supabase project (free tier)
   - Region: Southeast Asia (Singapore) — closest to Philippines
   - Database password: generate strong password

2. Get connection details:
   - DATABASE_URL (Settings → Database → Connection string → URI)
   - SUPABASE_URL (Settings → API → Project URL)
   - SUPABASE_ANON_KEY (Settings → API → anon/public key)
   - SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role key)
   - JWT_SECRET (Settings → API → JWT Secret)

3. Configure Auth:
   - Enable email/password provider
   - Set minimum password length: 8
   - Enable MFA (TOTP) for admin accounts
   - Set JWT expiry: 3600 seconds (1 hour)

4. Configure Storage:
   - Create bucket: "exports" (private)
   - Set max file size: 10MB
```

## 8. Render Service Setup

### Required Configuration
```
1. Create Web Service:
   - Name: educore-mvp
   - Environment: Docker
   - Branch: main
   - Auto-Deploy: Yes

2. Set environment variables (from Supabase):
   - NODE_ENV=production
   - DATABASE_URL=<from-supabase>
   - SUPABASE_URL=<from-supabase>
   - SUPABASE_ANON_KEY=<from-supabase>
   - SUPABASE_SERVICE_ROLE_KEY=<from-supabase>
   - JWT_SECRET=<from-supabase>
   - CORS_ORIGIN=https://educore-mvp.onrender.com
   - THROTTLE_TTL=60
   - THROTTLE_LIMIT=10

3. Get deploy hook URL:
   - Settings → Deploy Hook → Copy URL
   - Add to GitHub Secrets as RENDER_DEPLOY_HOOK_URL
```
