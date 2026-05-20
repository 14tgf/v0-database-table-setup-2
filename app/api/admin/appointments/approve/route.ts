import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { sendEmail, sendEmailToAdmin } from '@/lib/email/resend';

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(process.env.DATABASE_URL);
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const { appointment_id, action } = body;

    if (!appointment_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sql = getSql();

    // Get appointment details
    const appointmentResult = await sql`SELECT * FROM elon_appointments WHERE id = ${appointment_id}`;
    if (!appointmentResult || appointmentResult.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const appointment = appointmentResult[0];

    if (action === 'approve') {
      await sql`
        UPDATE elon_appointments 
        SET status = 'approved', updated_at = NOW() 
        WHERE id = ${appointment_id}
      `;

      // Send approval email to applicant
      if (appointment.email) {
        sendEmail({
          to: appointment.email,
          subject: `Appointment Approved - Ticket #${appointment.ticket_number}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f1419; color: #fff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #00d9ff; margin: 0;">Appointment Approved</h1>
              </div>
              <p style="color: #a0aec0;">Dear ${appointment.full_name},</p>
              <p style="color: #a0aec0;">Congratulations! Your appointment request to meet with Elon Musk has been <strong style="color: #22c55e;">APPROVED</strong>.</p>
              <div style="background-color: #1e2d3d; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00d9ff;">
                <p style="margin: 0; color: #00d9ff; font-size: 14px;">Ticket Number</p>
                <p style="margin: 5px 0 0; color: #fff; font-size: 24px; font-weight: bold;">${appointment.ticket_number}</p>
              </div>
              <p style="color: #a0aec0;">Our team will contact you shortly with further details regarding the scheduling and logistics of your appointment.</p>
              <p style="color: #a0aec0;">Thank you for your interest in X Holdings.</p>
              <hr style="border: none; border-top: 1px solid #2d3748; margin: 30px 0;">
              <p style="color: #718096; font-size: 12px; text-align: center;">X Holdings - Premium Investment Platform</p>
            </div>
          `,
        }).catch(err => console.error('[v0] Failed to send approval email:', err));
      }

      return NextResponse.json({ success: true, message: 'Appointment approved' });

    } else if (action === 'reject') {
      await sql`
        UPDATE elon_appointments 
        SET status = 'rejected', updated_at = NOW() 
        WHERE id = ${appointment_id}
      `;

      // Send rejection email to applicant
      if (appointment.email) {
        sendEmail({
          to: appointment.email,
          subject: `Appointment Status Update - Ticket #${appointment.ticket_number}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f1419; color: #fff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #00d9ff; margin: 0;">Appointment Status Update</h1>
              </div>
              <p style="color: #a0aec0;">Dear ${appointment.full_name},</p>
              <p style="color: #a0aec0;">Thank you for your interest in meeting with Elon Musk. After careful review, we regret to inform you that your appointment request (Ticket #${appointment.ticket_number}) could not be approved at this time.</p>
              <p style="color: #a0aec0;">This decision may be due to scheduling constraints or other factors. You are welcome to submit a new application in the future.</p>
              <p style="color: #a0aec0;">Thank you for your understanding.</p>
              <hr style="border: none; border-top: 1px solid #2d3748; margin: 30px 0;">
              <p style="color: #718096; font-size: 12px; text-align: center;">X Holdings - Premium Investment Platform</p>
            </div>
          `,
        }).catch(err => console.error('[v0] Failed to send rejection email:', err));
      }

      return NextResponse.json({ success: true, message: 'Appointment rejected' });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error processing appointment:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
