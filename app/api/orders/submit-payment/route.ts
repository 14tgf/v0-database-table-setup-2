import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';

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

    console.log('[v0] Order payment submitted:', { order_id, deposit_id: depositId });

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
