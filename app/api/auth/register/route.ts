import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] REGISTER: Endpoint called');
    
    const body = await request.json();
    console.log('[v0] REGISTER: Body received - email:', body.email);
    
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      console.log('[v0] REGISTER: Missing fields');
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    console.log('[v0] REGISTER: Returning mock success');
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: { id: 'test-id', email, fullName }
    }, { status: 201 });
    
  } catch (error) {
    console.error('[v0] REGISTER ERROR:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error',
      details: String(error)
    }, { status: 500 });
  }
}
