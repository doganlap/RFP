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

    // Read and execute seed.sql (from root database folder)
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf-8');

    console.log('📝 Executing seed script...');
    await client.query(seedSQL);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log('  ✓ 3 Tenants');
    console.log('  ✓ 7 Users');
    console.log('  ✓ 4 Clients');
    console.log('  ✓ 4 RFPs (2 won, 1 lost, 1 in progress)');
    console.log('  ✓ 2 Win/Loss Analyses');
    console.log('  ✓ 3 Comments with threading');
    console.log('  ✓ 2 Mentions');
    console.log('  ✓ 3 Discussions');
    console.log('  ✓ 4 Integration logs');
    console.log('  ✓ 2 DocuSign envelopes');

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
