import { Group, Challenge, ExpertAnswer, Post, User, Poll, Badge } from '../types/community';

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'You',
  badges: ['water-warrior', 'step-master']
};

export const MOCK_GROUPS: Group[] = [
  {
    id: 'diabetes-support',
    name: 'Diabetes Support',
    description: 'A supportive community for managing diabetes together',
    memberCount: 1247,
    isJoined: true,
    category: 'health-condition'
  },
  {
    id: 'mental-wellness',
    name: 'Mental Wellness',
    description: 'Share your journey towards better mental health',
    memberCount: 2156,
    isJoined: false,
    category: 'mental-wellness'
  },
  {
    id: 'fitness-nutrition',
    name: 'Fitness & Nutrition',
    description: 'Tips, recipes, and workout motivation',
    memberCount: 3421,
    isJoined: true,
    category: 'fitness'
  },
  {
    id: 'stress-relief',
    name: 'Stress Relief',
    description: 'Find peace and manage stress effectively',
    memberCount: 987,
    isJoined: false,
    category: 'mental-wellness'
  }
];

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'no-sugar-3days',
    title: 'No Sugar Challenge',
    description: 'Avoid added sugars for 3 consecutive days',
    duration: '3 days',
    participants: 234,
    isJoined: true,
    progress: 66,
    category: 'nutrition'
  },
  {
    id: 'walk-5000-steps',
    title: 'Daily Steps Goal',
    description: 'Walk 5,000 steps daily for a week',
    duration: '7 days',
    participants: 567,
    isJoined: false,
    category: 'fitness'
  },
  {
    id: 'water-intake',
    title: 'Hydration Hero',
    description: 'Drink 8 glasses of water every day for 7 days',
    duration: '7 days',
    participants: 432,
    isJoined: true,
    progress: 85,
    category: 'wellness'
  },
  {
    id: 'sleep-8hours',
    title: 'Sleep Champion',
    description: 'Get 8 hours of sleep for 5 nights straight',
    duration: '5 days',
    participants: 298,
    isJoined: false,
    category: 'wellness'
  },
  {
    id: 'meditation-10min',
    title: 'Mindful Moments',
    description: 'Meditate for 10 minutes daily for a week',
    duration: '7 days',
    participants: 189,
    isJoined: false,
    category: 'mental-wellness'
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    userId: 'user-2',
    user: { id: 'user-2', name: 'Sarah M.', badges: ['step-master'] },
    content: 'Just hit my step goal today! 💪 Feeling amazing after that evening walk. Who else is crushing their fitness goals?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 12,
    comments: 3,
    shares: 1,
    isLiked: false,
    groupId: 'fitness-nutrition'
  },
  {
    id: 'post-2',
    userId: 'user-3',
    user: { id: 'user-3', name: 'Anonymous', badges: [], isAnonymous: true },
    content: 'Day 2 of no sugar – feeling great so far! 🍵 The cravings were tough yesterday but today feels easier. Thanks for all the support!',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 25,
    comments: 5,
    shares: 4,
    isLiked: true,
    isAnonymous: true
  },
  {
    id: 'post-3',
    userId: 'user-4',
    user: { id: 'user-4', name: 'Mike R.', badges: ['water-warrior', 'meditation-master'] },
    content: 'Quick reminder: small steps lead to big changes! 🌱 Started with just 5 minutes of meditation, now I\'m up to 20 minutes daily.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 18,
    comments: 7,
    shares: 3,
    isLiked: false,
    groupId: 'mental-wellness'
  },
  {
    id: 'post-4',
    userId: 'user-5',
    user: { id: 'user-5', name: 'Emma L.', badges: ['hydration-hero'] },
    content: 'Anyone else struggling with late-night snacking? Looking for healthy alternatives that actually satisfy cravings 🤔',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    likes: 31,
    comments: 12,
    shares: 2,
    isLiked: true,
    groupId: 'fitness-nutrition'
  }
];

export const MOCK_EXPERT_ANSWERS: ExpertAnswer[] = [
  {
    id: 'expert-1',
    question: 'What\'s the best way to manage sugar cravings?',
    answer: 'Try having a protein-rich snack with water first. Often cravings are actually thirst or low blood sugar. Greek yogurt with berries or a handful of nuts can help stabilize your levels.',
    expertName: 'Dr. Lisa Chen',
    expertTitle: 'Registered Nutritionist',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    likes: 45,
    isLiked: false
  },
  {
    id: 'expert-2',
    question: 'How can I stay motivated to exercise when I\'m feeling down?',
    answer: 'Start incredibly small - even 2 minutes counts! Movement releases endorphins which naturally boost mood. Try gentle activities like stretching or a short walk. Progress, not perfection.',
    expertName: 'Coach Maria Santos',
    expertTitle: 'Certified Wellness Coach',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
    likes: 67,
    isLiked: true
  }
];

export const MOCK_POLLS: Poll[] = [
  {
    id: 'poll-1',
    question: 'What time do you prefer to work out?',
    options: [
      { id: 'morning', text: 'Morning (6-9 AM)', votes: 45 },
      { id: 'afternoon', text: 'Afternoon (12-3 PM)', votes: 23 },
      { id: 'evening', text: 'Evening (6-9 PM)', votes: 67 },
      { id: 'night', text: 'Night (9+ PM)', votes: 12 }
    ],
    totalVotes: 147,
    userVote: 'evening',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
];

export const MOCK_BADGES: Badge[] = [
  {
    id: 'water-warrior',
    name: 'Water Warrior',
    description: 'Completed the hydration challenge',
    icon: '💧',
    earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'step-master',
    name: 'Step Master',
    description: 'Achieved daily step goals for a week',
    icon: '👟',
    earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'meditation-master',
    name: 'Meditation Master',
    description: 'Meditated daily for 30 days',
    icon: '🧘',
  },
  {
    id: 'hydration-hero',
    name: 'Hydration Hero',
    description: 'Maintained proper hydration for 2 weeks',
    icon: '🏆'
  }
];

export const TRENDING_TOPICS = [
  { tag: '#NoSugarChallenge', posts: 234 },
  { tag: '#MentalHealthMatters', posts: 189 },
  { tag: '#FitnessMotivation', posts: 156 },
  { tag: '#HealthyEating', posts: 143 },
  { tag: '#StressRelief', posts: 98 }
];

export const DAILY_INSPIRATION = [
  'Small steps lead to big changes 🌱',
  'Progress, not perfection 💪',
  'Your health journey is unique to you ✨',
  'Every day is a fresh start 🌅',
  'Celebrate small victories 🎉'
];