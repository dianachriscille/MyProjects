# Story Generation Plan — EduCore ERP MVP

## Plan Overview
This plan defines the methodology for creating user stories for the EduCore ERP bare-minimum MVP: enrollment form + student list + manual billing with auth.

---

## Part A: Planning Questions

Please answer the following questions to guide story creation.

### Question 1
What story breakdown approach should we use?

A) User Journey-Based — stories follow each role's workflow end-to-end (e.g., "Registrar enrolls a student from start to finish")
B) Feature-Based — stories organized by system feature (e.g., all enrollment stories, all billing stories)
C) Persona-Based — stories grouped by user role (e.g., all Admin stories, all Registrar stories)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What level of story granularity is appropriate for a 2-3 dev team on a 3-month timeline?

A) Coarse — epic-level stories (e.g., "As a Registrar, I can manage the entire enrollment process") with sub-tasks
B) Medium — feature-level stories (e.g., "As a Registrar, I can approve an enrollment application") with acceptance criteria
C) Fine — task-level stories (e.g., "As a Registrar, I can click the approve button on an enrollment record and see the status change")
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What acceptance criteria format do you prefer?

A) Given/When/Then (BDD-style) — structured, testable, maps to automated tests
B) Checklist format — simple bullet points of what must be true
C) Scenario-based — describe the user scenario and expected outcome
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
For the enrollment approval workflow (Draft -> Submitted -> Approved -> Enrolled), who can perform each transition?

A) Only Registrar can approve/reject; student/parent submits the form (but for MVP, Registrar enters data on behalf of applicant)
B) Admin and Registrar can both approve/reject
C) Registrar approves, then Finance must also confirm before "Enrolled" status
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
For billing, should Finance staff create billing records individually per student, or in bulk for a grade level/section?

A) Individual only — one billing record per student at a time
B) Bulk — create billing for all enrolled students in a grade level at once
C) Both individual and bulk
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 6
What should happen when a student's enrollment is rejected?

A) Record stays in system with "Rejected" status, can be resubmitted
B) Record is soft-deleted (hidden but recoverable)
C) Registrar must provide a rejection reason, record stays with "Rejected" status
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part B: Story Generation Execution Plan

After questions are answered, stories will be generated in this order:

- [x] Step 1: Create personas.md with 3 user personas (Admin, Registrar, Finance)
- [x] Step 2: Generate authentication stories (login, logout, role-based access)
- [x] Step 3: Generate student management stories (CRUD, search, filter)
- [x] Step 4: Generate enrollment workflow stories (create, submit, approve/reject, status tracking)
- [x] Step 5: Generate billing stories (create billing, record payment, view balance)
- [x] Step 6: Generate reporting stories (CSV exports)
- [x] Step 7: Generate audit trail stories (view logs)
- [x] Step 8: Generate DPA compliance stories (consent, data export, data deletion)
- [x] Step 9: Compile all stories into stories.md with acceptance criteria
- [x] Step 10: Map personas to stories and validate INVEST criteria
