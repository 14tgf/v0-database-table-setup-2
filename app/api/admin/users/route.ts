import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

let sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sql) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(dbUrl);
  }
  return sql;
}

export async function GET(request: NextRequest) {
  try {
    const searchQuery = request.nextUrl.searchParams.get('search') || '';

    const dbSql = getSql();
    let users: any[];

    if (searchQuery) {
      users = await dbSql(
        `SELECT 
          id, 
          email, 
          full_name, 
          wallet_balance,
          stock_balance,
          vehicle_balance,
          energy_balance,
          status,
          created_at
        FROM users
        WHERE status = 'active' AND (full_name ILIKE $1 OR email ILIKE $1)
        ORDER BY created_at DESC LIMIT 100`,
        [`%${searchQuery}%`]
      );
    } else {
      users = await dbSql(
        `SELECT 
          id, 
          email, 
          full_name, 
          wallet_balance,
          stock_balance,
          vehicle_balance,
          energy_balance,
          status,
          created_at
        FROM users
        WHERE status = 'active'
        ORDER BY created_at DESC LIMIT 100`
      );
    }

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.full_name,
      email: user.email,
      balance: parseFloat(user.wallet_balance) || 0,
      stockBalance: parseFloat(user.stock_balance) || 0,
      vehicleBalance: parseFloat(user.vehicle_balance) || 0,
      energyBalance: parseFloat(user.energy_balance) || 0,
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
