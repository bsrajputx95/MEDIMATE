import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { groups, groupMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const allGroups = await db.select().from(groups).orderBy(groups.name);
    if (!userId) return NextResponse.json({ data: allGroups.map((g: any) => ({ ...g, isJoined: false })) });
    const memberships = await db.select().from(groupMembers).where(eq(groupMembers.userId, userId));
    const joinedIds = new Set(memberships.map((m: any) => m.groupId));
    return NextResponse.json({ data: allGroups.map((g: any) => ({ ...g, isJoined: joinedIds.has(g.id) })) });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}
