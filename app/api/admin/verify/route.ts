import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-middleware';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        admin: {
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Auth verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
