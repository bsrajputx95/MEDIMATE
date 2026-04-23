import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, gender, age, height, weight, bloodGroup, medicalConditions } = body;

    await db.update(userProfiles).set({
      gender,
      age,
      heightFeet: height?.feet,
      heightInches: height?.inches,
      weight: String(weight),
      bloodGroup,
      medicalConditions,
    }).where(eq(userProfiles.userId, userId));

    return NextResponse.json({ message: 'Onboarding completed' });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ message: 'Failed to complete onboarding' }, { status: 500 });
  }
}
