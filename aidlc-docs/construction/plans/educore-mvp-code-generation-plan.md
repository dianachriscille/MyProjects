# Code Generation Plan — educore-mvp

## Unit Context
- **Unit**: educore-mvp (single modular monolith)
- **Workspace Root**: /Users/mchalley/MyProjects
- **Code Location**: /Users/mchalley/MyProjects (workspace root)
- **Documentation**: /Users/mchalley/MyProjects/aidlc-docs/construction/educore-mvp/code/
- **Project Type**: Greenfield single unit (monorepo)
- **Stories**: All 14 stories across 4 epics

## Monorepo Structure
```
/Users/mchalley/MyProjects/
+-- apps/
|   +-- api/                    # NestJS backend
|   |   +-- src/
|   |   |   +-- core/           # CoreModule
|   |   |   +-- academic/       # AcademicModule
|   |   |   +-- finance/        # FinanceModule
|   |   |   +-- admin/          # AdminModule
|   |   |   +-- app.module.ts
|   |   |   +-- main.ts
|   |   +-- prisma/
|   |   |   +-- schema.prisma
|   |   |   +-- seed.ts
|   |   +-- test/
|   |   +-- package.json
|   |   +-- tsconfig.json
|   +-- web/                    # Nuxt 3 frontend
|       +-- pages/
|       +-- components/
|       +-- composables/
|       +-- middleware/
|       +-- layouts/
|       +-- nuxt.config.ts
|       +-- package.json
+-- packages/
|   +-- shared/                 # Shared TypeScript types
|       +-- src/
|       +-- package.json
+-- .env.development
+-- .gitignore
+-- docker-compose.yml
+-- Dockerfile
+-- Dockerfile.dev
+-- package.json
+-- .github/workflows/deploy.yml
```

## Story Mapping
| Step | Stories Covered |
|------|----------------|
| Step 1 (Project Setup) | — (infrastructure) |
| Step 2 (Prisma Schema) | — (data layer) |
| Step 3 (CoreModule) | 1.1 (Login), cross-cutting security |
| Step 4 (AcademicModule) | 2.1, 2.2, 2.3, 4.1, 4.2, 4.3 |
| Step 5 (FinanceModule) | 3.1, 3.2, 3.3, 3.4 |
| Step 6 (AdminModule) | 1.2, 1.3, 1.4 |
| Step 7 (Backend Tests) | All stories (unit tests) |
| Step 8 (Shared Types) | — (shared DTOs) |
| Step 9 (Frontend Layout + Auth) | 1.1 (Login) |
| Step 10 (Frontend Academic Pages) | 2.1, 2.2, 2.3, 4.1 |
| Step 11 (Frontend Finance Pages) | 3.1, 3.2, 3.3, 3.4 |
| Step 12 (Frontend Admin Pages) | 1.2, 1.3, 1.4, 4.2, 4.3 |
| Step 13 (Deployment Artifacts) | — (Docker, CI/CD, env) |
| Step 14 (Documentation) | — (README, API docs) |

---

## Code Generation Steps

### Step 1: Project Structure Setup
- [x] Initialize monorepo with root package.json (npm workspaces)
- [x] Create apps/api/ with NestJS scaffold (package.json, tsconfig.json, nest-cli.json)
- [x] Create apps/web/ with Nuxt 3 scaffold (package.json, nuxt.config.ts, tsconfig.json)
- [x] Create packages/shared/ with TypeScript scaffold
- [x] Create .env.development with local dev values
- [x] Create .gitignore (node_modules, dist, .output, .env.production, .env.local)

### Step 2: Database Schema + Migrations
- [x] Create apps/api/prisma/schema.prisma with all 9 entities (Organization, SchoolYear, User, Student, Enrollment, Billing, BillingItem, Payment, AuditLog)
- [x] Define all indexes, unique constraints, and relations per domain-entities.md
- [x] Create apps/api/prisma/seed.ts with initial data (default org, admin user, school year)

### Step 3: CoreModule (Backend)
- [x] Create apps/api/src/core/core.module.ts
- [x] Create apps/api/src/core/prisma.service.ts (PrismaService)
- [x] Create apps/api/src/core/guards/supabase-auth.guard.ts (SupabaseAuthGuard)
- [x] Create apps/api/src/core/guards/roles.guard.ts (RolesGuard)
- [x] Create apps/api/src/core/decorators/roles.decorator.ts (@Roles)
- [x] Create apps/api/src/core/decorators/public.decorator.ts (@Public)
- [x] Create apps/api/src/core/interceptors/audit.interceptor.ts (AuditInterceptor)
- [x] Create apps/api/src/core/filters/global-exception.filter.ts
- [x] Create apps/api/src/core/filters/prisma-exception.filter.ts
- [x] Create apps/api/src/core/middleware/security-headers.middleware.ts
- [x] Create apps/api/src/core/health/health.controller.ts (GET /api/v1/health)

### Step 4: AcademicModule (Backend)
- [x] Create apps/api/src/academic/academic.module.ts
- [x] Create apps/api/src/academic/student/student.controller.ts (CRUD + export + delete)
- [x] Create apps/api/src/academic/student/student.service.ts (business logic)
- [x] Create apps/api/src/academic/student/dto/ (CreateStudentDto, UpdateStudentDto, StudentQueryDto)
- [x] Create apps/api/src/academic/enrollment/enrollment.controller.ts (create, submit, approve, reject)
- [x] Create apps/api/src/academic/enrollment/enrollment.service.ts (state machine)
- [x] Create apps/api/src/academic/enrollment/dto/ (CreateEnrollmentDto, EnrollmentQueryDto)
- [x] Create apps/api/src/academic/events/ (EnrollmentApprovedEvent, StudentDeletedEvent)

