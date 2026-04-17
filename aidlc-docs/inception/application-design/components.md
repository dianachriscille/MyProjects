# EduCore ERP — Component Inventory

## Module Architecture (Bounded Context Organization)

```
+-------------------------------------------------------+
|                    AppModule (Root)                    |
|                                                       |
|  +------------------+  +---------------------------+  |
|  |   CoreModule     |  |    AcademicModule         |  |
|  |  (shared infra)  |  |  (students + enrollment)  |  |
|  +------------------+  +---------------------------+  |
|                                                       |
|  +------------------+  +---------------------------+  |
|  |  FinanceModule   |  |    AdminModule            |  |
|  |  (billing + pay) |  |  (users + audit + report) |  |
|  +------------------+  +---------------------------+  |
+-------------------------------------------------------+
```

---

## Component 1: CoreModule

**Bounded Context**: Shared infrastructure — cross-cutting concerns used by all modules

**Responsibilities**:
- Database connection and Prisma client
- Event bus (NestJS EventEmitter2)
- Audit interceptor (automatic mutation logging)
- Auth guard and roles decorator
- Supabase Auth integration (JWT validation)
- HTTP security headers middleware
- Rate limiting middleware
- Global exception filter
- Health check endpoint

**Key Classes**:
- PrismaService — database client singleton
- SupabaseAuthGuard — JWT validation guard
- RolesGuard — RBAC enforcement guard
- AuditInterceptor — automatic audit logging on mutations
- SecurityHeadersMiddleware — HTTP security headers (SECURITY-04)
- RateLimitMiddleware — brute-force protection (SECURITY-12)
- GlobalExceptionFilter — safe error responses (SECURITY-15)

---

## Component 2: AcademicModule

**Bounded Context**: Academic operations — student records and enrollment lifecycle

**Responsibilities**:
- Student CRUD (create, read, update, soft-delete)
- Student search and filtering (by name, LRN, grade level, status)
- Enrollment application creation and submission
- Enrollment approval/rejection workflow (state machine)
- Enrollment resubmission after rejection
- DPA consent tracking on enrollment
- Student data export (CSV, JSON for DPA data subject requests)
- Emit events: EnrollmentApproved, EnrollmentRejected, StudentCreated, StudentDeleted

**Sub-components**:
- StudentController — REST endpoints for student CRUD
- StudentService — business logic for student operations
- EnrollmentController — REST endpoints for enrollment workflow
- EnrollmentService — enrollment state machine and business rules
- AcademicEventEmitter — publishes domain events

---

## Component 3: FinanceModule

**Bounded Context**: Financial operations — billing and payment tracking

**Responsibilities**:
- Individual billing record creation
- Bulk billing creation (by grade level)
- Payment recording (bank transfer)
- Balance calculation (total - payments)
- Billing status management (Unpaid -> Partially Paid -> Fully Paid)
- Billing summary reporting
- Listen for events: EnrollmentApproved (to enable billing for student)

**Sub-components**:
- BillingController — REST endpoints for billing CRUD
- BillingService — billing creation and lifecycle logic
- PaymentController — REST endpoints for payment recording
- PaymentService — payment processing and balance calculation
- FinanceEventListener — listens for enrollment events

---

## Component 4: AdminModule

**Bounded Context**: System administration — users, audit, and reporting

**Responsibilities**:
- User CRUD (create, view, edit, deactivate)
- User role assignment (Admin, Registrar, Finance)
- Supabase Auth user provisioning (create auth user, send invite)
- Audit log viewing and filtering
- CSV report generation (student list, enrollment summary, billing summary)
- Organization profile management
- DPA data subject rights (export all data, soft-delete student data)

**Sub-components**:
- UserController — REST endpoints for user management
- UserService — user CRUD and Supabase Auth sync
- AuditController — REST endpoints for audit log viewing
- AuditService — audit log queries and filtering
- ReportController — REST endpoints for CSV exports
- ReportService — report generation logic
- OrgController — REST endpoint for organization profile
- OrgService — organization management
