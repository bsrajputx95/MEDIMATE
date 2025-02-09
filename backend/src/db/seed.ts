import { db } from './index';
import { doctors, groups, challenges, polls } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Starting database seed...');

  const existingDoctors = await db.select().from(doctors);
  if (existingDoctors.length === 0) {
    await db.insert(doctors).values([
      { name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', rating: '4.8', experience: '15 years', location: 'Heart Care Clinic', availability: 'Available today', consultationFee: 150, languages: ['English', 'Spanish'] },
      { name: 'Dr. Michael Chen', specialty: 'General Physician', rating: '4.9', experience: '12 years', location: 'City Medical Center', availability: 'Next available: Tomorrow', consultationFee: 120, languages: ['English', 'Mandarin'] },
      { name: 'Dr. Emily Rodriguez', specialty: 'Dermatologist', rating: '4.7', experience: '10 years', location: 'Skin Health Clinic', availability: 'Available in 2 days', consultationFee: 180, languages: ['English', 'Spanish', 'Portuguese'] },
    ]);
    console.log('Seeded doctors');
  }

  const existingGroups = await db.select().from(groups);
  if (existingGroups.length === 0) {
    await db.insert(groups).values([
      { name: 'Diabetes Support', description: 'A supportive community for managing diabetes together', category: 'health-condition', memberCount: 1247 },
      { name: 'Mental Wellness', description: 'Share your journey towards better mental health', category: 'mental-wellness', memberCount: 2156 },
      { name: 'Fitness & Nutrition', description: 'Tips, recipes, and workout motivation', category: 'fitness', memberCount: 3421 },
      { name: 'Stress Relief', description: 'Find peace and manage stress effectively', category: 'mental-wellness', memberCount: 987 },
    ]);
    console.log('Seeded groups');
  }

  const existingChallenges = await db.select().from(challenges);
  if (existingChallenges.length === 0) {
    await db.insert(challenges).values([
      { title: 'No Sugar Challenge', description: 'Avoid added sugars for 3 consecutive days', duration: '3 days', category: 'nutrition', participantsCount: 234 },
      { title: 'Daily Steps Goal', description: 'Walk 5,000 steps daily for a week', duration: '7 days', category: 'fitness', participantsCount: 567 },
      { title: 'Hydration Hero', description: 'Drink 8 glasses of water every day for 7 days', duration: '7 days', category: 'wellness', participantsCount: 432 },
      { title: 'Sleep Champion', description: 'Get 8 hours of sleep for 5 nights straight', duration: '5 days', category: 'wellness', participantsCount: 298 },
      { title: 'Mindful Moments', description: 'Meditate for 10 minutes daily for a week', duration: '7 days', category: 'mental-wellness', participantsCount: 189 },
    ]);
    console.log('Seeded challenges');
  }

  const existingPolls = await db.select().from(polls);
  if (existingPolls.length === 0) {
    await db.insert(polls).values({
      question: 'What time do you prefer to work out?',
      options: [
        { id: 'morning', text: 'Morning (6-9 AM)', votes: 45 },
        { id: 'afternoon', text: 'Afternoon (12-3 PM)', votes: 23 },
        { id: 'evening', text: 'Evening (6-9 PM)', votes: 67 },
        { id: 'night', text: 'Night (9+ PM)', votes: 12 },
      ],
      totalVotes: 147,
    });
    console.log('Seeded polls');
  }

  console.log('Database seeded successfully!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
