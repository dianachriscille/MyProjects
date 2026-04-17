# EduCore ERP — Business Rules & Validation

## Organization Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| ORG-01 | Organization name is required, max 255 chars | class-validator: @IsNotEmpty, @MaxLength(255) |
| ORG-02 | Organization slug must be unique, lowercase, alphanumeric + hyphens | class-validator: @Matches(/^[a-z0-9-]+$/) |
| ORG-03 | DPO name and email should be set for DPA compliance | Soft warning, not blocking |

## User Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| USR-01 | Email is required, valid format, unique per org | class-validator: @IsEmail; DB unique constraint |
| USR-02 | First name and last name required, max 100 chars each | class-validator: @IsNotEmpty, @MaxLength(100) |
| USR-03 | Role must be one of: admin, registrar, finance | class-validator: @IsIn(['admin','registrar','finance']) |
| USR-04 | Cannot deactivate the last admin user | Service-level check before deactivation |
| USR-05 | Email must match Supabase Auth user email | Sync on create/update |

## Student Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| STU-01 | First name and last name required, max 100 chars | class-validator: @IsNotEmpty, @MaxLength(100) |
| STU-02 | Date of birth required, must be in the past | class-validator: @IsDate, custom validator |
| STU-03 | Gender required, must be 'male' or 'female' | class-validator: @IsIn(['male','female']) |
| STU-04 | Guardian name required, max 255 chars | class-validator: @IsNotEmpty, @MaxLength(255) |
| STU-05 | Guardian contact required, valid PH phone format | class-validator: @Matches(/^(09\d{9}|\+639\d{9})$/) |
| STU-06 | LRN optional; when provided must be exactly 12 digits | class-validator: @IsOptional, @Matches(/^\d{12}$/) |
| STU-07 | LRN must be unique per org (when not null) | DB partial unique index |
| STU-08 | Grade level required, valid K-12 values | @IsIn(['K','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12']) |
| STU-09 | Soft-deleted students excluded from all queries | Global query filter: WHERE isDeleted = false |
| STU-10 | Only admin can soft-delete students | @Roles('admin') guard |

## Enrollment Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| ENR-01 | DPA consent must be true to submit | Service validation: dpaConsentGiven = true |
| ENR-02 | All required student fields must be filled before submit | Validate applicantData JSONB completeness |
| ENR-03 | Cannot submit enrollment that is not in 'draft' status | State machine guard |
| ENR-04 | Cannot approve/reject enrollment that is not in 'submitted' status | State machine guard |
| ENR-05 | Only users with 'registrar' role can approve/reject | @Roles('registrar') guard |
| ENR-06 | Duplicate detection: warn if LRN already exists in system | Service-level check, non-blocking warning |
| ENR-07 | Duplicate detection: warn if name+DOB match exists | Service-level check, non-blocking warning |
| ENR-08 | Resubmit only allowed from 'rejected' status | State machine guard |
| ENR-09 | School year must exist and be active | FK validation + status check |

## Billing Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BIL-01 | Student must exist and have status 'enrolled' | Service validation |
| BIL-02 | One billing per student per school year | DB unique constraint (studentId, schoolYearId) |
| BIL-03 | At least one billing item required | class-validator: @ArrayMinSize(1) |
| BIL-04 | All billing item amounts must be > 0 | class-validator: @IsPositive |
| BIL-05 | Billing item description required, max 255 chars | class-validator: @IsNotEmpty, @MaxLength(255) |
| BIL-06 | Due date required, must be a valid date | class-validator: @IsDate |
| BIL-07 | totalAmount auto-calculated as SUM of billing items | Service-level calculation, not user input |
| BIL-08 | Billing cannot be deleted if payments exist | Service validation |
| BIL-09 | Only users with 'finance' role can create billing | @Roles('finance') guard |

## Payment Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| PAY-01 | Amount must be > 0 | class-validator: @IsPositive |
| PAY-02 | Amount must not exceed billing balance | Service validation: amount <= billing.balance |
| PAY-03 | Payment date required, must be valid date | class-validator: @IsDate |
| PAY-04 | Payment method must be 'bank_transfer' | class-validator: @IsIn(['bank_transfer']) |
| PAY-05 | Reference number optional, max 100 chars | class-validator: @IsOptional, @MaxLength(100) |
| PAY-06 | Only users with 'finance' role can record payments | @Roles('finance') guard |
| PAY-07 | After payment, billing status auto-recalculated | Service-level side effect |

## Audit Log Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| AUD-01 | Audit logs are immutable — no update or delete | No update/delete endpoints; DB-level: no UPDATE/DELETE permissions on table |
| AUD-02 | All POST/PATCH/DELETE API calls auto-logged | AuditInterceptor on all mutation endpoints |
| AUD-03 | PII must not appear in log messages (only in structured old/new values) | Interceptor captures entity data, not log strings |
| AUD-04 | Only admin can view audit logs | @Roles('admin') guard |
| AUD-05 | Audit logs retained minimum 5 years (DPA) | No auto-purge; archival strategy post-MVP |

## School Year Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| SY-01 | Name format: "YYYY-YYYY" (e.g., "2025-2026") | class-validator: @Matches(/^\d{4}-\d{4}$/) |
| SY-02 | Second year must be first year + 1 | Custom validator |
| SY-03 | Only one school year can be 'current' at a time | Service-level: unset previous current before setting new |
| SY-04 | Name must be unique per org | DB unique constraint (orgId, name) |
