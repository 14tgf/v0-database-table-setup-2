import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendEmail, sendEmailToAdmin } from '@/lib/email/resend';
import { withdrawalApprovedTemplate, withdrawalRejectedTemplate, adminAlertTemplate } from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const { withdrawal_id, action, userId } = body;

    if (!withdrawal_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = sql();

    // Get withdrawal details
    const withdrawalResult = await db`SELECT * FROM withdrawals WHERE id = ${withdrawal_id}`;
    if (!withdrawalResult || withdrawalResult.length === 0) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    const withdrawal = withdrawalResult[0];

    if (action === 'approve') {
      // Get user's current balance
      const userResult = await db`
        SELECT wallet_balance FROM users WHERE id = ${withdrawal.user_id}
      `;

      const currentBalance = userResult?.length > 0 ? parseFloat(userResult[0].wallet_balance || 0) : 0;

      // Check if user still has sufficient balance
      if (currentBalance < withdrawal.amount) {
        return NextResponse.json(
          { error: 'Insufficient balance to approve withdrawal' },
          { status: 400 }
        );
      }

      const newBalance = currentBalance - parseFloat(withdrawal.amount);

      // Update user wallet (deduct amount)
      await db`
        UPDATE users 
        SET wallet_balance = ${newBalance}, updated_at = NOW()
        WHERE id = ${withdrawal.user_id}
      `;

      // Update withdrawal status
      await db`
        UPDATE withdrawals 
        SET status = 'approved', approved_by = ${userId || null}, approved_at = NOW(), updated_at = NOW()
        WHERE id = ${withdrawal_id}
      `;

      // Create wallet transaction log
      await db`
        INSERT INTO wallet_transactions (user_id, transaction_type, amount, old_balance, new_balance, related_id, related_type, description)
        VALUES (${withdrawal.user_id}, 'withdrawal', ${withdrawal.amount}, ${currentBalance}, ${newBalance}, ${withdrawal_id}, 'withdrawal', 'Withdrawal approved')
      `;

      // Update the pending transaction to approved status
      await db`
        UPDATE wallet_transactions 
        SET status = 'approved', updated_at = NOW() 
        WHERE related_id = ${withdrawal_id} AND related_type = 'withdrawal' AND status = 'pending'
      `;

      // Send approval email to user (non-blocking)
      const userQuery = await db`SELECT email, full_name FROM users WHERE id = ${withdrawal.user_id}`;
      const userEmail = userQuery?.[0]?.email;
      if (userEmail) {
        sendEmail({
          to: userEmail,
          subject: 'Withdrawal Approved - Funds Being Processed',
          html: withdrawalApprovedTemplate(String(withdrawal.amount), withdrawal.method_name || 'Unknown'),
        }).catch(err => console.error('[v0] Failed to send withdrawal approval email:', err));
      }

      // Notify admin of approval (non-blocking)
      sendEmailToAdmin({
        subject: 'Withdrawal Approved',
        html: adminAlertTemplate(
          'Withdrawal Approved',
          'A withdrawal request has been approved and processed.',
          {
            'Amount': `$${withdrawal.amount}`,
            'Method': withdrawal.method_name,
            'User ID': withdrawal.user_id,
            'New Balance': `$${newBalance}`,
          }
        ),
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));

      return NextResponse.json({
        success: true,
        message: 'Withdrawal approved and wallet debited',
        newBalance,
      });
    } else {
      // Reject withdrawal
      await db`
        UPDATE withdrawals 
        SET status = 'rejected', approved_by = ${userId || null}, approved_at = NOW(), updated_at = NOW()
        WHERE id = ${withdrawal_id}
      `;

      // Update the pending transaction to rejected status
      await db`
        UPDATE wallet_transactions 
        SET status = 'rejected', updated_at = NOW() 
        WHERE related_id = ${withdrawal_id} AND related_type = 'withdrawal' AND status = 'pending'
      `;

      // Send rejection email to user (non-blocking)
      const userQuery = await db`SELECT email, full_name FROM users WHERE id = ${withdrawal.user_id}`;
      const userEmail = userQuery?.[0]?.email;
      if (userEmail) {
        sendEmail({
          to: userEmail,
          subject: 'Withdrawal Request Could Not Be Processed',
          html: withdrawalRejectedTemplate(String(withdrawal.amount), 'Your withdrawal request could not be processed. Please contact support for more information.'),
        }).catch(err => console.error('[v0] Failed to send withdrawal rejection email:', err));
      }

      // Notify admin of rejection (non-blocking)
      sendEmailToAdmin({
        subject: 'Withdrawal Rejected',
        html: adminAlertTemplate(
          'Withdrawal Rejected',
          'A withdrawal request has been rejected.',
          {
            'Amount': `$${withdrawal.amount}`,
            'Method': withdrawal.method_name,
            'User ID': withdrawal.user_id,
          }
        ),
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));

      return NextResponse.json({
        success: true,
        message: 'Withdrawal rejected',
      });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error approving withdrawal:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
