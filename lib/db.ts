import { neon } from '@neondatabase/serverless';

let sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

export { getSql as sql };

export async function withDb<T>(
  callback: (sql: ReturnType<typeof neon>) => Promise<T>
): Promise<T> {
  return callback(getSql());
}
