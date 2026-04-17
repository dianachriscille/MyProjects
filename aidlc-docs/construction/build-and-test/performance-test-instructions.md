# Performance Test Instructions — EduCore ERP

## Performance Requirements (from NFR)
| Metric | Target |
|--------|--------|
| Page load time | < 3 seconds (PH 4G) |
| API response (CRUD) | < 500ms P95 |
| API response (reports) | < 5 seconds |
| Concurrent users | 50 per school |
| Cold start (Render wake) | < 30 seconds |

## Performance Testing (Post-MVP)

Performance testing is deferred to post-MVP. For the pilot phase (1-5 schools, ~50 concurrent users), the free tier infrastructure is expected to be sufficient.

### When to Run Performance Tests
- Before onboarding the 6th school
- Before enrollment season (peak load period)
- After any significant architecture change

### Recommended Tool: k6 (Free, Open Source)
```bash
# Install k6
brew install k6

# Example load test script (save as load-test.js)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 50 },   // Hold at 50 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
  },
};

export default function () {
  const res = http.get('https://educore-mvp.onrender.com/api/v1/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}

# Run
k6 run load-test.js
```

### Key Metrics to Monitor
- API response time P50, P95, P99
- Error rate under load
- Database connection pool utilization (Supabase dashboard)
- Memory usage (Render dashboard)
