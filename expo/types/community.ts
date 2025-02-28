export interface User {
  id: string;
  name: string;
  avatar?: string;
  isAnonymous?: boolean;
  badges: string[];
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  groupId?: string;
  isAnonymous?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  category: 'health-condition' | 'lifestyle' | 'fitness' | 'mental-wellness';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: string;
  participants: number;
  isJoined: boolean;
  progress?: number;
  category: string;
}

export interface ExpertAnswer {
  id: string;
  question: string;
  answer: string;
  expertName: string;
  expertTitle: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  userVote?: string;
  timestamp: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
}