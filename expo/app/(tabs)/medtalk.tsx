import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  Search,
  TrendingUp,
  Trophy,
  Users,
  GraduationCap,
  Plus,
  Filter,
  BarChart3,
  MessageCircle,
  X,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import PostCard from '../../components/community/PostCard';
import GroupCard from '../../components/community/GroupCard';
import ChallengeCard from '../../components/community/ChallengeCard';
import ExpertAnswerCard from '../../components/community/ExpertAnswerCard';
import { useAssistant } from '../../contexts/AssistantContext';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { SectionHeader, Card, Badge } from '@/components/ui';
import { usePosts, useGroups, useChallenges, usePolls } from '@/hooks';
import { Post, Group, Challenge, Poll as PollType, ExpertAnswer } from '@/hooks';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SkeletonCard } from '@/components/ui/Skeleton';

const { width } = Dimensions.get('window');

// Mock data for features not yet fully implemented
const MOCK_EXPERT_ANSWERS: ExpertAnswer[] = [
  {
    id: '1',
    question: 'How much water should I drink daily?',
    answer: 'The general recommendation is about 8 glasses (2 liters) per day, but individual needs vary based on activity level, climate, and health conditions.',
    expert: {
      id: 'e1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Nutrition',
      credentials: ['MD', 'PhD Nutrition'],
    },
    likes: 45,
    isLiked: false,
    timestamp: new Date().toISOString(),
  },
];

const TRENDING_TOPICS = [
  { tag: '#MindfulEating', posts: 234 },
  { tag: '#10KStepsChallenge', posts: 189 },
  { tag: '#SleepBetter', posts: 156 },
  { tag: '#HydrationGoals', posts: 134 },
  { tag: '#MeditationDaily', posts: 98 },
];

const DAILY_INSPIRATION = [
  "Small steps every day lead to big changes over time.",
  "Your health is an investment, not an expense.",
  "Progress, not perfection.",
  "Take care of your body. It's the only place you have to live.",
  "Every healthy choice counts.",
];

type TabType = 'feed' | 'groups' | 'challenges' | 'experts' | 'trending';

