# NFR Requirements Plan — educore-mvp

## Plan Overview
Assess non-functional requirements for the EduCore MVP. Tech stack is already decided (NestJS + Nuxt 3 + Supabase + Render + Vuetify 3). This plan focuses on security implementation details, observability, error handling, and deployment constraints.

---

## Part A: NFR Questions

### Question 1
What logging level and observability is needed for MVP?

A) Minimal — console.log to stdout, rely on Render's built-in log viewer (simplest, zero cost)
B) Structured logging — use a logging library (e.g., nestjs-pino) with JSON output to stdout, viewable in Render logs (better debugging, still zero cost)
C) Full observability — structured logging + Grafana Cloud free tier for dashboards and alerting
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What error notification strategy for production issues?

A) No alerting — check logs manually when issues are reported (bare minimum)
B) Email alerts on critical errors via a free service (e.g., Sentry free tier: 5K errors/month)
C) Slack/Discord webhook notifications on errors (free, requires channel setup)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What database backup strategy for Supabase free tier?

A) Rely on Supabase's built-in daily backups (free tier includes 7-day retention)
B) Supabase backups + weekly manual pg_dump to a free storage (e.g., GitHub release artifact or Supabase Storage)
C) Supabase backups + automated pg_dump via GitHub Actions cron job
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What is the acceptable downtime tolerance for the MVP?

A) Best-effort — Render free tier auto-sleeps after 15 min inactivity, ~30s cold start is acceptable
B) Always-on — upgrade to Render paid ($7/month) to prevent auto-sleep (breaks zero-budget constraint)
C) Accept auto-sleep but implement a health check ping to keep alive during school hours (free workaround)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
How should sensitive PII fields be handled in the database for DPA compliance?

A) Application-level encryption — encrypt PII fields (student name, DOB, address, guardian info) before storing in PostgreSQL using a library like crypto-js (adds complexity, searchable only by exact match)
B) Database-level encryption at rest only — Supabase PostgreSQL is encrypted at rest by default, no additional application encryption (simpler, full search capability)
C) Column-level encryption for high-sensitivity fields only (DOB, address) + database encryption at rest for everything else (balanced approach)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part B: NFR Requirements Execution Plan

- [x] Step 1: Document performance requirements and benchmarks
- [x] Step 2: Document security requirements (SECURITY rules mapping)
- [x] Step 3: Document availability and reliability requirements
- [x] Step 4: Document observability and monitoring requirements
- [x] Step 5: Document DPA-specific data protection requirements
- [x] Step 6: Document tech stack decisions with rationale
