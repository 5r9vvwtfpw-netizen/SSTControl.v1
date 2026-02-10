import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const isProduction = process.env.NODE_ENV === 'production';
const hasAwsRds = !!(process.env.AWS_RDS_HOST && process.env.AWS_RDS_PASSWORD);

const poolConfig = {
  max: 15,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  allowExitOnIdle: false,
};

console.log('[DB-DEBUG] NODE_ENV:', process.env.NODE_ENV);
console.log('[DB-DEBUG] isProduction:', isProduction);
console.log('[DB-DEBUG] AWS_RDS_HOST exists:', !!process.env.AWS_RDS_HOST);
console.log('[DB-DEBUG] AWS_RDS_PASSWORD exists:', !!process.env.AWS_RDS_PASSWORD);
console.log('[DB-DEBUG] hasAwsRds:', hasAwsRds);
console.log('[DB-DEBUG] Will use:', isProduction && hasAwsRds ? 'AWS RDS' : 'Neon');

let pool: NeonPool | PgPool;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>;

if (isProduction && hasAwsRds) {
  const awsConnectionString = `postgresql://${process.env.AWS_RDS_USER || 'postgres'}:${process.env.AWS_RDS_PASSWORD}@${process.env.AWS_RDS_HOST}:${process.env.AWS_RDS_PORT || '5432'}/${process.env.AWS_RDS_DATABASE || 'postgres'}`;
  
  const pgPool = new PgPool({ 
    connectionString: awsConnectionString,
    ...poolConfig,
    ssl: {
      rejectUnauthorized: false
    }
  });

  pgPool.on('error', (err) => {
    console.error('[DB-POOL] Unexpected pool error on idle client:', err.message);
  });

  pgPool.on('connect', (client) => {
    client.on('error', (err) => {
      console.error('[DB-CLIENT] Client error:', err.message);
    });
  });

  pool = pgPool;
  db = drizzlePg({ client: pool as PgPool, schema });
  
  console.log('[DB] Connected to AWS RDS PostgreSQL (Production with SSL, max:', poolConfig.max, 'min:', poolConfig.min, 'connections)');
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  pool = new NeonPool({ 
    connectionString: process.env.DATABASE_URL,
    max: poolConfig.max,
    idleTimeoutMillis: poolConfig.idleTimeoutMillis,
    connectionTimeoutMillis: poolConfig.connectionTimeoutMillis,
    ssl: {
      rejectUnauthorized: false
    }
  });

  pool.on('error', (err: Error) => {
    console.error('[DB-POOL] Unexpected pool error on idle client:', err.message);
  });

  db = drizzleNeon({ client: pool as NeonPool, schema });
  
  console.log('[DB] Connected to Neon PostgreSQL (Development, max:', poolConfig.max, 'connections)');
}

let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

function startKeepAlive() {
  if (keepAliveInterval) return;
  
  const intervalMs = isProduction ? 60000 : 120000;
  
  keepAliveInterval = setInterval(async () => {
    try {
      if ('connect' in pool && typeof (pool as any).connect === 'function') {
        const client = await (pool as any).connect();
        try {
          await client.query('SELECT 1');
        } finally {
          client.release();
        }
      } else {
        await (pool as any).query('SELECT 1');
      }
    } catch (err: any) {
      console.error('[DB-KEEPALIVE] Connection check failed:', err.message);
    }
  }, intervalMs);
  
  keepAliveInterval.unref();
  console.log(`[DB-KEEPALIVE] Started (every ${intervalMs / 1000}s)`);
}

startKeepAlive();

export { pool, db };
