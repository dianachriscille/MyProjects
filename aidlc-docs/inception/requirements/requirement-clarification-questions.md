# EduCore ERP — Clarification Questions

I detected contradictions and potential risks in your responses that need clarification before proceeding.

---

## Contradiction 1: Full Regulatory Compliance vs. 3-Month Timeline + 2-3 Devs
You indicated full Philippine regulatory compliance including DPA + DepEd/CHED + BIR + SEC/DTI (Q10: D), but also a 3-month MVP timeline (Q15: A) with only 2-3 developers (Q4: A). Full regulatory compliance across 4 regulatory bodies is a significant scope that typically requires 6-9 months even with a larger team.

### Clarification Question 1
How should we handle the regulatory compliance vs. timeline tension?

A) Reduce regulatory scope for MVP — implement DPA (RA 10173) compliance only for 3-month MVP, add DepEd/CHED/BIR/SEC compliance in later phases
B) Extend timeline to 6 months to accommodate full regulatory compliance
C) Keep 3-month timeline but implement regulatory compliance as configuration templates (not enforced in code) that can be activated later
D) Prioritize DPA + BIR for MVP (data privacy + tax receipts are most critical), defer DepEd/CHED/SEC to post-MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Contradiction 2: Security Extension Skipped vs. Philippine DPA Compliance
You chose to skip security extension rules (Security: B), but also require Philippine Data Privacy Act compliance (Q10: D). DPA compliance inherently requires security measures like encryption, audit trails, and access controls. Skipping security rules may conflict with DPA requirements.

### Clarification Question 2
How should we handle security in the context of DPA compliance?

A) Enable security extension rules — DPA compliance requires them (change Security answer to A)
B) Keep security rules as non-blocking guidelines — implement DPA-specific security measures only (encryption of PII, audit logs, consent management) without full security enforcement
C) Skip formal security rules but document DPA security requirements separately as part of the requirements
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Contradiction 3: Multi-Tenant SaaS vs. Zero Budget
You chose multi-tenant SaaS (Q1: A) with zero budget (Q14: A). Multi-tenant architecture requires database isolation, tenant-aware middleware, and more complex infrastructure. On Render's free tier, you get limited resources (750 hours/month, 512MB RAM, auto-sleep after 15 min inactivity).

### Clarification Question 3
How should we handle the multi-tenant architecture given zero budget constraints?

A) Start with single-tenant for MVP (simpler, fits free tier), design for multi-tenant migration later
B) Keep multi-tenant but use PostgreSQL Row-Level Security (schema-based isolation) — works on free tier but adds development complexity
C) Use Supabase free tier (includes PostgreSQL with RLS built-in) instead of Render for the database, Render for the app only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Risk Flag: 3-Month Timeline with 2-3 Devs
A 3-month timeline with 2-3 full-stack developers for a multi-tenant ERP with enrollment, student management, and billing is very aggressive. This is not a contradiction but a significant risk.

### Clarification Question 4
What is the acceptable scope reduction to hit 3 months?

A) Bare minimum — enrollment form + student list + manual billing record (essentially a CRUD app with auth)
B) Core flows only — enrollment workflow + student profiles + tuition billing with basic payment tracking (no reports, no parent portal, no scheduling)
C) Extend to 6 months and keep the original scope (Enrollment + Student Mgmt + Billing with proper workflows)
D) 3-month prototype/demo, then 3 more months to production-ready MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
