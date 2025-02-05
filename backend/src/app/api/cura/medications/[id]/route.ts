import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const [updated] = await db.update(medications).set(body).where(and(eq(medications.id, parseInt(id)), eq(medications.userId, userId))).returning();
    if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await db.delete(medications).where(and(eq(medications.id, parseInt(id)), eq(medications.userId, userId)));
    return NextResponse.json({ message: 'Medication deleted' });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}
