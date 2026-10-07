import { validateDatabaseEnvironment } from './env.js';
import pg from 'pg';

const { Pool } = pg;

validateDatabaseEnvironment();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
  max: Number(process.env.DB_POOL_MAX ?? 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
