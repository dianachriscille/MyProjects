# NFR Design Plan — educore-mvp

## Plan Overview
Incorporate NFR requirements into concrete design patterns and logical components. Most patterns are already defined (middleware pipeline, guards, interceptors). This plan focuses on remaining implementation pattern decisions.

---

## Part A: NFR Design Questions

### Question 1
How should Prisma database errors be handled (e.g., unique constraint violations, foreign key failures)?

A) Map Prisma errors to HTTP-friendly exceptions in a centralized PrismaExceptionFilter (one place, consistent error responses)
B) Handle Prisma errors individually in each service method (more control per case, more code)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
How should the NestJS app and Nuxt 3 frontend be deployed on Render?

A) Monorepo — single repo, two Render services (one for API, one for frontend), shared types via workspace
B) Two separate repos — independent deployment, API types shared via npm package or copy
C) Single Render service — NestJS serves the Nuxt 3 SSR output as a static/SSR middleware (simplest, one deployment)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 3
How should database migrations be managed in production?

A) Run Prisma migrate on application startup (automatic, risk of failed migrations blocking startup)
B) Run Prisma migrate as a separate step in CI/CD before deployment (safer, explicit)
C) Manual migration — developer runs prisma migrate deploy via Render shell (most control, manual)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part B: NFR Design Execution Plan

- [x] Step 1: Design NestJS middleware/guard/interceptor pipeline with implementation details
- [x] Step 2: Design error handling patterns (exception filters, error response format)
- [x] Step 3: Design deployment architecture (Render services, Docker, CI/CD pipeline)
- [x] Step 4: Design database patterns (connection pooling, migration strategy, query optimization)
- [x] Step 5: Design authentication flow (Supabase Auth integration pattern)
