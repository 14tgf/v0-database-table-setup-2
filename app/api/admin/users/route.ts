import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  try {
    const searchQuery = request.nextUrl.searchParams.get('search') || '';

    let query: string;
    let params: any[] = [];

    if (searchQuery) {
      query = `
        SELECT 
          id, 
          email, 
          full_name, 
          wallet_balance, 
          status,
          created_at
        FROM users
        WHERE status = 'active' AND (full_name ILIKE $1 OR email ILIKE $1)
        ORDER BY created_at DESC LIMIT 100
      `;
      params = [`%${searchQuery}%`];
    } else {
      query = `
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
      `;
    }

    const users = await sql(query, params);

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.full_name,
      email: user.email,
      balance: parseFloat(user.wallet_balance),
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
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
