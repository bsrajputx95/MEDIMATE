import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthGoals } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const goals = await db.select().from(healthGoals).where(eq(healthGoals.userId, userId)).orderBy(healthGoals.createdAt);
    return NextResponse.json({ data: goals });
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json({ message: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, title, target, current, unit, deadline } = body;

    if (!title || !target) {
      return NextResponse.json({ message: 'Title and target are required' }, { status: 400 });
    }

    const [created] = await db.insert(healthGoals).values({
      userId,
      type,
      title,
      target: String(target),
      current: String(current || 0),
      unit,
      deadline,
      progress: 0,
      isCompleted: false,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json({ message: 'Failed to create goal' }, { status: 500 });
  }
}
