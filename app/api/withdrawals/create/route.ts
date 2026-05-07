import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';
import { sendEmailSafely } from '@/lib/email/send';
import { getWithdrawalSubmittedEmail, getAdminNotificationEmail } from '@/lib/email/templates';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;
    console.log('[v0] Withdrawal API - Auth token present:', !!cookie);
    
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      userId = payload.sub as string;
      console.log('[v0] Withdrawal API - User ID verified:', userId);
    } catch (jwtError) {
      console.error('[v0] Withdrawal API - JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid or expired session. Please log in again.' }, { status: 401 });
    }

    const body = await request.json();
    const { method_name, amount, destination_address, destination_bank_details, note } = body;

    console.log('[v0] Withdrawal submission:', { userId, method_name, amount });

    // Validate input
    if (!method_name || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid withdrawal data' },
        { status: 400 }
      );
    }

    const db = sql();

    // Check user's balance
    const userResult = await db`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `;

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const balance = parseFloat(userResult[0].wallet_balance || 0);

    if (balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create withdrawal record - status starts as 'pending'
    const result = await db`
      INSERT INTO withdrawals (user_id, method_name, amount, destination_address, destination_bank_details, note, status)
      VALUES (${userId}, ${method_name}, ${amount}, ${destination_address}, ${destination_bank_details}, ${note}, 'pending')
      RETURNING id, status, created_at
    `;

    console.log('[v0] Withdrawal created:', result[0]);

    // Get user email for notification
    const userEmailResult = await db`SELECT email FROM users WHERE id = ${userId}`;
    const userEmail = userEmailResult?.[0]?.email;

    // Send withdrawal submitted confirmation email
    if (userEmail) {
      const emailHtml = getWithdrawalSubmittedEmail(amount.toString(), method_name);
      sendEmailSafely({
        to: userEmail,
        subject: 'Withdrawal Request Submitted',
        html: emailHtml,
      }).catch(err => console.error('[v0] Failed to send withdrawal email:', err));
    }

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminHtml = getAdminNotificationEmail(
        'New Withdrawal Request',
        `New withdrawal: $${amount} from user ${userId} via ${method_name}`
      );
      sendEmailSafely({
        to: adminEmail,
        subject: 'New Withdrawal Request',
        html: adminHtml,
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));
    }

    return NextResponse.json({
      success: true,
      withdrawal: result[0],
      message: 'Withdrawal submitted successfully. Pending admin approval.',
    });
  } catch (error) {
    console.error('[v0] Withdrawal submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Withdrawal submission failed' },
      { status: 500 }
    );
  }
}
