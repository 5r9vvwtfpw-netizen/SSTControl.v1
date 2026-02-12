import cron from "node-cron";
import { isDemoEnabled } from "./types";
import { runHousekeeping } from "./service";
import logger from "../../server/lib/logger";

export function startDemoHousekeepingCron(): void {
  if (!isDemoEnabled()) {
    logger.info("[DemoEngine] Demo mode disabled - housekeeping cron not started");
    return;
  }

  cron.schedule("0 * * * *", async () => {
    if (!isDemoEnabled()) return;

    logger.info("[DemoEngine] Housekeeping cron triggered");
    try {
      const result = await runHousekeeping();
      logger.info({ ...result }, "[DemoEngine] Housekeeping cron completed");
    } catch (error) {
      logger.error({ err: error }, "[DemoEngine] Housekeeping cron failed");
    }
  });

  logger.info("[DemoEngine] Housekeeping cron scheduled (runs every hour)");
}
