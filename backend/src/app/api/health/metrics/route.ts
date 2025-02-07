import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthMetrics } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    let query = db.select().from(healthMetrics).where(eq(healthMetrics.userId, userId));

    if (dateFrom) {
      query = db.select().from(healthMetrics).where(
        and(eq(healthMetrics.userId, userId), gte(healthMetrics.date, dateFrom))
      );
    }
    if (dateFrom && dateTo) {
      query = db.select().from(healthMetrics).where(
        and(eq(healthMetrics.userId, userId), gte(healthMetrics.date, dateFrom), lte(healthMetrics.date, dateTo))
      );
    }

    const metrics = await query.orderBy(healthMetrics.date);
    return NextResponse.json({ data: metrics });
  } catch (error) {
    console.error('Get metrics error:', error);
    return NextResponse.json({ message: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { date, steps, heartRate, waterIntake, caloriesConsumed, sleepHours, weight } = body;

    if (!date) return NextResponse.json({ message: 'Date is required' }, { status: 400 });

    const existing = await db.select().from(healthMetrics).where(
      and(eq(healthMetrics.userId, userId), eq(healthMetrics.date, date))
    );

    if (existing.length > 0) {
      const [updated] = await db.update(healthMetrics).set({
        steps: steps ?? existing[0].steps,
        heartRate: heartRate ?? existing[0].heartRate,
        waterIntake: waterIntake ?? existing[0].waterIntake,
        caloriesConsumed: caloriesConsumed ?? existing[0].caloriesConsumed,
        sleepHours: sleepHours ?? existing[0].sleepHours,
        weight: weight ?? existing[0].weight,
      }).where(eq(healthMetrics.id, existing[0].id)).returning();
      return NextResponse.json({ data: updated });
    }

    const [created] = await db.insert(healthMetrics).values({
      userId,
      date,
      steps: steps || 0,
      heartRate,
      waterIntake: waterIntake || '0',
      caloriesConsumed: caloriesConsumed || 0,
      sleepHours,
      weight,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error('Create metrics error:', error);
    return NextResponse.json({ message: 'Failed to save metrics' }, { status: 500 });
  }
}
