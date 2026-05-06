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

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, product_name, quantity, total_amount } = body;

    if (!product_id || !product_name || !quantity || !total_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sql = getSql();

    // Create order record
    const orderResult = await sql`
      INSERT INTO orders (user_id, product_id, product_name, quantity, total_amount, payment_method, order_type, status)
      VALUES (${userId}, ${product_id}, ${product_name}, ${quantity}, ${total_amount}, 'pending', 'product_purchase', 'Pending Payment')
      RETURNING id, user_id, product_id, product_name, quantity, total_amount, status, created_at
    `;

    if (!orderResult || orderResult.length === 0) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    const order = orderResult[0];
    console.log('[v0] Order created:', order.id);

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error creating order:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
