import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from 'dotenv';

neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL exists and is non-empty before loading .env
const hasReplitDatabase = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '';

if (!hasReplitDatabase) {
  // No Replit database configured, load from .env file with override
  config({ override: true });
  console.log('[DATABASE] Loading database config from .env file');
} else {
  console.log('[DATABASE] Using Replit database credentials');
}

let databaseUrl = process.env.DATABASE_URL;

// Try to construct from individual PG* variables if DATABASE_URL is still not set
const { PGUSER, PGPASSWORD, PGHOST, PGDATABASE, PGPORT } = process.env;
if (!databaseUrl && PGUSER && PGPASSWORD && PGHOST && PGDATABASE) {
  databaseUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT || 5432}/${PGDATABASE}?sslmode=require`;
  console.log('[DATABASE] Constructed DATABASE_URL from PG* environment variables');
}

if (!databaseUrl || databaseUrl.trim() === '') {
  console.error('[DATABASE] ERROR: No database connection string found!');
  console.error('[DATABASE] Please ensure DATABASE_URL is set in:');
  console.error('[DATABASE] 1. Replit Secrets (Tools > Database > Commands > Environment variables)');
  console.error('[DATABASE] 2. Or in your .env file');
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('[DATABASE] Connecting to database...');
export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
