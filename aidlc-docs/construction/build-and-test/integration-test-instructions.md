# Integration Test Instructions — EduCore ERP

## Purpose
Test end-to-end workflows across modules to ensure they work together correctly.

## Setup Integration Test Environment
```bash
# Start local stack
docker-compose up -d
docker-compose exec app npx prisma migrate dev
docker-compose exec app npx prisma db seed
```

## Integration Test Scenarios (Manual for MVP)

### Scenario 1: Enrollment → Student Creation
1. **Setup**: Login as Registrar via Supabase Auth
2. **Steps**:
   - POST /api/v1/enrollments — create enrollment with applicant data + DPA consent
   - PATCH /api/v1/enrollments/:id/submit — submit enrollment
   - PATCH /api/v1/enrollments/:id/approve — approve enrollment
3. **Expected**:
   - Enrollment status changes: draft → submitted → enrolled
   - Student record created with status 'enrolled'
   - EnrollmentApprovedEvent emitted (check logs for "eligible for billing")
4. **Verify**:
   - GET /api/v1/students — new student appears in list
   - GET /api/v1/enrollments/:id — status is 'enrolled', studentId is set

### Scenario 2: Billing → Payment → Balance
1. **Setup**: Login as Finance staff, have an enrolled student from Scenario 1
2. **Steps**:
   - POST /api/v1/billing — create billing with line items (tuition: 15000, misc: 2000)
   - POST /api/v1/billing/:id/payments — record partial payment (amount: 10000)
   - POST /api/v1/billing/:id/payments — record remaining payment (amount: 7000)
3. **Expected**:
   - Billing created with totalAmount: 17000, status: 'unpaid'
   - After first payment: totalPaid: 10000, balance: 7000, status: 'partially_paid'
   - After second payment: totalPaid: 17000, balance: 0, status: 'fully_paid'
4. **Verify**:
   - GET /api/v1/billing/:id — status is 'fully_paid', balance is 0
   - GET /api/v1/billing/:id/payments — 2 payment records

### Scenario 3: Bulk Billing
1. **Setup**: Have 3+ enrolled students in the same grade level
2. **Steps**:
   - POST /api/v1/billing/bulk — create bulk billing for grade level with items
3. **Expected**:
   - Billing records created for all enrolled students without existing billing
   - Students with existing billing are skipped
   - Response shows created count and skipped count
4. **Verify**:
   - GET /api/v1/billing?gradeLevel=G1 — billing records for all students

### Scenario 4: Enrollment Rejection → Resubmit
1. **Steps**:
   - Create and submit enrollment
   - PATCH /api/v1/enrollments/:id/reject — reject enrollment
   - PATCH /api/v1/enrollments/:id/submit — resubmit (status goes back to submitted)
   - PATCH /api/v1/enrollments/:id/approve — approve
2. **Expected**: Full cycle works: draft → submitted → rejected → draft → submitted → enrolled

### Scenario 5: RBAC Enforcement
1. **Steps**:
   - Login as Finance staff
   - GET /api/v1/students — should return 403 Forbidden
   - POST /api/v1/enrollments — should return 403 Forbidden
   - POST /api/v1/billing — should return 200 OK
2. **Expected**: Finance can only access billing endpoints, not student/enrollment

### Scenario 6: Audit Trail
1. **Steps**:
   - Perform any create/update/delete operation
   - Login as Admin
   - GET /api/v1/audit-logs — check for the operation
2. **Expected**: Audit log entry with userId, action, entityType, entityId, newValues

### Scenario 7: DPA Data Export + Deletion
1. **Steps**:
   - Login as Admin
   - GET /api/v1/students/:id/export — export all student data
   - DELETE /api/v1/students/:id — soft-delete with reason
   - GET /api/v1/students — student should not appear
2. **Expected**: Export returns complete data; after deletion, student is hidden but audit log records the deletion

## Running Integration Tests via curl

```bash
# Set variables
BASE=http://localhost:3000/api/v1
TOKEN="Bearer <your-supabase-jwt>"

# Health check
curl $BASE/health

# Create enrollment
curl -X POST $BASE/enrollments \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"schoolYearId":"<sy-id>","gradeLevel":"G1","dpaConsentGiven":true,"applicantData":{"firstName":"Juan","lastName":"Cruz","dateOfBirth":"2015-05-15","gender":"male","guardianName":"Maria Cruz","guardianContact":"09171234567"}}'
```

## Cleanup
```bash
docker-compose down -v  # Removes volumes (database data)
```
