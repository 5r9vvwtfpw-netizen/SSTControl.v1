import { defineConfig } from "drizzle-kit";

const host = process.env.AWS_RDS_HOST;
const password = process.env.AWS_RDS_PASSWORD;
const user = process.env.AWS_RDS_USER || 'postgres';
const port = process.env.AWS_RDS_PORT || '5432';
const database = process.env.AWS_RDS_DATABASE || 'postgres';

if (!host || !password) {
  throw new Error("AWS_RDS_HOST and AWS_RDS_PASSWORD are required for production migrations");
}

const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
