import { db } from "./db";
import { sql } from "drizzle-orm";

export async function migrateWhatsAppColumns() {
  try {
    console.log('[MIGRATION] Adding WhatsApp columns to users table...');
    
    // Add new columns to users table
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_phone text`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_notifications boolean DEFAULT true`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_messages boolean DEFAULT true`);
    
    console.log('[MIGRATION] WhatsApp columns added successfully');
    
    // Create WhatsApp messages table
    console.log('[MIGRATION] Creating whatsapp_messages table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id SERIAL PRIMARY KEY,
        campaign_name text NOT NULL,
        message_content text NOT NULL,
        target_audience text NOT NULL,
        target_city text,
        target_category text,
        total_recipients integer DEFAULT 0,
        sent_count integer DEFAULT 0,
        delivered_count integer DEFAULT 0,
        failed_count integer DEFAULT 0,
        status text DEFAULT 'draft',
        scheduled_at timestamp,
        sent_at timestamp,
        completed_at timestamp,
        created_by integer NOT NULL REFERENCES users(id),
        created_at timestamp DEFAULT now()
      )
    `);
    
    console.log('[MIGRATION] whatsapp_messages table created successfully');
    
    // Create WhatsApp message recipients table
    console.log('[MIGRATION] Creating whatsapp_message_recipients table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whatsapp_message_recipients (
        id SERIAL PRIMARY KEY,
        message_id integer NOT NULL REFERENCES whatsapp_messages(id),
        user_id integer NOT NULL REFERENCES users(id),
        phone_number text NOT NULL,
        status text DEFAULT 'pending',
        error_message text,
        sent_at timestamp,
        delivered_at timestamp,
        created_at timestamp DEFAULT now()
      )
    `);
    
    console.log('[MIGRATION] whatsapp_message_recipients table created successfully');
    console.log('[MIGRATION] All WhatsApp migrations completed successfully');
    
    return true;
  } catch (error) {
    console.error('[MIGRATION] Error running WhatsApp migrations:', error);
    return false;
  }
}
