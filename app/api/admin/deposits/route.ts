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
      return NextResponse.json({ error: 'No user ID provided', deposits: [] }, { status: 400 });
    }

    const sql = getSql();

    // Check if user is an admin
    const adminCheck = await sql`SELECT id FROM admins WHERE id = ${userId}`;

    if (!adminCheck || adminCheck.length === 0) {
      console.log('[v0] ADMIN DEPOSITS API - User is not an admin');
      return NextResponse.json({ error: 'Admin access required', deposits: [] }, { status: 403 });
    }

    console.log('[v0] ADMIN DEPOSITS API - User is admin, fetching deposits');

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

    console.log('[v0] ADMIN DEPOSITS API - Deposits:', deposits?.length || 0);

    return NextResponse.json({ success: true, deposits: deposits || [] });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] ADMIN DEPOSITS API - Error:', msg);
    return NextResponse.json({ error: msg, deposits: [] }, { status: 500 });
  }
}
