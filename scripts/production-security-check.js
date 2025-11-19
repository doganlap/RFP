#!/usr/bin/env node
/**
 * Production Security Validation Script
 * Checks for critical security issues before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductionSecurityChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.criticalIssues = [];
  }

  // Check if .env.production exists and has secure values
  checkEnvironmentSecurity() {
    console.log('\n🔍 Checking Environment Security...\n');
    
    const envPath = path.join(process.cwd(), '.env.production');
    
    if (!fs.existsSync(envPath)) {
      this.criticalIssues.push('❌ .env.production file is missing');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Critical security checks
    const securityChecks = [
      {
        pattern: /JWT_SECRET=.*dev-secret|JWT_SECRET=.*your-super-secret/i,
        message: '🚨 CRITICAL: JWT_SECRET contains weak/example values',
        critical: true
      },
      {
        pattern: /DATABASE_URL=.*localhost|DB_HOST=.*localhost/i,
        message: '🚨 CRITICAL: Database still pointing to localhost',
        critical: true
      },
      {
        pattern: /CORS_ORIGINS=.*localhost/i,
        message: '🚨 CRITICAL: CORS origins include localhost',
        critical: true
      },
      {
        pattern: /JWT_SECRET=.{1,31}$/m,
        message: '⚠️  WARNING: JWT_SECRET should be at least 32 characters',
        critical: false
      },
      {
        pattern: /ENABLE_HTTPS=false/i,
        message: '⚠️  WARNING: HTTPS is disabled',
        critical: false
      },
      {
        pattern: /NODE_ENV=development/i,
        message: '🚨 CRITICAL: NODE_ENV is set to development',
        critical: true
      },
      {
        pattern: /mock_|CHANGE_THIS|example|your-instance/i,
        message: '⚠️  WARNING: Found placeholder/mock values in configuration',
        critical: false
      }
    ];

    securityChecks.forEach(check => {
      if (check.pattern.test(envContent)) {
        if (check.critical) {
          this.criticalIssues.push(check.message);
        } else {
          this.warnings.push(check.message);
        }
      }
    });

    // Check for required environment variables
    const requiredVars = [
      'NODE_ENV',
      'JWT_SECRET', 
      'DATABASE_URL',
      'API_PORT',
      'VITE_API_URL'
    ];

    requiredVars.forEach(varName => {
      if (!envContent.includes(`${varName}=`)) {
        this.criticalIssues.push(`🚨 CRITICAL: Missing required variable ${varName}`);
      }
    });
  }

  // Check package.json for production readiness
  checkPackageJsonSecurity() {
    console.log('🔍 Checking Package Configuration...\n');
    
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      this.criticalIssues.push('❌ package.json is missing');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check for production build script
    if (!packageJson.scripts || !packageJson.scripts.build) {
      this.warnings.push('⚠️  WARNING: Missing build script in package.json');
    }

    // Check for security-related dependencies
    const devDeps = packageJson.devDependencies || {};
    const deps = packageJson.dependencies || {};

    // Check for development-only packages in production dependencies
    const devOnlyPackages = ['nodemon', 'webpack-dev-server', 'vite'];
    devOnlyPackages.forEach(pkg => {
      if (deps[pkg]) {
        this.warnings.push(`⚠️  WARNING: ${pkg} should be in devDependencies, not dependencies`);
      }
    });
  }

  // Check for hardcoded secrets in source code
  checkSourceCodeSecurity() {
    console.log('🔍 Checking Source Code for Hardcoded Secrets...\n');
    
    const sourceFiles = this.findJavaScriptFiles('./api');
    
    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for hardcoded secrets
      const secretPatterns = [
        /jwtSecret\s*=\s*['"](.*?)['"](?!.*process\.env)/,
        /secret\s*:\s*['"](.*?)['"](?!.*process\.env)/,
        /password\s*:\s*['"](.*?)['"](?!.*process\.env)/,
        /api[_-]?key\s*:\s*['"](.*?)['"](?!.*process\.env)/
      ];

      secretPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          this.warnings.push(`⚠️  WARNING: Potential hardcoded secret in ${file}`);
        }
      });
    });
  }

  // Find JavaScript files recursively
  findJavaScriptFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.findJavaScriptFiles(fullPath, files);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.ts'))) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  // Generate security report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🛡️  PRODUCTION SECURITY VALIDATION REPORT');
    console.log('='.repeat(60));

    if (this.criticalIssues.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ ALL SECURITY CHECKS PASSED!');
      console.log('🚀 Ready for production deployment.\n');
      return true;
    }

    if (this.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL SECURITY ISSUES (MUST FIX BEFORE DEPLOYMENT):');
      console.log('─'.repeat(50));
      this.criticalIssues.forEach(issue => console.log(issue));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (RECOMMENDED TO FIX):');
      console.log('─'.repeat(30));
      this.warnings.forEach(warning => console.log(warning));
    }

    console.log('\n' + '='.repeat(60));
    
    if (this.criticalIssues.length > 0) {
      console.log('❌ DEPLOYMENT BLOCKED - Fix critical issues first');
      console.log('\nQuick fixes:');
      console.log('1. Run: node -p "require(\'crypto\').randomBytes(32).toString(\'hex\')" > Generate JWT_SECRET');
      console.log('2. Update DATABASE_URL with production database');
      console.log('3. Set CORS_ORIGINS to your production domain');
      console.log('4. Set NODE_ENV=production');
      console.log('5. Enable HTTPS with proper SSL certificates\n');
      return false;
    } else {
      console.log('⚠️  Warnings found but deployment can proceed');
      console.log('🚀 Consider fixing warnings for better security\n');
      return true;
    }
  }

  // Run all security checks
  async runAllChecks() {
    console.log('🛡️  Starting Production Security Validation...');
    
    this.checkEnvironmentSecurity();
    this.checkPackageJsonSecurity();
    this.checkSourceCodeSecurity();
    
    return this.generateReport();
  }
}

// Run the security checker if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new ProductionSecurityChecker();
  checker.runAllChecks().then(passed => {
    process.exit(passed ? 0 : 1);
  });
}

export default ProductionSecurityChecker;