#!/usr/bin/env node
/**
 * Production Database Setup Script
 * Helps configure and validate production PostgreSQL connection
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductionDatabaseSetup {
  constructor() {
    this.databaseProviders = {
      aws: {
        name: "Amazon RDS PostgreSQL",
        urlFormat: "postgresql://username:password@your-instance.region.rds.amazonaws.com:5432/database_name",
        sslRequired: true,
        setup: [
          "1. Go to AWS RDS Console",
          "2. Create PostgreSQL instance",
          "3. Note the endpoint URL",
          "4. Create database and user",
          "5. Enable SSL connections"
        ]
      },
      gcp: {
        name: "Google Cloud SQL PostgreSQL", 
        urlFormat: "postgresql://username:password@private-ip:5432/database_name",
        sslRequired: true,
        setup: [
          "1. Go to Google Cloud SQL",
          "2. Create PostgreSQL instance",
          "3. Create database and user", 
          "4. Download SSL certificates",
          "5. Configure authorized networks"
        ]
      },
      azure: {
        name: "Azure Database for PostgreSQL",
        urlFormat: "postgresql://username%40servername:password@servername.postgres.database.azure.com:5432/database_name",
        sslRequired: true,
        setup: [
          "1. Go to Azure Portal",
          "2. Create PostgreSQL server",
          "3. Configure firewall rules",
          "4. Create database and user",
          "5. Download SSL certificate"
        ]
      },
      heroku: {
        name: "Heroku Postgres",
        urlFormat: "postgres://username:password@hostname:port/database_name",
        sslRequired: true,
        setup: [
          "1. Go to Heroku Dashboard",
          "2. Create new app",
          "3. Add Heroku Postgres addon",
          "4. Get DATABASE_URL from config vars",
          "5. SSL is enabled by default"
        ]
      },
      supabase: {
        name: "Supabase PostgreSQL",
        urlFormat: "postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres",
        sslRequired: true,
        setup: [
          "1. Go to supabase.com",
          "2. Create new project",
          "3. Get connection string from Settings > Database",
          "4. SSL is enabled by default",
          "5. Configure row-level security"
        ]
      },
      neon: {
        name: "Neon PostgreSQL",
        urlFormat: "postgresql://username:password@hostname.neon.database:5432/database_name",
        sslRequired: true,
        setup: [
          "1. Go to neon.tech",
          "2. Create new project",
          "3. Get connection string",
          "4. SSL is required by default",
          "5. Configure database settings"
        ]
      }
    };
  }

  // Generate secure database configuration
  generateDatabaseConfig() {
    const config = {
      development: {
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/rfp_platform_dev",
        DB_SSL: false,
        DB_POOL_SIZE: 10
      },
      production: {
        DATABASE_URL: "postgresql://CHANGE_USER:CHANGE_PASSWORD@CHANGE_HOST:5432/CHANGE_DB_NAME",
        DB_SSL: true,
        DB_POOL_SIZE: 20,
        DB_POOL_IDLE_TIMEOUT: 30000,
        DB_QUERY_TIMEOUT: 10000,
        DB_CONNECTION_TIMEOUT: 10000,
        DB_IDLE_IN_TRANSACTION_SESSION_TIMEOUT: 10000
      }
    };

    return config;
  }

  // Create production database environment template
  createProductionTemplate() {
    const template = `# =============================================================================
# PRODUCTION DATABASE CONFIGURATION
# =============================================================================
# Choose ONE of the following database providers and update the values:

# Option 1: Amazon RDS PostgreSQL
# DATABASE_URL=postgresql://your_user:your_password@your-instance.region.rds.amazonaws.com:5432/your_db_name

# Option 2: Google Cloud SQL PostgreSQL  
# DATABASE_URL=postgresql://your_user:your_password@your_private_ip:5432/your_db_name

# Option 3: Azure Database for PostgreSQL
# DATABASE_URL=postgresql://your_user%40your_server:your_password@your_server.postgres.database.azure.com:5432/your_db_name

# Option 4: Heroku Postgres (Recommended for quick setup)
# DATABASE_URL=postgres://your_heroku_provided_url_from_config_vars

# Option 5: Supabase (Recommended for modern setup)
# DATABASE_URL=postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres

# Option 6: Neon (Recommended for serverless)
# DATABASE_URL=postgresql://your_user:your_password@your_hostname.neon.database:5432/your_db_name

# =============================================================================
# CURRENT CONFIGURATION (UPDATE THESE VALUES)
# =============================================================================
DATABASE_URL=CHANGE_THIS_TO_YOUR_PRODUCTION_DATABASE_URL
DB_HOST=CHANGE_TO_YOUR_PRODUCTION_HOST
DB_PORT=5432
DB_NAME=rfp_platform_production
DB_USER=CHANGE_TO_YOUR_DB_USER
DB_PASSWORD=CHANGE_TO_YOUR_SECURE_DB_PASSWORD
DB_SSL=true

# Connection Pool Settings (Production Optimized)
DB_POOL_SIZE=20
DB_POOL_IDLE_TIMEOUT=30000
DB_QUERY_TIMEOUT=10000
DB_CONNECTION_TIMEOUT=10000
DB_IDLE_IN_TRANSACTION_SESSION_TIMEOUT=10000

# =============================================================================
# SSL CONFIGURATION (Required for Production)
# =============================================================================
# Most cloud providers require SSL connections
DB_SSL_MODE=require
DB_SSL_REJECT_UNAUTHORIZED=true

# For custom SSL certificates (if needed):
# DB_SSL_CERT_PATH=/path/to/client-cert.pem
# DB_SSL_KEY_PATH=/path/to/client-key.pem
# DB_SSL_CA_PATH=/path/to/ca-cert.pem
`;

    return template;
  }

  // Display provider setup instructions
  displayProviderInstructions() {
    console.log('\\n🗄️  DATABASE PROVIDER SETUP INSTRUCTIONS');
    console.log('='.repeat(60));

    Object.entries(this.databaseProviders).forEach(([key, provider]) => {
      console.log(`\\n📊 ${provider.name}`);
      console.log('─'.repeat(provider.name.length + 4));
      console.log(`URL Format: ${provider.urlFormat}`);
      console.log(`SSL Required: ${provider.sslRequired ? '✅ Yes' : '❌ No'}`);
      console.log('Setup Steps:');
      provider.setup.forEach(step => console.log(`   ${step}`));
    });
  }

  // Validate database URL format
  validateDatabaseURL(url) {
    const patterns = [
      /^postgresql:\/\/[\w%]+:[\w%]+@[\w.-]+:\d+\/\w+$/,
      /^postgres:\/\/[\w%]+:[\w%]+@[\w.-]+:\d+\/\w+$/
    ];

    return patterns.some(pattern => pattern.test(url));
  }

  // Create database migration script
  createMigrationScript() {
    const migrationSQL = `-- Production Database Schema Migration
-- RFP Platform Database Setup

-- Create database (run this first as superuser)
-- CREATE DATABASE rfp_platform_production;

-- Connect to the database, then run the following:

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'sales_rep',
    is_active BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens  
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rate limiting for login attempts
CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RFP data tables
CREATE TABLE IF NOT EXISTS rfps (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    client_company VARCHAR(255),
    deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new',
    stage VARCHAR(50) DEFAULT 'initial_review',
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_rfps_status ON rfps(status);
CREATE INDEX IF NOT EXISTS idx_rfps_stage ON rfps(stage);
CREATE INDEX IF NOT EXISTS idx_rfps_assigned ON rfps(assigned_to);

-- Create admin user (update password hash with your secure password)
INSERT INTO users (email, password_hash, name, role, is_active, email_verified_at)
VALUES (
    'admin@yourcompany.com',
    '$2a$10$example.hash.replace.with.real.bcrypt.hash',
    'System Administrator',
    'admin',
    true,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMIT;
`;

    fs.writeFileSync(path.join(process.cwd(), 'database', 'production-migration.sql'), migrationSQL);
    console.log('✅ Created database/production-migration.sql');
  }

  // Update environment file with database template
  updateEnvironmentFile() {
    const envPath = path.join(process.cwd(), '.env.production');
    const template = this.createProductionTemplate();
    
    // Read current file if it exists
    let currentContent = '';
    if (fs.existsSync(envPath)) {
      currentContent = fs.readFileSync(envPath, 'utf8');
    }

    // Add database section at the beginning
    const updatedContent = `${template}

# =============================================================================
# OTHER PRODUCTION CONFIGURATION
# =============================================================================
${currentContent}`;

    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ Updated .env.production with database configuration template');
  }

  // Main setup function
  async run() {
    console.log('🗄️  PRODUCTION DATABASE SETUP');
    console.log('='.repeat(50));
    
    // Create migration script
    if (!fs.existsSync('database')) {
      fs.mkdirSync('database');
    }
    this.createMigrationScript();

    // Display provider options
    this.displayProviderInstructions();

    // Show quick setup recommendations
    console.log('\\n🚀 QUICK SETUP RECOMMENDATIONS');
    console.log('='.repeat(40));
    console.log('1. 🥇 **Supabase** - Best for modern apps, free tier, built-in auth');
    console.log('2. 🥈 **Heroku Postgres** - Easiest setup, good free tier');  
    console.log('3. 🥉 **Neon** - Serverless, modern, good performance');
    console.log('4. ⭐ **AWS RDS** - Enterprise grade, requires more setup');

    // Generate environment template
    this.updateEnvironmentFile();

    console.log('\\n✅ Database setup preparation complete!');
    console.log('\\n📋 Next steps:');
    console.log('1. Choose a database provider from the list above');
    console.log('2. Follow the setup steps for your chosen provider');
    console.log('3. Update DATABASE_URL in .env.production');
    console.log('4. Run: npm run db:migrate:production (if you have migrations)');
    console.log('5. Test connection with: npm run db:test');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new ProductionDatabaseSetup();
  setup.run();
}

export default ProductionDatabaseSetup;