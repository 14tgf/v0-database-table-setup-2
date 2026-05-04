import { createAdmin } from '../lib/admin-auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@xholding.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'X Admin';

async function seedAdmin() {
  try {
    console.log('[v0] Checking if admin account exists...');
    
    // Try to create admin (will fail if email already exists, which is expected)
    const admin = await createAdmin(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME);
    
    console.log('[v0] ✅ Admin account created successfully!');
    console.log('[v0] Admin ID:', admin.id);
    console.log('[v0] Email:', admin.email);
    console.log('[v0] Name:', admin.full_name);
    console.log('[v0]');
    console.log('[v0] Login credentials:');
    console.log('[v0] Email:', ADMIN_EMAIL);
    console.log('[v0] Password:', ADMIN_PASSWORD);
    console.log('[v0]');
    console.log('[v0] ⚠️  IMPORTANT: Change the default password in production!');
    
    process.exit(0);
  } catch (error) {
    console.error('[v0] Error seeding admin:', error);
    
    // If it's a unique constraint violation, the admin likely already exists
    if ((error as any)?.message?.includes('duplicate') || (error as any)?.message?.includes('unique')) {
      console.log('[v0] ℹ️  Admin account already exists. No action needed.');
      process.exit(0);
    }
    
    process.exit(1);
  }
}

seedAdmin();
