# EduCore ERP — Business Logic Model

## 1. Enrollment State Machine

### States
| State | Description | Entry Condition |
|-------|-------------|-----------------|
| draft | Initial state, enrollment form saved but not submitted | Created by Registrar |
| submitted | Enrollment submitted for review | Registrar clicks "Submit" |
| approved | Enrollment approved by Registrar | Registrar clicks "Approve" |
| rejected | Enrollment rejected by Registrar | Registrar clicks "Reject" |
| enrolled | Student fully enrolled (final state) | Automatic after approval |

### State Transitions

```
                    +-------+
                    | draft |
                    +---+---+
                        |
                   submit()
                        |
                    +---v-------+
             +------| submitted |------+
             |      +-----------+      |
         approve()               reject()
             |                         |
      +------v------+          +-------v------+
      |  approved   |          |   rejected   |
      +------+------+          +-------+------+
             |                         |
    auto: createStudent()        resubmit()
             |                         |
      +------v------+          +-------v------+
      |  enrolled   |          |    draft     |
      +-------------+          +--------------+
      (final state)            (back to start)
```

### Transition Guards

| Transition | From | To | Guard Conditions |
|-----------|------|-----|-----------------|
| submit | draft | submitted | All required fields filled; dpaConsentGiven = true |
| approve | submitted | approved | User has 'registrar' role; enrollment status = 'submitted' |
| reject | submitted | rejected | User has 'registrar' role; enrollment status = 'submitted' |
| resubmit | rejected | draft | Enrollment status = 'rejected' |
| auto-enroll | approved | enrolled | Triggered automatically after approve; creates/updates Student record |

### Side Effects

| Transition | Side Effects |
|-----------|-------------|
| submit | Set submittedAt = now() |
| approve | Set approvedBy, approvedAt; Create Student record (or update if LRN match); Set student.status = 'enrolled'; Emit EnrollmentApprovedEvent |
| reject | Set rejectedBy, rejectedAt; Emit EnrollmentRejectedEvent |
| resubmit | Clear rejectedBy, rejectedAt; Reset status to 'draft' |
| auto-enroll | Set enrollment.status = 'enrolled'; Link enrollment.studentId |

---

## 2. Billing Lifecycle

### States
| State | Description | Condition |
|-------|-------------|-----------|
| unpaid | No payments recorded | totalPaid = 0 |
| partially_paid | Some payments but balance remains | 0 < totalPaid < totalAmount |
| fully_paid | All fees paid | totalPaid >= totalAmount |

### State Transitions

```
+--------+     recordPayment()     +----------------+
| unpaid | ----------------------->| partially_paid |
+--------+                         +-------+--------+
     |                                     |
     |     recordPayment()                 | recordPayment()
     |     (full amount)                   | (remaining balance)
     |                                     |
     +----------------+--------------------+
                      |
                      v
               +------------+
               | fully_paid |
               +------------+
               (final state)
```

### Balance Calculation Logic

```
billing.totalAmount = SUM(billingItems.amount)
billing.totalPaid = SUM(payments.amount)
billing.balance = billing.totalAmount - billing.totalPaid

IF billing.totalPaid = 0 THEN status = 'unpaid'
IF billing.totalPaid > 0 AND billing.totalPaid < billing.totalAmount THEN status = 'partially_paid'
IF billing.totalPaid >= billing.totalAmount THEN status = 'fully_paid'
```

### Billing Creation Logic

#### Individual Billing
```
INPUT: studentId, schoolYearId, items[{description, amount}], dueDate
VALIDATE:
  - Student exists and status = 'enrolled'
  - No existing billing for (studentId, schoolYearId)
  - At least one billing item
  - All item amounts > 0
PROCESS:
  - Create Billing record with totalAmount = SUM(items.amount)
  - Create BillingItem records for each item
  - Set status = 'unpaid', totalPaid = 0
OUTPUT: Billing with BillingItems
```

#### Bulk Billing
```
INPUT: gradeLevel, schoolYearId, items[{description, amount}], dueDate
VALIDATE:
  - SchoolYear exists
  - At least one billing item
  - All item amounts > 0
PROCESS:
  - Find all students WHERE gradeLevel = input AND status = 'enrolled'
  - For each student:
    - IF billing exists for (studentId, schoolYearId): SKIP (add to skipped list)
    - ELSE: Create Billing + BillingItems (same items for all)
OUTPUT: { created: count, skipped: count, skippedStudents: [names] }
```

### Payment Recording Logic

```
INPUT: billingId, amount, paymentDate, paymentMethod, referenceNumber
VALIDATE:
  - Billing exists
  - amount > 0
  - amount <= billing.balance (cannot overpay)
  - paymentDate is valid date
PROCESS:
  - Create Payment record
  - Update billing.totalPaid = billing.totalPaid + amount
  - Update billing.balance = billing.totalAmount - billing.totalPaid
  - Recalculate billing.status based on new totalPaid
  - IF status changed to 'fully_paid': Emit BillingFullyPaidEvent
OUTPUT: Payment record + updated Billing
```

---

## 3. Student Lifecycle

### Status Flow
```
applicant --> enrolled --> withdrawn
                      --> graduated
```

| Transition | Trigger | Description |
|-----------|---------|-------------|
| applicant -> enrolled | Enrollment approved | Automatic when enrollment is approved |
| enrolled -> withdrawn | Manual by Registrar | Student withdraws from school |
| enrolled -> graduated | Manual by Registrar | Student completes grade level |

---

## 4. DPA Data Subject Rights Logic

### Export Student Data
```
INPUT: studentId
PROCESS:
  - Fetch Student record with all fields
  - Fetch all Enrollments for student
  - Fetch all Billing records for student
  - Fetch all Payments for student's billing records
  - Compile into single JSON/CSV export
  - Log export in AuditLog (action: 'export', entityType: 'student')
OUTPUT: Complete data package
```

### Delete Student Data (Soft Delete)
```
INPUT: studentId, reason
VALIDATE:
  - Student exists and isDeleted = false
  - User has 'admin' role
PROCESS:
  - Set student.isDeleted = true, deletedAt = now(), deletedReason = reason
  - Soft-delete all enrollments for student
  - Soft-delete all billing records for student
  - Soft-delete all payments for student's billing
  - Emit StudentDeletedEvent
  - Log deletion in AuditLog (action: 'delete', entityType: 'student', reason)
OUTPUT: void
NOTE: Audit logs are NEVER deleted (legal requirement)
```
