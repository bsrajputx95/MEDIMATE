import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const data = await db.select({
      id: posts.id,
      content: posts.content,
      isAnonymous: posts.isAnonymous,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      sharesCount: posts.sharesCount,
      createdAt: posts.createdAt,
      userId: posts.userId,
      userName: users.name,
    }).from(posts).leftJoin(users, eq(posts.userId, users.id)).orderBy(desc(posts.createdAt)).limit(limit).offset(offset);

    return NextResponse.json({ data: data.map((p: any) => ({
      ...p,
      user: { name: p.isAnonymous ? 'Anonymous' : (p.userName || 'Unknown'), isAnonymous: p.isAnonymous },
    }))});
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { content, isAnonymous } = await request.json();
    if (!content) return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    const [created] = await db.insert(posts).values({ userId, content, isAnonymous: isAnonymous || false }).returning();
    return NextResponse.json({ data: created }, { status: 201 });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}
