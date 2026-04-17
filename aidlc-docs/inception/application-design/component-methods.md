# EduCore ERP — Component Methods

Method signatures for each component. Detailed business rules will be defined in Functional Design (CONSTRUCTION phase).

---

## CoreModule Methods

### PrismaService
```typescript
// Extends PrismaClient, managed by NestJS lifecycle
onModuleInit(): Promise<void>
onModuleDestroy(): Promise<void>
```

### SupabaseAuthGuard
```typescript
canActivate(context: ExecutionContext): Promise<boolean>
// Validates JWT from Authorization header against Supabase
// Attaches user payload to request
```

### RolesGuard
```typescript
canActivate(context: ExecutionContext): boolean
// Reads @Roles() decorator metadata
// Checks request.user.role against required roles
```

### AuditInterceptor
```typescript
intercept(context: ExecutionContext, next: CallHandler): Observable<any>
// Captures: userId, action (POST/PATCH/DELETE), entityType, entityId
// Logs old values (for updates) and new values
// Stores in audit_logs table
```

---

## AcademicModule Methods

### StudentService
```typescript
create(dto: CreateStudentDto): Promise<Student>
// Input: { firstName, lastName, dateOfBirth, gender, address, guardianName, guardianContact, lrn?, gradeLevel }
// Output: Student record
// Emits: StudentCreated event

findAll(query: StudentQueryDto): Promise<PaginatedResult<Student>>
// Input: { search?, gradeLevel?, status?, page, limit }
// Output: Paginated student list

findOne(id: string): Promise<Student>
// Input: student UUID
// Output: Student with enrollment and billing relations

update(id: string, dto: UpdateStudentDto): Promise<Student>
// Input: student UUID + partial student fields
// Output: Updated student record

softDelete(id: string, reason: string): Promise<void>
// Input: student UUID + deletion reason (DPA compliance)
// Output: void (marks as deleted, audit logged)
// Emits: StudentDeleted event

exportStudentData(id: string): Promise<StudentExportDto>
// Input: student UUID
// Output: All student data + enrollments + billing + payments (DPA data subject request)
```

### EnrollmentService
```typescript
create(dto: CreateEnrollmentDto): Promise<Enrollment>
// Input: { studentData, gradeLevel, schoolYear, dpaConsent: true }
// Output: Enrollment with status 'draft'
// Validates: DPA consent required, duplicate LRN check

submit(id: string): Promise<Enrollment>
// Input: enrollment UUID
// Output: Enrollment with status 'submitted'
// Validates: status must be 'draft' or 'rejected' (resubmit)

approve(id: string, userId: string): Promise<Enrollment>
// Input: enrollment UUID + approving user UUID
// Output: Enrollment with status 'approved', Student record created/updated
// Emits: EnrollmentApproved event
// Validates: status must be 'submitted', user must have 'registrar' role

reject(id: string, userId: string): Promise<Enrollment>
// Input: enrollment UUID + rejecting user UUID
// Output: Enrollment with status 'rejected'
// Emits: EnrollmentRejected event
// Validates: status must be 'submitted', user must have 'registrar' role

findAllSubmitted(query: EnrollmentQueryDto): Promise<PaginatedResult<Enrollment>>
// Input: { status?, schoolYear?, gradeLevel?, page, limit }
// Output: Paginated enrollment list (approval queue)
```

---

## FinanceModule Methods

### BillingService
```typescript
create(dto: CreateBillingDto): Promise<Billing>
// Input: { studentId, schoolYear, totalAmount, description, dueDate }
// Output: Billing record with status 'unpaid'
// Validates: student must be enrolled, no duplicate billing for same student+schoolYear

createBulk(dto: CreateBulkBillingDto): Promise<BulkBillingResult>
// Input: { gradeLevel, schoolYear, totalAmount, description, dueDate }
// Output: { created: number, skipped: number, skippedStudents: string[] }
// Creates billing for all enrolled students in grade level without existing billing

findAll(query: BillingQueryDto): Promise<PaginatedResult<BillingWithBalance>>
// Input: { status?, gradeLevel?, schoolYear?, sortBy?, page, limit }
// Output: Paginated billing list with calculated balance

findOne(id: string): Promise<BillingWithPayments>
// Input: billing UUID
// Output: Billing record with all associated payments
```

### PaymentService
```typescript
create(dto: CreatePaymentDto): Promise<Payment>
// Input: { billingId, amount, paymentDate, paymentMethod: 'bank_transfer', referenceNumber }
// Output: Payment record
// Side effect: recalculates billing status (unpaid/partially_paid/fully_paid)
// Validates: amount must not exceed outstanding balance

findByBilling(billingId: string): Promise<Payment[]>
// Input: billing UUID
// Output: All payments for that billing record
```

---

## AdminModule Methods

### UserService
```typescript
create(dto: CreateUserDto): Promise<User>
// Input: { email, firstName, lastName, role }
// Output: User record
// Side effect: creates Supabase Auth user, sends invite email

findAll(query: UserQueryDto): Promise<PaginatedResult<User>>
// Input: { search?, role?, status?, page, limit }
// Output: Paginated user list

update(id: string, dto: UpdateUserDto): Promise<User>
// Input: user UUID + partial user fields
// Output: Updated user record

deactivate(id: string): Promise<User>
// Input: user UUID
// Output: User with status 'inactive'
// Side effect: disables Supabase Auth user
```

### AuditService
```typescript
findAll(query: AuditQueryDto): Promise<PaginatedResult<AuditLog>>
// Input: { entityType?, entityId?, userId?, dateFrom?, dateTo?, page, limit }
// Output: Paginated audit log entries

log(entry: CreateAuditEntryDto): Promise<void>
// Input: { userId, action, entityType, entityId, oldValues?, newValues?, ipAddress }
// Output: void (called by AuditInterceptor)
```

### ReportService
```typescript
exportStudentList(query: StudentQueryDto): Promise<Buffer>
// Input: filter criteria
// Output: CSV buffer

exportEnrollmentSummary(schoolYear: string): Promise<Buffer>
// Input: school year
// Output: CSV buffer (counts by grade level and status)

exportBillingSummary(schoolYear: string): Promise<Buffer>
// Input: school year
// Output: CSV buffer (total billed, collected, outstanding per grade level)
```

### OrgService
```typescript
getProfile(): Promise<Organization>
// Output: Organization profile

updateProfile(dto: UpdateOrgDto): Promise<Organization>
// Input: partial org fields (name, address, contact)
// Output: Updated organization
```