export default function MedTalkScreen() {
  const { setCurrentScreen } = useAssistant();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expertAnswers] = useState<ExpertAnswer[]>(MOCK_EXPERT_ANSWERS);

  // API Data Hooks
  const {
    posts,
    isLoading: postsLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh: refreshPosts,
    createPost,
    likePost,
  } = usePosts();

  const {
    groups,
    myGroups,
    isLoading: groupsLoading,
    joinGroup,
  } = useGroups();

  const {
    challenges,
    activeChallenges,
    isLoading: challengesLoading,
    joinChallenge,
  } = useChallenges();

  const {
    polls,
    activePolls,
    votePoll,
  } = usePolls();

  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('medtalk');
    }, [setCurrentScreen])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshPosts();
    setRefreshing(false);
  }, [refreshPosts]);

  const handleLikePost = useCallback(async (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await likePost.mutate({ id: postId });
  }, [likePost]);
  
  const handleCommentPost = useCallback((postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Comments', 'Comments feature coming soon!');
  }, []);
  
  const handleSharePost = useCallback((postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Share', 'Share feature coming soon!');
  }, []);

  const handleJoinGroup = useCallback(async (groupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await joinGroup.mutate({ id: groupId });
  }, [joinGroup]);

  const handleJoinChallenge = useCallback(async (challengeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await joinChallenge.mutate({ id: challengeId });
  }, [joinChallenge]);

  const handleLikeExpertAnswer = useCallback((answerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Liked expert answer:', answerId);
  }, []);

  const handleVotePoll = useCallback(async (pollId: string, optionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await votePoll.mutate({ pollId, optionId });
  }, [votePoll]);

  const handleTabChange = useCallback((tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }, []);

  const handleCreatePost = useCallback(async () => {
    if (newPostContent.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await createPost.mutate({
        content: newPostContent,
        isAnonymous,
      });
      setNewPostContent('');
      setShowCreatePost(false);
      setIsAnonymous(false);
    }
  }, [newPostContent, isAnonymous, createPost]);

  const isLoading = postsLoading || groupsLoading || challengesLoading;

  // Filter posts by search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    return posts.filter(post => 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  // Filter challenges by search query
  const filteredChallenges = useMemo(() => {
    if (!searchQuery.trim()) return challenges;
    return challenges.filter(challenge => 
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [challenges, searchQuery]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <View style={styles.tabContent}>
            {/* Daily Inspiration */}
            <Animated.View entering={FadeInUp.springify()}>
              <Card variant="filled" padding="lg" style={styles.inspirationCard}>
                <View style={styles.inspirationHeader}>
                  <Sparkles size={20} color={COLORS.warning} />
                  <Text style={styles.inspirationLabel}>Daily Inspiration</Text>
                </View>
                <Text style={styles.inspirationText}>
                  {DAILY_INSPIRATION[Math.floor(Math.random() * DAILY_INSPIRATION.length)]}
                </Text>
              </Card>
            </Animated.View>

            {/* Loading State */}
            {isLoading && posts.length === 0 && (
              <View style={styles.skeletonContainer}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            )}

            {/* Posts */}
            {filteredPosts.map((post, index) => (
              <Animated.View 
                key={post.id} 
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <PostCard 
                  post={post} 
                  onLike={handleLikePost} 
                  onComment={handleCommentPost} 
                  onShare={handleSharePost} 
                />
              </Animated.View>
            ))}

            {/* Load More */}
            {hasMore && posts.length > 0 && (
              <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={() => loadMore()}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.loadMoreText}>Load More</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Empty State */}
            {!isLoading && filteredPosts.length === 0 && (
              <Card variant="outlined" padding="lg">
                <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
              </Card>
            )}
          </View>
        );
        
      case 'groups':
        return (
          <View style={styles.tabContent}>
            <Animated.View entering={FadeInUp.springify()}>
              <SectionHeader title="Topic-Based Groups" />
              <Text style={styles.sectionSubtitle}>Connect with others who share similar health goals and challenges</Text>
            </Animated.View>

            {isLoading && groups.length === 0 && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            )}

            {filteredGroups.map((group, index) => (
              <Animated.View 
                key={group.id} 
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <GroupCard group={group} onJoin={handleJoinGroup} />
              </Animated.View>
            ))}

            {!isLoading && filteredGroups.length === 0 && (
              <Card variant="outlined" padding="lg">
                <Text style={styles.emptyText}>No groups found</Text>
              </Card>
            )}
          </View>
        );
        
      case 'challenges':
        return (
          <View style={styles.tabContent}>
            <Animated.View entering={FadeInUp.springify()}>
              <SectionHeader title="Group Challenges" />
              <Text style={styles.sectionSubtitle}>Join fun challenges and achieve your wellness goals together</Text>
            </Animated.View>

            {isLoading && challenges.length === 0 && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            )}

            {filteredChallenges.map((challenge, index) => (
              <Animated.View 
                key={challenge.id} 
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <ChallengeCard challenge={challenge} onJoin={handleJoinChallenge} />
              </Animated.View>
            ))}

            {!isLoading && filteredChallenges.length === 0 && (
              <Card variant="outlined" padding="lg">
                <Text style={styles.emptyText}>No challenges found</Text>
              </Card>
            )}
          </View>
        );
        
      case 'experts':
        return (
          <View style={styles.tabContent}>
            <Animated.View entering={FadeInUp.springify()}>
              <SectionHeader title="Ask the Expert" />
              <Text style={styles.sectionSubtitle}>Get answers from certified health professionals</Text>
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <Card 
                variant="outlined" 
                padding="lg" 
                style={styles.askQuestionCard}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={styles.askQuestionContent}>
                  <MessageCircle size={24} color={COLORS.primary} />
                  <View style={styles.askQuestionText}>
                    <Text style={styles.askQuestionTitle}>Ask a Question</Text>
                    <Text style={styles.askQuestionSubtitle}>Get expert advice</Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
            
            {expertAnswers.map((answer, index) => (
              <Animated.View 
                key={answer.id} 
                entering={FadeInDown.delay(150 + index * 50).springify()}
              >
                <ExpertAnswerCard expertAnswer={answer} onLike={handleLikeExpertAnswer} />
              </Animated.View>
            ))}
          </View>
        );
        
      case 'trending':
        return (
          <View style={styles.tabContent}>
            <Animated.View entering={FadeInUp.springify()}>
              <SectionHeader title="Trending Topics" />
              <Text style={styles.sectionSubtitle}>Discover what the community is talking about</Text>
            </Animated.View>
            
            {/* Trending Topics */}
            <View style={styles.trendingContainer}>
              {TRENDING_TOPICS.map((topic, index) => (
                <Animated.View 
                  key={topic.tag} 
                  entering={FadeInDown.delay(index * 50).springify()}
                >
                  <Card 
                    variant="elevated" 
                    padding="md" 
                    style={styles.trendingItem}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <View style={styles.trendingRank}>
                      <Text style={styles.trendingRankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.trendingInfo}>
                      <Text style={styles.trendingTag}>{topic.tag}</Text>
                      <Text style={styles.trendingCount}>{topic.posts} posts</Text>
                    </View>
                    <TrendingUp size={16} color={COLORS.success} />
                  </Card>
                </Animated.View>
              ))}
            </View>

            {/* Community Polls */}
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <SectionHeader title="Community Polls" />
            </Animated.View>
            
            {activePolls.map((poll, pollIndex) => (
              <Animated.View 
                key={poll.id} 
                entering={FadeInDown.delay(350 + pollIndex * 50).springify()}
              >
                <Card variant="elevated" padding="lg" style={styles.pollCard}>
                  <Text style={styles.pollQuestion}>{poll.question}</Text>
                  {poll.options.map((option) => {
                    const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                    const isSelected = poll.userVote === option.id;
                    return (
                      <TouchableOpacity 
                        key={option.id} 
                        style={styles.pollOption}
                        onPress={() => handleVotePoll(poll.id, option.id)}
                      >
                        <View style={styles.pollOptionContent}>
                          <Text style={[styles.pollOptionText, isSelected && styles.selectedOptionText]}>
                            {option.text}
                          </Text>
                          <Text style={styles.pollPercentage}>{Math.round(percentage)}%</Text>
                        </View>
                        <View style={styles.pollBar}>
                          <View 
                            style={[
                              styles.pollBarFill, 
                              { width: `${percentage}%` }, 
                              isSelected && styles.selectedBar
                            ]} 
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  <Text style={styles.pollVotes}>{poll.totalVotes} votes</Text>
                </Card>
              </Animated.View>
            ))}
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + SPACING[3] }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSubtitle}>Connect, Share, Grow</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton} 
              accessibilityLabel="Filter"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Filter size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowCreatePost(true);
              }} 
              accessibilityLabel="Create post"
            >
              <Plus size={20} color={COLORS.textInverse} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View entering={FadeIn.delay(100).springify()} style={styles.searchContainer}>
        <Search size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search topics, groups, or challenges..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textMuted}
        />
      </Animated.View>

      {/* Tab Bar */}
      <Animated.View entering={FadeIn.delay(150).springify()} style={styles.tabBar}>
        {[
          { key: 'feed' as TabType, label: 'Feed', Icon: MessageCircle },
          { key: 'groups' as TabType, label: 'Groups', Icon: Users },
          { key: 'challenges' as TabType, label: 'Challenges', Icon: Trophy },
          { key: 'experts' as TabType, label: 'Experts', Icon: GraduationCap },
          { key: 'trending' as TabType, label: 'Trending', Icon: BarChart3 },
        ].map(({ key, label, Icon }) => (
          <TouchableOpacity 
            key={key} 
            style={[styles.tab, activeTab === key && styles.activeTab]} 
            onPress={() => handleTabChange(key)}
          >
            <Icon size={16} color={activeTab === key ? COLORS.textInverse : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        } 
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal visible={showCreatePost} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowCreatePost(false)} 
              accessibilityLabel="Close"
            >
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity 
              onPress={handleCreatePost} 
              disabled={!newPostContent.trim() || createPost.isLoading}
            >
              <Text style={[styles.postButton, (!newPostContent.trim() || createPost.isLoading) && styles.disabledButton]}>
                {createPost.isLoading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.postInput}
              placeholder="Share your thoughts, progress, or ask for support..."
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              textAlignVertical="top"
              placeholderTextColor={COLORS.textMuted}
            />
            <TouchableOpacity 
              style={styles.anonymousToggle} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsAnonymous(!isAnonymous);
              }}
            >
              <View style={[styles.checkbox, isAnonymous && styles.checkedBox]}>
                {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.anonymousText}>Post anonymously</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingBottom: SPACING[4],
    paddingHorizontal: SPACING[5],
    ...SHADOWS.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: SPACING[1],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING[5],
    marginVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  searchIcon: {
    marginRight: SPACING[3],
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    marginHorizontal: SPACING[5],
    borderRadius: RADIUS.lg,
    marginBottom: SPACING[3],
    ...SHADOWS.sm,
    gap: SPACING[1],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[2],
    borderRadius: RADIUS.md,
    gap: SPACING[1],
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  activeTabText: {
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[8],
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonContainer: {
    gap: SPACING[3],
  },
  loadMoreButton: {
    paddingVertical: SPACING[4],
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING[4],
    lineHeight: 20,
  },
  inspirationCard: {
    backgroundColor: COLORS.warningMuted,
    borderWidth: 1,
    borderColor: COLORS.warning,
    marginBottom: SPACING[4],
  },
  inspirationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[2],
  },
  inspirationLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#92400E',
  },
  inspirationText: {
    fontSize: FONT_SIZES.base,
    color: '#92400E',
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 22,
  },
  askQuestionCard: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: SPACING[4],
  },
  askQuestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
  },
  askQuestionText: {
    flex: 1,
  },
  askQuestionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  askQuestionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  trendingContainer: {
    marginBottom: SPACING[6],
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  trendingRank: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[3],
  },
  trendingRankText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textSecondary,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingTag: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  trendingCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  pollCard: {
    marginBottom: SPACING[4],
  },
  pollQuestion: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[4],
  },
  pollOption: {
    marginBottom: SPACING[3],
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[1],
  },
  pollOptionText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  pollPercentage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  pollBar: {
    height: 6,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  pollBarFill: {
    height: '100%',
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
  },
  selectedBar: {
    backgroundColor: COLORS.primary,
  },
  pollVotes: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING[2],
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  postButton: {
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  disabledButton: {
    color: COLORS.textMuted,
  },
  modalContent: {
    flex: 1,
    padding: SPACING[5],
  },
  postInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    paddingTop: SPACING[2],
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[3],
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  anonymousText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
  },
});
