import type { Express } from "express";

export function registerDbDiagnosticRoutes(app: Express) {
  app.get("/api/db-diagnostic", async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const hasAwsRdsHost = !!process.env.AWS_RDS_HOST;
    const hasAwsRdsPassword = !!process.env.AWS_RDS_PASSWORD;
    const hasAwsRds = hasAwsRdsHost && hasAwsRdsPassword;
    const usingAwsRds = isProduction && hasAwsRds;
    
    res.json({
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        isProduction,
      },
      database: {
        hasAwsRdsHost,
        hasAwsRdsPassword,
        hasAwsRds,
        usingDatabase: usingAwsRds ? 'AWS RDS' : 'Neon (DATABASE_URL)',
        awsRdsHost: process.env.AWS_RDS_HOST ? `${process.env.AWS_RDS_HOST.substring(0, 15)}...` : 'not set',
        databaseUrlSet: !!process.env.DATABASE_URL,
      },
      decision: usingAwsRds 
        ? 'Production mode with AWS RDS credentials → Using AWS RDS' 
        : isProduction 
          ? 'Production mode but missing AWS RDS credentials → Falling back to Neon'
          : 'Development mode → Using Neon',
    });
  });
}
