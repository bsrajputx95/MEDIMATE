import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import crypto from 'crypto';

let dbInstance: any = null;

const createMockDb = () => {
  console.warn('Using mock in-memory database');
  const store: Record<string, any[]> = {};
  
  const createChain = (tableName: string, data: any[]) => {
    const chain = {
      where: () => chain,
      orderBy: () => chain,
      limit: () => chain,
      offset: () => chain,
      returning: () => chain,
      execute: async () => data,
      then: (cb: any) => Promise.resolve(data).then(cb),
      catch: (cb: any) => Promise.resolve(data).catch(cb),
    };
    return chain;
  };

  return {
    select: () => ({
      from: (table: any) => {
        const tableName = table._.name;
        console.log(`Mock DB: selecting from ${tableName}`);
        return createChain(tableName, store[tableName] || []);
      }
    }),
    insert: (table: any) => ({
      values: (values: any) => {
        const tableName = table._.name;
        console.log(`Mock DB: inserting into ${tableName}`, values);
        if (!store[tableName]) store[tableName] = [];
        
        // Simple UUID-like generator
        const id = (typeof crypto !== 'undefined' && crypto.randomUUID) 
          ? crypto.randomUUID() 
          : 'mock-' + Math.random().toString(36).substring(2, 15);
          
        const newRecord = { id, ...values, createdAt: new Date() };
        store[tableName].push(newRecord);
        return createChain(tableName, [newRecord]);
      }
    }),
    update: (table: any) => ({
      set: (values: any) => ({
        where: () => createChain(table._.name, [])
      })
    }),
    delete: (table: any) => ({
      where: () => createChain(table._.name, [])
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
