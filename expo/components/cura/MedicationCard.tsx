import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Pill,
  Clock,
  User,
  CheckCircle,
  Circle,
  Bell,
  AlertTriangle,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';
import { Medication } from '../../types/cura';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { Badge, ProgressBar } from '@/components/ui';

interface MedicationCardProps {
  medication: Medication;
  onToggleTaken?: (medicationId: string, taken: boolean) => void;
  onSetReminder?: (medicationId: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function MedicationCard({
  medication,
  onToggleTaken,
  onSetReminder,
}: MedicationCardProps) {
  const [localTaken, setLocalTaken] = useState(medication.taken);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggleTaken = () => {
    const newTaken = !localTaken;
    setLocalTaken(newTaken);
    Haptics.impactAsync(
      newTaken ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    onToggleTaken?.(medication.id, newTaken);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getNextReminderTime = () => {
    if (medication.reminderTimes.length === 0) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const time of medication.reminderTimes) {
      const [hours, minutes] = time.split(':').map(Number);
      const reminderTime = hours * 60 + minutes;

      if (reminderTime > currentTime) {
        return time;
      }
    }

    return medication.reminderTimes[0];
  };

  const nextReminder = getNextReminderTime();

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
        <View style={styles.medInfo}>
          <View style={styles.pillIconContainer}>
            <Pill size={24} color={COLORS.textInverse} />
          </View>
          <View style={styles.medDetails}>
            <Text style={styles.medName}>{medication.name}</Text>
            <View style={styles.dosageRow}>
              <Text style={styles.dosageText}>{medication.dosage}</Text>
              <View style={styles.dot} />
              <Text style={styles.frequencyText}>{medication.frequency}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkButton, localTaken && styles.checkButtonActive]}
          onPress={handleToggleTaken}
          activeOpacity={0.8}
        >
          {localTaken ? (
            <CheckCircle size={28} color={COLORS.success} />
          ) : (
            <Circle size={28} color={COLORS.border} />
          )}
        </TouchableOpacity>
      </View>

      {/* Status Badge */}
      <View style={styles.statusRow}>
        <Badge
          label={localTaken ? 'Taken today' : 'Not taken'}
          variant={localTaken ? 'success' : 'warning'}
          size="sm"
        />
        {medication.endDate && (
          <Text style={styles.endDate}>Until {formatDate(medication.endDate)}</Text>
        )}
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailCard}>
          <User size={16} color={COLORS.primary} />
          <View>
            <Text style={styles.detailLabel}>Prescribed by</Text>
            <Text style={styles.detailValue}>{medication.prescribedBy}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Calendar size={16} color={COLORS.success} />
          <View>
            <Text style={styles.detailLabel}>Started</Text>
            <Text style={styles.detailValue}>{formatDate(medication.startDate)}</Text>
          </View>
        </View>
      </View>

      {/* Next Reminder */}
      {nextReminder && (
        <View style={styles.reminderCard}>
          <View style={styles.reminderLeft}>
            <View style={styles.reminderIconBox}>
              <Bell size={18} color={COLORS.warning} />
            </View>
            <View>
              <Text style={styles.reminderLabel}>Next reminder</Text>
              <Text style={styles.reminderTime}>{nextReminder}</Text>
            </View>
          </View>
          {onSetReminder && (
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSetReminder(medication.id);
              }}
            >
              <Text style={styles.adjustText}>Adjust</Text>
              <ChevronRight size={14} color={COLORS.warning} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsLabel}>Instructions</Text>
        <Text style={styles.instructionsText}>{medication.instructions}</Text>
      </View>

      {/* Side Effects Warning */}
      {medication.sideEffects && medication.sideEffects.length > 0 && (
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <AlertTriangle size={16} color={COLORS.error} />
            <Text style={styles.warningLabel}>Possible Side Effects</Text>
          </View>
          <Text style={styles.warningText}>
            {medication.sideEffects.join(' • ')}
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  medInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING[3],
  },
  pillIconContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  medDetails: {
    flex: 1,
  },
  medName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  dosageText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textMuted,
  },
  frequencyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  checkButton: {
    padding: SPACING[1],
  },
  checkButtonActive: {
    // Animation handled by icon
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[4],
  },
  endDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
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
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.warningMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  reminderIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#92400E',
    fontWeight: FONT_WEIGHTS.medium,
  },
  reminderTime: {
    fontSize: FONT_SIZES.lg,
    color: '#92400E',
    fontWeight: FONT_WEIGHTS.bold,
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
  },
  adjustText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  instructionsCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    marginBottom: SPACING[4],
  },
  instructionsLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instructionsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: COLORS.errorMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[1],
  },
  warningLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  warningText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    lineHeight: 16,
  },
});
