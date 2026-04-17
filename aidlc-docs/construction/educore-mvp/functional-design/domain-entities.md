# EduCore ERP — Domain Entities

## Entity Relationship Diagram

```
+------------------+       +--------------------+
|  Organization    |       |    SchoolYear      |
|  (1 per deploy)  |<------| (2025-2026, etc.)  |
+------------------+       +--------------------+
        |                          |
        |                          |
+-------v--------+       +--------v-----------+
|     User       |       |    Enrollment      |
| (admin/reg/fin)|       | (draft/submitted/  |
+----------------+       |  approved/rejected)|
                          +--------+-----------+
                                   |
                          +--------v-----------+
                          |     Student        |
                          | (applicant/enrolled|
                          |  /withdrawn/grad)  |
                          +--------+-----------+
                                   |
                          +--------v-----------+       +------------------+
                          |     Billing        |<------| BillingItem      |
                          | (unpaid/partial/   |       | (tuition, misc,  |
                          |  fully_paid)       |       |  lab fees, etc.) |
                          +--------+-----------+       +------------------+
                                   |
                          +--------v-----------+
                          |     Payment        |
                          | (bank_transfer)    |
                          +--------------------+

Cross-cutting:
+------------------+       +---------------------------+
|   AuditLog       |       | CustomFieldDefinition     |
| (all mutations)  |       | (future extensibility)    |
+------------------+       +---------------------------+
```

---

## Entity: Organization

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| name | VARCHAR(255) | NOT NULL | School name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly identifier |
| type | VARCHAR(50) | NOT NULL, default 'k12' | School type |
| address | JSONB | default '{}' | Philippine address: { street, barangay, city, province, zipCode } |
| contactEmail | VARCHAR(255) | | School contact email |
| contactPhone | VARCHAR(20) | | School contact phone |
| dpoName | VARCHAR(255) | | Data Protection Officer name (DPA) |
| dpoEmail | VARCHAR(255) | | DPO email (DPA) |
| settings | JSONB | default '{}' | Org-level configuration |
| createdAt | TIMESTAMPTZ | auto | Creation timestamp |
| updatedAt | TIMESTAMPTZ | auto | Last update timestamp |

---

## Entity: SchoolYear

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| orgId | UUID | FK -> Organization | Organization reference |
| name | VARCHAR(20) | NOT NULL | e.g., "2025-2026" |
| startDate | DATE | NOT NULL | School year start |
| endDate | DATE | NOT NULL | School year end |
| isCurrent | BOOLEAN | default false | Active school year flag |
| status | VARCHAR(20) | default 'active' | active, archived |
| createdAt | TIMESTAMPTZ | auto | Creation timestamp |

**Unique constraint**: (orgId, name)

---

## Entity: User

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| orgId | UUID | FK -> Organization | Organization reference |
| supabaseId | VARCHAR(255) | UNIQUE | Supabase Auth user ID |
| email | VARCHAR(255) | NOT NULL | User email |
| firstName | VARCHAR(100) | NOT NULL | First name |
| lastName | VARCHAR(100) | NOT NULL | Last name |
| role | VARCHAR(20) | NOT NULL | 'admin', 'registrar', 'finance' |
| status | VARCHAR(20) | default 'active' | active, inactive |
| lastLoginAt | TIMESTAMPTZ | | Last login timestamp |
| createdAt | TIMESTAMPTZ | auto | Creation timestamp |
| updatedAt | TIMESTAMPTZ | auto | Last update timestamp |

**Unique constraint**: (orgId, email)

---

## Entity: Student

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| orgId | UUID | FK -> Organization | Organization reference |
| lrn | VARCHAR(12) | NULLABLE, validated | Learner Reference Number (12-digit numeric) |
| firstName | VARCHAR(100) | NOT NULL | First name |
| middleName | VARCHAR(100) | | Middle name |
| lastName | VARCHAR(100) | NOT NULL | Last name |
| dateOfBirth | DATE | NOT NULL | Date of birth |
| gender | VARCHAR(10) | NOT NULL | 'male', 'female' |
| address | JSONB | default '{}' | Philippine address format |
| guardianName | VARCHAR(255) | NOT NULL | Parent/guardian full name |
| guardianContact | VARCHAR(20) | NOT NULL | Guardian phone number |
| guardianEmail | VARCHAR(255) | | Guardian email (optional) |
| gradeLevel | VARCHAR(20) | NOT NULL | Current grade level |
| section | VARCHAR(50) | | Class section |
| status | VARCHAR(20) | default 'applicant' | applicant, enrolled, withdrawn, graduated |
| metadata | JSONB | default '{}' | Extensible fields for future use |
| isDeleted | BOOLEAN | default false | Soft delete flag (DPA) |
| deletedAt | TIMESTAMPTZ | | Deletion timestamp |
| deletedReason | VARCHAR(255) | | Deletion reason (DPA) |
| createdAt | TIMESTAMPTZ | auto | Creation timestamp |
| updatedAt | TIMESTAMPTZ | auto | Last update timestamp |

