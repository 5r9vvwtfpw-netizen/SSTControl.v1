import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const demoRoomBookings = pgTable("demo_room_bookings", {
  roomId: varchar("room_id").primaryKey(),
  companyId: varchar("company_id").notNull().unique(),
  demoUsername: text("demo_username").notNull().unique(),
  status: text("status").notNull().default("available"),
  assignedProspectEmail: text("assigned_prospect_email"),
  assignedSessionToken: text("assigned_session_token"),
  expiresAt: timestamp("expires_at"),
  lastResetAt: timestamp("last_reset_at"),
  errorMessage: text("error_message"),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertDemoRoomBookingSchema = createInsertSchema(demoRoomBookings).omit({
  updatedAt: true,
});

export type DemoRoomBooking = typeof demoRoomBookings.$inferSelect;
export type InsertDemoRoomBooking = z.infer<typeof insertDemoRoomBookingSchema>;
