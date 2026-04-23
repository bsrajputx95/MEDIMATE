import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react-native';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalTaken: number;
  totalMissed: number;
  lastTakenDate: string | null;
  adherenceRate: number;
}

interface MedicationStreakTrackerProps {
  streakData: StreakData;
  compact?: boolean;
}

export const MedicationStreakTracker: React.FC<MedicationStreakTrackerProps> = ({
  streakData,
  compact = false,
}) => {
  const getStreakMessage = () => {
    if (streakData.currentStreak === 0) {
      return "Start your streak today!";
    } else if (streakData.currentStreak < 7) {
      return "Great start! Keep going!";
    } else if (streakData.currentStreak < 30) {
      return "Amazing consistency!";
    } else if (streakData.currentStreak < 100) {
      return "You're on fire! 🔥";
    } else {
      return "Legendary dedication! 🏆";
    }
  };

  const getStreakColor = () => {
    if (streakData.currentStreak === 0) return COLORS.textMuted;
    if (streakData.currentStreak < 7) return COLORS.primary;
    if (streakData.currentStreak < 30) return COLORS.warning;
    return COLORS.error; // Fire color for high streaks
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Flame size={20} color={getStreakColor()} />
        <Text style={[styles.compactStreak, { color: getStreakColor() }]}>
          {streakData.currentStreak} day{streakData.currentStreak !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Current Streak */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Flame size={28} color={getStreakColor()} />
          <Text style={styles.streakTitle}>Current Streak</Text>
        </View>
        <Text style={[styles.streakNumber, { color: getStreakColor() }]}>
          {streakData.currentStreak}
        </Text>
        <Text style={styles.streakLabel}>days</Text>
        <Text style={styles.streakMessage}>{getStreakMessage()}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Trophy size={20} color={COLORS.warning} />
          <Text style={styles.statValue}>{streakData.longestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>

        <View style={styles.statCard}>
          <TrendingUp size={20} color={COLORS.success} />
          <Text style={styles.statValue}>{streakData.adherenceRate}%</Text>
          <Text style={styles.statLabel}>Adherence</Text>
        </View>

        <View style={styles.statCard}>
          <Calendar size={20} color={COLORS.primary} />
          <Text style={styles.statValue}>{streakData.totalTaken}</Text>
          <Text style={styles.statLabel}>Total Taken</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Monthly Progress</Text>
          <Text style={styles.progressValue}>
            {streakData.totalTaken}/{streakData.totalTaken + streakData.totalMissed}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${streakData.adherenceRate}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressHint}>
          {streakData.adherenceRate >= 90 
            ? "Excellent adherence! 🎉" 
            : streakData.adherenceRate >= 70 
              ? "Good progress! Keep it up!"
              : "Try to improve your consistency"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.lg,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  compactStreak: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  streakCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    alignItems: 'center',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  streakTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  streakNumber: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.bold,
  },
  streakLabel: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  streakMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  statValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  progressSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  progressValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.full,
  },
  progressHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default MedicationStreakTracker;
