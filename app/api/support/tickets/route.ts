import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const db = sql();

    const tickets = await db`
      SELECT 
        st.id,
        st.user_id,
        st.subject,
        st.category,
        st.priority,
        st.status,
        st.created_at,
        st.updated_at,
        (SELECT message FROM support_messages WHERE ticket_id = st.id ORDER BY created_at DESC LIMIT 1) as latest_message
      FROM support_tickets st
      WHERE st.user_id = ${userId}
      ORDER BY st.created_at DESC
    `;

    const ticketsArray = Array.isArray(tickets) ? tickets : (tickets?.rows || []);
    return NextResponse.json({ success: true, tickets: ticketsArray });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error fetching user tickets:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, subject, category, priority, message } = body;

    if (!user_id || !subject || !category || !priority || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = sql();

    // Create ticket
    const ticketResult = await db`
      INSERT INTO support_tickets (user_id, subject, category, priority, status)
      VALUES (${user_id}, ${subject}, ${category}, ${priority}, 'open')
      RETURNING id, user_id, subject, category, priority, status, created_at, updated_at
    `;

    const ticketArray = Array.isArray(ticketResult) ? ticketResult : (ticketResult?.rows || []);
    const ticket = ticketArray[0];

    if (!ticket) {
      throw new Error('Failed to create support ticket');
    }

    // Add initial message
    await db`
      INSERT INTO support_messages (ticket_id, sender_type, sender_id, message)
      VALUES (${ticket.id}, 'user', ${user_id}, ${message})
    `;

    console.log('[v0] Support ticket created:', ticket.id);
    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error creating support ticket:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
