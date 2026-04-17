# EduCore ERP

A modular School ERP platform for Philippine K-12 schools. Built with NestJS, Nuxt 3, Vuetify 3, and Supabase.

## Features (MVP)
- Student management with LRN tracking
- Enrollment workflow (Draft → Submitted → Approved → Enrolled)
- Tuition billing with line items (individual + bulk)
- Payment recording with balance tracking
- Role-based access (Admin, Registrar, Finance)
- Audit trail on all data changes
- DPA (RA 10173) compliance (consent, data export, data deletion)
- CSV report exports

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10 (TypeScript) |
| Frontend | Nuxt 3 + Vuetify 3 |
| Database | PostgreSQL 15 (Supabase) |
| Auth | Supabase Auth |
| Hosting | Render |
| CI/CD | GitHub Actions |

## Quick Start (Local Development)

```bash
git clone <repo-url>
cd educore-erp
cp .env.development .env
docker-compose up -d
docker-compose exec app npx prisma migrate dev
docker-compose exec app npx prisma db seed
# Open http://localhost:3000
```

## Project Structure
```
apps/api/          NestJS backend (CoreModule, AcademicModule, FinanceModule, AdminModule)
apps/web/          Nuxt 3 frontend (Vuetify 3, pages, composables)
packages/shared/   Shared TypeScript types and enums
aidlc-docs/        AI-DLC design documentation
```

## API Endpoints
See `aidlc-docs/inception/application-design/application-design.md` for the full API reference.

## License
MIT
