import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, symbol } = body;

    if (!userId || !symbol) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = sql();

    // Mark stock as removed
    const result = (await db`
      UPDATE user_portfolio_stocks 
       SET status = 'removed', updated_at = NOW()
       WHERE user_id = ${userId} AND symbol = ${symbol}
       RETURNING *
    `) as any[];

    if (result.length === 0) {
      return NextResponse.json(
        { message: 'Stock not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('[v0] Remove stock error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
