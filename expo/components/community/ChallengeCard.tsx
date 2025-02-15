import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Trophy,
  Users,
  Clock,
  Target,
  Flame,
  Zap,
} from 'lucide-react-native';
import { Challenge } from '../../types/community';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { ProgressBar, Badge } from '@/components/ui';

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin: (challengeId: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function ChallengeCard({ challenge, onJoin }: ChallengeCardProps) {
  const [isJoined, setIsJoined] = useState(challenge.isJoined);
  const [participants, setParticipants] = useState(challenge.participants);

  const scale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleJoin = () => {
    const newJoined = !isJoined;
    setIsJoined(newJoined);
    setParticipants(prev => isJoined ? prev - 1 : prev + 1);

    buttonScale.value = withSpring(newJoined ? 0.95 : 1, { damping: 15, stiffness: 300 });

    Haptics.impactAsync(
      newJoined ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    onJoin(challenge.id);
  };

  const getCategoryConfig = (category: string) => {
    const configs: Record<string, { color: string; icon: React.ElementType; variant: 'warning' | 'success' | 'primary' }> = {
      'nutrition': { color: COLORS.warning, icon: Flame, variant: 'warning' },
      'fitness': { color: COLORS.success, icon: Zap, variant: 'success' },
      'wellness': { color: COLORS.primary, icon: Target, variant: 'primary' },
      'mental-wellness': { color: COLORS.primary, icon: Target, variant: 'primary' },
    };
    return configs[category] || { color: COLORS.textSecondary, icon: Target, variant: 'primary' };
  };

  const categoryConfig = getCategoryConfig(challenge.category);
  const CategoryIcon = categoryConfig.icon;

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, animatedStyle]}
      activeOpacity={0.95}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.trophyBox, { backgroundColor: `${categoryConfig.color}15` }]}>
            <Trophy size={24} color={categoryConfig.color} />
          </View>
          <View style={styles.titleContent}>
            <Text style={styles.title}>{challenge.title}</Text>
            <Badge
              label={challenge.category.replace('-', ' ')}
              variant={categoryConfig.variant}
              size="sm"
            />
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>

      {/* Progress (if joined) */}
      {challenge.progress !== undefined && isJoined && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Your Progress</Text>
            <Text style={[styles.progressValue, { color: categoryConfig.color }]}>
              {challenge.progress}%
            </Text>
          </View>
          <ProgressBar
            progress={challenge.progress}
            variant={categoryConfig.variant}
            size="md"
          />
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Clock size={16} color={COLORS.primary} />
          <View>
            <Text style={styles.statValue}>{challenge.duration}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Users size={16} color={COLORS.success} />
          <View>
            <Text style={styles.statValue}>{participants.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <CategoryIcon size={16} color={categoryConfig.color} />
          <View>
            <Text style={styles.statValue}>{challenge.points || 100}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
      </View>

      {/* Join Button */}
      <TouchableOpacity
        style={[styles.joinButton, isJoined && styles.joinedButton]}
        onPress={handleJoin}
        activeOpacity={0.9}
      >
        <Target size={18} color={isJoined ? COLORS.textInverse : COLORS.primary} />
        <Text style={[styles.joinButtonText, isJoined && styles.joinedButtonText]}>
          {isJoined ? 'Joined Challenge' : 'Join Challenge'}
        </Text>
      </TouchableOpacity>
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
  },
  header: {
    marginBottom: SPACING[3],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[3],
  },
  trophyBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContent: {
    flex: 1,
    gap: SPACING[2],
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING[4],
  },
  progressSection: {
    marginBottom: SPACING[4],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  progressValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    gap: SPACING[2],
  },
  statValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    gap: SPACING[2],
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  joinedButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  joinButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  joinedButtonText: {
    color: COLORS.textInverse,
  },
});
