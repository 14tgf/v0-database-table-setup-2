import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(request: NextRequest) {
  let requestBody: any;
  
  try {
    console.log('[v0] ========== ADJUST BALANCE START ==========');
    requestBody = await request.json();
    console.log('[v0] Request body received:', JSON.stringify(requestBody));
    
    const { userId, amount, type, balanceType = 'wallet', reason } = requestBody;
    
    // Get database client
    const db = sql();
    console.log('[v0] Database client initialized');

    // Validate inputs
    if (!userId) {
      console.log('[v0] VALIDATION ERROR: Missing userId');
      return NextResponse.json({ error: 'VALIDATION_ERROR: Missing userId field' }, { status: 400 });
    }
    if (!amount) {
      console.log('[v0] VALIDATION ERROR: Missing amount');
      return NextResponse.json({ error: 'VALIDATION_ERROR: Missing amount field' }, { status: 400 });
    }
    if (!type) {
      console.log('[v0] VALIDATION ERROR: Missing type');
      return NextResponse.json({ error: 'VALIDATION_ERROR: Missing type field' }, { status: 400 });
    }

    if (type !== 'credit' && type !== 'debit') {
      console.log('[v0] VALIDATION ERROR: Invalid type:', type);
      return NextResponse.json({ error: 'VALIDATION_ERROR: Type must be "credit" or "debit"' }, { status: 400 });
    }

    const validBalanceTypes = ['wallet'];
    if (!validBalanceTypes.includes(balanceType)) {
      console.log('[v0] VALIDATION ERROR: Invalid balanceType:', balanceType);
      return NextResponse.json({ error: 'VALIDATION_ERROR: Invalid balance type' }, { status: 400 });
    }

    // Step 1: Fetch user
    console.log('[v0] STEP 1: Fetching user with ID:', userId);
    let userResult;
    try {
      userResult = await db`SELECT id, email, wallet_balance, full_name FROM users WHERE id = ${userId}`;
      console.log('[v0] STEP 1 SUCCESS: User query returned:', userResult?.length || 0, 'rows');
      console.log('[v0] STEP 1 DATA (raw):', JSON.stringify(userResult, null, 2));
    } catch (dbError) {
      console.error('[v0] STEP 1 FAILED: Database error fetching user:', dbError);
      throw new Error(`DB_FETCH_USER_FAILED: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
    
    if (!userResult || userResult.length === 0) {
      console.log('[v0] STEP 1 RESULT: No user found with ID:', userId);
      return NextResponse.json({ error: 'USER_NOT_FOUND: No user exists with this ID' }, { status: 404 });
    }

    // Step 2: Extract and validate user data
    console.log('[v0] STEP 2: Extracting user data');
    const user = userResult[0];
    console.log('[v0] STEP 2 DATA: user object:', JSON.stringify(user, null, 2));
    console.log('[v0] STEP 2 DATA: user keys:', user ? Object.keys(user) : 'NULL USER');
    
    if (!user) {
      console.error('[v0] STEP 2 FAILED: user object is null/undefined');
      throw new Error('USER_OBJECT_NULL: Failed to extract user from query result');
    }

    // Step 3: Convert wallet_balance to number
    console.log('[v0] STEP 3: Converting wallet_balance to number');
    console.log('[v0] STEP 3 DATA: wallet_balance value:', user.wallet_balance, 'type:', typeof user.wallet_balance);
    
    let currentBalance = 0;
    if (user.wallet_balance !== null && user.wallet_balance !== undefined) {
      const balanceStr = String(user.wallet_balance);
      currentBalance = parseFloat(balanceStr);
      console.log('[v0] STEP 3 SUCCESS: Converted balance:', currentBalance);
      if (isNaN(currentBalance)) {
        throw new Error(`INVALID_BALANCE_VALUE: Cannot parse wallet_balance as number: ${balanceStr}`);
      }
    }

    // Step 4: Parse adjustment amount
    console.log('[v0] STEP 4: Parsing adjustment amount:', amount);
    const adjustmentAmount = parseFloat(String(amount));
    if (isNaN(adjustmentAmount)) {
      console.error('[v0] STEP 4 FAILED: Invalid amount');
      throw new Error(`INVALID_AMOUNT: Cannot parse amount as number: ${amount}`);
    }
    console.log('[v0] STEP 4 SUCCESS: Adjustment amount:', adjustmentAmount);

    // Step 5: Calculate new balance
    console.log('[v0] STEP 5: Calculating new balance');
    const newBalance = type === 'credit' 
      ? currentBalance + adjustmentAmount 
      : currentBalance - adjustmentAmount;
    console.log('[v0] STEP 5: New balance calculated:', newBalance);

    if (newBalance < 0) {
      console.log('[v0] STEP 5 ERROR: Negative balance not allowed:', newBalance);
      return NextResponse.json({ error: `INSUFFICIENT_BALANCE: New balance would be negative: ${newBalance}` }, { status: 400 });
    }

    // Step 6: Update user balance in database
    console.log('[v0] STEP 6: Updating user balance in database');
    try {
      await db`UPDATE users SET wallet_balance = ${newBalance}, updated_at = NOW() WHERE id = ${userId}`;
      console.log('[v0] STEP 6 SUCCESS: User balance updated');
    } catch (updateError) {
      console.error('[v0] STEP 6 FAILED: Database error updating balance:', updateError);
      throw new Error(`DB_UPDATE_FAILED: ${updateError instanceof Error ? updateError.message : String(updateError)}`);
    }

    // Step 7: Create transaction record in wallet_transactions
    console.log('[v0] STEP 7: Creating transaction record');
    try {
      const transactionType = type === 'credit' ? 'deposit' : 'withdrawal';
      const description = reason || `Admin ${type === 'credit' ? 'deposit' : 'withdrawal'} adjustment`;
      
      await db`INSERT INTO wallet_transactions (
        id, user_id, transaction_type, amount, old_balance, new_balance, description, created_at
      ) VALUES (
        gen_random_uuid(),
        ${userId},
        ${transactionType},
        ${adjustmentAmount},
        ${currentBalance},
        ${newBalance},
        ${description},
        NOW()
      )`;
      console.log('[v0] STEP 7 SUCCESS: Transaction record created');
    } catch (txError) {
      console.warn('[v0] STEP 7 WARNING: Failed to create transaction record (non-critical):', txError);
    }

    // Step 8: Log to audit_logs (optional - don't fail if this fails)
    console.log('[v0] STEP 8: Logging to audit_logs');
    try {
      const newValuesJson = JSON.stringify({
        new_balance: newBalance,
        old_balance: currentBalance,
        adjustment: adjustmentAmount,
        type: type,
        reason: reason || 'No reason provided'
      });
      await db`INSERT INTO audit_logs (id, admin_id, action, entity_type, entity_id, new_values) 
        VALUES (gen_random_uuid(), NULL, 'BALANCE_ADJUSTMENT', 'user', ${userId}, ${newValuesJson}::jsonb)`;
      console.log('[v0] STEP 8 SUCCESS: Audit log created');
    } catch (auditError) {
      console.warn('[v0] STEP 8 WARNING: Failed to log audit (non-critical):', auditError);
    }

    console.log('[v0] ========== ADJUST BALANCE SUCCESS ==========');
    return NextResponse.json({
      success: true,
      message: 'Balance adjusted successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        previousBalance: currentBalance,
        newBalance: newBalance,
        adjustmentAmount: adjustmentAmount,
        type: type,
        reason: reason || 'No reason provided',
      },
    });
  } catch (error) {
    console.error('[v0] ========== ADJUST BALANCE FAILED ==========');
    console.error('[v0] Error type:', error?.constructor?.name);
    console.error('[v0] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[v0] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[v0] Full error object:', JSON.stringify(error, null, 2));
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: `UNEXPECTED_ERROR: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
