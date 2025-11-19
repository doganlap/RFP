import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER || 'rfpuser',
  password: process.env.POSTGRES_PASSWORD || 'rfppass',
  database: process.env.POSTGRES_DB || 'rfpdb',
});
