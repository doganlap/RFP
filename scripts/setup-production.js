#!/usr/bin/env node
/**
 * Master Production Setup Script
 * Orchestrates all production configuration steps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MasterProductionSetup {
  constructor() {
    this.setupSteps = [
      {
        name: 'Database Configuration',
        script: 'setup-production-database.js',
        description: 'Configure production PostgreSQL database',
        critical: true
      },
      {
        name: 'Domain & CORS Setup',
        script: 'setup-production-domain.js', 
        description: 'Configure production domain and CORS settings',
        critical: true
      },
      {
        name: 'SSL/HTTPS Configuration',
        script: 'setup-ssl-https.js',
        description: 'Setup SSL certificates and HTTPS enforcement',
        critical: true
      },
      {
        name: 'Security Validation',
        script: 'production-security-check.js',
        description: 'Validate production security configuration',
        critical: true
      }
    ];

    this.deploymentPlatforms = {
      vercel: {
        name: "Vercel",
        command: "vercel --prod",
        requirements: ["Domain configured", "Build successful"],
        autoSSL: true,
        autoDomain: true
      },
      netlify: {
        name: "Netlify",
        command: "netlify deploy --prod --dir=dist",
        requirements: ["Build successful", "netlify.toml configured"],
        autoSSL: true,
        autoDomain: true
      },
      firebase: {
        name: "Firebase Hosting",
        command: "firebase deploy --only hosting",
        requirements: ["Firebase project setup", "Build successful"],
        autoSSL: true,
        autoDomain: false
      },
      aws: {
        name: "AWS (S3 + CloudFront)",
        command: "aws s3 sync dist/ s3://your-bucket --delete",
        requirements: ["S3 bucket setup", "CloudFront distribution", "SSL certificate"],
        autoSSL: false,
        autoDomain: false
      },
      custom: {
        name: "Custom Server",
        command: "Custom deployment process",
        requirements: ["Server setup", "SSL certificates", "Database migration"],
        autoSSL: false,
        autoDomain: false
      }
    };
  }

  // Check if all required scripts exist
  validateScripts() {
    console.log('🔍 Validating setup scripts...');
    
    const missing = [];
    for (const step of this.setupSteps) {
      const scriptPath = path.join(__dirname, step.script);
      if (!fs.existsSync(scriptPath)) {
        missing.push(step.script);
      }
    }

    if (missing.length > 0) {
      console.log('❌ Missing required scripts:');
      missing.forEach(script => console.log(`   - ${script}`));
      return false;
    }

    console.log('✅ All setup scripts found');
    return true;
  }

  // Generate production environment template
  generateProductionEnv() {
    const template = `# =============================================================================
# RFP PLATFORM - PRODUCTION ENVIRONMENT CONFIGURATION
# =============================================================================
# 🚨 CRITICAL: Replace ALL placeholder values before deployment!
# Generated: ${new Date().toISOString()}

# =============================================================================
# NODE.JS CONFIGURATION
# =============================================================================
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0

# =============================================================================
# DATABASE CONFIGURATION (CRITICAL - MUST CHANGE)
# =============================================================================
# PostgreSQL Production Database
DATABASE_URL=postgresql://CHANGE_USER:CHANGE_PASSWORD@CHANGE_HOST:5432/CHANGE_DB_NAME
DB_HOST=CHANGE_TO_YOUR_PRODUCTION_HOST
DB_PORT=5432
DB_NAME=rfp_platform_production
DB_USER=CHANGE_TO_YOUR_DB_USER  
DB_PASSWORD=CHANGE_TO_YOUR_SECURE_DB_PASSWORD
DB_SSL=true
DB_POOL_SIZE=20
DB_POOL_IDLE_TIMEOUT=30000
DB_QUERY_TIMEOUT=10000

# =============================================================================
# AUTHENTICATION & SECURITY (CRITICAL - MUST CHANGE)
# =============================================================================
# Generate secure secrets: node -p "require('crypto').randomBytes(32).toString('hex')"
JWT_SECRET=CHANGE_TO_64_CHAR_SECURE_RANDOM_STRING_ABCDEFGHIJKLMNOPQRSTUVWXYZ
JWT_EXPIRY=7d
SESSION_SECRET=CHANGE_TO_64_CHAR_SECURE_SESSION_SECRET_123456789ABCDEFGHIJKLMNOP
BCRYPT_ROUNDS=12

# =============================================================================
# DOMAIN & CORS CONFIGURATION (CRITICAL - MUST CHANGE)
# =============================================================================
# Update with your production domain
VITE_API_URL=https://CHANGE_TO_YOUR_DOMAIN.com/api
VITE_APP_URL=https://CHANGE_TO_YOUR_DOMAIN.com
CORS_ORIGINS=https://CHANGE_TO_YOUR_DOMAIN.com,https://www.CHANGE_TO_YOUR_DOMAIN.com

# =============================================================================
# SSL/HTTPS CONFIGURATION
# =============================================================================
ENABLE_HTTPS=true
FORCE_HTTPS=true
SSL_CERT_PATH=/etc/ssl/certs/your-domain.crt
SSL_KEY_PATH=/etc/ssl/private/your-domain.key

# Security Headers
HSTS_ENABLED=true
HSTS_MAX_AGE=63072000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true

# =============================================================================
# EMAIL CONFIGURATION (HIGH PRIORITY)
# =============================================================================
# Configure with your email service provider
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=CHANGE_TO_YOUR_SMTP_USERNAME
SMTP_PASSWORD=CHANGE_TO_YOUR_SMTP_PASSWORD
SMTP_FROM=noreply@CHANGE_TO_YOUR_DOMAIN.com
SMTP_TLS=true

# =============================================================================
# FILE STORAGE (Optional but recommended)
# =============================================================================
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=CHANGE_TO_YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=CHANGE_TO_YOUR_AWS_SECRET_KEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=CHANGE_TO_YOUR_S3_BUCKET_NAME

# =============================================================================
# REDIS CONFIGURATION (Optional)
# =============================================================================
REDIS_HOST=CHANGE_TO_YOUR_REDIS_HOST
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_TO_YOUR_REDIS_PASSWORD
REDIS_DB=0
REDIS_CACHE_TTL=3600

# =============================================================================
# MONITORING & LOGGING
# =============================================================================
LOG_LEVEL=warn
LOG_FORMAT=json
LOG_TO_FILE=true
LOG_FILE_PATH=./logs/production.log

# Optional monitoring services
SENTRY_DSN=YOUR_SENTRY_DSN_HERE
NEW_RELIC_LICENSE_KEY=YOUR_NEW_RELIC_KEY_HERE

# =============================================================================
# FEATURE FLAGS
# =============================================================================
FEATURE_WIN_LOSS_ANALYSIS=true
FEATURE_COLLABORATION=true
FEATURE_REAL_TIME_NOTIFICATIONS=true
FEATURE_DOCUMENT_SIGNATURES=true
FEATURE_CRM_SYNC=true
FEATURE_ANALYTICS=true

# =============================================================================
# EXTERNAL INTEGRATIONS (Configure as needed)
# =============================================================================
# Salesforce
SALESFORCE_CLIENT_ID=YOUR_SALESFORCE_CLIENT_ID
SALESFORCE_CLIENT_SECRET=YOUR_SALESFORCE_CLIENT_SECRET
SALESFORCE_INSTANCE_URL=https://your-instance.salesforce.com

# HubSpot
HUBSPOT_API_KEY=YOUR_HUBSPOT_API_KEY
HUBSPOT_PORTAL_ID=YOUR_HUBSPOT_PORTAL_ID

# SendGrid
SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
RATE_LIMIT_WINDOW_MS=15000
RATE_LIMIT_MAX_REQUESTS=50
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,txt,png,jpg,jpeg,gif

# DEBUG (DISABLE IN PRODUCTION)
DEBUG=

# =============================================================================
# DEPLOYMENT VALIDATION CHECKLIST
# =============================================================================
# Before deploying, ensure:
# ✅ All CHANGE_* values have been replaced with actual values
# ✅ Secure random strings generated for JWT_SECRET and SESSION_SECRET
# ✅ Production database provisioned and DATABASE_URL updated
# ✅ Domain configured and CORS_ORIGINS updated
# ✅ SSL certificates obtained and configured
# ✅ Email service configured and tested
# ✅ Security validation passes: npm run security:check
# ✅ Production build successful: npm run build
# ✅ All tests pass: npm run test
# =============================================================================
`;

    fs.writeFileSync(path.join(process.cwd(), '.env.production'), template);
    console.log('✅ Generated comprehensive .env.production file');
  }

  // Create production scripts in package.json
  updatePackageScripts() {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      console.log('❌ package.json not found');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add production scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    const productionScripts = {
      'setup:production': 'node scripts/setup-production.js',
      'setup:database': 'node scripts/setup-production-database.js', 
      'setup:domain': 'node scripts/setup-production-domain.js',
      'setup:ssl': 'node scripts/setup-ssl-https.js',
      'security:check': 'node scripts/production-security-check.js',
      'fix:cors': 'node scripts/fix-cors-security.js',
      'deploy:vercel': 'npm run build && vercel --prod',
      'deploy:netlify': 'npm run build && netlify deploy --prod --dir=dist',
      'deploy:firebase': 'npm run build && firebase deploy --only hosting',
      'production:validate': 'npm run security:check && npm run build',
      'production:deploy': 'npm run production:validate && npm run deploy:vercel'
    };

    Object.assign(packageJson.scripts, productionScripts);
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with production scripts');
  }

  // Display setup summary
  displaySetupSummary() {
    console.log('\\n📋 PRODUCTION SETUP SUMMARY');
    console.log('='.repeat(50));
    
    this.setupSteps.forEach((step, index) => {
      const status = step.critical ? '🔴 CRITICAL' : '🟡 OPTIONAL';
      console.log(`${index + 1}. ${step.name} ${status}`);
      console.log(`   ${step.description}`);
      console.log(`   Script: ${step.script}`);
    });
  }

  // Display deployment options
  displayDeploymentOptions() {
    console.log('\\n🚀 DEPLOYMENT PLATFORM OPTIONS');
    console.log('='.repeat(50));

    Object.entries(this.deploymentPlatforms).forEach(([key, platform]) => {
      console.log(`\\n🔧 ${platform.name}`);
      console.log(`   Command: ${platform.command}`);
      console.log(`   Auto SSL: ${platform.autoSSL ? '✅' : '❌'}`);
      console.log(`   Auto Domain: ${platform.autoDomain ? '✅' : '❌'}`);
      console.log('   Requirements:');
      platform.requirements.forEach(req => console.log(`     - ${req}`));
    });
  }

  // Create deployment guide
  createDeploymentGuide() {
    const guide = `# 🚀 PRODUCTION DEPLOYMENT GUIDE

## 🎯 Overview
This guide walks you through deploying the RFP Platform to production.

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Run \`npm run setup:production\` to generate configuration
- [ ] Update all \`CHANGE_*\` values in \`.env.production\`
- [ ] Generate secure JWT secrets
- [ ] Configure production database
- [ ] Set up production domain

### 2. Security Validation  
- [ ] Run \`npm run security:check\` - must pass
- [ ] Run \`npm run fix:cors\` if needed
- [ ] Verify no hardcoded secrets in code
- [ ] Confirm HTTPS enforcement enabled

### 3. Build & Test
- [ ] Run \`npm run build\` successfully
- [ ] Test production build with \`npm run preview\`
- [ ] Verify all features work correctly
- [ ] Check bundle size is acceptable

## 🚀 Quick Deployment

### Option 1: Vercel (Recommended)
\`\`\`bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
npm run deploy:vercel

# 3. Configure custom domain in Vercel dashboard
# 4. Update CORS_ORIGINS and VITE_API_URL
\`\`\`

### Option 2: Netlify  
\`\`\`bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Deploy
npm run deploy:netlify

# 3. Configure custom domain in Netlify dashboard
\`\`\`

### Option 3: Firebase Hosting
\`\`\`bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Initialize Firebase
firebase init hosting

# 3. Deploy
npm run deploy:firebase
\`\`\`

## 🗄️ Database Setup

### PostgreSQL Production Database Options:

1. **Supabase** (Recommended)
   - Go to supabase.com
   - Create new project
   - Get connection string
   - Update DATABASE_URL

2. **Heroku Postgres**
   - Create Heroku app
   - Add Postgres addon
   - Get DATABASE_URL from config

3. **AWS RDS**
   - Create PostgreSQL instance
   - Configure security groups
   - Update DATABASE_URL

4. **Google Cloud SQL**
   - Create PostgreSQL instance
   - Configure authorized networks
   - Update DATABASE_URL

## 🔒 SSL/HTTPS Setup

### For Custom Servers:
\`\`\`bash
# Let's Encrypt (Free SSL)
sudo bash deploy/scripts/setup-ssl-yourdomain.com.sh
\`\`\`

### For Cloud Platforms:
- SSL is automatically configured
- Custom domains may require DNS verification

## 📧 Email Configuration

### Recommended Email Services:
1. **SendGrid** - Reliable, good free tier
2. **AWS SES** - Cost effective for high volume
3. **Mailgun** - Developer friendly
4. **Postmark** - High deliverability

Update SMTP settings in \`.env.production\`

## 🔍 Post-Deployment Validation

\`\`\`bash
# 1. Run SSL health check
bash deploy/scripts/ssl-health-check-yourdomain.com.sh

# 2. Test all critical features
# 3. Monitor error logs
# 4. Check performance metrics
\`\`\`

## 🆘 Troubleshooting

### Common Issues:
1. **Build Fails**: Check for TypeScript errors
2. **CORS Errors**: Verify CORS_ORIGINS setting
3. **Database Connection**: Check DATABASE_URL format
4. **SSL Issues**: Verify certificate installation
5. **Email Not Working**: Check SMTP credentials

### Getting Help:
- Check application logs
- Run \`npm run security:check\`
- Verify all environment variables
- Test locally with \`npm run preview\`

## 📊 Monitoring

### Recommended Tools:
- **Sentry** - Error tracking
- **New Relic** - Performance monitoring  
- **LogRocket** - Session replay
- **Uptime Robot** - Availability monitoring

Add monitoring DSNs to \`.env.production\`

## 🚀 Success!

Your RFP Platform is now live in production! 

Next steps:
1. Set up monitoring and alerts
2. Configure backup procedures
3. Document any custom configurations
4. Train users on the new system

---

For technical support or questions, refer to the documentation in this repository.
`;

    fs.writeFileSync(path.join(process.cwd(), 'DEPLOYMENT_GUIDE.md'), guide);
    console.log('✅ Created comprehensive DEPLOYMENT_GUIDE.md');
  }

  // Main setup orchestration
  async run() {
    console.log('🚀 RFP PLATFORM - MASTER PRODUCTION SETUP');
    console.log('='.repeat(60));
    console.log('This script will prepare your application for production deployment');
    console.log('');

    // Validate scripts exist
    if (!this.validateScripts()) {
      console.log('❌ Cannot continue without required scripts');
      process.exit(1);
    }

    // Generate production configuration
    console.log('\\n📝 Generating production configuration...');
    this.generateProductionEnv();
    this.updatePackageScripts();
    this.createDeploymentGuide();

    // Display setup information
    this.displaySetupSummary();
    this.displayDeploymentOptions();

    console.log('\\n✅ PRODUCTION SETUP COMPLETE!');
    console.log('='.repeat(40));
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. 📝 Edit .env.production - replace all CHANGE_* values');
    console.log('2. 🗄️  Setup database: npm run setup:database');
    console.log('3. 🌐 Configure domain: npm run setup:domain');  
    console.log('4. 🔒 Setup SSL: npm run setup:ssl');
    console.log('5. 🔍 Validate security: npm run security:check');
    console.log('6. 🏗️  Build & test: npm run build && npm run preview');
    console.log('7. 🚀 Deploy: npm run production:deploy');
    console.log('');
    console.log('📖 Read DEPLOYMENT_GUIDE.md for detailed instructions');
    console.log('');
    console.log('🎯 Quick setup commands:');
    console.log('   npm run setup:database    # Database configuration');
    console.log('   npm run setup:domain      # Domain & CORS setup');
    console.log('   npm run setup:ssl         # SSL/HTTPS setup');
    console.log('   npm run security:check    # Security validation');
    console.log('   npm run production:deploy # Build & deploy');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new MasterProductionSetup();
  setup.run();
}

export default MasterProductionSetup;