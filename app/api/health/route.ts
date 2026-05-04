import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[v0] Diagnostic endpoint called');
    console.log('[v0] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('[v0] JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    // Try to get the SQL client
    try {
      const { sql } = await import('@/lib/db');
      console.log('[v0] DB module imported successfully');
      const db = sql();
      console.log('[v0] SQL client initialized');
      
      // Try a simple query
      const result = await db`SELECT 1 as test`;
      console.log('[v0] Database query successful:', result);
      
      return NextResponse.json({
        status: 'ok',
        database: 'connected',
        envVars: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          JWT_SECRET: !!process.env.JWT_SECRET,
        }
      });
    } catch (dbError) {
      console.error('[v0] Database error:', dbError);
      return NextResponse.json({
        status: 'error',
        database: 'failed',
        error: dbError instanceof Error ? dbError.message : String(dbError),
        envVars: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          JWT_SECRET: !!process.env.JWT_SECRET,
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[v0] Diagnostic endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
