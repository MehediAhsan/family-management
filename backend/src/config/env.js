import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
const result = dotenv.config({ path: envPath });

if (result.error && result.error.code !== 'ENOENT') {
  throw new Error(`Could not load backend environment file at ${envPath}: ${result.error.message}`);
}

export const validateDatabaseEnvironment = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'Missing required environment setting: DATABASE_URL. '
      + 'Create backend/.env from backend/.env.example and configure the PostgreSQL connection.',
    );
  }
};

export const validateEnvironment = () => {
  validateDatabaseEnvironment();
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing required environment setting: JWT_SECRET. Configure it in backend/.env.');
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters. Configure it in backend/.env.');
  }
};
