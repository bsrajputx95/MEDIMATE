import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  decimal,
  serial,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: text('name'),
  isGuest: boolean('is_guest').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  gender: varchar('gender', { length: 20 }),
  age: integer('age'),
  heightFeet: integer('height_feet'),
  heightInches: integer('height_inches'),
  weight: decimal('weight', { precision: 5, scale: 2 }),
  bloodGroup: varchar('blood_group', { length: 5 }),
  medicalConditions: jsonb('medical_conditions').$type<string[]>(),
  phone: varchar('phone', { length: 30 }),
  emergencyContact: jsonb('emergency_contact').$type<{ name: string; relationship: string; phone: string }>(),
});

export const healthMetrics = pgTable('health_metrics', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  steps: integer('steps').default(0),
  heartRate: integer('heart_rate'),
  waterIntake: decimal('water_intake', { precision: 5, scale: 2 }).default('0'),
  caloriesConsumed: integer('calories_consumed').default(0),
  sleepHours: decimal('sleep_hours', { precision: 4, scale: 1 }),
  weight: decimal('weight', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  uniqueUserDate: { columns: [t.userId, t.date] },
}));

export const healthGoals = pgTable('health_goals', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }),
  title: varchar('title', { length: 255 }).notNull(),
  target: decimal('target', { precision: 10, scale: 2 }).notNull(),
  current: decimal('current', { precision: 10, scale: 2 }).default('0'),
  unit: varchar('unit', { length: 50 }),
  deadline: text('deadline'),
  progress: integer('progress').default(0),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  doctorName: varchar('doctor_name', { length: 255 }).notNull(),
  specialty: varchar('specialty', { length: 100 }),
  date: text('date').notNull(),
  time: varchar('time', { length: 20 }),
  type: varchar('type', { length: 50 }),
  status: varchar('status', { length: 20 }).default('upcoming'),
  location: varchar('location', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const medications = pgTable('medications', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  dosage: varchar('dosage', { length: 100 }),
  frequency: varchar('frequency', { length: 100 }),
  prescribedBy: varchar('prescribed_by', { length: 255 }),
  startDate: text('start_date'),
  endDate: text('end_date'),
  instructions: text('instructions'),
  reminderTimes: jsonb('reminder_times').$type<string[]>(),
  isTaken: boolean('is_taken').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const testReports = pgTable('test_reports', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  testName: varchar('test_name', { length: 255 }).notNull(),
  testType: varchar('test_type', { length: 50 }),
  date: text('date'),
  doctorName: varchar('doctor_name', { length: 255 }),
  clinic: varchar('clinic', { length: 255 }),
  status: varchar('status', { length: 20 }).default('pending'),
  results: text('results'),
  value: varchar('value', { length: 255 }),
  normalRange: varchar('normal_range', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  specialty: varchar('specialty', { length: 100 }),
  rating: decimal('rating', { precision: 2, scale: 1 }),
  experience: varchar('experience', { length: 100 }),
  location: varchar('location', { length: 255 }),
  availability: varchar('availability', { length: 255 }),
  consultationFee: integer('consultation_fee'),
  languages: jsonb('languages').$type<string[]>(),
});

export const treatmentPlans = pgTable('treatment_plans', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  progress: integer('progress').default(0),
  prescribedBy: varchar('prescribed_by', { length: 255 }),
  milestones: jsonb('milestones').$type<{ id: string; title: string; description: string; dueDate: string; completed: boolean }[]>(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isAnonymous: boolean('is_anonymous').default(false),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  sharesCount: integer('shares_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isAnonymous: boolean('is_anonymous').default(false),
  likesCount: integer('likes_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }),
  memberCount: integer('member_count').default(0),
});

export const groupMembers = pgTable('group_members', {
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.groupId, t.userId] }),
}));

export const challenges = pgTable('challenges', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  duration: varchar('duration', { length: 50 }),
  category: varchar('category', { length: 50 }),
  participantsCount: integer('participants_count').default(0),
});

export const challengeParticipants = pgTable('challenge_participants', {
  challengeId: integer('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.challengeId, t.userId] }),
}));

export const polls = pgTable('polls', {
  id: serial('id').primaryKey(),
  question: varchar('question', { length: 500 }).notNull(),
  options: jsonb('options').$type<{ id: string; text: string; votes: number }[]>().notNull(),
  totalVotes: integer('total_votes').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pollVotes = pgTable('poll_votes', {
  pollId: integer('poll_id').notNull().references(() => polls.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  optionId: varchar('option_id', { length: 100 }).notNull(),
  votedAt: timestamp('voted_at').defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.pollId, t.userId] }),
}));

export const healthIssues = pgTable('health_issues', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bodyPart: varchar('body_part', { length: 100 }),
  description: text('description'),
  analysisResult: jsonb('analysis_result').$type<{ nutrients: unknown[]; lifestyle: unknown[] }>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  metrics: many(healthMetrics),
  goals: many(healthGoals),
  appointments: many(appointments),
  medications: many(medications),
  testReports: many(testReports),
  treatmentPlans: many(treatmentPlans),
  posts: many(posts),
  comments: many(comments),
  groupMemberships: many(groupMembers),
  challengeParticipations: many(challengeParticipants),
  pollVotes: many(pollVotes),
  healthIssues: many(healthIssues),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));
