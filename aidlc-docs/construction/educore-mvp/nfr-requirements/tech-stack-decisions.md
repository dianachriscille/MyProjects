# EduCore ERP — Tech Stack Decisions

## Final Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Runtime** | Node.js | 20 LTS | Long-term support; NestJS recommended version |
| **Backend Framework** | NestJS | 10.x | Modular architecture; TypeScript; decorator-based DI; enterprise patterns |
| **Frontend Framework** | Nuxt 3 | 3.x | Vue 3 SSR; file-based routing; auto-imports; good PH internet performance |
| **UI Library** | Vuetify 3 | 3.x | Material Design; rich data tables; form components; free |
| **Language** | TypeScript | 5.x | End-to-end type safety; better DX for small team |
| **ORM** | Prisma | 5.x | Type-safe queries; auto-generated types; migration management |
| **Database** | PostgreSQL | 15 | Via Supabase; JSONB support; partial unique indexes; encryption at rest |
| **Auth Provider** | Supabase Auth | — | Free 50K MAU; JWT-based; email/password; MFA support |
| **Database Hosting** | Supabase | Free tier | 500MB storage; daily backups; managed PostgreSQL |
| **App Hosting** | Render | Free tier | Auto-deploy from GitHub; Docker support; SSL included |
| **CDN/DNS** | Cloudflare | Free tier | DDoS protection; SSL; edge caching; DNS management |
| **CI/CD** | GitHub Actions | Free tier | 2000 min/month; auto-deploy to Render on push |
| **Containerization** | Docker | — | Local dev parity; Render deployment via Dockerfile |
| **Validation** | class-validator | — | Decorator-based validation; integrates with NestJS ValidationPipe |
| **Event Bus** | @nestjs/event-emitter | — | EventEmitter2; async event-driven module communication |
| **Rate Limiting** | @nestjs/throttler | — | Configurable rate limiting; decorator-based |
| **CSV Export** | json2csv | — | Simple JSON-to-CSV conversion for reports |
| **Source Control** | GitHub | — | Free private repos; Actions integration; team collaboration |

## Key Dependencies (package.json)

### Backend (NestJS)
```
@nestjs/core, @nestjs/common, @nestjs/platform-express
@nestjs/event-emitter          # Event-driven communication
@nestjs/throttler               # Rate limiting
@prisma/client                  # Database ORM
@supabase/supabase-js           # Supabase Auth client
class-validator                 # Input validation
class-transformer               # DTO transformation
json2csv                        # CSV report generation
```

### Frontend (Nuxt 3)
```
nuxt                            # Framework
vuetify                         # UI component library
@mdi/font                       # Material Design Icons
@nuxtjs/supabase                # Supabase Nuxt module (auth client)
```

### Dev Dependencies
```
prisma                          # Migration CLI
typescript                      # Compiler
@types/node                     # Node.js types
eslint, prettier                # Code quality
```

## Infrastructure Architecture

```
+-------------------+     +-------------------+     +-------------------+
|    Cloudflare     |     |      Render       |     |     Supabase      |
|    (CDN/DNS)      |     |    (App Host)     |     |   (DB + Auth)     |
+-------------------+     +-------------------+     +-------------------+
| - DNS management  |     | - NestJS API      |     | - PostgreSQL 15   |
| - SSL termination | --> | - Nuxt 3 SSR      | --> | - Auth (JWT)      |
| - DDoS protection |     | - Docker container |     | - Storage (1GB)   |
| - Edge caching    |     | - Auto-deploy     |     | - Daily backups   |
| - Free tier       |     | - Free tier       |     | - Free tier       |
+-------------------+     +-------------------+     +-------------------+
```

## Deployment Model

```
GitHub (push to main)
    |
    v
GitHub Actions
    |
    +-- Run npm audit (dependency vulnerability check)
    +-- Run TypeScript compilation check
    +-- Run unit tests
    +-- Trigger Render deploy (via deploy hook)
    |
    v
Render (auto-build)
    |
    +-- Build Docker image (Dockerfile)
    +-- Deploy container
    +-- Serve on HTTPS
```

## Environment Variables

| Variable | Source | Description |
|----------|--------|-------------|
| DATABASE_URL | Supabase | PostgreSQL connection string (SSL required) |
| SUPABASE_URL | Supabase | Supabase project URL |
| SUPABASE_ANON_KEY | Supabase | Supabase anonymous/public key |
| SUPABASE_SERVICE_ROLE_KEY | Supabase | Supabase service role key (server-side only) |
| JWT_SECRET | Supabase | JWT secret for token validation |
| NODE_ENV | Render | production |
| CORS_ORIGIN | Render | Frontend URL for CORS whitelist |
| THROTTLE_TTL | Config | Rate limit window (seconds) |
| THROTTLE_LIMIT | Config | Max requests per window |

## Free Tier Limits

| Service | Limit | Impact |
|---------|-------|--------|
| Render | 750 hrs/month, 512MB RAM, auto-sleep | Cold starts after inactivity |
| Supabase DB | 500MB storage, 2 projects | Sufficient for 1-5 schools MVP |
| Supabase Auth | 50K MAU | Far exceeds MVP needs |
| Supabase Storage | 1GB | Sufficient for CSV exports |
| Cloudflare | Unlimited requests | No limit concerns |
| GitHub Actions | 2000 min/month | ~66 builds at 30 min each |

## Post-MVP Upgrade Path

| Current (Free) | Upgrade To | Trigger |
|----------------|-----------|---------|
| Render free | Render Starter ($7/mo) | Need always-on (no auto-sleep) |
| Supabase free | Supabase Pro ($25/mo) | Exceed 500MB DB or need point-in-time recovery |
| Console logging | Sentry free tier | Need automated error alerting |
| No monitoring | Grafana Cloud free | Need dashboards and metrics |
| Single region | Multi-region Render | Need low latency across PH |
