# EduCore ERP — NFR Requirements

## 1. Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page load time | < 3 seconds | On Philippine 4G (~10 Mbps) |
| API response time (CRUD) | < 500ms | P95 latency |
| API response time (reports/CSV) | < 5 seconds | For up to 500 students |
| Concurrent users | 50 per school | Peak during enrollment season |
| Database query time | < 100ms | P95 for indexed queries |
| Cold start (Render wake) | < 30 seconds | Acceptable for MVP |

### Performance Implementation
- Prisma query optimization: use `select` to fetch only needed fields
- Database indexes on frequently queried columns (studentId, orgId, status, gradeLevel, schoolYearId)
- Pagination on all list endpoints (default 20, max 100 per page)
- Nuxt 3 SSR for initial page load performance
- Vuetify server-side data tables (v-data-table-server) to avoid loading all records

---

## 2. Security Requirements (SECURITY Rules Compliance)

### SECURITY-01: Encryption at Rest and in Transit
- **At rest**: Supabase PostgreSQL encrypted at rest by default (AES-256)
- **In transit**: TLS 1.2+ enforced on all connections
  - Supabase DB: SSL mode = require (Prisma connection string)
  - Render: HTTPS enforced via automatic SSL
  - Cloudflare: Full (strict) SSL mode
- **Status**: COMPLIANT

### SECURITY-02: Access Logging on Network Intermediaries
- **CDN**: Cloudflare free tier includes basic analytics (not full access logs)
- **API Gateway**: No separate API gateway; NestJS handles directly
- **Mitigation**: Application-level request logging covers API access (SECURITY-03)
- **Status**: COMPLIANT (Cloudflare analytics + application logging)

