import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { testReports } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const data = await db.select().from(testReports).where(eq(testReports.userId, userId)).orderBy(testReports.date);
    return NextResponse.json({ data });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const [created] = await db.insert(testReports).values({ userId, ...body }).returning();
    return NextResponse.json({ data: created }, { status: 201 });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}
