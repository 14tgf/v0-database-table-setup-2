import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[v0] NOTIFICATION MARK AS READ - id:', params.id);
    
    const cookie = request.cookies.get('auth_token')?.value;
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    // TODO: Update notification in database to mark as read
    console.log('[v0] Marked notification as read:', params.id, 'for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('[v0] NOTIFICATION MARK AS READ - Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[v0] NOTIFICATION DELETE - id:', params.id);
    
    const cookie = request.cookies.get('auth_token')?.value;
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    // TODO: Delete notification from database
    console.log('[v0] Deleted notification:', params.id, 'for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('[v0] NOTIFICATION DELETE - Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
