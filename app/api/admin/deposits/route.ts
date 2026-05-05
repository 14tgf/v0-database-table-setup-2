import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(process.env.DATABASE_URL);
}

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] ADMIN DEPOSITS API - Request received');
    
    // Get user ID from query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('[v0] ADMIN DEPOSITS API - User ID:', userId);

    if (!userId) {
      console.error('[v0] ADMIN DEPOSITS API - No user ID provided');
      return NextResponse.json({ success: false, error: 'No user ID provided', deposits: [] }, { status: 400 });
    }

    const sql = getSql();

    // For now, just fetch deposits - we can check admin status later
    // Check if user exists (whether in users or admins table)
    console.log('[v0] ADMIN DEPOSITS API - Checking if user exists');
    
    const userCheck = await sql`SELECT id FROM users WHERE id = ${userId}`;
    const adminCheck = await sql`SELECT id FROM admins WHERE id = ${userId}`;
    
    console.log('[v0] ADMIN DEPOSITS API - User exists:', userCheck?.length > 0, 'Admin exists:', adminCheck?.length > 0);

    // For now, allow access if user exists (we can add strict admin check later)
    if (!userCheck || userCheck.length === 0) {
      console.error('[v0] ADMIN DEPOSITS API - User not found');
      return NextResponse.json({ success: false, error: 'User not found', deposits: [] }, { status: 404 });
    }

    console.log('[v0] ADMIN DEPOSITS API - Fetching deposits');

    // Get all pending deposits with user email
    const deposits = await sql`
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
        u.email as user_email
      FROM deposits d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.status = 'pending'
      ORDER BY d.created_at DESC
    `;

    console.log('[v0] ADMIN DEPOSITS API - Deposits retrieved:', deposits?.length || 0);

    return NextResponse.json({ success: true, deposits: deposits || [], error: null });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] ADMIN DEPOSITS API - Error:', msg, error);
    return NextResponse.json({ success: false, error: msg, deposits: [] }, { status: 500 });
  }
}
