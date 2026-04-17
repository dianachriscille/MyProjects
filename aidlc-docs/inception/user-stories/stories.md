# EduCore ERP — User Stories (MVP)

Stories are organized by user journey (per approved plan). Each epic contains sub-tasks. Acceptance criteria use Given/When/Then (BDD) format.

---

## Epic 1: Admin Sets Up and Manages the System

**Persona**: Maria Santos (Admin)
**Journey**: Maria logs in, manages users and roles, views audit logs, and generates reports.

### Story 1.1: Admin Logs In
**As an** Admin, **I want to** log in with my email and password **so that** I can access the system securely.

**Acceptance Criteria**:
- Given I am on the login page, When I enter valid credentials, Then I am redirected to the Admin dashboard
- Given I am on the login page, When I enter invalid credentials, Then I see an error message "Invalid email or password"
- Given I have failed login 5 times, When I attempt again, Then I am temporarily locked out for 15 minutes
- Given I am logged in, When I click logout, Then my session is terminated and I am redirected to the login page

### Story 1.2: Admin Manages Users
**As an** Admin, **I want to** create, view, edit, and deactivate user accounts **so that** I can control who accesses the system.

**Acceptance Criteria**:
- Given I am on the Users page, When I click "Add User", Then I see a form with fields: email, first name, last name, role (Admin/Registrar/Finance)
- Given I fill in valid user details, When I click "Save", Then the user is created and receives a Supabase Auth invitation email
- Given I am viewing a user, When I click "Deactivate", Then the user's status changes to inactive and they can no longer log in
- Given I am on the Users page, When I search by name or email, Then the list filters to matching users

### Story 1.3: Admin Views Audit Logs
**As an** Admin, **I want to** view a log of all data changes **so that** I can track who changed what and when for DPA compliance.

**Acceptance Criteria**:
- Given I am on the Audit Logs page, When the page loads, Then I see a table with columns: timestamp, user, action (create/update/delete), entity type, entity ID
- Given I am viewing audit logs, When I filter by entity type "student", Then only student-related changes are shown
- Given I am viewing audit logs, When I filter by date range, Then only logs within that range are shown
- Given I am viewing a specific log entry, When I click to expand, Then I see the old values and new values of the changed record

### Story 1.4: Admin Exports Reports
**As an** Admin, **I want to** export student lists, enrollment summaries, and billing summaries as CSV **so that** I can use the data for DepEd reporting and school management.

**Acceptance Criteria**:
- Given I am on the Reports page, When I select "Student List" and click "Export CSV", Then a CSV file downloads with all active students and their details
- Given I am on the Reports page, When I select "Enrollment Summary" and choose a school year, Then a CSV downloads with enrollment counts by grade level and status
- Given I am on the Reports page, When I select "Billing Summary" and choose a school year, Then a CSV downloads with total billed, total collected, and outstanding balance per grade level

---

## Epic 2: Registrar Manages the Enrollment Journey

**Persona**: Jose Reyes (Registrar)
**Journey**: Jose logs in, creates enrollment applications for walk-in applicants, reviews and approves/rejects them, and manages student records.

### Story 2.1: Registrar Creates Enrollment Application
**As a** Registrar, **I want to** create an enrollment application for a walk-in applicant **so that** I can start the enrollment process.

**Acceptance Criteria**:
- Given I am on the Enrollment page, When I click "New Enrollment", Then I see a form with: student name, date of birth, gender, address, guardian name, guardian contact, LRN (optional), grade level applying for, school year, and a DPA privacy consent checkbox
- Given I fill in all required fields and check the DPA consent, When I click "Save as Draft", Then the enrollment is saved with status "Draft"
- Given I have a Draft enrollment, When I click "Submit", Then the status changes to "Submitted" and it appears in the approval queue
- Given I enter a student with an LRN that already exists, When I click "Save", Then I see a warning "A student with this LRN already exists" with a link to the existing record

### Story 2.2: Registrar Approves or Rejects Enrollment
**As a** Registrar, **I want to** approve or reject submitted enrollment applications **so that** qualified students can proceed to billing.

**Acceptance Criteria**:
- Given I am on the Enrollment Queue page, When the page loads, Then I see all enrollments with status "Submitted" sorted by submission date
- Given I am viewing a submitted enrollment, When I click "Approve", Then the status changes to "Approved" and a student record is created (or updated if existing)
- Given I am viewing a submitted enrollment, When I click "Reject", Then the status changes to "Rejected" and the record remains in the system
- Given an enrollment is "Rejected", When the Registrar views it, Then they can click "Resubmit" to change status back to "Draft" for editing

### Story 2.3: Registrar Manages Student Records
**As a** Registrar, **I want to** view, search, and update student profiles **so that** I can maintain accurate student records.

**Acceptance Criteria**:
- Given I am on the Students page, When the page loads, Then I see a paginated list of all students with columns: name, LRN, grade level, section, status
- Given I am on the Students page, When I type in the search box, Then the list filters by student name or LRN
- Given I am on the Students page, When I select a grade level filter, Then only students in that grade level are shown
- Given I am viewing a student profile, When I edit a field and click "Save", Then the change is saved and an audit log entry is created with old and new values

---

## Epic 3: Finance Staff Manages Billing and Payments

**Persona**: Ana Cruz (Finance)
**Journey**: Ana logs in, creates billing records for enrolled students (individually or in bulk), records bank transfer payments, and tracks balances.

### Story 3.1: Finance Creates Individual Billing
**As a** Finance staff, **I want to** create a billing record for an enrolled student **so that** I can track their tuition obligation.

