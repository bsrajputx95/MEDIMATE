import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let dbInstance: any = null;

const createMockDb = () => {
  console.warn('Using mock in-memory database');
  const store: Record<string, any[]> = {};
  
  return {
    select: () => ({
      from: (table: any) => {
        const tableName = table._.name;
        return {
          where: () => [],
          orderBy: () => [],
          execute: async () => store[tableName] || [],
          then: (cb: any) => Promise.resolve(store[tableName] || []).then(cb)
        };
      }
    }),
    insert: (table: any) => ({
      values: (values: any) => {
        const tableName = table._.name;
        if (!store[tableName]) store[tableName] = [];
        const newRecord = { id: crypto.randomUUID(), ...values, createdAt: new Date() };
        store[tableName].push(newRecord);
        return {
          returning: () => [newRecord],
          execute: async () => [newRecord],
          then: (cb: any) => Promise.resolve([newRecord]).then(cb)
        };
      }
    })
  } as any;
};

export const getDb = () => {
  if (dbInstance) return dbInstance;
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    dbInstance = createMockDb();
    return dbInstance;
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
