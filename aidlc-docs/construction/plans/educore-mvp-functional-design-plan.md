# Functional Design Plan — educore-mvp

## Plan Overview
Detailed business logic design for the EduCore MVP unit (modular monolith). Covers domain entities, business rules, state machines, validation logic, and frontend components.

---

## Part A: Design Questions

### Question 1
For the enrollment state machine, should there be a time limit on how long an enrollment can stay in "Submitted" status before auto-expiring?

A) No time limit — enrollments stay in "Submitted" until manually approved/rejected
B) Auto-expire after 30 days — status changes to "Expired" if not acted on
C) Configurable per school year — admin sets a deadline for enrollment processing
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
For student LRN (Learner Reference Number), what validation rules apply?

A) Optional free-text field — no format validation (some transferees may not have LRN yet)
B) Optional but validated format — 12-digit numeric string when provided (DepEd standard)
C) Required for all students — must be 12-digit numeric
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
For billing amounts, should the system support line items (tuition, miscellaneous fees, lab fees) or just a single total amount?

A) Single total amount only — Finance enters one lump sum per student (bare minimum)
B) Line items — Finance can add multiple fee items that sum to the total (more detailed)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 4
What school year format should the system use?

A) Academic year format: "2025-2026" (Philippine standard for K-12)
B) Calendar year: "2025"
C) Configurable label — admin defines school year names
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
For the Nuxt 3 frontend, what UI component library should be used?

A) PrimeVue — rich component library, free, good data tables and forms
B) Vuetify 3 — Material Design, comprehensive, popular
C) Naive UI — lightweight, TypeScript-first, good defaults
D) No library — use Tailwind CSS with custom components (maximum control, more work)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part B: Functional Design Execution Plan

- [x] Step 1: Define domain entities with all fields, types, and relationships
- [x] Step 2: Define enrollment state machine with all transitions and guards
- [x] Step 3: Define billing lifecycle with status transitions and balance rules
- [x] Step 4: Define all business rules and validation logic per entity
- [x] Step 5: Define frontend component hierarchy and page structure
- [x] Step 6: Validate completeness against all 14 user stories
