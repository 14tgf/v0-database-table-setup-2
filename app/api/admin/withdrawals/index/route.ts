import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get('admin_token')?.value;
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify admin token
    await jwtVerify(cookie, JWT_SECRET);

    // Fetch all withdrawals with user info, sorted by status (pending first) then by date
    const result = await sql`
      SELECT 
        w.id,
        w.user_id,
        w.method_name,
        w.amount,
        w.destination_address,
        w.destination_bank_details,
        w.note,
        w.status,
        w.created_at,
        w.approved_at,
        u.email as user_email,
        u.full_name
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
      ORDER BY 
        CASE WHEN w.status = 'pending' THEN 0 ELSE 1 END,
        w.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      withdrawals: result.rows,
    });
  } catch (error) {
    console.error('[v0] Fetch withdrawals error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}
