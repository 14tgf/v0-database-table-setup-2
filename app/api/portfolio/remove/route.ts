import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

const sql = neon(process.env.DATABASE_URL || '');

export async function DELETE(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const stockId = searchParams.get('id');
    const symbol = searchParams.get('symbol');

    if (!stockId && !symbol) {
      return NextResponse.json(
        { error: 'Missing required parameter: id or symbol' },
        { status: 400 }
      );
    }

    // Delete or mark as removed
    let query = 'DELETE FROM user_portfolio_stocks WHERE user_id = $1';
    const params: any[] = [userId];

    if (stockId) {
      query += ' AND id = $2';
      params.push(stockId);
    } else if (symbol) {
      query += ' AND symbol = $2';
      params.push(symbol);
    }

    await sql.query(query, params);

    return NextResponse.json({
      success: true,
      message: 'Stock removed from portfolio',
    });
  } catch (error) {
    console.error('[v0] Remove stock error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to remove stock: ${errorMessage}` },
      { status: 500 }
    );
  }
}
