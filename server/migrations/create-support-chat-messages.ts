import { db } from '../db';

export async function createSupportChatMessages() {
  console.log('[Migration] Sincronizando tabla support_chat_messages...');
  
  try {
    await db.execute(`
      DO $$ BEGIN
        CREATE TYPE support_chat_channel AS ENUM (
          'general', 'soporte_tecnico', 'facturacion',
          'nueva_funcionalidad', 'error_bug', 'capacitacion'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS support_chat_messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id VARCHAR NOT NULL REFERENCES users(id),
        sender_name TEXT NOT NULL,
        content TEXT NOT NULL,
        channel support_chat_channel NOT NULL DEFAULT 'general',
        reply_to_id VARCHAR,
        ticket_ref VARCHAR,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_support_chat_messages_channel 
      ON support_chat_messages(channel, created_at DESC);
    `);

    console.log('[Migration] ✅ Tabla support_chat_messages sincronizada');
  } catch (error: any) {
    console.error('[Migration] Error sincronizando support_chat_messages:', error.message);
    throw error;
  }
}
