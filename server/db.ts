import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

// Disable SSL certificate validation globally for Node.js
// This is needed for production environments with self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

neonConfig.webSocketConstructor = ws;

const isProduction = process.env.NODE_ENV === 'production';
const hasAwsRds = !!(process.env.AWS_RDS_HOST && process.env.AWS_RDS_PASSWORD);

console.log('[DB-DEBUG] NODE_ENV:', process.env.NODE_ENV);
console.log('[DB-DEBUG] isProduction:', isProduction);
console.log('[DB-DEBUG] AWS_RDS_HOST exists:', !!process.env.AWS_RDS_HOST);
console.log('[DB-DEBUG] AWS_RDS_PASSWORD exists:', !!process.env.AWS_RDS_PASSWORD);
console.log('[DB-DEBUG] hasAwsRds:', hasAwsRds);
console.log('[DB-DEBUG] Will use:', isProduction && hasAwsRds ? 'AWS RDS' : 'Neon');

let pool: NeonPool | PgPool;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>;

if (isProduction && hasAwsRds) {
  const awsConnectionString = `postgresql://${process.env.AWS_RDS_USER || 'postgres'}:${process.env.AWS_RDS_PASSWORD}@${process.env.AWS_RDS_HOST}:${process.env.AWS_RDS_PORT || '5432'}/${process.env.AWS_RDS_DATABASE || 'postgres'}?sslmode=require`;
  
  pool = new PgPool({ 
    connectionString: awsConnectionString,
    ssl: {
      rejectUnauthorized: false // Required for AWS RDS SSL connections
    }
  });
  db = drizzlePg({ client: pool as PgPool, schema });
  
  console.log('[DB] Connected to AWS RDS PostgreSQL (Production with SSL)');
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  // Configure Neon with SSL options to handle certificate issues
  // This is important for production environments using Neon
  pool = new NeonPool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Allow self-signed certificates in production
    }
  });
  db = drizzleNeon({ client: pool as NeonPool, schema });
  
  console.log('[DB] Connected to Neon PostgreSQL (Development/Fallback)');
}

export { pool, db };
