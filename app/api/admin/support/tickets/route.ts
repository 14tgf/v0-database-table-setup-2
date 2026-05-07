import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
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
        u.email as user_email,
        u.full_name as user_name,
        (SELECT message FROM support_messages WHERE ticket_id = st.id ORDER BY created_at DESC LIMIT 1) as latest_message
      FROM support_tickets st
      LEFT JOIN users u ON st.user_id = u.id
      ORDER BY st.created_at DESC
    `;

    const ticketsArray = Array.isArray(tickets) ? tickets : (tickets?.rows || []);
    return NextResponse.json({ success: true, tickets: ticketsArray });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error fetching admin tickets:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
