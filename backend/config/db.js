/**
 * PostgreSQL Database Connection Pool
 */
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.PGURL || 'postgresql://postgres:postgres@localhost:5432/fee_management_db';

const pool = new Pool({
  connectionString,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

module.exports = pool;
