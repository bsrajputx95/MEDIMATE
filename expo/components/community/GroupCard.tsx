import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Users, Plus, Check, Lock, Globe } from 'lucide-react-native';
import { Group } from '../../types/community';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { Badge } from '@/components/ui';

interface GroupCardProps {
  group: Group;
  onJoin: (groupId: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function GroupCard({ group, onJoin }: GroupCardProps) {
  const [isJoined, setIsJoined] = useState(group.isJoined);
  const [memberCount, setMemberCount] = useState(group.memberCount);

  const scale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleJoin = () => {
    const newJoined = !isJoined;
    setIsJoined(newJoined);
    setMemberCount(prev => isJoined ? prev - 1 : prev + 1);

    buttonScale.value = withSpring(newJoined ? 0.95 : 1, { damping: 15, stiffness: 300 });

    Haptics.impactAsync(
      newJoined ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    onJoin(group.id);
  };

  const getCategoryConfig = (category: string) => {
    const configs: Record<string, { color: string; variant: 'error' | 'primary' | 'success' | 'warning' }> = {
      'health-condition': { color: COLORS.error, variant: 'error' },
      'mental-wellness': { color: COLORS.primary, variant: 'primary' },
      'fitness': { color: COLORS.success, variant: 'success' },
      'lifestyle': { color: COLORS.warning, variant: 'warning' },
    };
    return configs[category] || { color: COLORS.textSecondary, variant: 'primary' };
  };

  const categoryConfig = getCategoryConfig(group.category);

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
          <View style={[styles.categoryIndicator, { backgroundColor: categoryConfig.color }]} />
          <View style={styles.titleContent}>
            <Text style={styles.groupName}>{group.name}</Text>
            <View style={styles.privacyRow}>
              {group.isPrivate ? (
                <Lock size={12} color={COLORS.textMuted} />
              ) : (
                <Globe size={12} color={COLORS.textMuted} />
              )}
              <Text style={styles.privacyText}>
                {group.isPrivate ? 'Private group' : 'Public group'}
              </Text>
            </View>
          </View>
        </View>

        <Badge
          label={group.category.replace('-', ' ')}
          variant={categoryConfig.variant}
          size="sm"
        />
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {group.description}
      </Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIconBox}>
            <Users size={16} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>{memberCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>members</Text>
          </View>
        </View>

        {group.postCount && (
          <View style={styles.statItem}>
            <View style={[styles.statIconBox, { backgroundColor: COLORS.successMuted }]}>
              <Globe size={16} color={COLORS.success} />
            </View>
            <View>
              <Text style={styles.statValue}>{group.postCount}</Text>
              <Text style={styles.statLabel}>posts</Text>
            </View>
          </View>
        )}
      </View>

      {/* Join Button */}
      <AnimatedTouchableOpacity
        style={[
          styles.joinButton,
          isJoined && styles.joinedButton,
          buttonAnimatedStyle,
        ]}
        onPress={handleJoin}
        activeOpacity={0.9}
      >
        {isJoined ? (
          <>
            <Check size={18} color={COLORS.textInverse} />
            <Text style={styles.joinedButtonText}>Joined</Text>
          </>
        ) : (
          <>
            <Plus size={18} color={COLORS.primary} />
            <Text style={styles.joinButtonText}>Join Group</Text>
          </>
        )}
      </AnimatedTouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[3],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: SPACING[3],
  },
  categoryIndicator: {
    width: 4,
    height: 40,
    borderRadius: RADIUS.full,
    marginTop: SPACING[1],
  },
  titleContent: {
    flex: 1,
  },
  groupName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
  },
  privacyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING[4],
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING[4],
    marginBottom: SPACING[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.base,
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
    fontSize: FONT_SIZES.sm,
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
