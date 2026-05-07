import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const db = sql();

    // Get ticket details
    const ticketResult = await db`
      SELECT * FROM support_tickets WHERE id = ${ticketId}
    `;

    const ticketArray = Array.isArray(ticketResult) ? ticketResult : (ticketResult?.rows || []);
    const ticket = ticketArray[0];

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Get messages
    const messagesResult = await db`
      SELECT * FROM support_messages WHERE ticket_id = ${ticketId} ORDER BY created_at ASC
    `;

    const messagesArray = Array.isArray(messagesResult) ? messagesResult : (messagesResult?.rows || []);

    return NextResponse.json({ success: true, ticket, messages: messagesArray });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error fetching ticket:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const body = await request.json();
    const { message, sender_type, sender_id } = body;

    if (!message || !sender_type || !sender_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = sql();

    // Add message
    const result = await db`
      INSERT INTO support_messages (ticket_id, sender_type, sender_id, message)
      VALUES (${ticketId}, ${sender_type}, ${sender_id}, ${message})
      RETURNING *
    `;

    const resultArray = Array.isArray(result) ? result : (result?.rows || []);
    const newMessage = resultArray[0];

    // Update ticket updated_at
    await db`UPDATE support_tickets SET updated_at = NOW() WHERE id = ${ticketId}`;

    console.log('[v0] Message added to ticket:', ticketId);
    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error adding message:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
