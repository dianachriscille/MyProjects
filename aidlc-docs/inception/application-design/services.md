# EduCore ERP — Service Layer Design

## Orchestration Pattern: Event-Driven

Modules communicate via NestJS EventEmitter2. Each module publishes domain events; other modules subscribe to events they care about. No direct cross-module service injection.

---

## Domain Events

### Events Published by AcademicModule

```typescript
// When enrollment is approved and student record is created/updated
EnrollmentApprovedEvent {
  enrollmentId: string
  studentId: string
  gradeLevel: string
  schoolYear: string
  approvedBy: string
  approvedAt: Date
}

// When enrollment is rejected
EnrollmentRejectedEvent {
  enrollmentId: string
  studentId: string
  rejectedBy: string
  rejectedAt: Date
}

// When a student record is created
StudentCreatedEvent {
  studentId: string
  firstName: string
  lastName: string
  gradeLevel: string
}

// When a student is soft-deleted (DPA erasure)
StudentDeletedEvent {
  studentId: string
  deletedBy: string
  reason: string
}
```

### Events Published by FinanceModule

```typescript
// When billing is fully paid
BillingFullyPaidEvent {
  billingId: string
  studentId: string
  schoolYear: string
  totalAmount: number
  paidAt: Date
}
```

---

## Event Flow: Enrollment to Billing

```
+-------------------+     EnrollmentApprovedEvent     +-------------------+
|  AcademicModule   | -------------------------------->|  FinanceModule    |
|                   |                                  |                   |
| EnrollmentService |                                  | FinanceListener   |
| 1. Validate       |                                  | 1. Receive event  |
| 2. Update status  |                                  | 2. Log: "Student  |
| 3. Create student |                                  |    eligible for   |
| 4. Emit event     |                                  |    billing"       |
+-------------------+                                  +-------------------+
```

For MVP, the FinanceModule listener simply logs the event. Finance staff manually creates billing. In post-MVP, auto-billing can be triggered by this event.

---

## Event Flow: Student Deletion (DPA)

```
+-------------------+     StudentDeletedEvent          +-------------------+
|   AdminModule     | -------------------------------->|  FinanceModule    |
|                   |                                  |                   |
| (triggers delete  |     StudentDeletedEvent          | 1. Soft-delete    |
|  via Academic)    | -------------------------------->|    billing +      |
|                   |                                  |    payments       |
+-------------------+                                  +-------------------+
                    |
                    |     StudentDeletedEvent          +-------------------+
                    +--------------------------------->|  AcademicModule   |
                                                       | 1. Soft-delete    |
                                                       |    enrollments    |
                                                       +-------------------+
```

---

## Cross-Cutting Service Flows

### Authentication Flow
```
Request --> SecurityHeadersMiddleware --> RateLimitMiddleware
        --> SupabaseAuthGuard (JWT validation)
        --> RolesGuard (@Roles decorator check)
        --> Controller method
        --> AuditInterceptor (log mutation)
        --> Response
```

### Request Pipeline (NestJS middleware/guard/interceptor order)
1. SecurityHeadersMiddleware — sets CSP, HSTS, X-Frame-Options (SECURITY-04)
2. RateLimitMiddleware — rate limit on auth endpoints (SECURITY-12)
3. SupabaseAuthGuard — validates JWT, attaches user to request (SECURITY-08)
4. RolesGuard — checks @Roles() against user.role (SECURITY-06, SECURITY-08)
5. ValidationPipe — validates request body via class-validator DTOs (SECURITY-05)
6. Controller method — executes business logic
7. AuditInterceptor — logs mutation (POST/PATCH/DELETE) to audit_logs (SECURITY-13)
8. GlobalExceptionFilter — catches errors, returns safe response (SECURITY-15)
