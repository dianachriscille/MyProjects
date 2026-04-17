# EduCore ERP — Frontend Components (Nuxt 3 + Vuetify 3)

## Page Structure

```
pages/
+-- login.vue                          # Public login page
+-- index.vue                          # Dashboard (redirect by role)
+-- students/
|   +-- index.vue                      # Student list (Registrar, Admin)
|   +-- [id].vue                       # Student detail/edit (Registrar)
+-- enrollments/
|   +-- index.vue                      # Enrollment list (Registrar, Admin)
|   +-- new.vue                        # New enrollment form (Registrar)
|   +-- [id].vue                       # Enrollment detail/approve/reject (Registrar)
+-- billing/
|   +-- index.vue                      # Billing list (Finance, Admin)
|   +-- new.vue                        # New individual billing (Finance)
|   +-- bulk.vue                       # Bulk billing (Finance)
|   +-- [id].vue                       # Billing detail + payments (Finance)
+-- users/
|   +-- index.vue                      # User list (Admin)
|   +-- new.vue                        # New user form (Admin)
+-- audit-logs/
|   +-- index.vue                      # Audit log viewer (Admin)
+-- reports/
|   +-- index.vue                      # Report selection (Admin)
+-- settings/
|   +-- index.vue                      # Org profile (Admin)
```

## Layout Structure

```
layouts/
+-- default.vue                        # Authenticated layout with sidebar
+-- auth.vue                           # Public layout (login page only)
```

### Default Layout (Authenticated)
```
+-------------------------------------------------------+
| AppBar: Logo | School Name | User Menu (logout)       |
+-------+-----------------------------------------------+
|       |                                               |
| Side  |  Main Content Area                            |
| Nav   |  (router-view)                                |
|       |                                               |
| Menu: |                                               |
| - Dashboard                                           |
| - Students    (registrar, admin)                      |
| - Enrollment  (registrar, admin)                      |
| - Billing     (finance, admin)                        |
| - Users       (admin)                                 |
| - Audit Logs  (admin)                                 |
| - Reports     (admin)                                 |
| - Settings    (admin)                                 |
+-------+-----------------------------------------------+
```

## Key Component Specifications

### Login Page (login.vue)
- **Components**: v-card, v-text-field (email), v-text-field (password), v-btn (login)
- **State**: email, password, loading, error
- **API**: Supabase Auth signInWithPassword()
- **Validation**: email required + valid format, password required + min 8 chars
- **Security**: Rate limit feedback (show lockout message after 5 failures)

### Student List (students/index.vue)
- **Components**: v-data-table-server (paginated), v-text-field (search), v-select (grade level filter), v-select (status filter)
- **State**: students[], totalCount, page, search, filters, loading
- **API**: GET /api/v1/students?search=&gradeLevel=&status=&page=&limit=
- **Actions**: Click row -> navigate to student detail; "Export CSV" button -> GET /api/v1/reports/students

### Enrollment Form (enrollments/new.vue)
- **Components**: v-stepper (multi-step form), v-text-field, v-select, v-date-picker, v-checkbox (DPA consent)
- **Steps**: 1) Student Info, 2) Guardian Info, 3) Academic Info, 4) DPA Consent + Review
- **State**: formData (all enrollment fields), currentStep, errors, loading
- **API**: POST /api/v1/enrollments (save draft), PATCH /api/v1/enrollments/:id/submit
- **Validation**: Per-step validation before advancing; DPA consent required on step 4
- **DPA Consent Text**: "I consent to the collection and processing of the above personal information in accordance with Republic Act No. 10173 (Data Privacy Act of 2012). This data will be used solely for enrollment and academic record-keeping purposes."

### Enrollment Queue (enrollments/index.vue)
- **Components**: v-data-table-server, v-chip (status badges), v-select (status filter)
- **State**: enrollments[], totalCount, page, statusFilter, loading
- **API**: GET /api/v1/enrollments?status=submitted&page=&limit=
- **Actions**: Click row -> enrollment detail; status chips color-coded (draft=grey, submitted=orange, approved=green, rejected=red)

### Enrollment Detail (enrollments/[id].vue)
- **Components**: v-card (student info display), v-btn (Approve), v-btn (Reject), v-btn (Resubmit), v-timeline (status history)
- **State**: enrollment, loading, actionLoading
- **API**: GET /api/v1/enrollments/:id, PATCH .../approve, PATCH .../reject
- **Conditional rendering**: Show Approve/Reject buttons only when status = 'submitted' and user role = 'registrar'

### Billing Form (billing/new.vue)
- **Components**: v-autocomplete (student search), v-select (school year), v-date-picker (due date), dynamic line items (v-text-field description + v-text-field amount per row), v-btn (add item), total display
- **State**: studentId, schoolYearId, dueDate, items[], totalAmount (computed), loading
- **API**: POST /api/v1/billing
- **Validation**: Student required, school year required, at least 1 item, all amounts > 0

### Bulk Billing (billing/bulk.vue)
- **Components**: v-select (grade level), v-select (school year), dynamic line items, v-btn (Preview), v-data-table (preview list), v-btn (Create All)
- **State**: gradeLevel, schoolYearId, dueDate, items[], previewStudents[], created, skipped
- **API**: POST /api/v1/billing/bulk (with preview query param), POST /api/v1/billing/bulk (confirm)
- **Flow**: Select grade + items -> Preview (shows eligible students) -> Confirm -> Show results

### Billing Detail (billing/[id].vue)
- **Components**: v-card (billing info), v-data-table (line items), v-data-table (payments), v-chip (status), v-dialog (record payment form)
- **State**: billing, payments[], paymentForm, loading
- **API**: GET /api/v1/billing/:id, POST /api/v1/billing/:id/payments
- **Payment form fields**: amount, paymentDate, referenceNumber
- **Validation**: Amount > 0, amount <= balance

### Audit Log Viewer (audit-logs/index.vue)
- **Components**: v-data-table-server, v-select (entity type filter), v-date-picker (date range), v-dialog (detail view with old/new values diff)
- **State**: logs[], totalCount, page, entityTypeFilter, dateRange, loading
- **API**: GET /api/v1/audit-logs?entityType=&dateFrom=&dateTo=&page=&limit=

## Shared Components

```
components/
+-- AppSidebar.vue                     # Navigation sidebar with role-based menu
+-- AppBar.vue                         # Top bar with school name + user menu
+-- DataTableServer.vue                # Reusable server-side paginated table wrapper
+-- StatusChip.vue                     # Color-coded status badge
+-- ConfirmDialog.vue                  # Reusable confirmation dialog
+-- CurrencyDisplay.vue                # PHP currency formatter
+-- PhoneInput.vue                     # Philippine phone number input with validation
+-- AddressForm.vue                    # Philippine address form (street, barangay, city, province, zip)
```

## State Management

- **Auth state**: Supabase Auth client (useSupabaseUser composable)
- **API calls**: useFetch / $fetch with auth headers (Nuxt 3 built-in)
- **No Pinia needed for MVP**: Component-level state is sufficient; API data fetched per-page
- **Role-based routing**: Nuxt middleware checks user role, redirects unauthorized access

## API Integration Pattern

```typescript
// composables/useApi.ts
// Wraps $fetch with:
// - Base URL from runtime config
// - Authorization header from Supabase session
// - Error handling (401 -> redirect to login)
// - Loading state management
```
