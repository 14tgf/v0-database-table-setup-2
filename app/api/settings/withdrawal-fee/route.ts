import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET withdrawal fee percentage
export async function GET() {
  try {
    const db = sql();
    const result = await db`
      SELECT value FROM site_settings WHERE id = 'withdrawal_fee_percent'
    `;
    
    const resultArray = Array.isArray(result) ? result : (result?.rows || []);
    const feePercent = resultArray.length > 0 ? parseFloat(resultArray[0].value) : 20;
    
    return NextResponse.json({ success: true, feePercent });
  } catch (error) {
    console.error('[v0] Error fetching withdrawal fee:', error);
    return NextResponse.json({ success: true, feePercent: 20 }); // Default fallback
  }
}

// POST to update withdrawal fee (admin only)
export async function POST(request: NextRequest) {
  try {
    const { feePercent } = await request.json();
    
    if (typeof feePercent !== 'number' || feePercent < 0 || feePercent > 100) {
      return NextResponse.json({ error: 'Invalid fee percentage' }, { status: 400 });
    }
    
    const db = sql();
    await db`
      INSERT INTO site_settings (id, value, updated_at)
      VALUES ('withdrawal_fee_percent', ${feePercent.toString()}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET value = ${feePercent.toString()}, updated_at = CURRENT_TIMESTAMP
    `;
    
    return NextResponse.json({ success: true, feePercent });
  } catch (error) {
    console.error('[v0] Error updating withdrawal fee:', error);
    return NextResponse.json({ error: 'Failed to update fee' }, { status: 500 });
  }
}
