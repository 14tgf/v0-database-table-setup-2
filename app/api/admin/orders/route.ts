import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(process.env.DATABASE_URL);
}

export async function GET() {
  try {
    console.log('[v0] Fetching pending product orders');
    const sql = getSql();

    const orders = await sql`
      SELECT 
        o.id,
        o.user_id,
        o.product_name,
        o.amount,
        o.payment_method,
        o.status,
        o.created_at,
        u.email as user_email,
        u.full_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.status IN ('Payment Submitted', 'Pending', 'Pending Payment Review', 'Pending Payment')
      ORDER BY o.created_at DESC
    `;

    const ordersArray = Array.isArray(orders) ? orders : (orders?.rows || []);
    console.log('[v0] Fetched', ordersArray.length, 'pending orders');

    return NextResponse.json({
      success: true,
      orders: ordersArray,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('[v0] Error fetching orders:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to fetch orders: ' + errorMsg },
      { status: 500 }
    );
  }
}
