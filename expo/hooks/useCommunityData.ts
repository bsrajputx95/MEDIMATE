import { useApi, useMutation, usePaginatedApi } from './useApiData';
import { communityApi } from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

export interface Post {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    isAnonymous: boolean;
    badges: string[];
  };
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  timestamp: string;
  tags?: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  isJoined: boolean;
  isPrivate: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  participants: number;
  isJoined: boolean;
  progress?: number;
  points?: number;
}

export interface Poll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  totalVotes: number;
  hasVoted: boolean;
  userVote?: string;
  endsAt: string;
}

export interface ExpertAnswer {
  id: string;
  question: string;
  answer: string;
  expert: {
    id: string;
    name: string;
    avatar?: string;
    specialty: string;
    credentials: string[];
  };
  likes: number;
  isLiked: boolean;
  timestamp: string;
}

// ============================================================================
// Posts Hook
// ============================================================================

export function usePosts(pageSize = 10) {
  const {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  } = usePaginatedApi<Post>(
    async (page, limit) => {
      const response = await communityApi.getPosts(page, limit);
      return {
        data: response.data.map(post => ({
          ...post,
          timestamp: post.timestamp || new Date().toISOString(),
        })),
        hasMore: response.hasMore,
      };
    },
    { pageSize }
  );

  const createPost = useMutation(
    async (params: { content: string; isAnonymous?: boolean; tags?: string[] }) => {
      const result = await communityApi.createPost(params);
      refresh();
      return result;
    }
  );

  const likePost = useMutation(
    async (params: { id: string }) => {
      await communityApi.likePost(params.id);
      refresh();
    }
  );

  return {
    posts: data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    createPost,
    likePost,
  };
}

// ============================================================================
// Groups Hook
// ============================================================================

export function useGroups() {
  const { data, isLoading, error, refetch } = useApi<Group[]>(
    async () => {
      const groups = await communityApi.getGroups();
      return groups;
    }
  );

  const joinGroup = useMutation(
    async (params: { id: string }) => {
      await communityApi.joinGroup(params.id);
      refetch();
    }
  );

  const myGroups = data?.filter(g => g.isJoined) || [];
  const discoverGroups = data?.filter(g => !g.isJoined) || [];

  return {
    groups: data || [],
    myGroups,
    discoverGroups,
    isLoading,
    error,
    refetch,
    joinGroup,
  };
}

// ============================================================================
// Challenges Hook
// ============================================================================

export function useChallenges() {
  const { data, isLoading, error, refetch } = useApi<Challenge[]>(
    async () => {
      const challenges = await communityApi.getChallenges();
      return challenges;
    }
  );

  const joinChallenge = useMutation(
    async (params: { id: string }) => {
      await communityApi.joinChallenge(params.id);
      refetch();
    }
  );

  const activeChallenges = data?.filter(c => c.isJoined) || [];
  const availableChallenges = data?.filter(c => !c.isJoined) || [];

  return {
    challenges: data || [],
    activeChallenges,
    availableChallenges,
    isLoading,
    error,
    refetch,
    joinChallenge,
  };
}

// ============================================================================
// Polls Hook
// ============================================================================

export function usePolls() {
  const { data, isLoading, error, refetch } = useApi<Poll[]>(
    async () => {
      const polls = await communityApi.getPolls();
      return polls;
    }
  );

  const votePoll = useMutation(
    async (params: { pollId: string; optionId: string }) => {
      await communityApi.votePoll(params.pollId, params.optionId);
      refetch();
    }
  );

  const activePolls = data?.filter(p => new Date(p.endsAt) > new Date()) || [];
  const completedPolls = data?.filter(p => new Date(p.endsAt) <= new Date()) || [];

  return {
    polls: data || [],
    activePolls,
    completedPolls,
    isLoading,
    error,
    refetch,
    votePoll,
  };
}

// ============================================================================
// Community Overview Hook
// ============================================================================

export function useCommunityOverview() {
  const { posts, isLoading: postsLoading, refresh: refreshPosts } = usePosts(5);
  const { groups, myGroups, isLoading: groupsLoading } = useGroups();
  const { challenges, activeChallenges, isLoading: challengesLoading } = useChallenges();
  const { polls, isLoading: pollsLoading } = usePolls();

  return {
    recentPosts: posts.slice(0, 5),
    myGroups,
    activeChallenges,
    activePolls: polls.slice(0, 3),
    stats: {
      totalPosts: posts.length,
      totalGroups: groups.length,
      totalChallenges: challenges.length,
    },
    isLoading: postsLoading || groupsLoading || challengesLoading || pollsLoading,
    refreshPosts,
  };
}
