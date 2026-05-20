import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

function generateTicketNumber(): string {
  const prefix = 'XEM';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName, email, phone, address, city, country,
      occupation, company, purpose, preferredDate,
    } = body;

    if (!fullName || !email || !phone || !address || !city || !country || !occupation || !purpose) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
    }

    const ticketNumber = generateTicketNumber();
    const db = sql();

    await db`
      INSERT INTO elon_appointments (
        ticket_number, full_name, email, phone, address, city, country,
        occupation, company, purpose, preferred_date, status, payment_status, amount
      ) VALUES (
        ${ticketNumber}, ${fullName}, ${email}, ${phone}, ${address}, ${city}, ${country},
        ${occupation}, ${company || null}, ${purpose}, ${preferredDate || null},
        'pending', 'unpaid', 50000.00
      )
    `;

    return NextResponse.json({ success: true, ticketNumber });
  } catch (error) {
    console.error('[v0] Appointment create error:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
