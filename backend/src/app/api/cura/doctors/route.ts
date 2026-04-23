import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { doctors } from '@/db/schema';

export async function GET() {
  try {
    const data = await db.select().from(doctors).orderBy(doctors.name);
    return NextResponse.json({ data });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}
