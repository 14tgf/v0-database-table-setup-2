import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

// Initialize buckets on module load
async function ensureBucketsExist() {
  const buckets = ['kyc-documents', 'payment-proofs', 'order-proofs', 'user-uploads'];

  for (const bucketName of buckets) {
    try {
      console.log(`[v0] Checking if bucket '${bucketName}' exists...`);

      // Try to list files to check if bucket exists
      const { data, error } = await supabase.storage.from(bucketName).list('', { limit: 1 });

      if (error && error.message.includes('Bucket not found')) {
        console.log(`[v0] Bucket '${bucketName}' not found, creating it...`);

        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });

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
      console.log(`[v0] Error with bucket '${bucketName}':`, errorMsg);
    }
  }
}

// Initialize on first import
ensureBucketsExist().catch(err => console.error('[v0] Storage initialization failed:', err));

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
 * Ensures all images are stored in one place with public URLs for emails
 */
export async function uploadImageToSupabase(options: UploadImageOptions): Promise<UploadImageResult> {
  const { bucket, file, userId, maxSizeMB = 5 } = options;

  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Only image files are allowed',
      };
    }

    // Validate file size
    const MAX_SIZE = maxSizeMB * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size is ${maxSizeMB}MB`,
      };
    }

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${userId}/${timestamp}-${random}.${extension}`;

    console.log('[v0] SUPABASE UPLOAD - Uploading to bucket:', bucket, 'filename:', filename);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[v0] SUPABASE UPLOAD - Upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }

    // Generate public URL
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    console.log('[v0] SUPABASE UPLOAD - Successfully uploaded:', {
      bucket,
      path: data.path,
      url: publicData.publicUrl,
    });

    return {
      success: true,
      url: publicData.publicUrl,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] SUPABASE UPLOAD - Error:', errorMsg);
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
