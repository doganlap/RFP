#!/usr/bin/env node
/**
 * Database Migration Script
 * Applies all database schema changes
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rfp_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting database migration...');

    // Read schema.sql (from root database folder)
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Creating database schema...');
    await client.query(schemaSQL);

    console.log('✅ Database migration completed successfully!');
    console.log('\n📊 Created Tables:');
    console.log('  ✓ tenants');
    console.log('  ✓ users');
    console.log('  ✓ user_sessions');
    console.log('  ✓ clients');
    console.log('  ✓ rfps');
    console.log('  ✓ win_loss_analysis');
    console.log('  ✓ comments');
    console.log('  ✓ mentions');
    console.log('  ✓ discussions');
    console.log('  ✓ integration_logs');
    console.log('  ✓ docusign_envelopes');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.message.includes('already exists')) {
      console.log('⚠️  Tables already exist. Use db:reset to drop and recreate.');
    }
  } finally {
    await client.end();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
