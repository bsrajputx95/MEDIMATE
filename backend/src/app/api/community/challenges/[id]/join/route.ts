import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challenges, challengeParticipants } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const challengeId = parseInt(id);
    const existing = await db.select().from(challengeParticipants).where(and(eq(challengeParticipants.challengeId, challengeId), eq(challengeParticipants.userId, userId)));
    
    if (existing.length > 0) {
      await db.delete(challengeParticipants).where(and(eq(challengeParticipants.challengeId, challengeId), eq(challengeParticipants.userId, userId)));
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(challengeParticipants).where(eq(challengeParticipants.challengeId, challengeId));
      await db.update(challenges).set({ participantsCount: Number(countResult[0]?.count || 0) }).where(eq(challenges.id, challengeId));
      return NextResponse.json({ message: 'Left challenge' });
    } else {
      await db.insert(challengeParticipants).values({ challengeId, userId });
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(challengeParticipants).where(eq(challengeParticipants.challengeId, challengeId));
      await db.update(challenges).set({ participantsCount: Number(countResult[0]?.count || 0) }).where(eq(challenges.id, challengeId));
      return NextResponse.json({ message: 'Joined challenge' });
    }
  } catch (error) { 
    console.error(error);
    return NextResponse.json({ message: 'Failed' }, { status: 500 }); 
  }
}
