#!/usr/bin/env node
/**
 * Database Seed Script
 * Populates the database with sample data for development and testing
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rfp_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...');

    // Read and execute enhanced_seed.sql (from root database folder)
    const seedPath = path.join(__dirname, '../../database/enhanced_seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf-8');

    console.log('📝 Executing enhanced seed script...');
    await client.query(seedSQL);

    console.log('✅ Enhanced database seeding completed successfully!');
    console.log('\n📊 Enhanced Seeded Data Summary:');
    console.log('  ✓ 10 Tenants');
    console.log('  ✓ 100 Users (distributed across tenants)');
    console.log('  ✓ 100 Clients');
    console.log('  ✓ 100 RFPs (with realistic statuses and values)');
    console.log('  ✓ 100 Win/Loss Analyses');
    console.log('  ✓ 100 Comments with threading');
    console.log('  ✓ 100 Mentions');
    console.log('  ✓ 100 Discussions');
    console.log('  ✓ 100 Integration logs');
    console.log('  ✓ 100 DocuSign envelopes');
    console.log('  ✓ 100 User sessions');
    console.log('  ✓ 100 Documents (if table exists)');
    console.log('\n🎉 Database enriched with realistic sample data for enhanced testing and demonstration!');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    await pool.end();
  }
}

// Run the seed script
seedDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
