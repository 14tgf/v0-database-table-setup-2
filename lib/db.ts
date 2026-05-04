import { neon } from '@neondatabase/serverless';

console.log('[v0] DB module initializing. DATABASE_URL exists:', !!process.env.DATABASE_URL);

let sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sql) {
    const dbUrl = process.env.DATABASE_URL;
    console.log('[v0] getSql called. DATABASE_URL check:', {
      exists: !!dbUrl,
      startsWithPostgres: dbUrl?.startsWith('postgres') || dbUrl?.startsWith('postgresql'),
      length: dbUrl?.length || 0
    });
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    try {
      console.log('[v0] Creating Neon SQL client...');
      sql = neon(dbUrl);
      console.log('[v0] Neon SQL client created successfully');
    } catch (error) {
      console.error('[v0] Failed to create Neon SQL client:', error);
      throw error;
    }
  }
  return sql;
}

export { getSql as sql };

export async function withDb<T>(
  callback: (sql: ReturnType<typeof neon>) => Promise<T>
): Promise<T> {
  return callback(getSql());
}
