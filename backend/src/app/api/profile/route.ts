import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const [profile] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isGuest: users.isGuest,
        gender: userProfiles.gender,
        age: userProfiles.age,
        heightFeet: userProfiles.heightFeet,
        heightInches: userProfiles.heightInches,
        weight: userProfiles.weight,
        bloodGroup: userProfiles.bloodGroup,
        medicalConditions: userProfiles.medicalConditions,
        phone: userProfiles.phone,
        emergencyContact: userProfiles.emergencyContact,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, userId));

    if (!profile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...profile,
      height: { feet: profile.heightFeet, inches: profile.heightInches },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ message: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    if (body.name !== undefined) {
      await db.update(users).set({ name: body.name }).where(eq(users.id, userId));
    }

    const profileUpdate: Record<string, unknown> = {};
    const profileFields = ['gender', 'age', 'heightFeet', 'heightInches', 'weight', 'bloodGroup', 'medicalConditions', 'phone', 'emergencyContact'];
    for (const field of profileFields) {
      if (body[field] !== undefined) {
        profileUpdate[field] = body[field];
      }
    }

    if (Object.keys(profileUpdate).length > 0) {
      const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
      if (existing.length > 0) {
        await db.update(userProfiles).set(profileUpdate).where(eq(userProfiles.userId, userId));
      } else {
        await db.insert(userProfiles).values({ userId, ...profileUpdate });
      }
    }

    return NextResponse.json({ message: 'Profile updated' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}
