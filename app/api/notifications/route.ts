import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    const db = sql();
    const rows = await db`
      SELECT id, user_id, title, message, type, is_read, related_id, related_type, created_at
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const notifications = rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      message: r.message,
      type: r.type,
      isRead: r.is_read,
      relatedId: r.related_id,
      relatedType: r.related_type,
      createdAt: r.created_at,
    }));

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('[v0] NOTIFICATIONS GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
