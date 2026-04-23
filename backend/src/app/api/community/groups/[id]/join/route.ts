import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { groups, groupMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const groupId = parseInt(id);
    const existing = await db.select().from(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
    if (existing.length > 0) {
      await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
      await db.update(groups).set({ memberCount: db.select({ count: groupMembers.groupId }).from(groupMembers).where(eq(groupMembers.groupId, groupId)) }).where(eq(groups.id, groupId));
      return NextResponse.json({ message: 'Left group' });
    } else {
      await db.insert(groupMembers).values({ groupId, userId });
      await db.update(groups).set({ memberCount: db.select({ count: groupMembers.groupId }).from(groupMembers).where(eq(groupMembers.groupId, groupId)) }).where(eq(groups.id, groupId));
      return NextResponse.json({ message: 'Joined group' });
    }
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}
