import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = sql();

    const deposits = await db`
      SELECT 
        d.id,
        d.user_id,
        d.method_name,
        d.amount,
        d.tx_hash,
        d.proof_upload,
        d.note,
        d.status,
        d.created_at,
        u.email as user_email
      FROM deposits d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.status = 'pending'
      ORDER BY d.created_at DESC
    `;

    const formattedDeposits = deposits.map((deposit: any) => ({
      id: deposit.id,
      user_id: deposit.user_id,
      method_name: deposit.method_name,
      amount: parseFloat(deposit.amount) || 0,
      tx_hash: deposit.tx_hash,
      proof_upload: deposit.proof_upload,
      note: deposit.note,
      status: deposit.status,
      created_at: deposit.created_at,
      user_email: deposit.user_email,
    }));

    return NextResponse.json({ success: true, deposits: formattedDeposits });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error fetching deposits:', msg);
    return NextResponse.json({ success: false, error: msg, deposits: [] }, { status: 500 });
  }
}