**Acceptance Criteria**:
- Given I am on the Billing page, When I click "New Billing", Then I see a form with: student (searchable dropdown of enrolled students), school year, total amount (PHP), description, due date
- Given I fill in valid billing details, When I click "Save", Then the billing record is created with status "Unpaid"
- Given a student already has a billing record for the same school year, When I try to create another, Then I see a warning "Billing already exists for this student and school year"

### Story 3.2: Finance Creates Bulk Billing
**As a** Finance staff, **I want to** create billing records for all enrolled students in a grade level at once **so that** I can efficiently bill an entire class.

**Acceptance Criteria**:
- Given I am on the Billing page, When I click "Bulk Billing", Then I see a form with: grade level (dropdown), school year, total amount (PHP), description, due date
- Given I select a grade level and fill in details, When I click "Preview", Then I see a list of all enrolled students in that grade level who don't already have billing for that school year
- Given I review the preview, When I click "Create All", Then billing records are created for each listed student with status "Unpaid"
- Given some students already have billing, When I preview, Then those students are excluded with a note "Already billed"

### Story 3.3: Finance Records Payment
**As a** Finance staff, **I want to** record a bank transfer payment against a student's billing **so that** I can track how much has been paid.

**Acceptance Criteria**:
- Given I am viewing a student's billing record, When I click "Record Payment", Then I see a form with: amount (PHP), payment date, payment method (bank transfer), bank reference number
- Given I enter a valid payment, When I click "Save", Then the payment is recorded and the billing balance is recalculated
- Given the total payments equal the billing amount, When the payment is saved, Then the billing status changes to "Fully Paid"
- Given the total payments are less than the billing amount, When the payment is saved, Then the billing status changes to "Partially Paid"
- Given I enter a payment amount that would exceed the billing total, When I click "Save", Then I see an error "Payment amount exceeds outstanding balance"

### Story 3.4: Finance Views Student Balances
**As a** Finance staff, **I want to** view all students with outstanding balances **so that** I can follow up on unpaid tuition.

**Acceptance Criteria**:
- Given I am on the Billing page, When I filter by status "Unpaid" or "Partially Paid", Then I see all students with outstanding balances
- Given I am viewing the billing list, When I sort by "Outstanding Balance" descending, Then students with the highest balances appear first
- Given I am viewing a student's billing, When I click on it, Then I see the billing details and a list of all payments made

---

## Epic 4: DPA Compliance (Cross-Cutting)

**Persona**: Maria Santos (Admin)
**Journey**: Maria ensures the system complies with Philippine Data Privacy Act requirements.

### Story 4.1: DPA Consent on Enrollment
**As an** Admin, **I want** the enrollment form to require DPA privacy consent **so that** the school complies with RA 10173.

**Acceptance Criteria**:
- Given I am filling out an enrollment form, When I view the form, Then I see a privacy consent statement explaining how student data will be used
- Given the DPA consent checkbox is unchecked, When I try to submit the enrollment, Then I see an error "Privacy consent is required to proceed"
- Given the DPA consent is checked, When the enrollment is submitted, Then the consent timestamp and IP address are recorded in the audit log

### Story 4.2: Data Subject Rights — Export
**As an** Admin, **I want to** export all data for a specific student **so that** I can fulfill data subject access requests under RA 10173.

**Acceptance Criteria**:
- Given I am viewing a student profile, When I click "Export Student Data", Then a CSV/JSON file downloads containing all student data, enrollment records, billing records, and payment records
- Given the export is generated, When it completes, Then an audit log entry is created recording who exported whose data and when

### Story 4.3: Data Subject Rights — Deletion
**As an** Admin, **I want to** delete a student's data upon request **so that** I can fulfill data erasure requests under RA 10173.

**Acceptance Criteria**:
- Given I am viewing a student profile, When I click "Delete Student Data", Then I see a confirmation dialog warning that this will delete all related records (enrollment, billing, payments)
- Given I confirm deletion, When the deletion executes, Then the student and all related records are soft-deleted (marked as deleted but retained for audit purposes for the legally required retention period)
- Given a student is soft-deleted, When anyone searches for them, Then they do not appear in search results
- Given the deletion occurs, When it completes, Then an audit log entry records the deletion with the reason "Data subject erasure request"

---

## Story Map — Persona to Story Mapping

| Story | Admin (Maria) | Registrar (Jose) | Finance (Ana) |
|-------|:---:|:---:|:---:|
| 1.1 Login | x | x | x |
| 1.2 Manage Users | x | | |
| 1.3 Audit Logs | x | | |
| 1.4 Export Reports | x | | |
| 2.1 Create Enrollment | | x | |
| 2.2 Approve/Reject Enrollment | | x | |
| 2.3 Manage Students | | x | |
| 3.1 Individual Billing | | | x |
| 3.2 Bulk Billing | | | x |
| 3.3 Record Payment | | | x |
| 3.4 View Balances | | | x |
| 4.1 DPA Consent | x | x | |
| 4.2 Data Export | x | | |
| 4.3 Data Deletion | x | | |

## INVEST Validation

| Criteria | Status | Notes |
|----------|--------|-------|
| **Independent** | Pass | Each epic can be developed and delivered independently |
| **Negotiable** | Pass | Sub-tasks within epics can be adjusted without affecting other epics |
| **Valuable** | Pass | Each epic delivers value to a specific persona |
| **Estimable** | Pass | Coarse-grained epics with clear sub-tasks are estimable by 2-3 dev team |
| **Small** | Pass | Each epic fits within 2-3 sprints (2-week sprints) |
| **Testable** | Pass | All acceptance criteria use Given/When/Then format, directly testable |
