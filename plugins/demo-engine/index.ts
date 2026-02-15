export { default as demoEngineRouter } from "./routes";
export { initializeDemoRooms } from "./service";
export { startDemoHousekeepingCron } from "./cron";
export { isDemoEnabled } from "./types";
export { demoReadOnlyMiddleware } from "./readonly-middleware";

export const PLUGIN_INFO = {
  name: "demo-engine",
  version: "1.0.0",
  description: "SST Demo Engine - Hotel Room Model for prospect demos",
  author: "SST Colombia",
  mountPath: "/api/demo",
  tables: ["demo_room_bookings"],
  envVars: ["ENABLE_DEMO_MODE"],
};
