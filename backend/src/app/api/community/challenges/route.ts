import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challenges, challengeParticipants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const allChallenges = await db.select().from(challenges).orderBy(challenges.title);
    if (!userId) return NextResponse.json({ data: allChallenges.map(c => ({ ...c, isJoined: false })) });
    const participations = await db.select().from(challengeParticipants).where(eq(challengeParticipants.userId, userId));
    const joinedIds = new Set(participations.map(p => p.challengeId));
    return NextResponse.json({ data: allChallenges.map(c => ({ ...c, isJoined: joinedIds.has(c.id) })) });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}
