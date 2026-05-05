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
    console.log('[v0] ADMIN DEPOSITS API - Request received');
    
    // Try to get token from cookies or Authorization header
    let token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      // Try Authorization header
      const authHeader = request.headers.get('Authorization');
      console.log('[v0] ADMIN DEPOSITS API - Auth header present:', !!authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
        console.log('[v0] ADMIN DEPOSITS API - Token from Authorization header');
      }
    } else {
      console.log('[v0] ADMIN DEPOSITS API - Token from cookie');
    }

    if (!token) {
      console.error('[v0] ADMIN DEPOSITS API - No auth token found in cookie or header');
      return NextResponse.json({ 
        error: 'Not authenticated. Please log in again.',
      }, { status: 401 });
    }

    // Verify JWT
    try {
      await jwtVerify(token, JWT_SECRET);
      console.log('[v0] ADMIN DEPOSITS API - JWT verification successful');
    } catch (jwtError) {
      console.error('[v0] ADMIN DEPOSITS API - JWT verification failed:', jwtError);
      return NextResponse.json({ 
        error: 'Invalid or expired token. Please log in again.',
        detail: jwtError instanceof Error ? jwtError.message : String(jwtError)
      }, { status: 401 });
    }

    // Get database connection
    const sql = getSql();

    // Fetch all deposits with user emails
    try {
      console.log('[v0] ADMIN DEPOSITS API - Fetching deposits');
      
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
        ORDER BY d.created_at DESC
      `;
      
      console.log('[v0] ADMIN DEPOSITS API - Deposits fetched:', deposits?.length || 0);

      if (!deposits || !Array.isArray(deposits)) {
        console.error('[v0] ADMIN DEPOSITS API - Invalid result format');
        return NextResponse.json({ deposits: [] }, { status: 200 });
      }

      return NextResponse.json({
        deposits: deposits,
        count: deposits.length,
      }, { status: 200 });
      
    } catch (sqlError) {
      const errorMsg = sqlError instanceof Error ? sqlError.message : String(sqlError);
      console.error('[v0] ADMIN DEPOSITS API - Database error:', errorMsg);
      return NextResponse.json(
        { error: `Database error: ${errorMsg}`, deposits: [] },
        { status: 200 } // Return 200 with empty deposits instead of 500
      );
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[v0] ADMIN DEPOSITS API - Error:', errorMsg);
    return NextResponse.json(
      { error: `Server error: ${errorMsg}`, deposits: [] },
      { status: 200 }
    );
  }
}
