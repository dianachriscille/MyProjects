# EduCore ERP — Requirements Document

## Intent Analysis Summary

- **User Request**: Design and build a generic, multi-industry ERP platform starting with School ERP for Philippine K-12 schools
- **Request Type**: New Project (Greenfield)
- **Scope Estimate**: System-wide — full ERP platform with core modules + school industry module
- **Complexity Estimate**: Complex — multi-module ERP, Philippine regulatory compliance, multi-industry extensibility
- **MVP Strategy**: Bare minimum 3-month prototype — enrollment form + student list + manual billing record with auth

---

## Functional Requirements

### FR-01: Organization Management
- System supports a single organization (school) per deployment for MVP
- Organization profile: name, address (Philippine format), contact info, school type (K-12)
- Architecture must be designed for future multi-tenant migration (PostgreSQL RLS-ready schema)

### FR-02: User Authentication & Authorization
- User registration and login via Supabase Auth
- Role-based access control with predefined roles: Admin, Registrar, Finance Staff
- Supabase Auth handles: email/password login, session management, JWT tokens
- Application-level RBAC enforced on all API endpoints

### FR-03: Student Management
- Create, read, update student profiles
- Student fields: name, date of birth, gender, address, guardian info, contact, LRN (Learner Reference Number)
- Student list with search and filter (by name, grade level, section, status)
- Student status tracking: applicant, enrolled, withdrawn, graduated
- Extensible metadata field (JSONB) for future custom fields

### FR-04: Enrollment
- Enrollment form: student info + grade level + school year selection
- Enrollment status workflow: Draft → Submitted → Approved → Enrolled (or Rejected)
- Registrar can approve/reject enrollment applications
- Enrollment tied to a specific school year and grade level
- Basic validation: required fields, duplicate detection (by LRN or name+DOB)

### FR-05: Tuition Billing (Manual)
- Finance staff can create billing records for enrolled students
- Billing fields: student, school year, total amount (PHP), description, due date
- Payment recording: amount paid, payment date, payment method (bank transfer), reference number
- Balance calculation: total - sum of payments
- Billing status: unpaid, partially paid, fully paid
- No online payment gateway for MVP — manual recording only

### FR-06: Basic Reporting
- Student list export (CSV)
- Enrollment summary by grade level and school year
- Billing summary: total billed, total collected, outstanding balance
- No dynamic report builder for MVP

### FR-07: Audit Trail
- Log all create/update/delete operations on students, enrollments, and billing records
- Audit fields: user, action, entity type, entity ID, timestamp, old values, new values
- Audit log viewable by Admin role only

---

## Non-Functional Requirements

### NFR-01: Technology Stack
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Backend | NestJS (Node.js + TypeScript) | Modular architecture, TypeScript end-to-end, 2-3 dev team efficiency |
| Frontend | Vue.js (Nuxt 3) | Simpler learning curve for small team, SSR support, good DX |
| Database | PostgreSQL (Supabase free tier) | Free managed DB, built-in RLS for future multi-tenancy, JSONB support |
| Auth | Supabase Auth | Free tier, integrated with Supabase DB, JWT-based, simple setup |
| Hosting | Render (free tier) | Auto-deploy from GitHub, free tier for backend + frontend |
| CI/CD | GitHub Actions | Free for public repos, integrated with Render deployment |
| Containers | Docker + Docker Compose | Local dev parity |

### NFR-02: Performance
- Page load time: < 3 seconds on Philippine 4G connection
- API response time: < 500ms for CRUD operations
- Support up to 50 concurrent users per school (MVP scale)

### NFR-03: Security (DPA RA 10173 Compliance)
- Encryption at rest: Supabase PostgreSQL (encrypted by default)
- Encryption in transit: TLS 1.2+ enforced on all endpoints
- PII fields (student name, DOB, address, guardian info) stored with awareness of DPA requirements
- Audit trail on all PII access and modifications
- Supabase Auth handles secure credential storage (bcrypt hashing)
- Session management: JWT with expiration, secure/httpOnly cookies
- Input validation on all API endpoints (class-validator in NestJS)
- Rate limiting on auth endpoints
- SECURITY extension rules enforced as blocking constraints (see security-baseline.md)

### NFR-04: Deployment Architecture (MVP)
- Single-tenant deployment on Render free tier
- PostgreSQL on Supabase free tier (500MB, 2 projects)
- Supabase Storage for document uploads (1GB free)
- Cloudflare free tier for DNS + SSL + CDN
- GitHub repository (public or private)

### NFR-05: Maintainability
- Modular monolith architecture (NestJS modules as bounded contexts)
- Module boundaries designed for future microservice extraction
- Core platform modules separated from school-specific modules
- Prisma ORM for type-safe database access
- English-only UI for MVP

### NFR-06: Scalability Path (Post-MVP)
- Single-tenant → multi-tenant via PostgreSQL RLS
- Modular monolith → microservices via event-driven module communication
- K-12 → College/University/TESDA via configurable school type
- School ERP → Construction/Hospitality/Service/PMO via industry module pattern
- Manual billing → PayMongo/GCash/Maya integration
- DPA only → DepEd/CHED/BIR/SEC compliance modules

---

## Regulatory Requirements (MVP Scope)

### REG-01: Philippine Data Privacy Act (RA 10173)
- **Data Collection Consent**: Enrollment form must include privacy consent checkbox
- **Purpose Limitation**: Student data used only for enrollment and billing purposes
- **Data Retention**: Define retention period for student records (minimum per DepEd requirements)
- **Data Subject Rights**: Ability to export student data (CSV) and delete records upon request
- **Breach Notification**: Audit logs enable breach investigation; notification process documented
- **DPO Designation**: System supports designating a Data Protection Officer role

### REG-02: Deferred Regulatory (Post-MVP)
- DepEd Learner Information System (LIS) reporting format
- CHED Student Data reporting
- BIR Official Receipt generation for tuition payments
- SEC/DTI business registration compliance

---

## User Roles (MVP)

| Role | Permissions |
|------|------------|
| Admin | Full system access, user management, audit log viewing, system configuration |
| Registrar | Student management, enrollment approval/rejection, student reports |
| Finance | Billing creation, payment recording, financial reports |

---

## MVP Scope Summary (3-Month Target)

### In Scope
- User auth (login/logout/roles) via Supabase Auth
- Student CRUD with search/filter
- Enrollment form + approval workflow (Draft → Submitted → Approved → Enrolled)
- Manual billing + payment recording
- Basic CSV exports (student list, enrollment summary, billing summary)
- Audit trail on all data changes
- DPA consent on enrollment form
- Responsive web UI (desktop + mobile browser)

### Out of Scope (Post-MVP)
- Multi-tenancy
- Online payment gateway
- Parent/student portal
- Faculty management
- Scheduling/timetable
- Grade tracking
- SMS/email notifications
- Dynamic report builder
- Low-code configuration engine
- AI features
- DepEd/CHED/BIR/SEC compliance
- Multiple languages
- Offline/PWA capability
- Native mobile apps