**Unique constraint**: (orgId, lrn) WHERE lrn IS NOT NULL

---

## Entity: Enrollment

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| orgId | UUID | FK -> Organization | Organization reference |
| studentId | UUID | FK -> Student, NULLABLE | Linked after approval (null during draft) |
| schoolYearId | UUID | FK -> SchoolYear | School year reference |
| applicantData | JSONB | NOT NULL | Snapshot of student data at time of application |
| gradeLevel | VARCHAR(20) | NOT NULL | Grade level applying for |
| status | VARCHAR(20) | default 'draft' | draft, submitted, approved, rejected, enrolled |
| dpaConsentGiven | BOOLEAN | NOT NULL | Privacy consent flag |
| dpaConsentTimestamp | TIMESTAMPTZ | | When consent was given |
| approvedBy | UUID | FK -> User, NULLABLE | Approving registrar |
| approvedAt | TIMESTAMPTZ | | Approval timestamp |
| rejectedBy | UUID | FK -> User, NULLABLE | Rejecting registrar |
| rejectedAt | TIMESTAMPTZ | | Rejection timestamp |
| submittedAt | TIMESTAMPTZ | | Submission timestamp |
| createdBy | UUID | FK -> User | Creating user |
| createdAt | TIMESTAMPTZ | auto | Creation timestamp |
| updatedAt | TIMESTAMPTZ | auto | Last update timestamp |

---

## Entity: Billing

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| orgId | UUID | FK -> Organization | Organization reference |
| studentId | UUID | FK -> Student | Student reference |
| schoolYearId | UUID | FK -> SchoolYear | School year reference |
| totalAmount | DECIMAL(15,2) | NOT NULL | Sum of all billing items (PHP) |
| totalPaid | DECIMAL(15,2) | default 0 | Sum of all payments (denormalized) |
| balance | DECIMAL(15,2) | computed | totalAmount - totalPaid |
| dueDate | DATE | NOT NULL | Payment due date |
| status | VARCHAR(20) | default 'unpaid' | unpaid, partially_paid, fully_paid |
| createdBy | UUID | FK -> User | Creating finance staff |
| createdAt | TIMESTAMPTZ | auto | Creation timestamp |
| updatedAt | TIMESTAMPTZ | auto | Last update timestamp |

**Unique constraint**: (studentId, schoolYearId)

---

## Entity: BillingItem

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| billingId | UUID | FK -> Billing | Parent billing record |
| description | VARCHAR(255) | NOT NULL | e.g., "Tuition Fee", "Miscellaneous Fee", "Lab Fee" |
| amount | DECIMAL(15,2) | NOT NULL | Item amount (PHP) |
| sortOrder | INTEGER | default 0 | Display order |
| createdAt | TIMESTAMPTZ | auto | Creation timestamp |

---

## Entity: Payment

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| billingId | UUID | FK -> Billing | Billing reference |
| amount | DECIMAL(15,2) | NOT NULL | Payment amount (PHP) |
| paymentDate | DATE | NOT NULL | Date of payment |
| paymentMethod | VARCHAR(30) | default 'bank_transfer' | bank_transfer |
| referenceNumber | VARCHAR(100) | | Bank reference number |
| notes | TEXT | | Optional notes |
| recordedBy | UUID | FK -> User | Finance staff who recorded |
| createdAt | TIMESTAMPTZ | auto | Creation timestamp |

---

## Entity: AuditLog

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| orgId | UUID | FK -> Organization | Organization reference |
| userId | UUID | FK -> User, NULLABLE | Acting user (null for system actions) |
| action | VARCHAR(20) | NOT NULL | create, update, delete |
| entityType | VARCHAR(50) | NOT NULL | student, enrollment, billing, payment, user |
| entityId | UUID | NOT NULL | ID of affected entity |
| oldValues | JSONB | | Previous values (for updates) |
| newValues | JSONB | | New values |
| ipAddress | VARCHAR(45) | | Client IP address |
| userAgent | TEXT | | Client user agent |
| createdAt | TIMESTAMPTZ | auto | Timestamp (immutable) |

**Indexes**: (entityType, entityId), (userId, createdAt), (orgId, createdAt)
