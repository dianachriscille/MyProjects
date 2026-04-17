# Infrastructure Design Plan — educore-mvp

## Plan Overview
Map logical components to actual infrastructure services. Most infrastructure decisions are already made (Render + Supabase + Cloudflare). This plan covers remaining deployment details.

---

## Part A: Infrastructure Questions

### Question 1
Do you have a custom domain for the ERP, or will you use the default Render subdomain?

A) Use default Render subdomain (e.g., educore-mvp.onrender.com) — zero cost, no DNS setup
B) Custom domain (e.g., erp.yourschool.edu.ph) — requires domain purchase (~$10-15/year) + Cloudflare DNS
C) Will purchase a domain later — design for custom domain but deploy on Render subdomain for now
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
How should local development work for the 2-3 dev team?

A) Docker Compose only — all devs run the full stack locally via docker-compose up (consistent, heavier)
B) Direct local dev — devs run NestJS and Nuxt locally with npm run dev, connect to shared Supabase cloud project (lighter, simpler)
C) Hybrid — Docker for database (local PostgreSQL), direct npm run dev for app code, Supabase Auth via cloud
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
How should environment configuration be managed across dev/staging/production?

A) .env files only — .env.development, .env.production committed to repo (simple, less secure)
B) .env.example in repo + actual values in Render env vars and local .env (gitignored) — standard practice
C) Use a secrets manager (e.g., Doppler free tier) for centralized env management
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part B: Infrastructure Design Execution Plan

- [x] Step 1: Document complete infrastructure service mapping
- [x] Step 2: Document deployment architecture with network diagram
- [x] Step 3: Document local development setup instructions
- [x] Step 4: Document CI/CD pipeline configuration (GitHub Actions YAML)
- [x] Step 5: Document environment configuration strategy
