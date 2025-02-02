import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { hashPassword, generateToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const password = await hashPassword(`guest_${Date.now()}`);

    const [newUser] = await db.insert(users).values({
      email: `guest_${Date.now()}@medimate.app`,
      passwordHash: password,
      name: 'Guest User',
      isGuest: true,
    }).returning();

    await db.insert(userProfiles).values({
      userId: newUser.id,
      gender: 'Male',
      age: 25,
      heightFeet: 5,
      heightInches: 8,
      weight: '70',
      bloodGroup: 'O+',
      medicalConditions: [],
    });

    const token = generateToken(newUser.id, true);

    return NextResponse.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isGuest: true,
        onboardingCompleted: true,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json({ message: 'Guest login failed' }, { status: 500 });
  }
}
