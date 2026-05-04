#!/usr/bin/env node

/**
 * Seed Admin Account Script
 * Creates the default admin account in the database
 * Run with: node scripts/seed-admin-account.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function seedAdminAccount() {
  try {
    const sql = neon(DATABASE_URL);

    console.log('🔄 Starting admin account setup...');

    // Admin credentials
    const adminEmail = 'admin@xholding.com';
    const adminPassword = 'AdminPassword123!';

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    console.log('📝 Creating admin account...');

    // Insert admin account
    const result = await sql`
      INSERT INTO admins (id, email, password_hash, full_name, status, created_at, updated_at)
      VALUES (${uuidv4()}, ${adminEmail}, ${passwordHash}, 'System Administrator', 'active', NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, full_name;
    `;

    if (result.length > 0) {
      console.log('✅ Admin account created successfully!');
      console.log(`   Email: ${result[0].email}`);
      console.log(`   Name: ${result[0].full_name}`);
      console.log(`   ID: ${result[0].id}`);
    } else {
      console.log('ℹ️  Admin account already exists');
    }

    console.log('\n✨ Admin setup completed successfully!');
    console.log('\n📋 Admin Login Details:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  SECURITY NOTE: Change this password immediately after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin account:', error.message);
    process.exit(1);
  }
}

seedAdminAccount();
