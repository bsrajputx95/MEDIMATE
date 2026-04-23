import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const postId = parseInt(id);
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    await db.update(posts).set({ likesCount: post.likesCount + 1 }).where(eq(posts.id, postId));
    return NextResponse.json({ message: 'Liked' });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}
