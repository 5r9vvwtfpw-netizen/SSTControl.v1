import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const isProduction = process.env.NODE_ENV === 'production';
const hasAwsRds = !!(process.env.AWS_RDS_HOST && process.env.AWS_RDS_PASSWORD);

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
  
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool as NeonPool, schema });
  
  console.log('[DB] Connected to Neon PostgreSQL (Development)');
}

export { pool, db };
