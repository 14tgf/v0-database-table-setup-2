import { neon } from '@neondatabase/serverless';

let sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sql) {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    sql = neon(dbUrl);
  }
  return sql;
}

export { getSql as sql };

export async function withDb<T>(
  callback: (sql: ReturnType<typeof neon>) => Promise<T>
): Promise<T> {
  return callback(getSql());
}
