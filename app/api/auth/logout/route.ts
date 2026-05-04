import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;

    if (cookie) {
      try {
        await jwtVerify(cookie, JWT_SECRET);
        // Session is valid - just clear it on client side via cookie deletion
      } catch (error) {
        console.error('[v0] Token verification error:', error);
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
      { error: 'Logout failed', message: 'Logout failed' },
      { status: 500 }
    );
  }
}
