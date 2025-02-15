import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  Award,
} from 'lucide-react-native';
import { Post } from '../../types/community';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { Avatar, Badge } from '@/components/ui';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(false);

  const likeScale = useSharedValue(1);
  const cardScale = useSharedValue(1);

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    // Animate heart
    likeScale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    Haptics.impactAsync(
      newLiked ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    onLike(post.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleMoreOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Post Options',
      'Choose an action',
      [
        { text: 'Report Post', style: 'destructive' },
        { text: 'Hide Post' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, cardAnimatedStyle]}
      activeOpacity={0.95}
      onPressIn={() => {
        cardScale.value = withSpring(0.99, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        cardScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar
            name={post.user.isAnonymous ? '?' : post.user.name}
            size="md"
          />
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>
                {post.user.isAnonymous ? 'Anonymous' : post.user.name}
              </Text>
              {post.user.badges.length > 0 && (
                <View style={styles.badgeContainer}>
                  <Award size={14} color={COLORS.warning} />
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>{formatTimeAgo(post.timestamp)}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
            <Bookmark
              size={18}
              color={isSaved ? COLORS.primary : COLORS.textMuted}
              fill={isSaved ? COLORS.primary : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleMoreOptions}>
            <MoreHorizontal size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Animated.View style={likeAnimatedStyle}>
            <Heart
              size={20}
              color={isLiked ? COLORS.error : COLORS.textMuted}
              fill={isLiked ? COLORS.error : 'transparent'}
            />
          </Animated.View>
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onComment(post.id);
          }}
        >
          <MessageCircle size={20} color={COLORS.textMuted} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onShare(post.id);
          }}
        >
          <Share2 size={20} color={COLORS.textMuted} />
          <Text style={styles.actionText}>{post.shares}</Text>
        </TouchableOpacity>
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING[5],
    marginBottom: SPACING[3],
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[4],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    flex: 1,
    marginLeft: SPACING[3],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
  },
  userName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  badgeContainer: {
    marginLeft: SPACING[1],
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING[1],
    fontWeight: FONT_WEIGHTS.medium,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING[1],
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    fontSize: FONT_SIZES.base,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginBottom: SPACING[4],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
    marginBottom: SPACING[4],
  },
  tag: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
    gap: SPACING[2],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[3],
    borderRadius: RADIUS.lg,
    gap: SPACING[2],
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  likedText: {
    color: COLORS.error,
  },
});
