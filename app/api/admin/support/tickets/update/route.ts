import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticket_id, action, status, message } = body;

    if (!ticket_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = sql();

    // Update ticket status if provided
    if (status) {
      await db`UPDATE support_tickets SET status = ${status}, updated_at = NOW() WHERE id = ${ticket_id}`;
    }

    // Add admin reply if provided
    if (message) {
      await db`
        INSERT INTO support_messages (ticket_id, sender_type, sender_id, message)
        VALUES (${ticket_id}, 'admin', ${ticket_id}, ${message})
      `;
      
      await db`UPDATE support_tickets SET updated_at = NOW() WHERE id = ${ticket_id}`;
    }

    console.log('[v0] Ticket updated:', ticket_id, 'action:', action);
    return NextResponse.json({ success: true, message: 'Ticket updated' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error updating ticket:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
