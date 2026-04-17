# EduCore ERP — Component Dependencies

## Dependency Matrix

| Module | Depends On | Communication | Dependency Type |
|--------|-----------|---------------|-----------------|
| CoreModule | — (no dependencies) | — | Foundation |
| AcademicModule | CoreModule | Direct import (Prisma, Guards) | Build-time |
| AcademicModule | EventEmitter2 | Publishes events | Runtime (async) |
| FinanceModule | CoreModule | Direct import (Prisma, Guards) | Build-time |
| FinanceModule | EventEmitter2 | Subscribes to events | Runtime (async) |
| AdminModule | CoreModule | Direct import (Prisma, Guards) | Build-time |
| AdminModule | Supabase Client | HTTP calls to Supabase Auth API | Runtime (external) |

## Dependency Diagram

```
+-------------------------------------------------------+
|                      AppModule                        |
|                                                       |
|  +--------------------------------------------------+ |
|  |                  CoreModule                       | |
|  |  PrismaService | AuthGuard | RolesGuard          | |
|  |  AuditInterceptor | ExceptionFilter              | |
|  +--------------------------------------------------+ |
|       ^                ^                ^              |
|       | imports         | imports        | imports     |
|       |                 |                |             |
|  +------------+   +------------+   +------------+     |
|  | Academic   |   | Finance    |   | Admin      |     |
|  | Module     |   | Module     |   | Module     |     |
|  +------------+   +------------+   +------------+     |
|       |                 ^                              |
|       | emits events    | listens                      |
|       +-----> EventBus -+                              |
+-------------------------------------------------------+
```

## Key Design Rules

1. **No circular dependencies**: Modules only depend on CoreModule, never on each other directly
2. **Event-driven coupling**: AcademicModule and FinanceModule communicate only via events
3. **CoreModule is stateless**: Provides infrastructure services only (Prisma, guards, interceptors)
4. **AdminModule is independent**: User management and audit viewing don't depend on Academic or Finance
5. **Supabase is external**: Only AdminModule (UserService) and CoreModule (AuthGuard) call Supabase APIs

## Data Flow Patterns

### Read Operations
```
Client --> Controller --> Service --> PrismaService --> PostgreSQL
                                                          |
Client <-- Controller <-- Service <-- PrismaService <-----+
```

### Write Operations (with audit)
```
Client --> Controller --> Service --> PrismaService --> PostgreSQL
                |                                         |
                +--> AuditInterceptor --> audit_logs ------+
                |
                +--> EventEmitter --> Listeners (async)
```

### Authentication Flow
```
Client --> Supabase Auth (login) --> JWT token
Client --> API (with JWT) --> SupabaseAuthGuard --> RolesGuard --> Controller
```

## External Dependencies

| External Service | Used By | Purpose | Free Tier Limit |
|-----------------|---------|---------|-----------------|
| Supabase Auth | CoreModule, AdminModule | JWT validation, user provisioning | 50K MAU |
| Supabase DB | CoreModule (Prisma) | PostgreSQL database | 500MB, 2 projects |
| Supabase Storage | AdminModule | Document/export storage | 1GB |
| Render | Deployment | NestJS + Nuxt hosting | 750 hrs/month |
| Cloudflare | CDN/DNS | SSL, caching, DDoS protection | Unlimited |
| GitHub | CI/CD | Source control, Actions | 2000 min/month |
