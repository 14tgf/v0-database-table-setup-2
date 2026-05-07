import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = sql();

    // Create support_tickets table
    await db`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create support_messages table
    await db`
      CREATE TABLE IF NOT EXISTS support_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) NOT NULL,
        sender_id UUID NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes
    await db`CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status)`;
    await db`CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id)`;

    console.log('[v0] Support schema initialized successfully');
    return NextResponse.json({ success: true, message: 'Support schema initialized' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error initializing support schema:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
