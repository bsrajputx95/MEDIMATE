import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Heart,
  GraduationCap,
  BadgeCheck,
  Clock,
  MessageCircleQuestion,
} from 'lucide-react-native';
import { ExpertAnswer } from '../../types/community';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { Avatar, Badge } from '@/components/ui';

interface ExpertAnswerCardProps {
  expertAnswer: ExpertAnswer;
  onLike: (answerId: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function ExpertAnswerCard({ expertAnswer, onLike }: ExpertAnswerCardProps) {
  const [isLiked, setIsLiked] = useState(expertAnswer.isLiked);
  const [likeCount, setLikeCount] = useState(expertAnswer.likes);

  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    heartScale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    Haptics.impactAsync(
      newLiked ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    onLike(expertAnswer.id);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, animatedStyle]}
      activeOpacity={0.95}
      onPressIn={() => {
        scale.value = withSpring(0.99, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
    >
      {/* Verified Expert Badge */}
      <View style={styles.verifiedBadge}>
        <BadgeCheck size={14} color={COLORS.textInverse} />
        <Text style={styles.verifiedText}>Verified Expert Answer</Text>
      </View>

      {/* Question */}
      <View style={styles.questionSection}>
        <View style={styles.questionHeader}>
          <MessageCircleQuestion size={16} color={COLORS.primary} />
          <Text style={styles.questionLabel}>Question</Text>
        </View>
        <Text style={styles.questionText}>{expertAnswer.question}</Text>
      </View>

      {/* Expert Info */}
      <View style={styles.expertSection}>
        <View style={styles.expertInfo}>
          <Avatar
            name={expertAnswer.expertName}
            size="md"
          />
          <View style={styles.expertDetails}>
            <View style={styles.expertNameRow}>
              <Text style={styles.expertName}>{expertAnswer.expertName}</Text>
              <BadgeCheck size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.expertTitle}>{expertAnswer.expertTitle}</Text>
          </View>
        </View>

        <View style={styles.timestampRow}>
          <Clock size={12} color={COLORS.textMuted} />
          <Text style={styles.timestamp}>{formatTimeAgo(expertAnswer.timestamp)}</Text>
        </View>
      </View>

      {/* Answer */}
      <View style={styles.answerSection}>
        <Text style={styles.answerText}>{expertAnswer.answer}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Animated.View style={heartAnimatedStyle}>
            <Heart
              size={20}
              color={isLiked ? COLORS.error : COLORS.textMuted}
              fill={isLiked ? COLORS.error : 'transparent'}
            />
          </Animated.View>
          <Text style={[styles.likeText, isLiked && styles.likedText]}>
            {likeCount} helpful
          </Text>
        </TouchableOpacity>
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING[5],
    marginBottom: SPACING[4],
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    alignSelf: 'flex-start',
    gap: SPACING[1],
    marginBottom: SPACING[4],
  },
  verifiedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  questionSection: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[4],
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[2],
  },
  questionLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 22,
  },
  expertSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[4],
  },
  expertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  expertDetails: {
    gap: SPACING[1],
  },
  expertNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
  },
  expertName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  expertTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  answerSection: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[4],
  },
  answerText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING[3],
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[3],
    borderRadius: RADIUS.lg,
    gap: SPACING[2],
  },
  likeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  likedText: {
    color: COLORS.error,
  },
});
