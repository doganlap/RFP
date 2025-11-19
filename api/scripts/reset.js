#!/usr/bin/env node
/**
 * Database Reset Script
 * Drops all tables and recreates schema
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const readline = require('readline');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rfp_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function reset() {
  const client = await pool.connect();

  try {
    // Confirm action
    rl.question(
      '⚠️  WARNING: This will DROP all tables and reset the database. Continue? (yes/no): ',
      async (answer) => {
        if (answer.toLowerCase() !== 'yes') {
          console.log('❌ Reset cancelled.');
          rl.close();
          await client.end();
          await pool.end();
          return;
        }

        try {
          console.log('\n🔄 Resetting database...');

          // Drop all tables if they exist
          const dropSQL = `
            DROP TABLE IF EXISTS docusign_envelopes CASCADE;
            DROP TABLE IF EXISTS integration_logs CASCADE;
            DROP TABLE IF EXISTS mentions CASCADE;
            DROP TABLE IF EXISTS comments CASCADE;
            DROP TABLE IF EXISTS discussions CASCADE;
            DROP TABLE IF EXISTS win_loss_analysis CASCADE;
            DROP TABLE IF EXISTS rfps CASCADE;
            DROP TABLE IF EXISTS clients CASCADE;
            DROP TABLE IF EXISTS user_sessions CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS tenants CASCADE;
            DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
            DROP EXTENSION IF EXISTS "pgcrypto" CASCADE;
          `;

          console.log('🗑️  Dropping existing tables...');
          await client.query(dropSQL);

          // Recreate schema
          const schemaPath = path.join(__dirname, '../database/schema.sql');
          const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

          console.log('📝 Creating new schema...');
          await client.query(schemaSQL);

          // Seed data
          const seedPath = path.join(__dirname, '../database/seed.sql');
          const seedSQL = fs.readFileSync(seedPath, 'utf-8');

          console.log('🌱 Seeding database...');
          await client.query(seedSQL);

          console.log('\n✅ Database reset completed successfully!');
          console.log('🎯 All tables recreated and seeded with sample data.');

        } catch (error) {
          console.error('❌ Reset error:', error.message);
          process.exit(1);
        } finally {
          rl.close();
          await client.end();
          await pool.end();
        }
      }
    );

  } catch (error) {
    console.error('Fatal error:', error);
    rl.close();
    await client.end();
    await pool.end();
    process.exit(1);
  }
}

reset();
