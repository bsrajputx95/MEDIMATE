import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { polls, pollVotes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const pollId = parseInt(id);
    const { optionId } = await request.json();
    if (!optionId) return NextResponse.json({ message: 'optionId is required' }, { status: 400 });

    const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));
    if (!poll) return NextResponse.json({ message: 'Poll not found' }, { status: 404 });

    const existingVote = await db.select().from(pollVotes).where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)));
    if (existingVote.length > 0) {
      await db.delete(pollVotes).where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)));
    }

    await db.insert(pollVotes).values({ pollId, userId, optionId });
    return NextResponse.json({ message: 'Vote recorded' });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}
