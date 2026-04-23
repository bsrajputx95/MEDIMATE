import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { polls, pollVotes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const allPolls = await db.select().from(polls).orderBy(polls.createdAt);
    if (!userId) return NextResponse.json({ data: allPolls.map(p => ({ ...p, userVote: null })) });
    const votes = await db.select().from(pollVotes).where(eq(pollVotes.userId, userId));
    const voteMap = new Map(votes.map(v => [v.pollId, v.optionId]));
    return NextResponse.json({ data: allPolls.map(p => ({ ...p, userVote: voteMap.get(p.id) || null })) });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}
