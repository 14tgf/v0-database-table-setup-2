import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = sql();

    const appointments = await db`
      SELECT 
        id,
        ticket_number,
        full_name,
        email,
        phone,
        address,
        city,
        country,
        occupation,
        company,
        purpose,
        preferred_date,
        status,
        payment_status,
        payment_method,
        payment_reference,
        amount,
        created_at
      FROM elon_appointments
      ORDER BY created_at DESC
    `;

    const formattedAppointments = appointments.map((apt: any) => ({
      id: apt.id,
      ticket_number: apt.ticket_number,
      full_name: apt.full_name,
      email: apt.email,
      phone: apt.phone,
      address: apt.address,
      city: apt.city,
      country: apt.country,
      occupation: apt.occupation,
      company: apt.company,
      purpose: apt.purpose,
      preferred_date: apt.preferred_date,
      status: apt.status,
      payment_status: apt.payment_status,
      payment_method: apt.payment_method,
      payment_reference: apt.payment_reference,
      amount: parseFloat(apt.amount) || 50000,
      created_at: apt.created_at,
    }));

    return NextResponse.json({ success: true, appointments: formattedAppointments });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error fetching appointments:', msg);
    return NextResponse.json({ success: false, error: msg, appointments: [] }, { status: 500 });
  }
}
