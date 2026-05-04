import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Starting database migrations...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set');
    }

    const sql = neon(process.env.DATABASE_URL);
    const results = [];

    // Get all migration files in order
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Lexicographic sort ensures 000_init runs first

    console.log('[v0] Found migration files:', migrationFiles);

    // Run each migration in sequence
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(filePath, 'utf-8');

      try {
        console.log(`[v0] Running migration: ${file}`);
        
        // Split SQL by semicolons and execute each statement
        const statements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);

        for (const statement of statements) {
          await sql.unsafe(statement);
        }

        results.push({
          file,
          status: 'completed',
          message: `Migration completed successfully`,
        });

        console.log(`[v0] Migration completed: ${file}`);
      } catch (migrationError) {
        console.error(`[v0] Migration error in ${file}:`, migrationError);
        results.push({
          file,
          status: 'failed',
          error: migrationError instanceof Error ? migrationError.message : String(migrationError),
        });
      }
    }

    // Check if migrations were successful
    const failedMigrations = results.filter(r => r.status === 'failed');

    if (failedMigrations.length > 0) {
      console.error('[v0] Some migrations failed:', failedMigrations);
      return NextResponse.json(
        {
          success: false,
          message: 'Some migrations failed',
          results,
        },
        { status: 500 }
      );
    }

    console.log('[v0] All migrations completed successfully');
    return NextResponse.json({
      success: true,
      message: 'All database migrations completed successfully',
      results,
    });
  } catch (error) {
    console.error('[v0] Migration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        status: 'error',
        message: 'DATABASE_URL not configured',
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Check if tables exist
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      tables: tablesCheck.map(t => t.table_name),
    });
  } catch (error) {
    console.error('[v0] Status check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Database connection failed',
      },
      { status: 500 }
    );
  }
}
