import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { getAdminByEmail, createAdmin } from '@/lib/admin-auth';

// Default credentials used only when no ADMIN_* env vars are configured.
const DEFAULT_ADMIN_EMAIL = 'admin@xholding.com';
const DEFAULT_ADMIN_PASSWORD = 'AdminPassword123!';
const DEFAULT_ADMIN_NAME = 'X Admin';

// Split a SQL file into individual statements. A naive split on ";" breaks
// PL/pgSQL function/trigger bodies, whose ";" characters live inside a
// dollar-quoted string ($$ ... $$). This splitter only treats a ";" as a
// statement boundary when it is not inside a single-quoted string or a
// dollar-quoted block.
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let dollarTag: string | null = null;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const rest = sql.slice(i);

    // Inside a dollar-quoted block, everything is literal until the matching tag.
    if (dollarTag) {
      if (rest.startsWith(dollarTag)) {
        current += dollarTag;
        i += dollarTag.length - 1;
        dollarTag = null;
        continue;
      }
      current += char;
      continue;
    }

    // Inside a single-quoted string, only another quote can end it.
    if (inSingleQuote) {
      current += char;
      if (char === "'") inSingleQuote = false;
      continue;
    }

    // Line comment: skip to end of line so its ; ' $ characters are ignored.
    if (char === '-' && sql[i + 1] === '-') {
      const newline = sql.indexOf('\n', i);
      i = newline === -1 ? sql.length : newline;
      continue;
    }

    // Block comment: skip to the closing */.
    if (char === '/' && sql[i + 1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      i = end === -1 ? sql.length : end + 1;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      current += char;
      continue;
    }

    const dollarMatch = rest.match(/^\$[A-Za-z0-9_]*\$/);
    if (dollarMatch) {
      dollarTag = dollarMatch[0];
      current += dollarTag;
      i += dollarTag.length - 1;
      continue;
    }

    if (char === ';') {
      const trimmed = current.trim();
      if (trimmed.length > 0) statements.push(trimmed);
      current = '';
      continue;
    }

    current += char;
  }

  const tail = current.trim();
  if (tail.length > 0) statements.push(tail);
  return statements;
}

export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, error: 'DATABASE_URL is not configured' },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);
    const migrationResults: Array<{ file: string; status: string; error?: string }> = [];

    // 1. Run all migrations in lexicographic order (000_init first).
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      const statements = splitSqlStatements(migrationSQL);

      try {
        for (const statement of statements) {
          // Use sql.query() (not sql.unsafe(), which returns an unexecuted
          // query object) so the DDL actually runs against the database.
          try {
            await sql.query(statement);
          } catch (statementError) {
            // Keep setup idempotent: some migrations issue bare CREATE TRIGGER
            // statements (Postgres has no reliable CREATE TRIGGER IF NOT EXISTS),
            // so a re-run would otherwise fail with "already exists". Those are
            // safe to ignore; any other error is a real failure.
            const message =
              statementError instanceof Error ? statementError.message : String(statementError);
            if (!/already exists/i.test(message)) {
              throw statementError;
            }
          }
        }
        migrationResults.push({ file, status: 'completed' });
      } catch (migrationError) {
        migrationResults.push({
          file,
          status: 'failed',
          error: migrationError instanceof Error ? migrationError.message : String(migrationError),
        });
      }
    }

    const failedMigrations = migrationResults.filter((r) => r.status === 'failed');
    if (failedMigrations.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Some migrations failed. The admin account was not created.',
          migrations: migrationResults,
        },
        { status: 500 }
      );
    }

    // 2. Create the initial admin login (from env vars, or hardcoded fallback).
    const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME;
    const usedEnvCredentials = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);

    const existingAdmin = await getAdminByEmail(adminEmail);
    let adminCreated = false;

    if (!existingAdmin) {
      await createAdmin(adminEmail, adminPassword, adminName);
      adminCreated = true;
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully.',
      migrations: migrationResults,
      admin: {
        created: adminCreated,
        alreadyExisted: !adminCreated,
        email: adminEmail,
        usedEnvCredentials,
        // Only reveal the fallback password when it was actually used to create the account.
        password: adminCreated && !usedEnvCredentials ? adminPassword : undefined,
      },
    });
  } catch (error) {
    console.error('[v0] Setup init error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Setup failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET reports whether the database has been set up already.
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ ready: false, message: 'DATABASE_URL not configured' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `;

    const tableNames = tables.map((t: any) => t.table_name);
    const hasAdmins = tableNames.includes('admins');
    let adminCount = 0;
    if (hasAdmins) {
      const rows = await sql`SELECT COUNT(*)::int AS count FROM admins`;
      adminCount = rows[0]?.count ?? 0;
    }

    return NextResponse.json({
      ready: hasAdmins && adminCount > 0,
      tables: tableNames,
      adminCount,
    });
  } catch (error) {
    return NextResponse.json(
      { ready: false, error: error instanceof Error ? error.message : 'Status check failed' },
      { status: 500 }
    );
  }
}
