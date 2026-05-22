import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

/**
 * Ensure a bucket exists, create it if it doesn't
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    console.log(`[v0] Checking if bucket '${bucketName}' exists...`);

    // Try to list the bucket
    const { data, error } = await supabase.storage.from(bucketName).list('', { limit: 1 });

    if (!error) {
      console.log(`[v0] Bucket '${bucketName}' already exists`);
      return true;
    }

    if (error.message.includes('Bucket not found')) {
      console.log(`[v0] Bucket '${bucketName}' not found, creating it...`);

      const { data: createdBucket, error: createError } = await supabase.storage.createBucket(
        bucketName,
        {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        }
      );

      if (createError) {
        console.error(`[v0] Failed to create bucket '${bucketName}':`, createError.message);
        return false;
      }

      console.log(`[v0] Successfully created bucket '${bucketName}'`);
      return true;
    }

    console.error(`[v0] Unexpected error checking bucket '${bucketName}':`, error.message);
    return false;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[v0] Exception checking bucket '${bucketName}':`, errorMsg);
    return false;
  }
}

// Initialize buckets on module load
async function initializeBuckets() {
  const buckets = ['kyc-documents', 'payment-proofs', 'order-proofs'];

  for (const bucketName of buckets) {
    await ensureBucketExists(bucketName);
  }
}

// Start initialization
initializeBuckets().catch(err => console.error('[v0] Storage initialization failed:', err));

export interface UploadImageOptions {
  bucket: 'kyc-documents' | 'payment-proofs' | 'order-proofs' | 'user-uploads';
  file: File;
  userId: string;
  maxSizeMB?: number;
}

export interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload image to Supabase storage
 * Ensures bucket exists before uploading
 */
export async function uploadImageToSupabase(options: UploadImageOptions): Promise<UploadImageResult> {
  const { bucket, file, userId, maxSizeMB = 5 } = options;

  console.log('[v0] === SUPABASE UPLOAD FUNCTION STARTED ===');
  console.log('[v0] SUPABASE UPLOAD - Options:', { bucket, userId, maxSizeMB });

  try {
    // Validate file type
    console.log('[v0] SUPABASE UPLOAD - Validating file type:', file.type);
    if (!file.type.startsWith('image/')) {
      console.error('[v0] SUPABASE UPLOAD - Invalid file type:', file.type);
      return {
        success: false,
        error: 'Only image files are allowed',
      };
    }
    console.log('[v0] SUPABASE UPLOAD - File type is valid');

    // Validate file size
    console.log('[v0] SUPABASE UPLOAD - Validating file size:', file.size, 'bytes');
    const MAX_SIZE = maxSizeMB * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      console.error('[v0] SUPABASE UPLOAD - File too large:', file.size, '>', MAX_SIZE);
      return {
        success: false,
        error: `File too large. Maximum size is ${maxSizeMB}MB`,
      };
    }
    console.log('[v0] SUPABASE UPLOAD - File size is valid');

    // Ensure bucket exists before uploading
    console.log(`[v0] SUPABASE UPLOAD - Ensuring bucket '${bucket}' exists...`);
    const bucketReady = await ensureBucketExists(bucket);
    if (!bucketReady) {
      console.error(`[v0] SUPABASE UPLOAD - Failed to prepare bucket '${bucket}'`);
      return {
        success: false,
        error: `Failed to prepare storage bucket: ${bucket}`,
      };
    }
    console.log(`[v0] SUPABASE UPLOAD - Bucket '${bucket}' is ready`);

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${userId}/${timestamp}-${random}.${extension}`;

    console.log('[v0] SUPABASE UPLOAD - Generated filename:', filename);
    console.log('[v0] SUPABASE UPLOAD - Uploading to bucket:', bucket);

    // Upload file to Supabase Storage
    console.log('[v0] SUPABASE UPLOAD - Calling supabase.storage.from().upload()...');
    const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

    console.log('[v0] SUPABASE UPLOAD - Upload response - data:', data, 'error:', error);

    if (error) {
      console.error('[v0] SUPABASE UPLOAD - Upload error object:', error);
      console.error('[v0] SUPABASE UPLOAD - Error message:', error.message);
      console.error('[v0] SUPABASE UPLOAD - Error details:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }

    console.log('[v0] SUPABASE UPLOAD - Upload successful, data:', data);

    // Generate public URL
    console.log('[v0] SUPABASE UPLOAD - Generating public URL for path:', data.path);
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    console.log('[v0] SUPABASE UPLOAD - Public URL generated:', publicData.publicUrl);
    console.log('[v0] SUPABASE UPLOAD - Successfully uploaded:', {
      bucket,
      path: data.path,
      url: publicData.publicUrl,
    });

    console.log('[v0] === SUPABASE UPLOAD FUNCTION COMPLETED SUCCESSFULLY ===');

    return {
      success: true,
      url: publicData.publicUrl,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[v0] === SUPABASE UPLOAD FUNCTION ERROR ===');
    console.error('[v0] SUPABASE UPLOAD - Error message:', errorMsg);
    console.error('[v0] SUPABASE UPLOAD - Error stack:', errorStack);
    console.error('[v0] SUPABASE UPLOAD - Full error object:', error);
    return {
      success: false,
      error: `Failed to upload image: ${errorMsg}`,
    };
  }
}

/**
 * Delete image from Supabase storage
 */
export async function deleteImageFromSupabase(bucket: string, filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error('[v0] SUPABASE DELETE - Error:', error);
      return false;
    }

    console.log('[v0] SUPABASE DELETE - Successfully deleted:', filePath);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] SUPABASE DELETE - Error:', errorMsg);
    return false;
  }
}

