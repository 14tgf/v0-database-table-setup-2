import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] NOTIFICATIONS API - GET request');
    
    const cookie = request.cookies.get('auth_token')?.value;
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    // TODO: Fetch notifications from database
    // For now, return empty array
    const notifications = [
      {
        id: '1',
        userId,
        title: 'Deposit Approved',
        message: 'Your deposit of $500 USD has been approved',
        type: 'deposit',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isRead: false,
      },
      {
        id: '2',
        userId,
        title: 'Withdrawal Processed',
        message: 'Your withdrawal of $200 USD has been processed',
        type: 'withdrawal',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isRead: true,
      },
    ];

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('[v0] NOTIFICATIONS API - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
