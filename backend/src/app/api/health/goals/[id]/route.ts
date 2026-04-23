import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthGoals } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const [updated] = await db.update(healthGoals).set(body).where(
      and(eq(healthGoals.id, parseInt(id)), eq(healthGoals.userId, userId))
    ).returning();

    if (!updated) return NextResponse.json({ message: 'Goal not found' }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Update goal error:', error);
    return NextResponse.json({ message: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await db.delete(healthGoals).where(
      and(eq(healthGoals.id, parseInt(id)), eq(healthGoals.userId, userId))
    );

    return NextResponse.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Delete goal error:', error);
    return NextResponse.json({ message: 'Failed to delete goal' }, { status: 500 });
  }
}
