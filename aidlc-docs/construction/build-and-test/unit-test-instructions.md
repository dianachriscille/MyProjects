# Unit Test Execution — EduCore ERP

## Run All Unit Tests
```bash
npm test
# Or directly:
cd apps/api && npx jest --passWithNoTests
```

## Run Specific Test Files
```bash
# Enrollment state machine tests
npx jest test/academic/enrollment.service.spec.ts

# Payment validation tests
npx jest test/finance/payment.service.spec.ts
```

## Test Coverage
```bash
npx jest --coverage
```

## Expected Test Results

### Enrollment Service Tests (enrollment.service.spec.ts)
| Test | Expected |
|------|----------|
| Reject create without DPA consent | PASS — throws BadRequestException |
| Reject submit from non-draft status | PASS — throws BadRequestException |
| Reject approve from non-submitted status | PASS — throws BadRequestException |
| Emit event on approve | PASS — events.emit called with enrollment.approved |

### Payment Service Tests (payment.service.spec.ts)
| Test | Expected |
|------|----------|
| Reject payment exceeding balance | PASS — throws BadRequestException |
| Set status to fully_paid when balance reaches zero | PASS — billing.update called with status: 'fully_paid' |
| Set status to partially_paid for partial payment | PASS — billing.update called with status: 'partially_paid' |

## Total Expected: 7 tests, 0 failures

## Fix Failing Tests
1. Review test output for the specific assertion that failed
2. Check if the service logic matches the expected behavior in business-rules.md
3. Fix the service code or update the test if the business rule changed
4. Rerun: `npx jest --verbose`
