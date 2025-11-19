# 🚀 Quick Start Guide

## Status: ✅ FULLY OPERATIONAL

Your RFP Platform is ready for use!

---

## 🎯 Quick Links

- **Production**: https://rfp-j7j7h5fny-donganksa.vercel.app
- **GitHub**: https://github.com/doganlap/RFP
- **Database**: PostgreSQL (rfp_platform) - 11 tables, 4 RFPs, 11 users

---

## 🔧 Start Development

```bash
# 1. Install dependencies
npm install

# 2. Start frontend (http://localhost:5175)
npm run dev

# 3. In another terminal, start API (http://localhost:3001)
cd api && npm install && npm start
```

---

## 📊 Features Available

✅ **Win/Loss Analysis** - Track competitive wins and losses
✅ **CRM Integrations** - Salesforce, HubSpot, etc.
✅ **Collaboration** - Real-time team collaboration
✅ **SLA Monitoring** - Track response times
✅ **Task Management** - Assign and track tasks
✅ **Clarifications** - Request/respond to clarifications

---

## 🗄️ Database Info

**Connected Database**: `rfp_platform`

**Sample Data**:
- 11 Users (various roles)
- 4 RFPs (sample records)
- All tables configured and ready

**Test Data Available**:
- Admin user: `admin@example.com`
- Sales rep: `sales1@example.com`
- See `database/seed.sql` for all users

---

## 🚢 Deploy to Production

```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod --yes

# Done! Check your production URL
```

---

## 🔑 Environment Variables

### Development (`.env`)
```
VITE_API_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rfp_platform
```

### Production (`.env.production`)
```
VITE_API_URL=https://your-api.com
DATABASE_URL=postgresql://user:pass@your-host:5432/rfp_platform
```

---

## 📝 API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/db/connect` | GET | Health check |
| `/api/auth/login` | POST | User login |
| `/api/rfp/list` | GET | List RFPs |
| `/api/rfp/create` | POST | Create RFP |

---

## 🛠️ Troubleshooting

### Database not connecting?
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check database exists
psql -U postgres -l | grep rfp_platform

# Verify connection string in .env
cat .env | grep DATABASE_URL
```

### API not responding?
```bash
# Check if port 3001 is in use
netstat -ano | findstr 3001

# Start API server manually
cd api && npm start
```

### Vercel deployment failing?
```bash
# Check build locally
npm run build

# Check git status
git status

# Push before deploying
git push origin main
```

---

## 📞 Support

For issues or questions:
1. Check `IMPLEMENTATION_FINAL.md` for detailed docs
2. Review error logs: `vercel logs --prod`
3. Check GitHub issues: https://github.com/doganlap/RFP

---

**Last Updated**: November 19, 2025
**Status**: 🟢 PRODUCTION READY
