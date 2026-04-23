import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthMetrics } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const metrics = await db.select().from(healthMetrics).where(eq(healthMetrics.userId, userId)).orderBy(desc(healthMetrics.date)).limit(7);

    if (metrics.length === 0) {
      return NextResponse.json({
        data: {
          healthScore: 0,
          avgSteps: 0,
          avgHeartRate: 0,
          avgWaterIntake: 0,
          avgCalories: 0,
          avgSleep: 0,
          trend: 'stable',
        },
      });
    }

    const validSteps = metrics.filter(m => m.steps !== null && m.steps !== undefined);
    const validHR = metrics.filter(m => m.heartRate !== null);
    const validWater = metrics.filter(m => m.waterIntake !== null);
    const validCalories = metrics.filter(m => m.caloriesConsumed !== null && m.caloriesConsumed !== undefined);
    const validSleep = metrics.filter(m => m.sleepHours !== null);

    const avgSteps = validSteps.length > 0 ? Math.round(validSteps.reduce((s, m) => s + (m.steps || 0), 0) / validSteps.length) : 0;
    const avgHeartRate = validHR.length > 0 ? Math.round(validHR.reduce((s, m) => s + (m.heartRate || 0), 0) / validHR.length) : 0;
    const avgWater = validWater.length > 0 ? parseFloat((validWater.reduce((s, m) => s + parseFloat(m.waterIntake || '0'), 0) / validWater.length).toFixed(1)) : 0;
    const avgCalories = validCalories.length > 0 ? Math.round(validCalories.reduce((s, m) => s + (m.caloriesConsumed || 0), 0) / validCalories.length) : 0;
    const avgSleep = validSleep.length > 0 ? parseFloat((validSleep.reduce((s, m) => s + parseFloat(m.sleepHours || '0'), 0) / validSleep.length).toFixed(1)) : 0;

    let healthScore = 50;
    if (avgSteps >= 8000) healthScore += 15; else if (avgSteps >= 5000) healthScore += 10; else if (avgSteps > 0) healthScore += 5;
    if (avgHeartRate >= 60 && avgHeartRate <= 80) healthScore += 10; else if (avgHeartRate > 0) healthScore += 5;
    if (avgWater >= 2) healthScore += 10; else if (avgWater > 0) healthScore += 5;
    if (avgCalories >= 1500 && avgCalories <= 2500) healthScore += 10; else if (avgCalories > 0) healthScore += 5;
    if (avgSleep >= 7 && avgSleep <= 9) healthScore += 5; else if (avgSleep > 0) healthScore += 2;
    healthScore = Math.min(100, healthScore);

    const trend = avgSteps >= 7000 ? 'improving' : avgSteps >= 4000 ? 'stable' : 'needs_attention';

    return NextResponse.json({
      data: { healthScore, avgSteps, avgHeartRate, avgWaterIntake: avgWater, avgCalories, avgSleep, trend },
    });
  } catch {
    return NextResponse.json({ message: 'Failed' }, { status: 500 });
  }
}
