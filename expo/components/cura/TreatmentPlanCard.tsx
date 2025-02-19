import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Target,
  Calendar,
  User,
  CheckCircle,
  Circle,
  TrendingUp,
  ChevronRight,
  Clock,
} from 'lucide-react-native';
import { TreatmentPlan } from '../../types/cura';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { ProgressBar, Badge } from '@/components/ui';

interface TreatmentPlanCardProps {
  plan: TreatmentPlan;
  onViewDetails?: (planId: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function TreatmentPlanCard({ plan, onViewDetails }: TreatmentPlanCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const completedMilestones = plan.milestones.filter(m => m.completed).length;
  const totalMilestones = plan.milestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const getProgressConfig = (progress: number) => {
    if (progress >= 80) return { color: COLORS.success, variant: 'success' as const };
    if (progress >= 50) return { color: COLORS.warning, variant: 'warning' as const };
    return { color: COLORS.primary, variant: 'primary' as const };
  };

  const progressConfig = getProgressConfig(progressPercentage);
  const nextMilestone = plan.milestones.find(m => !m.completed);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onViewDetails?.(plan.id);
  };

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
      onPress={onViewDetails ? handlePress : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.planInfo}>
          <View style={styles.targetIconBox}>
            <Target size={24} color={COLORS.textInverse} />
          </View>
          <View style={styles.planDetails}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planDescription} numberOfLines={2}>
              {plan.description}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <View style={styles.progressStats}>
            <TrendingUp size={14} color={progressConfig.color} />
            <Text style={[styles.progressValue, { color: progressConfig.color }]}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
        </View>

        <ProgressBar
          progress={progressPercentage}
          variant={progressConfig.variant}
          size="md"
        />

        <Text style={styles.milestonesCount}>
          {completedMilestones} of {totalMilestones} milestones completed
        </Text>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailCard}>
          <User size={16} color={COLORS.primary} />
          <View>
            <Text style={styles.detailLabel}>Prescribed by</Text>
            <Text style={styles.detailValue}>{plan.prescribedBy}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Calendar size={16} color={COLORS.success} />
          <View>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>
              {formatDate(plan.startDate)} - {plan.endDate ? formatDate(plan.endDate) : 'Ongoing'}
            </Text>
          </View>
        </View>
      </View>

      {/* Next Milestone */}
      {nextMilestone && (
        <View style={styles.nextMilestoneCard}>
          <View style={styles.nextMilestoneHeader}>
            <View style={styles.nextMilestoneIconBox}>
              <Clock size={16} color={COLORS.warning} />
            </View>
            <Text style={styles.nextMilestoneLabel}>Next Milestone</Text>
          </View>
          <Text style={styles.nextMilestoneTitle}>{nextMilestone.title}</Text>
          <Text style={styles.nextMilestoneDue}>Due: {formatDate(nextMilestone.dueDate)}</Text>
        </View>
      )}

      {/* Milestones Preview */}
      <View style={styles.milestonesSection}>
        <Text style={styles.milestonesLabel}>Recent Milestones</Text>
        <View style={styles.milestonesList}>
          {plan.milestones.slice(0, 3).map((milestone) => (
            <View key={milestone.id} style={styles.milestoneItem}>
              {milestone.completed ? (
                <View style={styles.milestoneCheckCompleted}>
                  <CheckCircle size={16} color={COLORS.success} />
                </View>
              ) : (
                <Circle size={16} color={COLORS.border} />
              )}
              <Text
                style={[
                  styles.milestoneText,
                  milestone.completed && styles.milestoneTextCompleted,
                ]}
                numberOfLines={1}
              >
                {milestone.title}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* View Details Button */}
      {onViewDetails && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.detailsButton} onPress={handlePress} activeOpacity={0.8}>
            <Text style={styles.detailsButtonText}>View Full Plan</Text>
            <ChevronRight size={18} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
      )}
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    marginBottom: SPACING[4],
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  header: {
    marginBottom: SPACING[4],
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[3],
  },
  targetIconBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  planDetails: {
    flex: 1,
  },
  planTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  planDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
  },
  progressValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  milestonesCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING[2],
    fontWeight: FONT_WEIGHTS.medium,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  detailCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    gap: SPACING[2],
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  nextMilestoneCard: {
    backgroundColor: COLORS.warningMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  nextMilestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[1],
  },
  nextMilestoneIconBox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextMilestoneLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#92400E',
    fontWeight: FONT_WEIGHTS.semibold,
  },
  nextMilestoneTitle: {
    fontSize: FONT_SIZES.base,
    color: '#92400E',
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING[1],
  },
  nextMilestoneDue: {
    fontSize: FONT_SIZES.xs,
    color: '#92400E',
    fontWeight: FONT_WEIGHTS.medium,
  },
  milestonesSection: {
    marginBottom: SPACING[4],
  },
  milestonesLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING[2],
  },
  milestonesList: {
    gap: SPACING[2],
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  milestoneCheckCompleted: {
    // Just a wrapper for styling
  },
  milestoneText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
    flex: 1,
  },
  milestoneTextCompleted: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
  footer: {
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    gap: SPACING[2],
    ...SHADOWS.sm,
  },
  detailsButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
