import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let dbInstance: any = null;

export const getDb = () => {
  if (dbInstance) return dbInstance;
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  
  const sql = neon(databaseUrl);
  dbInstance = drizzle(sql, { schema });
  return dbInstance;
};

// Export a proxy to maintain compatibility with existing imports
export const db = new Proxy({} as any, {
  get(_, prop) {
    const instance = getDb();
    return instance[prop];
  }
});
