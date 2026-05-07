import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { sendEmail, sendEmailToAdmin } from '@/lib/email/resend';
import { depositApprovedTemplate, depositRejectedTemplate, orderPaymentApprovedTemplate, adminAlertTemplate } from '@/lib/email/templates';

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
      let linkedOrderDetails = null;
      try {
        const orderResult = await sql`
          SELECT id, product_name, total_amount 
          FROM orders 
          WHERE linked_deposit_id = ${deposit_id}
        `;
        if (orderResult && orderResult.length > 0) {
          linkedOrderDetails = orderResult[0];
          await sql`UPDATE orders SET status = 'Completed', updated_at = NOW() WHERE linked_deposit_id = ${deposit_id}`;
        }
      } catch (e) {
        console.log('[v0] No linked order found for deposit, skipping order update');
      }

      // Send approval email (non-blocking)
      if (userEmail) {
        if (linkedOrderDetails) {
          // Send order-specific approval email
          sendEmail({
            to: userEmail,
            subject: 'Order Confirmed! - #' + linkedOrderDetails.id.slice(0, 8),
            html: orderPaymentApprovedTemplate(
              linkedOrderDetails.id.slice(0, 8),
              linkedOrderDetails.product_name,
              String(linkedOrderDetails.total_amount)
            ),
          }).catch(err => console.error('[v0] Failed to send order approval email:', err));
        } else {
          // Send generic deposit approval email
          sendEmail({
            to: userEmail,
            subject: 'Deposit Approved!',
            html: depositApprovedTemplate(String(deposit.amount)),
          }).catch(err => console.error('[v0] Failed to send approval email:', err));
        }
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

      // Send rejection email (non-blocking)
      if (userEmail) {
        sendEmail({
          to: userEmail,
          subject: 'Deposit Review Status',
          html: depositRejectedTemplate(String(deposit.amount)),
        }).catch(err => console.error('[v0] Failed to send rejection email:', err));
      }
      
      return NextResponse.json({ success: true, message: 'Deposit rejected' });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error approving deposit:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
