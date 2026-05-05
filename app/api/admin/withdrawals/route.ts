import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Fetching admin withdrawals...');
    
    const db = sql();

    // Fetch all pending withdrawals with user info
    const result = await db`
      SELECT 
        w.id,
        w.user_id,
        w.method_name,
        w.amount,
        w.destination_address,
        w.destination_bank_details,
        w.note,
        w.status,
        w.created_at,
        w.approved_at,
        u.email as user_email,
        u.full_name
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
      WHERE w.status = 'pending'
      ORDER BY w.created_at DESC
    `;

    console.log('[v0] Withdrawals fetched:', result?.length || 0);

    const formattedWithdrawals = result.map((withdrawal: any) => ({
      id: withdrawal.id,
      user_id: withdrawal.user_id,
      method_name: withdrawal.method_name,
      amount: parseFloat(withdrawal.amount) || 0,
      destination_address: withdrawal.destination_address,
      destination_bank_details: withdrawal.destination_bank_details,
      note: withdrawal.note,
      status: withdrawal.status,
      created_at: withdrawal.created_at,
      approved_at: withdrawal.approved_at,
      user_email: withdrawal.user_email,
      full_name: withdrawal.full_name,
    }));

    return NextResponse.json({
      success: true,
      withdrawals: formattedWithdrawals,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error fetching withdrawals:', msg, error);
    return NextResponse.json(
      { error: msg, withdrawals: [] },
      { status: 500 }
    );
  }
}
