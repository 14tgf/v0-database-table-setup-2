import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function initializeStorageBuckets() {
  const buckets = ['kyc-documents', 'payment-proofs', 'order-proofs'];

  for (const bucketName of buckets) {
    try {
      console.log(`[v0] Checking if bucket '${bucketName}' exists...`);

      // Try to list files in the bucket to check if it exists
      const { data, error } = await supabase.storage.from(bucketName).list('', { limit: 1 });

      if (error && error.message.includes('Bucket not found')) {
        console.log(`[v0] Creating bucket '${bucketName}'...`);

        // Create the bucket if it doesn't exist
        const { data: createData, error: createError } = await supabase.storage.createBucket(
          bucketName,
          {
            public: true, // Make buckets public so images can be viewed in emails
            fileSizeLimit: 5242880, // 5MB limit
          }
        );

        if (createError) {
          console.error(`[v0] Failed to create bucket '${bucketName}':`, createError.message);
        } else {
          console.log(`[v0] Successfully created bucket '${bucketName}'`);
        }
      } else if (error) {
        console.error(`[v0] Error checking bucket '${bucketName}':`, error.message);
      } else {
        console.log(`[v0] Bucket '${bucketName}' already exists`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[v0] Unexpected error with bucket '${bucketName}':`, errorMsg);
    }
  }
}

// Initialize buckets on module load
if (process.env.NODE_ENV === 'production' || process.env.INITIALIZE_STORAGE === 'true') {
  initializeStorageBuckets().catch(err => {
    console.error('[v0] Failed to initialize storage buckets:', err);
  });
}
