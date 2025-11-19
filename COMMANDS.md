# 🎯 RFP Platform - Quick Command Reference

## ⚡ Essential Commands

### Start Development (Most Used)

```bash
# Terminal 1: Start Backend API
cd d:\Projects\RFP\api && npm run dev
# Opens on http://localhost:3001

# Terminal 2: Start Frontend
cd d:\Projects\RFP && npm run dev
# Opens on http://localhost:5175
```

### Database Operations

```bash
# Create database schema
npm run db:migrate

# Populate with sample data
npm run db:seed

# Full reset (WARNING: Destructive!)
npm run db:reset

# Do everything
npm run db:reset && npm run db:migrate && npm run db:seed
```

---

## 🔨 Development Commands

### Frontend Tasks
```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage

# Linting
npm run lint
npm run lint:fix
npm run format
npm run format:check

# Type checking
npm run type-check
```

### Backend Tasks
```bash
# Development (with nodemon auto-reload)
cd api && npm run dev

# Production
cd api && npm start

# Run tests
cd api && npm run test
cd api && npm run test:watch
cd api && npm run test:coverage

# Linting
cd api && npm run lint
cd api && npm run lint:fix

# Build TypeScript
cd api && npm run build
```

### Database Scripts
```bash
# From root directory
npm run db:migrate     # Create schema
npm run db:seed        # Load sample data
npm run db:reset       # Full reset
npm run db:backup      # Backup database

# From api directory
cd api
npm run db:migrate
npm run db:seed
npm run db:reset
```

---

## 🐳 Docker Commands

```bash
# Build Docker image
npm run docker:build

# Run in Docker
npm run docker:run

# Production Docker Compose
npm run docker:prod

# Or directly:
docker-compose up -d              # Development
docker-compose -f docker-compose.production.yml up -d
```

---

## 🔍 Verification Commands

```bash
# Test API health
curl http://localhost:3001/health

# Check database connection
psql -U postgres -d rfp_platform -c "SELECT version();"

# List all RFPs
psql -U postgres -d rfp_platform -c "SELECT id, title, status FROM rfps;"

# Count database records
psql -U postgres -d rfp_platform -c "
  SELECT
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM rfps) as rfps,
    (SELECT COUNT(*) FROM comments) as comments,
    (SELECT COUNT(*) FROM discussions) as discussions;
"

# Check PostgreSQL is running
pg_isready -h localhost -p 5432
```

---

## 🧹 Cleanup Commands

```bash
# Remove node_modules and reinstall
rm -r node_modules && npm install
cd api && rm -r node_modules && npm install

# Clear npm cache
npm cache clean --force

# Clear build artifacts
rm -r dist .vite

# Kill all Node processes
taskkill /F /IM node.exe

# Remove package-lock files
rm -r package-lock.json api/package-lock.json

# Full clean slate
rm -r node_modules api/node_modules dist .vite
npm install
cd api && npm install
```

---

## 📊 Database Queries

```bash
# Connect to database
psql -U postgres -d rfp_platform

# Then run queries:

# Show all tables
\dt

# Show table structure
\d rfps

# Count records
SELECT 'tenants' as table_name, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'rfps', COUNT(*) FROM rfps
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'discussions', COUNT(*) FROM discussions;

# View RFPs
SELECT id, rfp_number, title, status FROM rfps;

# View users
SELECT id, email, name, role FROM users;

# View comments
SELECT id, user_id, content, created_at FROM comments LIMIT 10;
```

---

## 🔐 Environment Setup

```bash
# Copy example to create local env
cp .env.example .env

# Edit environment variables
nano .env  # or use your editor

# Verify environment
echo %DB_HOST%     # Windows
echo $DB_HOST      # Linux/Mac
```

---

## 📦 Installation & Setup

```bash
# Full setup from scratch
npm install
cd api && npm install
npm run db:migrate
npm run db:seed

# Or use setup script
node setup.cjs    # (Windows uses .cjs for CommonJS)
```

---

## 🧪 Testing

```bash
# Frontend tests
npm run test              # Watch mode
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Coverage report

# Backend tests
cd api
npm run test
npm run test:watch
npm run test:coverage

# Specific test file
npm run test src/services/__tests__/AnalyticsService.test.ts
```