### Step 5: FinanceModule (Backend)
- [x] Create apps/api/src/finance/finance.module.ts
- [x] Create apps/api/src/finance/billing/billing.controller.ts (create, bulk, list)
- [x] Create apps/api/src/finance/billing/billing.service.ts (individual + bulk + lifecycle)
- [x] Create apps/api/src/finance/billing/dto/ (CreateBillingDto, CreateBulkBillingDto, BillingQueryDto)
- [x] Create apps/api/src/finance/payment/payment.controller.ts (create, list)
- [x] Create apps/api/src/finance/payment/payment.service.ts (record + balance calc)
- [x] Create apps/api/src/finance/payment/dto/ (CreatePaymentDto)
- [x] Create apps/api/src/finance/listeners/finance-event.listener.ts (EnrollmentApproved listener)

### Step 6: AdminModule (Backend)
- [x] Create apps/api/src/admin/admin.module.ts
- [x] Create apps/api/src/admin/user/user.controller.ts (CRUD + deactivate)
- [x] Create apps/api/src/admin/user/user.service.ts (+ Supabase Auth sync)
- [x] Create apps/api/src/admin/user/dto/ (CreateUserDto, UpdateUserDto, UserQueryDto)
- [x] Create apps/api/src/admin/audit/audit.controller.ts (list + filter)
- [x] Create apps/api/src/admin/audit/audit.service.ts (query + log)
- [x] Create apps/api/src/admin/report/report.controller.ts (CSV exports)
- [x] Create apps/api/src/admin/report/report.service.ts (student list, enrollment summary, billing summary)
- [x] Create apps/api/src/admin/org/org.controller.ts (get + update profile)
- [x] Create apps/api/src/admin/org/org.service.ts
- [x] Create apps/api/src/app.module.ts (root module importing all)
- [x] Create apps/api/src/main.ts (bootstrap with global pipes, filters, guards, interceptors)

### Step 7: Backend Unit Tests
- [x] Create apps/api/test/academic/enrollment.service.spec.ts (state machine transitions)
- [x] Create apps/api/test/finance/billing.service.spec.ts (balance calculation, bulk billing)
- [x] Create apps/api/test/finance/payment.service.spec.ts (overpayment prevention)
- [x] Create apps/api/test/core/roles.guard.spec.ts (RBAC enforcement)

### Step 8: Shared Types Package
- [x] Create packages/shared/src/types/ (User, Student, Enrollment, Billing, Payment types)
- [x] Create packages/shared/src/enums/ (Role, EnrollmentStatus, BillingStatus, GradeLevel)
- [x] Create packages/shared/src/index.ts (barrel export)

### Step 9: Frontend — Layout + Auth
- [x] Create apps/web/nuxt.config.ts (Vuetify plugin, Supabase module, runtime config)
- [x] Create apps/web/plugins/vuetify.ts (Vuetify 3 setup)
- [x] Create apps/web/layouts/default.vue (sidebar + appbar)
- [x] Create apps/web/layouts/auth.vue (public layout)
- [x] Create apps/web/middleware/auth.global.ts (auth check + token refresh)
- [x] Create apps/web/composables/useApi.ts (API client with auth headers)
- [x] Create apps/web/pages/login.vue (email/password form)
- [x] Create apps/web/pages/index.vue (dashboard redirect by role)

### Step 10: Frontend — Academic Pages
- [x] Create apps/web/pages/students/index.vue (student list + search + filter)
- [x] Create apps/web/pages/students/[id].vue (student detail/edit)
- [x] Create apps/web/pages/enrollments/index.vue (enrollment queue)
- [x] Create apps/web/pages/enrollments/new.vue (multi-step enrollment form with DPA consent)
- [x] Create apps/web/pages/enrollments/[id].vue (enrollment detail + approve/reject)
- [x] Create apps/web/components/StatusChip.vue
- [x] Create apps/web/components/AddressForm.vue
- [x] Create apps/web/components/PhoneInput.vue

### Step 11: Frontend — Finance Pages
- [x] Create apps/web/pages/billing/index.vue (billing list + filter)
- [x] Create apps/web/pages/billing/new.vue (individual billing with line items)
- [x] Create apps/web/pages/billing/bulk.vue (bulk billing with preview)
- [x] Create apps/web/pages/billing/[id].vue (billing detail + payments + record payment dialog)
- [x] Create apps/web/components/CurrencyDisplay.vue

### Step 12: Frontend — Admin Pages
- [x] Create apps/web/pages/users/index.vue (user list)
- [x] Create apps/web/pages/users/new.vue (create user form)
- [x] Create apps/web/pages/audit-logs/index.vue (audit log viewer)
- [x] Create apps/web/pages/reports/index.vue (report selection + CSV download)
- [x] Create apps/web/pages/settings/index.vue (org profile)
- [x] Create apps/web/components/AppSidebar.vue (role-based navigation)
- [x] Create apps/web/components/AppBar.vue
- [x] Create apps/web/components/ConfirmDialog.vue

### Step 13: Deployment Artifacts
- [x] Create Dockerfile (production multi-stage)
- [x] Create Dockerfile.dev (development with hot reload)
- [x] Create docker-compose.yml (local dev)
- [x] Create .github/workflows/deploy.yml (CI/CD pipeline)

### Step 14: Documentation + Summary
- [x] Create README.md (project overview, setup instructions, architecture)
- [x] Create aidlc-docs/construction/educore-mvp/code/code-generation-summary.md
