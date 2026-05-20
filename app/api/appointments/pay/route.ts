import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketNumber, paymentMethod, paymentReference } = body;

    if (!ticketNumber || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = sql();

    const result = await db`
      UPDATE elon_appointments
      SET payment_method = ${paymentMethod},
          payment_reference = ${paymentReference || null},
          payment_status = 'pending_review',
          status = 'awaiting_confirmation',
          updated_at = NOW()
      WHERE ticket_number = ${ticketNumber}
      RETURNING id, ticket_number, full_name, email, status, payment_status
    `;

    const rows = Array.isArray(result) ? result : (result?.rows || []);
    if (!rows.length) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, appointment: rows[0] });
  } catch (error) {
    console.error('[v0] Appointment pay error:', error);
    return NextResponse.json({ error: 'Failed to submit payment' }, { status: 500 });
  }
}