---

## 📱 Available Ports

```
3001  - Backend API
5173  - Frontend (default Vite)
5174  - Frontend (if 5173 in use)
5175  - Frontend (if 5173 & 5174 in use)
5432  - PostgreSQL
6379  - Redis (if running)
8081  - Cosmos DB Emulator (if using)
```

---

## 🔄 Git & Version Control

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Feature: Add RFP win/loss analysis"

# Push
git push origin main

# View logs
git log --oneline -10

# Create branch
git checkout -b feature/new-feature

# Merge
git merge feature/new-feature
```

---

## 📤 Deployment

```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Backend production start
cd api && npm start

# Docker production
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose logs -f api
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 🔍 Debugging

```bash
# Enable debug logs
DEBUG=rfp:* npm run dev

# Node debugger
node --inspect server.js

# Frontend source maps
npm run build    # Creates source maps in dist

# Check for errors
npm run lint
npm run type-check

# Network debugging
curl -v http://localhost:3001/api/rfps

# Database query debugging
psql -U postgres -d rfp_platform -E    # Show queries
```

---

## 📊 Performance & Monitoring

```bash
# Check npm dependencies
npm ls
npm outdated

# Audit vulnerabilities
npm audit
npm audit fix    # Auto fix
npm audit fix --force

# Bundle analysis
npm run build -- --report    # If configured

# Backend metrics
curl http://localhost:3001/metrics

# Database size
psql -U postgres -d rfp_platform -c "SELECT pg_size_pretty(pg_database_size('rfp_platform'));"
```

---

## 🚨 Emergency Commands

```bash
# Stop everything
taskkill /F /IM node.exe

# Reset database
npm run db:reset

# Reinstall everything
rm -r node_modules api/node_modules
npm install
cd api && npm install

# Clear all caches
npm cache clean --force
rm -r .next dist .vite

# Kill specific port
lsof -i :3001      # Check process
kill -9 <PID>       # Kill process

# Or on Windows:
netstat -ano | find "3001"
taskkill /PID <PID> /F
```

---

## 💡 Quick Help

```bash
# List all available npm scripts
npm run

# Show Node version
node --version

# Show npm version
npm --version

# Show installed packages
npm list

# Update all packages
npm update

# Install specific version
npm install package-name@1.2.3

# Uninstall package
npm uninstall package-name

# Check what would change
npm ci --dry-run
```

---

## 🎓 Common Workflows

### Complete Fresh Start
```bash
taskkill /F /IM node.exe
rm -r node_modules api/node_modules dist .vite
npm install
cd api && npm install
npm run db:reset
npm run db:migrate
npm run db:seed
npm run api:dev    # Terminal 1
npm run dev        # Terminal 2
```

### Quick Testing Iteration
```bash
# Terminal 1 (stays running)
npm run api:dev

# Terminal 2 (for running tests)
npm run test

# Edit code, tests auto-rerun
```

### Deploy to Production
```bash
npm run build
npm run lint && npm run type-check
npm audit
npm run test
docker-compose -f docker-compose.production.yml up -d
```

### Debug API Issue
```bash
# Terminal 1: Run API with debug output
DEBUG=rfp:* npm run api:dev

# Terminal 2: Make requests
curl http://localhost:3001/health
curl http://localhost:3001/api/rfps

# Check logs for detailed output
```

---

## 📎 Useful Links

- **Frontend:** http://localhost:5175
- **Backend Health:** http://localhost:3001/health
- **PostgreSQL:** localhost:5432
- **API Docs:** See `FEATURES_IMPLEMENTATION.md`
- **Architecture:** See `ARCHITECTURE_SUMMARY.md`

---

## ✨ Pro Tips

1. **Keep two terminals open** - One for backend, one for frontend
2. **Use `npm run` to see all commands** available
3. **Check `.env.example` for all possible variables**
4. **Database issues?** Start with `npm run db:reset`
5. **Port conflicts?** Kill all node: `taskkill /F /IM node.exe`
6. **TypeScript errors?** Run `npm run type-check`
7. **Linting issues?** Auto-fix: `npm run lint:fix`

---

**Last Updated:** 2024
**Platform Version:** 2.0.0
**Status:** Production Ready ✅
