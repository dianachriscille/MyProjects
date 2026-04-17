# Build Instructions — EduCore ERP

## Prerequisites
- **Node.js**: v20 LTS
- **npm**: v10+
- **Docker**: v24+ (for local development)
- **Docker Compose**: v2+
- **Git**: v2+
- **Supabase Account**: Free tier project created (see infrastructure-design.md Section 7)

## Option A: Local Development with Docker Compose (Recommended)

### 1. Clone and Configure
```bash
git clone https://github.com/dianachriscille/MyProjects.git
cd MyProjects
cp .env.development .env
```

### 2. Update .env with Your Supabase Credentials
Edit `.env` and replace placeholder values:
```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
JWT_SECRET=your-actual-jwt-secret
```

### 3. Start the Stack
```bash
docker-compose up -d --build
```

### 4. Run Database Migrations
```bash
docker-compose exec app npx prisma migrate dev --schema=apps/api/prisma/schema.prisma
```

### 5. Seed Initial Data
```bash
docker-compose exec app npx prisma db seed
```

### 6. Verify Build
- Open http://localhost:3000/api/v1/health
- Expected response: `{"status":"ok","database":"connected","version":"1.0.0"}`

### 7. Access the Application
- Open http://localhost:3000
- Login with the seeded admin user (requires Supabase Auth user creation)

## Option B: Direct Local Development (Without Docker)

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate --schema=apps/api/prisma/schema.prisma
```

### 3. Run Migrations (requires DATABASE_URL pointing to a PostgreSQL instance)
```bash
npx prisma migrate dev --schema=apps/api/prisma/schema.prisma
```

### 4. Start Development Servers
```bash
npm run dev
```
This starts both NestJS API (port 3000) and Nuxt 3 dev server concurrently.

## Production Build

### 1. Build All Workspaces
```bash
npm run build
```

### 2. Build Docker Image
```bash
docker build -t educore-erp .
```

### 3. Run Production Container
```bash
docker run -p 3000:3000 --env-file .env.production educore-erp
```

## Build Verification Checklist
- [ ] `docker-compose up` starts without errors
- [ ] Health check returns `{"status":"ok","database":"connected"}`
- [ ] Prisma migrations apply successfully
- [ ] Seed data creates default org, admin user, and school year
- [ ] Login page loads at http://localhost:3000/login
- [ ] TypeScript compilation passes: `npx tsc --noEmit --project apps/api/tsconfig.json`

## Troubleshooting

### Docker Compose: Port 5432 Already in Use
```bash
# Stop local PostgreSQL
sudo lsof -i :5432
# Kill the process or change the port in docker-compose.yml
```

### Prisma Migration Fails
```bash
# Reset database and rerun migrations
npx prisma migrate reset --schema=apps/api/prisma/schema.prisma
```

### npm install Fails with Workspace Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```
