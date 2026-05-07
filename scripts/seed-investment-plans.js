'use strict';

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key.trim()] = value;
    }
  });
}

const { neon } = require('@neondatabase/serverless');
const { v4: uuidv4 } = require('uuid');

async function seedInvestmentPlans() {
  console.log('🚀 Seeding investment plans...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Get some companies
    const companies = await sql`
      SELECT id, symbol, name FROM companies LIMIT 10
    `;

    if (companies.length === 0) {
      console.error('❌ No companies found. Run seed-companies.js first');
      process.exit(1);
    }

    // Sample investment plans
    const plans = [
      {
        name: 'Starter Growth',
        description: 'Entry-level investment plan for beginners',
        minInvestment: 100,
        maxInvestment: 5000,
        expectedReturn: 8,
        durationMonths: 12,
      },
      {
        name: 'Standard Growth',
        description: 'Balanced growth investment for steady returns',
        minInvestment: 5000,
        maxInvestment: 50000,
        expectedReturn: 12,
        durationMonths: 24,
      },
      {
        name: 'Premium Growth',
        description: 'High-value investment plan with premium returns',
        minInvestment: 50000,
        maxInvestment: 500000,
        expectedReturn: 18,
        durationMonths: 36,
      },
      {
        name: 'Fast Track',
        description: 'Short-term high-yield investment opportunity',
        minInvestment: 10000,
        maxInvestment: 100000,
        expectedReturn: 15,
        durationMonths: 6,
      },
      {
        name: 'Platinum Elite',
        description: 'Exclusive long-term wealth building plan',
        minInvestment: 100000,
        maxInvestment: 1000000,
        expectedReturn: 20,
        durationMonths: 48,
      },
    ];

    console.log(`📋 Inserting ${plans.length} investment plans...`);

    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      const company = companies[i % companies.length];

      const existing = await sql`
        SELECT id FROM investment_plans WHERE plan_name = ${plan.name}
      `;

      if (existing.length === 0) {
        await sql`
          INSERT INTO investment_plans (
            company_id, plan_name, description, min_investment, 
            max_investment, expected_return, duration_months, status
          )
          VALUES (
            ${company.id}, ${plan.name}, ${plan.description}, ${plan.minInvestment},
            ${plan.maxInvestment}, ${plan.expectedReturn}, ${plan.durationMonths}, 'active'
          )
        `;
        console.log(`  ✓ ${plan.name} (${plan.expectedReturn}% return in ${plan.durationMonths} months)`);
      } else {
        console.log(`  ⏭️  ${plan.name} already exists`);
      }
    }

    // Verify
    const total = await sql`SELECT COUNT(*) as count FROM investment_plans`;
    console.log(`\n✅ Investment plans seeded successfully! Total: ${total[0].count}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedInvestmentPlans();
