import { Router, Request, Response } from "express";
import { db } from "../../server/db";
import { sql } from "drizzle-orm";
import { runHousekeeping } from "./service";
import logger from "../../server/lib/logger";

const router = Router();

function isTestMode(): boolean {
  return process.env.TEST_MODE === "true" && process.env.NODE_ENV !== "production";
}

router.use((req, res, next) => {
  if (!isTestMode()) {
    return res.status(404).json({ error: "Not found" });
  }
  next();
});

router.post("/demo/expire-room", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }
    
    await db.execute(sql.raw(`
      UPDATE demo_room_bookings 
      SET expires_at = now() - interval '1 minute',
          updated_at = now()
      WHERE room_id = '${roomId.replace(/'/g, "''")}'
    `));
    
    return res.json({ success: true, message: `Room ${roomId} expired` });
  } catch (error: any) {
    logger.error({ err: error }, "[TestHooks] expire-room failed");
    return res.status(500).json({ error: error.message });
  }
});

router.post("/demo/run-housekeeping", async (req: Request, res: Response) => {
  try {
    const result = await runHousekeeping();
    return res.json({ success: true, ...result });
  } catch (error: any) {
    logger.error({ err: error }, "[TestHooks] run-housekeeping failed");
    return res.status(500).json({ error: error.message });
  }
});

router.get("/demo/room-status", async (req: Request, res: Response) => {
  try {
    const rooms = await db.execute(sql.raw(
      `SELECT room_id, company_id, demo_username, status, assigned_prospect_email, assigned_session_token, expires_at, last_reset_at, error_message, updated_at
       FROM demo_room_bookings ORDER BY room_id`
    ));
    const rows = (rooms as any).rows || rooms;
    return res.json({ rooms: rows });
  } catch (error: any) {
    logger.error({ err: error }, "[TestHooks] room-status failed");
    return res.status(500).json({ error: error.message });
  }
});

router.post("/demo/force-available", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }
    
    await db.execute(sql.raw(`
      UPDATE demo_room_bookings 
      SET status = 'available',
          assigned_prospect_email = NULL,
          assigned_session_token = NULL,
          expires_at = NULL,
          error_message = NULL,
          updated_at = now()
      WHERE room_id = '${roomId.replace(/'/g, "''")}'
    `));
    
    const roomResult = await db.execute(sql.raw(
      `SELECT company_id FROM demo_room_bookings WHERE room_id = '${roomId.replace(/'/g, "''")}'`
    ));
    const roomRows = (roomResult as any).rows || roomResult;
    if (roomRows[0]) {
      await db.execute(sql.raw(
        `DELETE FROM users WHERE company_id = '${roomRows[0].company_id}'`
      ));
    }
    
    return res.json({ success: true, message: `Room ${roomId} forced to available` });
  } catch (error: any) {
    logger.error({ err: error }, "[TestHooks] force-available failed");
    return res.status(500).json({ error: error.message });
  }
});

export default router;
