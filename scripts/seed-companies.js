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

async function seedCompanies() {
  console.log('🚀 Seeding companies...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // List of top companies
    const companies = [
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer' },
      { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Automotive' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Entertainment' },
      { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', sector: 'Technology' },
      { symbol: 'BABA', name: 'Alibaba Group', exchange: 'NYSE', sector: 'Technology' },
      { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE', sector: 'Technology' },
      { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE', sector: 'Software' },
      { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ', sector: 'Software' },
      { symbol: 'UBER', name: 'Uber Technologies', exchange: 'NYSE', sector: 'Transport' },
      { symbol: 'DIS', name: 'The Walt Disney Company', exchange: 'NYSE', sector: 'Entertainment' },
      { symbol: 'PYPL', name: 'PayPal Holdings', exchange: 'NASDAQ', sector: 'Finance' },
      { symbol: 'KO', name: 'The Coca-Cola Company', exchange: 'NYSE', sector: 'Beverages' },
      { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ', sector: 'Beverages' },
      { symbol: 'NKE', name: 'Nike Inc.', exchange: 'NYSE', sector: 'Apparel' },
    ];

    console.log(`📋 Inserting ${companies.length} companies...`);
    
    for (const company of companies) {
      const existing = await sql`
        SELECT id FROM companies WHERE symbol = ${company.symbol}
      `;

      if (existing.length === 0) {
        await sql`
          INSERT INTO companies (symbol, name, exchange, sector)
          VALUES (${company.symbol}, ${company.name}, ${company.exchange}, ${company.sector})
        `;
        console.log(`  ✓ ${company.symbol} - ${company.name}`);
      } else {
        console.log(`  ⏭️  ${company.symbol} already exists`);
      }
    }

    // Verify
    const total = await sql`SELECT COUNT(*) as count FROM companies`;
    console.log(`\n✅ Companies seeded successfully! Total: ${total[0].count}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedCompanies();
