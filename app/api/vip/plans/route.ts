import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    console.log('[v0] VIP plans - Attempting to fetch from database');
    
    const plans = await sql`
      SELECT 
        id, 
        name, 
        tier_level, 
        description, 
        benefits, 
        price, 
        duration_days,
        active,
        created_at,
        updated_at
      FROM vip_plans
      WHERE active = true
      ORDER BY tier_level ASC
    `;

    console.log('[v0] VIP plans - Successfully fetched', plans.length, 'plans');
    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorType = error instanceof Error ? error.constructor.name : typeof error;
    
    console.error('[v0] VIP plans fetch error:', {
      message: errorMessage,
      type: errorType,
      error: String(error),
    });

    // Provide specific error information
    let userMessage = 'Failed to fetch VIP plans';
    let details = '';

    if (errorMessage.includes('relation "vip_plans" does not exist')) {
      userMessage = 'VIP plans table not found in database';
      details = 'The database schema may not be initialized. Please contact support.';
    } else if (errorMessage.includes('connect')) {
      userMessage = 'Database connection failed';
      details = 'Unable to connect to the database. Please try again later.';
    } else if (errorMessage.includes('permission')) {
      userMessage = 'Database permission denied';
      details = 'You do not have permission to access VIP plans.';
    } else if (errorMessage.includes('timeout')) {
      userMessage = 'Database query timeout';
      details = 'The request took too long. Please try again.';
    } else {
      details = errorMessage;
    }

    return NextResponse.json(
      { 
        error: userMessage,
        details: details,
        errorType: errorType,
      },
      { status: 500 }
    );
  }
}
