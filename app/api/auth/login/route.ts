import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] LOGIN: Endpoint called');
    
    const body = await request.json();
    console.log('[v0] LOGIN: Body received - email:', body.email);
    
    const { email, password } = body;

    if (!email || !password) {
      console.log('[v0] LOGIN: Missing fields');
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    console.log('[v0] LOGIN: Returning mock success');
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: 'test-id', email, fullName: 'Test User' }
    }, { status: 200 });
    
  } catch (error) {
    console.error('[v0] LOGIN ERROR:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error',
      details: String(error)
    }, { status: 500 });
  }
}
