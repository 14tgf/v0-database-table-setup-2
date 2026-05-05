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

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;
    
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    const sql = getSql();

    const orders = await sql`
      SELECT 
        id,
        user_id,
        product_id,
        product_name,
        quantity,
        total_amount,
        payment_method,
        status,
        created_at
      FROM orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error fetching orders:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
