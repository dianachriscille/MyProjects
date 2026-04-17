# EduCore ERP — Deployment Architecture

## Deployment Flow

```
Developer pushes to main
         |
         v
+---------------------------+
| GitHub Actions            |
| 1. npm ci                 |
| 2. npm audit              |
| 3. tsc --noEmit           |
| 4. npm test               |
| 5. prisma migrate deploy  |----> Supabase DB (migration)
| 6. curl Render deploy hook|
+---------------------------+
         |
         v
+---------------------------+
| Render Build              |
| 1. Pull from GitHub       |
| 2. Build Docker image     |
|    (multi-stage)          |
| 3. Deploy container       |
| 4. Health check           |----> GET /api/v1/health
+---------------------------+
         |
         v
+---------------------------+
| Production Running        |
| educore-mvp.onrender.com  |
| Port 3000                 |
+---------------------------+
```

## Environments

| Environment | Purpose | Infrastructure | URL |
|-------------|---------|---------------|-----|
| Local Dev | Development + testing | Docker Compose (local PG + app) | http://localhost:3000 |
| Production | Live system | Render + Supabase + Cloudflare | https://educore-mvp.onrender.com |

**Note**: No staging environment for MVP (zero budget). Production is the only deployed environment. Testing happens locally via Docker Compose.

## Rollback Procedure

### Application Rollback
```
1. Go to Render Dashboard → educore-mvp → Deploys
2. Find the last working deploy
3. Click "Redeploy" on that version
4. Render rebuilds and deploys the previous version
```

### Database Rollback
```
1. If migration caused the issue:
   - Create a new migration that reverses the change
   - Push to main → CI/CD runs the reverse migration → Render deploys

2. If data corruption:
   - Go to Supabase Dashboard → Database → Backups
   - Restore from most recent daily backup (up to 7 days)
   - Note: restores the ENTIRE database, not individual tables
```

## Operational Procedures

### Viewing Logs
```
Render Dashboard → educore-mvp → Logs
- Filter by: timestamp, log level
- Search for: error messages, user IDs, entity IDs
- Logs retained per Render's free tier policy
```

### Database Access
```
Supabase Dashboard → SQL Editor
- Run ad-hoc queries for debugging
- View table data in Table Editor
- Monitor connections in Database → Roles
```

### Health Check
```
GET https://educore-mvp.onrender.com/api/v1/health

Response (200 OK):
{
  "status": "ok",
  "timestamp": "2025-04-17T15:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

## Cost Summary

| Service | Monthly Cost | Annual Cost |
|---------|-------------|-------------|
| Render Web Service | $0 | $0 |
| Supabase (DB + Auth + Storage) | $0 | $0 |
| Cloudflare (DNS) | $0 | $0 |
| GitHub (repo + Actions) | $0 | $0 |
| Domain | $0 (using Render subdomain) | $0 |
| **Total** | **$0** | **$0** |
