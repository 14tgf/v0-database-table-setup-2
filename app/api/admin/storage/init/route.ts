import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] STORAGE INIT - Request received');

    // Verify admin authentication
    const cookie = request.cookies.get('auth_token')?.value;
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let userId: string;
    try {
      const verified = await jwtVerify(cookie, JWT_SECRET) as any;
      userId = verified.payload.sub || verified.payload.userId;
      if (!userId) throw new Error('No user ID in token');
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const buckets = ['kyc-documents', 'payment-proofs', 'order-proofs'];
    const results: any = {};

    for (const bucketName of buckets) {
      try {
        console.log(`[v0] STORAGE INIT - Creating bucket: ${bucketName}`);

        // Check if bucket exists
        const { data: bucketList, error: listError } = await supabase.storage.from(bucketName).list('', { limit: 1 });

        if (!listError) {
          console.log(`[v0] STORAGE INIT - Bucket '${bucketName}' already exists`);
          results[bucketName] = { status: 'exists', message: 'Bucket already exists' };
          continue;
        }

        // Create bucket
        const { data: createdBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880,
        });

        if (createError) {
          console.error(`[v0] STORAGE INIT - Error creating ${bucketName}:`, createError.message);
          results[bucketName] = { status: 'error', message: createError.message };
        } else {
          console.log(`[v0] STORAGE INIT - Successfully created bucket: ${bucketName}`);
          results[bucketName] = { status: 'created', message: 'Bucket created successfully' };
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[v0] STORAGE INIT - Exception for ${bucketName}:`, errorMsg);
        results[bucketName] = { status: 'error', message: errorMsg };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Storage initialization complete',
      results,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] STORAGE INIT - Error:', errorMsg);
    return NextResponse.json({ error: 'Failed to initialize storage' }, { status: 500 });
  }
}
