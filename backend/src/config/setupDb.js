import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateDatabaseEnvironment } from './env.js';

let pool;

try {
  validateDatabaseEnvironment();
  ({ pool } = await import('./db.js'));
  const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));
  const schema = readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.info('Database schema setup completed successfully.');
} catch (error) {
  console.error('Database schema setup failed:', error.message);
  process.exitCode = 1;
} finally {
  if (pool) {
    try {
      await pool.end();
    } catch (error) {
      console.error('Failed to close the PostgreSQL connection pool:', error.message);
      process.exitCode = 1;
    }
  }
}
