import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendEmailSafely } from '@/lib/email/send';
import { getSupportTicketReplyEmail } from '@/lib/email/templates';

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

      // Get ticket user ID to send reply notification
      const ticketResult = await db`SELECT user_id FROM support_tickets WHERE id = ${ticket_id}`;
      const ticketArray = Array.isArray(ticketResult) ? ticketResult : (ticketResult?.rows || []);
      const userId = ticketArray?.[0]?.user_id;

      if (userId) {
        const userResult = await db`SELECT email FROM users WHERE id = ${userId}`;
        const userEmail = userResult?.[0]?.email || (Array.isArray(userResult) && userResult[0]?.email);

        // Send reply notification email
        if (userEmail) {
          const emailHtml = getSupportTicketReplyEmail(ticket_id);
          sendEmailSafely({
            to: userEmail,
            subject: 'Support Ticket Response',
            html: emailHtml,
          }).catch(err => console.error('[v0] Failed to send ticket reply email:', err));
        }
      }
    }

    console.log('[v0] Ticket updated:', ticket_id, 'action:', action);
    return NextResponse.json({ success: true, message: 'Ticket updated' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error updating ticket:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
