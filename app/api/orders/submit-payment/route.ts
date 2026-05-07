import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';
import { sendEmail } from '@/lib/email/resend';
import { orderPaymentSubmittedTemplate } from '@/lib/email/templates';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(process.env.DATABASE_URL);
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;
    
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    const body = await request.json();
    const { order_id, method_name, amount, tx_hash, proof_upload, note } = body;

    if (!order_id || !method_name || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 });
    }

    const sql = getSql();

    // Get order details and user email for the email notification
    const orderResult = await sql`
      SELECT o.id, o.product_name, u.email, u.fullName 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ${order_id} AND o.user_id = ${userId}
    `;

    if (!orderResult || orderResult.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderResult[0];
    const userEmail = order.email;

    // Create deposit record for the order
    const depositResult = await sql`
      INSERT INTO deposits (user_id, method_name, amount, tx_hash, proof_upload, note, status)
      VALUES (${userId}, ${method_name}, ${amount}, ${tx_hash}, ${proof_upload}, ${note}, 'pending')
      RETURNING id
    `;

    if (!depositResult || depositResult.length === 0) {
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    const depositId = depositResult[0].id;

    // Link deposit to order and update order status
    await sql`
      UPDATE orders 
      SET linked_deposit_id = ${depositId}, status = 'Payment Submitted', payment_method = ${method_name}, amount = ${amount}, updated_at = NOW()
      WHERE id = ${order_id} AND user_id = ${userId}
    `;

    console.log('[v0] Order payment submitted:', { order_id, deposit_id: depositId, user_email: userEmail });

    // Send email notification to user (non-blocking)
    sendEmail({
      to: userEmail,
      subject: 'Payment Submitted - Order #' + order_id.slice(0, 8),
      html: orderPaymentSubmittedTemplate(order_id.slice(0, 8), amount.toFixed(2), method_name),
    }).catch(err => console.error('[v0] Failed to send order payment email:', err));

    return NextResponse.json({
      success: true,
      deposit_id: depositId,
      message: 'Payment submitted successfully. Pending admin approval.'
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error submitting order payment:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
