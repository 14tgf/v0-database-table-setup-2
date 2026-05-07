import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get('admin_token')?.value;
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify admin token
    await jwtVerify(cookie, JWT_SECRET);

    // Fetch all deposits with user info, sorted by status (pending first) then by date
    const result = await sql`
      SELECT 
        d.id,
        d.user_id,
        d.method_name,
        d.amount,
        d.tx_hash,
        d.proof_upload,
        d.note,
        d.status,
        d.created_at,
        d.approved_at,
        u.email as user_email,
        u.full_name
      FROM deposits d
      JOIN users u ON d.user_id = u.id
      ORDER BY 
        CASE WHEN d.status = 'pending' THEN 0 ELSE 1 END,
        d.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      deposits: result.rows,
    });
  } catch (error) {
    console.error('[v0] Fetch deposits error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch deposits' },
      { status: 500 }
    );
  }
}