### SECURITY-03: Application-Level Logging
- **Framework**: NestJS built-in Logger (console output to stdout)
- **Format**: Timestamp + log level + context + message
- **Output**: stdout → Render log viewer (retained per Render's policy)
- **PII protection**: Never log student names, DOB, addresses, or guardian info in log messages; audit log stores structured old/new values separately
- **Status**: COMPLIANT

### SECURITY-04: HTTP Security Headers
- **Implementation**: SecurityHeadersMiddleware in CoreModule
- **Headers**:
  - Content-Security-Policy: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` (unsafe-inline required for Vuetify)
  - Strict-Transport-Security: `max-age=31536000; includeSubDomains`
  - X-Content-Type-Options: `nosniff`
  - X-Frame-Options: `DENY`
  - Referrer-Policy: `strict-origin-when-cross-origin`
- **CSP justification**: `unsafe-inline` for style-src required by Vuetify 3's dynamic styling
- **Status**: COMPLIANT (with documented CSP exception)

### SECURITY-05: Input Validation on All API Parameters
- **Implementation**: NestJS ValidationPipe (global) + class-validator DTOs
- **Coverage**: Every endpoint has a DTO with validation decorators
- **SQL injection**: Prisma ORM uses parameterized queries exclusively
- **Request size limit**: 1MB body limit via NestJS configuration
- **String max lengths**: Defined per field in DTOs (see business-rules.md)
- **Status**: COMPLIANT

### SECURITY-06: Least-Privilege Access Policies
- **Implementation**: @Roles() decorator + RolesGuard on every endpoint
- **Role matrix**:
  - Admin: full access
  - Registrar: students + enrollments only
  - Finance: billing + payments only
- **Supabase RLS**: Not used for MVP (single-tenant); designed for future multi-tenant
- **Status**: COMPLIANT

### SECURITY-08: Application-Level Access Control
- **Deny by default**: SupabaseAuthGuard applied globally; only /api/v1/health and /login are public
- **Object-level authorization**: All queries scoped by orgId (single-tenant, but enforced)
- **Function-level authorization**: RolesGuard checks server-side on every request
- **CORS**: Restricted to frontend origin only (Render URL)
- **Token validation**: Supabase JWT validated server-side on every request (signature, expiration, audience)
- **Status**: COMPLIANT

### SECURITY-09: Security Hardening
- **No default credentials**: Supabase generates unique credentials; no hardcoded passwords
- **Error handling**: GlobalExceptionFilter returns generic messages; no stack traces in production
- **Directory listing**: Not applicable (API-only backend)
- **Supabase Storage**: Private buckets by default
- **Status**: COMPLIANT

### SECURITY-10: Software Supply Chain
- **Dependency pinning**: package-lock.json committed to git
- **Vulnerability scanning**: `npm audit` in CI/CD pipeline (GitHub Actions)
- **Docker**: Pinned Node.js base image version (no `latest` tag)
- **Status**: COMPLIANT

### SECURITY-11: Secure Design Principles
- **Separation of concerns**: Auth (CoreModule), business logic (Academic/Finance), admin (AdminModule) are isolated modules
- **Defense in depth**: Cloudflare (DDoS) → SecurityHeaders → AuthGuard → RolesGuard → ValidationPipe → AuditInterceptor
- **Rate limiting**: @nestjs/throttler on auth endpoints (10 requests/minute)
- **Misuse case**: Enrollment form spam prevented by auth requirement (only Registrar can create)
- **Status**: COMPLIANT

### SECURITY-12: Authentication and Credential Management
- **Password policy**: Supabase Auth default (minimum 6 chars); recommend configuring to 8+ in Supabase dashboard
- **Credential storage**: Supabase Auth handles bcrypt hashing
- **MFA**: Supabase Auth supports TOTP MFA; enabled for admin accounts
- **Session management**: JWT with 1-hour expiration; refresh tokens handled by Supabase client
- **Brute-force protection**: @nestjs/throttler rate limiting on login proxy endpoint + Supabase's built-in protection
- **No hardcoded credentials**: All secrets in environment variables (Render env vars)
- **Status**: COMPLIANT

### SECURITY-13: Software and Data Integrity
- **Deserialization**: class-transformer with whitelist strategy (strips unknown properties)
- **CI/CD integrity**: GitHub Actions with pinned action versions
- **CDN resources**: Vuetify loaded from npm bundle (not CDN), no SRI needed
- **Data integrity**: AuditInterceptor logs all mutations with actor, timestamp, old/new values
- **Status**: COMPLIANT

### SECURITY-14: Alerting and Monitoring
- **Security event alerting**: MVP uses console logging only; no automated alerting
- **Mitigation**: Log authentication failures and authorization violations to stdout with structured format for manual review
- **Log retention**: Render free tier retains logs for limited period; Supabase audit_logs table provides permanent application-level audit trail
- **Status**: PARTIAL COMPLIANCE — alerting deferred to post-MVP; audit_logs table provides permanent record; documented as accepted risk for MVP

### SECURITY-15: Exception Handling and Fail-Safe Defaults
- **Global error handler**: GlobalExceptionFilter catches all unhandled exceptions
- **Fail closed**: Auth failures return 401; authorization failures return 403; validation failures return 400
- **Resource cleanup**: Prisma handles connection pooling; NestJS lifecycle hooks for cleanup
- **User-facing errors**: Generic messages only ("An error occurred", "Invalid request")
- **Status**: COMPLIANT

---

## 3. Availability and Reliability

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| Uptime | Best-effort | Render free tier; auto-sleep after 15 min inactivity |
| Cold start | < 30 seconds | Acceptable for MVP pilot (1-5 schools) |
| Data durability | 99.9% | Supabase managed PostgreSQL with daily backups |
| Backup retention | 7 days | Supabase free tier built-in |
| Recovery time | < 1 hour | Restore from Supabase backup |
| Failover | None | Single instance; no redundancy for MVP |

### Accepted Risks (MVP)
- Render auto-sleep causes ~30s delay on first request after inactivity
- No automated alerting on downtime
- Single region deployment (no geo-redundancy)
- No load balancer (single Render instance)

---

## 4. Observability and Monitoring

| Aspect | Implementation | Cost |
|--------|---------------|------|
| Application logs | NestJS Logger → stdout → Render log viewer | Free |
| Error tracking | Console error logs; manual review | Free |
| Database monitoring | Supabase dashboard (connections, queries, storage) | Free |
| Uptime monitoring | None for MVP | Free |
| Performance metrics | None for MVP | Free |

### Log Format
```
[Nest] [timestamp] [LOG|WARN|ERROR] [Context] Message
```

### What Gets Logged
- All HTTP requests (method, path, status code, response time)
- Authentication failures (email, IP, timestamp)
- Authorization failures (userId, role, attempted resource)
- Business logic errors (enrollment state violations, payment validation failures)
- Unhandled exceptions (stack trace in dev, generic in production)

### What Does NOT Get Logged
- Student PII (names, DOB, addresses, guardian info)
- Passwords or tokens
- Full request/response bodies

---

## 5. DPA Data Protection Requirements

| Requirement | Implementation | DPA Reference |
|-------------|---------------|---------------|
| Encryption at rest | Supabase PostgreSQL AES-256 | Section 20(c) |
| Encryption in transit | TLS 1.2+ on all connections | Section 20(c) |
| Access control | RBAC with 3 roles; auth on every endpoint | Section 20(b) |
| Audit trail | AuditInterceptor logs all data changes | Section 20(d) |
| Consent collection | DPA checkbox on enrollment form with timestamp | Section 12 |
| Data subject access | Export all student data as CSV/JSON | Section 16(c) |
| Data erasure | Soft-delete student + cascade to related records | Section 16(e) |
| Data retention | Audit logs retained 5+ years; student data per DepEd requirements | Section 11(e) |
| Breach notification | Audit logs enable investigation; manual notification process | Section 20(f) |
| DPO designation | Organization profile includes DPO name and email | Section 24 |

### PII Classification

| Field | Sensitivity | Storage | Search |
|-------|------------|---------|--------|
| Student name | High | Plaintext (DB encrypted at rest) | Full-text search enabled |
| Date of birth | High | Plaintext (DB encrypted at rest) | Exact match filter |
| Address | High | JSONB (DB encrypted at rest) | Not searchable |
| Guardian name | High | Plaintext (DB encrypted at rest) | Not searchable |
| Guardian contact | High | Plaintext (DB encrypted at rest) | Not searchable |
| LRN | Medium | Plaintext (DB encrypted at rest) | Exact match search |
| Email | Medium | Plaintext (DB encrypted at rest) | Exact match search |
| Grade level | Low | Plaintext | Filter/search |
| Billing amounts | Medium | Plaintext (DB encrypted at rest) | Not searchable |

### Trade-off Documentation
Application-level encryption of PII fields was considered but deferred for MVP because:
1. Supabase provides encryption at rest (AES-256) and in transit (TLS 1.2+)
2. Application-level encryption would break search/filter on student names (core functionality)
3. The 2-3 dev team cannot absorb the complexity within 3 months
4. DPA Section 20(c) requires "reasonable and appropriate" measures — DB-level encryption meets this standard
5. Post-MVP: column-level encryption can be added for high-sensitivity fields if required by NPC audit
