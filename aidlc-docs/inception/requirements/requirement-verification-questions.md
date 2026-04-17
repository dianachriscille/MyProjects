# EduCore ERP — Requirements Verification Questions

Please answer the following questions to help clarify the requirements for the ERP platform.
Fill in your choice after each [Answer]: tag.

---

## Question 1
What is the primary deployment model for the ERP?

A) Multi-tenant SaaS — one deployment serves multiple schools/orgs with data isolation
B) Single-tenant — each school/org gets its own deployment
C) Hybrid — SaaS for small orgs, dedicated for large orgs
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
What is the expected scale for the MVP (first 12 months)?

A) 1–5 schools (pilot phase)
B) 5–20 schools (early adoption)
C) 20–100 schools (growth phase)
D) 100+ schools (scale phase)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
What types of schools should the MVP support?

A) K-12 only (elementary + high school)
B) College/University only
C) Both K-12 and College/University
D) Technical-Vocational (TESDA) schools
E) All of the above
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
What is the team size and composition available for development?

A) 2–3 developers (very small team, full-stack)
B) 4–6 developers (small team, some specialization)
C) 7–10 developers (medium team, full specialization)
D) 10+ developers
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
What is the preferred backend technology?

A) NestJS (Node.js + TypeScript) — modular, enterprise patterns, TypeScript end-to-end
B) Python FastAPI — fast development, good for AI integration later
C) Java Spring Boot — enterprise-grade, strong typing, mature ecosystem
D) No preference — let the architecture decision guide this
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6
What is the preferred frontend technology?

A) Next.js (React + SSR) — fast loads for PH internet, large ecosystem
B) Vue.js (Nuxt) — simpler learning curve, good for smaller teams
C) React SPA — client-side only, simpler deployment
D) No preference — let the architecture decision guide this
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 7
What is the preferred authentication approach?

A) Keycloak — full-featured, self-hosted, OIDC/SAML, free
B) Supabase Auth — simpler, managed, free tier available
C) Firebase Auth — Google-backed, free tier, easy social login
D) Custom auth built into the backend
X) Other (please describe after [Answer]: tag below)

[Answer]:B 

---

## Question 8
What is the preferred hosting/deployment strategy?

A) Railway — simple Docker deployment, free tier, good DX
B) Render — free tier, auto-deploy from GitHub
C) Fly.io — edge deployment, good for PH latency
D) Self-hosted (own servers or Philippine cloud provider)
E) AWS free tier (EC2, RDS, S3)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 9
What payment methods must the billing module support for Philippine schools?

A) Bank transfer only (BDO, BPI, Metrobank, etc.)
B) GCash and Maya (e-wallets) + bank transfer
C) Full payment gateway integration (PayMongo, Dragonpay) + e-wallets + bank
D) Manual/offline payment recording only (no online payments for MVP)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 10
What Philippine regulatory requirements are critical for MVP?

A) Data Privacy Act (RA 10173) compliance only
B) Data Privacy Act + DepEd/CHED reporting requirements
C) Data Privacy Act + DepEd/CHED + BIR tax compliance for tuition receipts
D) All of the above plus SEC/DTI business registration compliance
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 11
What level of offline capability is needed (considering Philippine internet reliability)?

A) None — always-online is acceptable
B) Basic offline viewing of cached data (grades, schedules)
C) Full offline mode with sync when reconnected (PWA)
D) Offline-first architecture with eventual consistency
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 12
What is the priority order for the School ERP modules in the MVP?

A) Enrollment + Student Management + Billing (revenue-focused MVP)
B) Enrollment + Student Management + Grades + Scheduling (academic-focused MVP)
C) All modules at basic level (breadth over depth)
D) Enrollment + Billing + Parent Portal (stakeholder-focused MVP)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 13
Should the ERP support multiple languages?

A) English only (sufficient for Philippine schools)
B) English + Filipino (Tagalog)
C) English + Filipino + regional languages (Cebuano, Ilocano, etc.)
D) Internationalization framework ready, but English only for MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 14
What is the budget constraint for infrastructure and tools?

A) Zero budget — strictly free/open-source tools and free tiers only
B) Minimal budget — under $50/month for hosting and services
C) Moderate budget — under $200/month
D) Flexible — willing to invest in the right tools
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 15
What is the target timeline for the first usable MVP?

A) 3 months (bare minimum viable)
B) 6 months (solid MVP with core features)
C) 9 months (comprehensive MVP)
D) 12 months (full-featured first release)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 16
Who is the primary decision-maker/product owner for this project?

A) A single product owner with school administration experience
B) A technical founder building for their own school
C) A development team building for external school clients
D) A school administrator who will also manage the project
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 17
What mobile experience is required?

A) Responsive web only (no native app)
B) Progressive Web App (PWA) — installable, push notifications
C) Native mobile apps (iOS + Android) planned after MVP
D) Mobile-first responsive web + PWA
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)
C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---
