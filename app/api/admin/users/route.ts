import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchQuery = request.nextUrl.searchParams.get('search') || '';

    const db = sql();

    let users: any[];

    if (searchQuery) {
      users = (await db`
        SELECT 
          id, 
          email, 
          full_name, 
          wallet_balance,
          status,
          created_at
        FROM users
        WHERE status = 'active' AND (full_name ILIKE ${`%${searchQuery}%`} OR email ILIKE ${`%${searchQuery}%`})
        ORDER BY created_at DESC LIMIT 100
      `) as any[];
    } else {
      users = (await db`
        SELECT 
          id, 
          email, 
          full_name, 
          wallet_balance,
          status,
          created_at
        FROM users
        WHERE status = 'active'
        ORDER BY created_at DESC LIMIT 100
      `) as any[];
    }

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.full_name,
      email: user.email,
      balance: parseFloat(user.wallet_balance) || 0,
      status: user.status as 'active' | 'frozen',
      joinDate: new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error) {
    console.error('[v0] Fetch users error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json(
      { error: `Failed to fetch users: ${errorMessage}` },
      { status: 500 }
    );
  }
}
