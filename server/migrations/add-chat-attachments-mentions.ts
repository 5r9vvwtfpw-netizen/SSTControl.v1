import { sql } from "drizzle-orm";
import { db } from "../db";

export async function addChatAttachmentsMentions() {
  console.log("[Migration] Adding attachments and mentions columns to support_chat_messages...");
  try {
    await db.execute(sql`
      ALTER TABLE support_chat_messages
      ADD COLUMN IF NOT EXISTS attachments text[],
      ADD COLUMN IF NOT EXISTS mentions text[]
    `);
    console.log("[Migration] support_chat_messages columns added successfully.");
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log("[Migration] Columns already exist, skipping.");
    } else {
      console.error("[Migration] Error adding columns:", error);
      throw error;
    }
  }
}
