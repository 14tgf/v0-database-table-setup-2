import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';
import { sendEmail } from '@/lib/email/resend';
import { passwordChangedTemplate } from '@/lib/email/templates';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId = '';
    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      userId = payload.sub as string;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const db = sql();

    // Get current password hash
    const userResult = await db`
      SELECT password_hash FROM users WHERE id = ${userId} LIMIT 1
    `;

    const userArray = Array.isArray(userResult) ? userResult : (userResult?.rows || []);
    if (!userArray || userArray.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userArray[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db`
      UPDATE users 
      SET password_hash = ${newPasswordHash}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Get user email for confirmation (non-blocking email)
    const emailQuery = await db`SELECT email, full_name FROM users WHERE id = ${userId}`;
    const userEmail = emailQuery?.[0]?.email;
    const fullName = emailQuery?.[0]?.full_name;

    if (userEmail) {
      sendEmail({
        to: userEmail,
        subject: 'Password Changed Successfully',
        html: passwordChangedTemplate(fullName || 'User'),
      }).catch(err => console.error('[v0] Failed to send password change email:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    });
  } catch (error) {
    console.error('[v0] Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
