# Production Deployment Guide

## Step 1: Set Up Vercel Environment Variables

Go to https://vercel.com/your-project-name/settings/environment-variables and add:

```
DATABASE_URL=postgresql://username:password@host:port/rfp_platform
JWT_SECRET=your-secure-secret-key-min-32-characters
API_URL=https://your-domain.com
```

## Step 2: Deploy to Vercel

```bash
# After setting environment variables:
vercel --prod --yes
```

## Step 3: Set Up Real PostgreSQL Database

### Option A: Use Managed Services
- **AWS RDS**: https://aws.amazon.com/rds/postgresql/
- **Azure Database**: https://azure.microsoft.com/services/postgresql/
- **Railway.app**: https://railway.app (Simple, affordable)
- **Heroku Postgres**: https://www.heroku.com/postgres

### Option B: Self-Hosted
- Set up PostgreSQL on your server
- Ensure connection is accessible from Vercel

### Database Setup
```bash
# 1. Create database
createdb rfp_platform

# 2. Run schema
psql rfp_platform < database/schema.sql

# 3. Seed sample data (optional)
psql rfp_platform < database/seed.sql
```

## Step 4: Configure API Endpoints

The Vercel serverless functions are at:
- `/api/auth/login` - Authentication
- `/api/rfp/list` - List RFPs
- `/api/db/connect` - Health check

## Step 5: Update Third-Party Integrations

Add to Vercel Environment Variables:

```
# Salesforce
SALESFORCE_CLIENT_ID=your_id
SALESFORCE_CLIENT_SECRET=your_secret

# HubSpot
HUBSPOT_API_KEY=your_key

# Email (SendGrid)
SENDGRID_API_KEY=your_key
EMAIL_FROM=noreply@your-domain.com

# Slack (optional)
SLACK_WEBHOOK_URL=your_webhook
```

## Step 6: Custom Domain (Optional)

1. Go to Vercel Project Settings > Domains
2. Add your custom domain
3. Update DNS records

## Quick Deployment Commands

```bash
# Build locally
npm run build

# Deploy to Vercel production
vercel --prod --yes

# View logs
vercel logs --prod

# Check deployment status
vercel status
```

## Verification

After deployment:

1. Visit your Vercel URL
2. Check `/api/db/connect` returns database status
3. Test authentication at `/api/auth/login`
4. Verify all routes work without 404 errors

## Production Checklist

- [ ] Real PostgreSQL database configured
- [ ] Environment variables set in Vercel
- [ ] API routes deployed and tested
- [ ] Database migrations applied
- [ ] Third-party integrations configured
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] Custom domain configured (optional)
- [ ] Monitoring and alerts set up
- [ ] Backup strategy in place
- [ ] Security audit completed
