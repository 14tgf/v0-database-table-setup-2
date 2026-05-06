import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    console.log('[v0] VIP plans API - Attempting to fetch from database');
    
    const plansResult = await sql`
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

    console.log('[v0] VIP plans API - Raw result:', {
      type: typeof plansResult,
      isArray: Array.isArray(plansResult),
      length: Array.isArray(plansResult) ? plansResult.length : 'not an array',
      keys: plansResult ? Object.keys(plansResult).slice(0, 5) : 'N/A',
      stringified: JSON.stringify(plansResult).substring(0, 200),
    });

    // Ensure we have an array
    const plans = Array.isArray(plansResult) ? plansResult : [];

    console.log('[v0] VIP plans API - After array check:', {
      isArray: Array.isArray(plans),
      length: plans.length,
      firstPlan: plans[0] ? JSON.stringify(plans[0]).substring(0, 200) : 'none',
    });

    if (plans.length === 0) {
      console.warn('[v0] VIP plans API - No active plans found in database');
      console.log('[v0] VIP plans API - Returning empty array');
      return NextResponse.json([], { status: 200 });
    }

    // Convert PostgreSQL arrays to JSON-serializable format
    console.log('[v0] VIP plans API - Starting to serialize', plans.length, 'plans');
    const serializedPlans = plans.map((plan: any, index: number) => {
      console.log(`[v0] VIP plans API - Serializing plan ${index}:`, {
        id: plan.id,
        name: plan.name,
        tier_level: plan.tier_level,
        benefitsType: typeof plan.benefits,
        benefitsValue: plan.benefits,
      });

      // Parse benefits - handle various formats
      let benefits = [];
      if (Array.isArray(plan.benefits)) {
        benefits = plan.benefits;
      } else if (typeof plan.benefits === 'string') {
        // If it's a string (from Neon), try to parse it
        try {
          benefits = JSON.parse(plan.benefits);
        } catch {
          benefits = plan.benefits.split(',').map((b: string) => b.trim());
        }
      }

      const serialized = {
        id: plan.id,
        name: plan.name,
        tier_level: plan.tier_level,
        description: plan.description,
        benefits: Array.isArray(benefits) ? benefits : [],
        price: typeof plan.price === 'number' ? plan.price : parseFloat(plan.price || 0),
        duration_days: plan.duration_days || 30,
        active: plan.active === true || plan.active === 1,
        created_at: plan.created_at instanceof Date ? plan.created_at.toISOString() : plan.created_at,
        updated_at: plan.updated_at instanceof Date ? plan.updated_at.toISOString() : plan.updated_at,
      };

      console.log(`[v0] VIP plans API - Serialized plan ${index}:`, serialized);
      return serialized;
    });

    console.log('[v0] VIP plans API - Successfully serialized', serializedPlans.length, 'plans');
    console.log('[v0] VIP plans API - First serialized plan:', serializedPlans[0]);
    console.log('[v0] VIP plans API - Returning NextResponse.json with', serializedPlans.length, 'plans');

    const response = NextResponse.json(serializedPlans, { status: 200 });
    console.log('[v0] VIP plans API - Response created, status:', response.status);
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorType = error instanceof Error ? error.constructor.name : typeof error;
    const errorStack = error instanceof Error ? error.stack : 'N/A';
    
    console.error('[v0] VIP plans API - CAUGHT ERROR:', {
      message: errorMessage,
      type: errorType,
      stack: errorStack,
      error: String(error),
      fullError: error,
    });

    // Provide specific error information
    let userMessage = 'Failed to fetch VIP plans';
    let details = '';

    if (errorMessage.includes('is not a function') || errorMessage.includes('.map')) {
      userMessage = 'VIP plans data structure error';
      details = 'The database query returned unexpected data format. The VIP schema may need to be initialized by visiting /api/admin/init-vip-schema and then /api/admin/seed-vip-plans';
    } else if (errorMessage.includes('not JSON serializable')) {
      userMessage = 'VIP plans data format error';
      details = 'The database returned incompatible data. The schema may need to be reinitialized.';
    } else if (errorMessage.includes('relation "vip_plans" does not exist')) {
      userMessage = 'VIP plans table not found in database';
      details = 'The database schema has not been initialized. Please run POST /api/admin/init-vip-schema first.';
    } else if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED')) {
      userMessage = 'Database connection failed';
      details = 'Unable to connect to the database. Please try again later.';
    } else if (errorMessage.includes('permission') || errorMessage.includes('permission denied')) {
      userMessage = 'Database permission denied';
      details = 'You do not have permission to access VIP plans.';
    } else if (errorMessage.includes('timeout')) {
      userMessage = 'Database query timeout';
      details = 'The request took too long. Please try again.';
    } else {
      details = errorMessage;
    }

    console.log('[v0] VIP plans API - Returning error response:', {
      userMessage,
      details,
      errorType,
    });

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
