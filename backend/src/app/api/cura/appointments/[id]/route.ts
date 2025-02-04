import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const [updated] = await db.update(appointments).set(body).where(and(eq(appointments.id, parseInt(id)), eq(appointments.userId, userId))).returning();
    if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await db.update(appointments).set({ status: 'cancelled' }).where(and(eq(appointments.id, parseInt(id)), eq(appointments.userId, userId)));
    return NextResponse.json({ message: 'Appointment cancelled' });
  } catch { return NextResponse.json({ message: 'Failed' }, { status: 500 }); }
}
