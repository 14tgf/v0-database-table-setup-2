import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { sendEmailSafely } from '@/lib/email/send';
import { getDepositApprovedEmail, getDepositRejectedEmail } from '@/lib/email/templates';

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

    const { deposit_id, action, userId } = body;

    if (!deposit_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sql = getSql();

    // Get deposit details
    const depositResult = await sql`SELECT * FROM deposits WHERE id = ${deposit_id}`;
    if (!depositResult || depositResult.length === 0) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    const deposit = depositResult[0];

    if (action === 'approve') {
      const userResult = await sql`SELECT wallet_balance, email FROM users WHERE id = ${deposit.user_id}`;
      const currentBalance = userResult?.length > 0 ? parseFloat(userResult[0].wallet_balance || 0) : 0;
      const userEmail = userResult?.[0]?.email;
      const newBalance = currentBalance + parseFloat(deposit.amount);

      await sql`UPDATE users SET wallet_balance = ${newBalance}, updated_at = NOW() WHERE id = ${deposit.user_id}`;
      await sql`UPDATE deposits SET status = 'approved', approved_by = ${userId || null}, approved_at = NOW(), updated_at = NOW() WHERE id = ${deposit_id}`;
      await sql`INSERT INTO wallet_transactions (user_id, transaction_type, amount, old_balance, new_balance, related_id, related_type, description) VALUES (${deposit.user_id}, 'deposit', ${deposit.amount}, ${currentBalance}, ${newBalance}, ${deposit_id}, 'deposit', 'Deposit approved')`;

      // Update linked order if this is a payment for an order (optional - only if exists)
      try {
        await sql`UPDATE orders SET status = 'Processing', updated_at = NOW() WHERE linked_deposit_id = ${deposit_id}`;
      } catch (e) {
        console.log('[v0] No linked order found for deposit, skipping order update');
      }

      // Send approval email to user
      if (userEmail) {
        const emailHtml = getDepositApprovedEmail(deposit.amount);
        sendEmailSafely({
          to: userEmail,
          subject: 'Deposit Approved',
          html: emailHtml,
        }).catch(err => console.error('[v0] Failed to send deposit approval email:', err));
      }

      return NextResponse.json({ success: true, message: 'Deposit approved', newBalance });
    } else {
      const userResult = await sql`SELECT email FROM users WHERE id = ${deposit.user_id}`;
      const userEmail = userResult?.[0]?.email;

      await sql`UPDATE deposits SET status = 'rejected', approved_by = ${userId || null}, approved_at = NOW(), updated_at = NOW() WHERE id = ${deposit_id}`;
      
      // Update linked order if this is a payment for an order (optional - only if exists)
      try {
        await sql`UPDATE orders SET status = 'Rejected', updated_at = NOW() WHERE linked_deposit_id = ${deposit_id}`;
      } catch (e) {
        console.log('[v0] No linked order found for deposit, skipping order update');
      }

      // Send rejection email to user
      if (userEmail) {
        const emailHtml = getDepositRejectedEmail(deposit.amount);
        sendEmailSafely({
          to: userEmail,
          subject: 'Deposit Not Approved',
          html: emailHtml,
        }).catch(err => console.error('[v0] Failed to send deposit rejection email:', err));
      }
      
      return NextResponse.json({ success: true, message: 'Deposit rejected' });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error approving deposit:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
