# EduCore ERP — Application Design (Consolidated)

## Architecture Overview

EduCore MVP is a **modular monolith** built with NestJS, organized by **bounded contexts**. Modules communicate via **event-driven** patterns using NestJS EventEmitter2. The API is **RESTful with resource-based URLs**. Audit logging uses a **NestJS interceptor** for transparent mutation tracking. RBAC uses **NestJS Guards with @Roles decorators**.

## Module Structure

| Module | Bounded Context | Key Entities | Responsibilities |
|--------|----------------|--------------|------------------|
| CoreModule | Shared Infrastructure | — | Prisma, Auth Guards, Audit Interceptor, Security Middleware, Exception Filter |
| AcademicModule | Academic Operations | Student, Enrollment | Student CRUD, enrollment workflow (state machine), DPA consent, data export |
| FinanceModule | Financial Operations | Billing, Payment | Individual/bulk billing, payment recording, balance calculation, status lifecycle |
| AdminModule | System Administration | User, AuditLog, Organization, Report | User management, Supabase Auth sync, audit viewing, CSV reports, org profile, DPA rights |

## Communication Pattern

- **Build-time**: All modules import CoreModule for Prisma, Guards, Interceptors
- **Runtime (async)**: AcademicModule emits events → FinanceModule listens
- **External**: AdminModule + CoreModule call Supabase Auth API
- **Rule**: No direct cross-module service injection. Events only.

## Key Domain Events

| Event | Publisher | Subscriber | Purpose |
|-------|----------|------------|---------|
| EnrollmentApprovedEvent | AcademicModule | FinanceModule | Notify that student is eligible for billing |
| EnrollmentRejectedEvent | AcademicModule | — | Audit/logging only for MVP |
| StudentDeletedEvent | AcademicModule | FinanceModule | Cascade soft-delete billing/payments (DPA) |
| BillingFullyPaidEvent | FinanceModule | — | Future: notify admin/parent |

## Request Pipeline

```
Request
  --> SecurityHeadersMiddleware (SECURITY-04)
  --> RateLimitMiddleware (SECURITY-12, auth endpoints only)
  --> SupabaseAuthGuard (SECURITY-08, JWT validation)
  --> RolesGuard (SECURITY-06/08, @Roles check)
  --> ValidationPipe (SECURITY-05, class-validator DTOs)
  --> Controller Method (business logic)
  --> AuditInterceptor (SECURITY-13, log mutations)
  --> GlobalExceptionFilter (SECURITY-15, safe errors)
Response
```

## API Endpoint Summary

### AcademicModule
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/v1/students | registrar | Create student |
| GET | /api/v1/students | registrar, admin | List students (paginated, filtered) |
| GET | /api/v1/students/:id | registrar, admin | Get student detail |
| PATCH | /api/v1/students/:id | registrar | Update student |
| DELETE | /api/v1/students/:id | admin | Soft-delete student (DPA) |
| GET | /api/v1/students/:id/export | admin | Export all student data (DPA) |
| POST | /api/v1/enrollments | registrar | Create enrollment (draft) |
| GET | /api/v1/enrollments | registrar, admin | List enrollments (filtered) |
| PATCH | /api/v1/enrollments/:id/submit | registrar | Submit enrollment |
| PATCH | /api/v1/enrollments/:id/approve | registrar | Approve enrollment |
| PATCH | /api/v1/enrollments/:id/reject | registrar | Reject enrollment |

### FinanceModule
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/v1/billing | finance | Create individual billing |
| POST | /api/v1/billing/bulk | finance | Create bulk billing by grade level |
| GET | /api/v1/billing | finance, admin | List billing (filtered) |
| GET | /api/v1/billing/:id | finance, admin | Get billing with payments |
| POST | /api/v1/billing/:id/payments | finance | Record payment |
| GET | /api/v1/billing/:id/payments | finance, admin | List payments for billing |

### AdminModule
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/v1/users | admin | Create user (+ Supabase Auth) |
| GET | /api/v1/users | admin | List users |
| PATCH | /api/v1/users/:id | admin | Update user |
| PATCH | /api/v1/users/:id/deactivate | admin | Deactivate user |
| GET | /api/v1/audit-logs | admin | List audit logs (filtered) |
| GET | /api/v1/reports/students | admin | Export student list CSV |
| GET | /api/v1/reports/enrollments | admin | Export enrollment summary CSV |
| GET | /api/v1/reports/billing | admin | Export billing summary CSV |
| GET | /api/v1/org | admin | Get organization profile |
| PATCH | /api/v1/org | admin | Update organization profile |

### CoreModule (Public)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/v1/health | public | Health check |

## Technology Mapping

| Concern | Implementation |
|---------|---------------|
| Module system | NestJS @Module with imports/exports |
| Dependency injection | NestJS built-in DI container |
| Event bus | @nestjs/event-emitter (EventEmitter2) |
| Database access | Prisma ORM with PostgreSQL |
| Input validation | class-validator + class-transformer via ValidationPipe |
| Authentication | Supabase Auth JWT + custom SupabaseAuthGuard |
| Authorization | Custom RolesGuard + @Roles() decorator |
| Audit logging | Custom AuditInterceptor (NestJS interceptor) |
| Error handling | Custom GlobalExceptionFilter |
| Security headers | Custom SecurityHeadersMiddleware |
| Rate limiting | @nestjs/throttler |
| CSV export | json2csv library |
| API versioning | URI-based (/api/v1/) |

## Design Validation Against Requirements

| Requirement | Covered By | Status |
|-------------|-----------|--------|
| FR-01: Organization Management | AdminModule (OrgService) | Covered |
| FR-02: Auth & RBAC | CoreModule (Guards) + AdminModule (UserService) | Covered |
| FR-03: Student Management | AcademicModule (StudentService) | Covered |
| FR-04: Enrollment | AcademicModule (EnrollmentService) | Covered |
| FR-05: Tuition Billing | FinanceModule (BillingService + PaymentService) | Covered |
| FR-06: Basic Reporting | AdminModule (ReportService) | Covered |
| FR-07: Audit Trail | CoreModule (AuditInterceptor) + AdminModule (AuditService) | Covered |
| REG-01: DPA Compliance | AcademicModule (consent, export, delete) + CoreModule (audit) | Covered |

## Design Validation Against User Stories

| Story | Component | Status |
|-------|----------|--------|
| 1.1 Admin Login | CoreModule (SupabaseAuthGuard) | Covered |
| 1.2 Manage Users | AdminModule (UserService) | Covered |
| 1.3 Audit Logs | AdminModule (AuditService) | Covered |
| 1.4 Export Reports | AdminModule (ReportService) | Covered |
| 2.1 Create Enrollment | AcademicModule (EnrollmentService.create/submit) | Covered |
| 2.2 Approve/Reject | AcademicModule (EnrollmentService.approve/reject) | Covered |
| 2.3 Manage Students | AcademicModule (StudentService) | Covered |
| 3.1 Individual Billing | FinanceModule (BillingService.create) | Covered |
| 3.2 Bulk Billing | FinanceModule (BillingService.createBulk) | Covered |
| 3.3 Record Payment | FinanceModule (PaymentService.create) | Covered |
| 3.4 View Balances | FinanceModule (BillingService.findAll) | Covered |
| 4.1 DPA Consent | AcademicModule (EnrollmentService.create) | Covered |
| 4.2 Data Export | AcademicModule (StudentService.exportStudentData) | Covered |
| 4.3 Data Deletion | AcademicModule (StudentService.softDelete) + Events | Covered |
