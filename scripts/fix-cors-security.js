#!/usr/bin/env node
/**
 * CORS Security Fix Script
 * Replaces insecure CORS wildcards with secure origin validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CORSSecurityFixer {
  constructor() {
    this.fixedFiles = [];
    this.skippedFiles = [];
  }

  // Find all JavaScript files in directory
  findJavaScriptFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.findJavaScriptFiles(fullPath, files);
      } else if (stat.isFile() && item.endsWith('.js')) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  // Fix CORS vulnerability in a single file
  fixCORSInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern to match the insecure CORS configuration
    const insecurePattern = /(\s*)(\/\/\s*CORS headers?\s*\n)(\s*)(res\.setHeader\('Access-Control-Allow-Credentials',\s*'true'\);\s*\n)(\s*)(res\.setHeader\('Access-Control-Allow-Origin',\s*'\*'\);\s*\n)/gm;
    
    if (!insecurePattern.test(content)) {
      this.skippedFiles.push(filePath);
      return false;
    }

    // Secure replacement
    const secureReplacement = `$1$2$3// SECURITY: Use environment variable for allowed origins$1const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];$1const origin = req.headers.origin;$1if (allowedOrigins.includes(origin)) {$1  res.setHeader('Access-Control-Allow-Origin', origin);$1}$1$4`;

    const fixedContent = content.replace(insecurePattern, secureReplacement);
    
    // Write fixed content back to file
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    this.fixedFiles.push(filePath);
    return true;
  }

  // Fix all CORS vulnerabilities in directory
  fixAllCORS(directory = './api') {
    console.log(`🔧 Fixing CORS security vulnerabilities in ${directory}...\\n`);
    
    const files = this.findJavaScriptFiles(directory);
    
    files.forEach(file => {
      try {
        this.fixCORSInFile(file);
      } catch (error) {
        console.error(`❌ Error fixing ${file}: ${error.message}`);
      }
    });

    this.generateReport();
  }

  // Generate fix report
  generateReport() {
    console.log('\\n' + '='.repeat(60));
    console.log('🛡️  CORS SECURITY FIX REPORT');
    console.log('='.repeat(60));

    if (this.fixedFiles.length > 0) {
      console.log('\\n✅ FIXED FILES:');
      console.log('─'.repeat(20));
      this.fixedFiles.forEach(file => {
        console.log(`🔧 ${file.replace(process.cwd(), '.')}`);
      });
    }

    if (this.skippedFiles.length > 0) {
      console.log('\\n⏭️  SKIPPED FILES (No CORS vulnerability found):');
      console.log('─'.repeat(45));
      this.skippedFiles.forEach(file => {
        console.log(`⏭️  ${file.replace(process.cwd(), '.')}`);
      });
    }

    console.log(`\\n📊 SUMMARY:`);
    console.log(`   Files Fixed: ${this.fixedFiles.length}`);
    console.log(`   Files Skipped: ${this.skippedFiles.length}`);
    console.log(`   Total Processed: ${this.fixedFiles.length + this.skippedFiles.length}`);

    if (this.fixedFiles.length > 0) {
      console.log('\\n🚀 CORS security vulnerabilities have been fixed!');
      console.log('📝 Remember to update CORS_ORIGINS in your .env.production file');
      console.log('   Example: CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com');
    } else {
      console.log('\\n✅ No CORS vulnerabilities found or all already fixed!');
    }

    console.log('\\n' + '='.repeat(60));
  }
}

// Run the CORS fixer if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new CORSSecurityFixer();
  fixer.fixAllCORS();
}

export default CORSSecurityFixer;