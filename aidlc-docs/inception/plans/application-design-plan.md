# Application Design Plan — EduCore ERP MVP

## Plan Overview
This plan defines the approach for identifying components, their interfaces, service layer orchestration, and dependency relationships for the EduCore ERP modular monolith.

---

## Part A: Design Questions

### Question 1
How should the NestJS modules be organized?

A) By domain entity — one module per entity (StudentModule, EnrollmentModule, BillingModule, etc.)
B) By bounded context — grouped modules (AcademicModule containing students+enrollment, FinanceModule containing billing+payments)
C) By user role — modules aligned to role workflows (RegistrarModule, FinanceModule, AdminModule)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 2
How should modules communicate with each other (e.g., when enrollment is approved, billing needs to be notified)?

A) Direct service injection — EnrollmentService directly calls BillingService (simple, coupled)
B) Event-driven — EnrollmentService emits an event, BillingService listens (decoupled, future microservice-ready)
C) Orchestration service — a WorkflowService coordinates between modules (centralized control)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
How should the API be structured?

A) RESTful with resource-based URLs (e.g., /api/v1/students, /api/v1/enrollments)
B) RESTful with role-based grouping (e.g., /api/v1/registrar/enrollments, /api/v1/finance/billing)
C) GraphQL — single endpoint with flexible queries
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
How should the audit trail be implemented?

A) Interceptor pattern — a NestJS interceptor automatically logs all mutations (transparent, no per-module code)
B) Explicit service calls — each module explicitly calls AuditService.log() after mutations (more control, more code)
C) Database triggers — PostgreSQL triggers automatically log changes (no application code needed, harder to debug)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
How should RBAC authorization be enforced on API endpoints?

A) NestJS Guards with decorators — @Roles('admin', 'registrar') on each controller method
B) Middleware-based — route-level middleware that checks role against a permission matrix
C) Policy-based — define policies per resource (e.g., "only registrar can approve enrollment") using CASL or similar library
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part B: Design Execution Plan

After questions are answered, design artifacts will be generated:

- [x] Step 1: Define component inventory (all NestJS modules with responsibilities)
- [x] Step 2: Define component methods (service interfaces with input/output types)
- [x] Step 3: Define service layer (orchestration patterns and cross-module flows)
- [x] Step 4: Define component dependencies (dependency matrix and communication patterns)
- [x] Step 5: Compile into consolidated application-design.md
- [x] Step 6: Validate design completeness against requirements and stories
