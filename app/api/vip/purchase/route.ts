import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendEmailSafely } from '@/lib/email/send';
import { getVipActivatedEmail, getAdminNotificationEmail } from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planId } = body;

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, planId' },
        { status: 400 }
      );
    }

    // Get the database client
    const db = sql();

    // Get the VIP plan
    const plans = await db`
      SELECT * FROM vip_plans WHERE id = ${planId} AND active = true
    `;

    if (plans.length === 0) {
      return NextResponse.json(
        { error: 'VIP plan not found' },
        { status: 404 }
      );
    }

    const plan = plans[0];

    // Check if user already has this tier level (same VIP membership)
    const existingMembership = await db`
      SELECT * FROM user_vip_memberships
      WHERE user_id = ${userId} 
      AND tier_level = ${plan.tier_level}
      AND status = 'active'
      AND expires_at > NOW()
    `;

    if (existingMembership.length > 0) {
      return NextResponse.json(
        { 
          error: 'You already have this membership',
          message: `You already own the ${plan.name} VIP membership. Please upgrade to a higher tier or wait for it to expire.`,
        },
        { status: 409 }
      );
    }

    // Check if user can upgrade (new tier must be higher)
    const currentMembership = await db`
      SELECT * FROM user_vip_memberships
      WHERE user_id = ${userId} 
      AND status = 'active'
      AND expires_at > NOW()
      ORDER BY tier_level DESC
      LIMIT 1
    `;

    if (currentMembership.length > 0) {
      const currentTier = currentMembership[0].tier_level;
      
      if (plan.tier_level < currentTier) {
        return NextResponse.json(
          { 
            error: 'Cannot downgrade membership',
            message: 'You can only upgrade to a higher tier membership, not downgrade.',
          },
          { status: 400 }
        );
      }

      if (plan.tier_level > currentTier) {
        // Mark old membership as upgraded
        await db`
          UPDATE user_vip_memberships
          SET status = 'upgraded'
          WHERE user_id = ${userId} AND status = 'active'
        `;
      }
    }

    // Check user wallet balance
    const userWallet = await db`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `;

    if (userWallet.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const balance = parseFloat(userWallet[0].wallet_balance) || 0;

    if (balance < plan.price) {
      return NextResponse.json(
        { 
          error: 'Insufficient balance',
          message: `You need $${plan.price.toFixed(2)} but only have $${balance.toFixed(2)} in your wallet.`,
          required: plan.price,
          available: balance,
        },
        { status: 402 }
      );
    }

    // Deduct from wallet
    const newBalance = balance - plan.price;
    await db`
      UPDATE users SET wallet_balance = ${newBalance} WHERE id = ${userId}
    `;

    // Create membership record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

    const membership = await db`
      INSERT INTO user_vip_memberships (
        user_id,
        vip_plan_id,
        tier_level,
        status,
        expires_at
      )
      VALUES (${userId}, ${planId}, ${plan.tier_level}, 'active', ${expiresAt.toISOString()})
      RETURNING *
    `;

    // Log transaction
    await db`
      INSERT INTO wallet_transactions (
        user_id,
        transaction_type,
        amount,
        old_balance,
        new_balance,
        related_id,
        related_type,
        description
      )
      VALUES (
        ${userId},
        'vip_purchase',
        ${plan.price},
        ${balance},
        ${newBalance},
        ${membership[0].id},
        'vip_membership',
        ${'Purchased VIP membership: ' + plan.name}
      )
    `;

    console.log(`[v0] VIP membership purchased: ${plan.name} for user ${userId}`);

    // Get user email for notification
    const userResult = await db`SELECT email FROM users WHERE id = ${userId}`;
    const userEmail = userResult?.[0]?.email;

    // Send VIP activation email
    if (userEmail) {
      const emailHtml = getVipActivatedEmail(plan.name);
      sendEmailSafely({
        to: userEmail,
        subject: 'VIP Membership Activated',
        html: emailHtml,
      }).catch(err => console.error('[v0] Failed to send VIP activation email:', err));
    }

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminHtml = getAdminNotificationEmail(
        'New VIP Purchase',
        `New VIP purchase: ${plan.name} ($${plan.price}) from user ${userId}`
      );
      sendEmailSafely({
        to: adminEmail,
        subject: 'New VIP Purchase',
        html: adminHtml,
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully purchased ${plan.name} VIP membership!`,
        membership: membership[0],
        newBalance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] VIP purchase error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to purchase VIP membership' },
      { status: 500 }
    );
  }
}
