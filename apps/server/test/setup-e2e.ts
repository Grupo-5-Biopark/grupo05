import * as dotenv from 'dotenv';
import { join } from 'node:path';

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, '../../..', '.env') });

// Override POSTGRES_HOST for e2e tests running on host machine
// (Docker container uses 'postgres', but host uses 'localhost')
if (process.env.POSTGRES_HOST === 'postgres') {
  process.env.POSTGRES_HOST = 'localhost';
}

// Ensure required environment variables are set for e2e tests
const requiredEnvVars = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`,
  );
  console.error('Please ensure your .env file is properly configured.');
  process.exit(1);
}
