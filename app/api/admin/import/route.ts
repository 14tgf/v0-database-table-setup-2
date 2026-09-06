import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyAdminAuth } from '@/lib/admin-middleware';

const BATCH_SIZE = 200;
const MAX_PASSES = 12;

// Convert a source value into something the neon driver can bind as a parameter.
function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  // Keep arrays (Postgres array columns) as-is; stringify plain objects (jsonb).
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Destination DATABASE_URL is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const sourceUrl: string = (body?.sourceUrl || '').trim();

    if (!sourceUrl) {
      return NextResponse.json({ error: 'Source database URL is required' }, { status: 400 });
    }
    if (!/^postgres(ql)?:\/\//i.test(sourceUrl)) {
      return NextResponse.json(
        { error: 'Source URL must be a valid postgres:// connection string' },
        { status: 400 }
      );
    }

    const sourceSql = neon(sourceUrl);
    const targetSql = neon(process.env.DATABASE_URL);

    // Verify the source connection before doing anything else.
    let sourceTables: string[];
    try {
      const rows = await sourceSql`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
      sourceTables = rows.map((r: any) => r.table_name);
    } catch (connErr) {
      return NextResponse.json(
        {
          error: 'Could not connect to the source database',
          details: connErr instanceof Error ? connErr.message : String(connErr),
        },
        { status: 400 }
      );
    }

    // Only import tables that also exist in the destination schema.
    const destRows = await targetSql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    const destTables = new Set(destRows.map((r: any) => r.table_name));
    const tables = sourceTables.filter((t) => destTables.has(t));
    const skippedMissing = sourceTables.filter((t) => !destTables.has(t));

    const results: Record<string, { imported: number; status: string; error?: string }> = {};

    async function copyTable(table: string): Promise<void> {
      const rows: any[] = await sourceSql.query(`SELECT * FROM "${table}"`);
      if (rows.length === 0) {
        results[table] = { imported: 0, status: 'empty' };
        return;
      }

      const cols = Object.keys(rows[0]);
      const quotedCols = cols.map((c) => `"${c}"`).join(', ');
      let imported = 0;

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const chunk = rows.slice(i, i + BATCH_SIZE);
        const params: unknown[] = [];
        const rowClauses = chunk.map((row) => {
          const placeholders = cols.map((c) => {
            params.push(normalizeValue(row[c]));
            return `$${params.length}`;
          });
          return `(${placeholders.join(', ')})`;
        });

        const query = `INSERT INTO "${table}" (${quotedCols}) VALUES ${rowClauses.join(
          ', '
        )} ON CONFLICT DO NOTHING`;

        await targetSql.query(query, params);
        imported += chunk.length;
      }

      results[table] = { imported, status: 'imported' };
    }

    // Multi-pass import so foreign-key dependencies resolve regardless of table order.
    let pending = [...tables];
    let pass = 0;
    let lastErrors: Record<string, string> = {};

    while (pending.length > 0 && pass < MAX_PASSES) {
      const stillPending: string[] = [];
      lastErrors = {};

      for (const table of pending) {
        try {
          await copyTable(table);
        } catch (err) {
          stillPending.push(table);
          lastErrors[table] = err instanceof Error ? err.message : String(err);
        }
      }

      // No progress this pass means the remaining tables cannot be resolved.
      if (stillPending.length === pending.length) {
        for (const table of stillPending) {
          results[table] = { imported: 0, status: 'failed', error: lastErrors[table] };
        }
        break;
      }

      pending = stillPending;
      pass += 1;
    }

    const failed = Object.entries(results).filter(([, r]) => r.status === 'failed');
    const totalImported = Object.values(results).reduce((sum, r) => sum + r.imported, 0);

    return NextResponse.json({
      success: failed.length === 0,
      message:
        failed.length === 0
          ? `Imported ${totalImported} rows across ${tables.length} tables.`
          : `Imported ${totalImported} rows, but ${failed.length} table(s) failed.`,
      totalImported,
      tablesProcessed: tables.length,
      skippedMissing,
      results,
    });
  } catch (error) {
    console.error('[v0] Import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Import failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
