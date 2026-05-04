import { NextRequest, NextResponse } from 'next/server';
import { invalidateAllUserSessions } from '@/lib/user-auth';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;

    if (cookie) {
      try {
        const { payload } = await jwtVerify(cookie, JWT_SECRET);
        const userId = payload.sub as string;
        if (userId) {
          await invalidateAllUserSessions(userId);
        }
      } catch (error) {
        console.error('[v0] Session invalidation error:', error);
      }
    }

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear cookie
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('[v0] Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
