import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react-native';
import { Appointment } from '../../types/cura';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { Avatar, Badge } from '@/components/ui';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onCancel?: (appointmentId: string) => void;
  onJoinCall?: (appointmentId: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function AppointmentCard({
  appointment,
  onEdit,
  onCancel,
  onJoinCall,
}: AppointmentCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    setIsPressed(true);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    setIsPressed(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'upcoming':
        return {
          color: COLORS.success,
          bgColor: COLORS.successMuted,
          icon: CheckCircle,
          label: 'Upcoming',
        };
      case 'completed':
        return {
          color: COLORS.primary,
          bgColor: COLORS.primaryMuted,
          icon: CheckCircle,
          label: 'Completed',
        };
      case 'cancelled':
        return {
          color: COLORS.error,
          bgColor: COLORS.errorMuted,
          icon: X,
          label: 'Cancelled',
        };
      default:
        return {
          color: COLORS.textMuted,
          bgColor: COLORS.surfaceMuted,
          icon: AlertCircle,
          label: status,
        };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'consultation':
        return { emoji: '🩺', label: 'Consultation' };
      case 'follow-up':
        return { emoji: '🔄', label: 'Follow-up' };
      case 'checkup':
        return { emoji: '✅', label: 'Checkup' };
      case 'emergency':
        return { emoji: '🚨', label: 'Emergency' };
      default:
        return { emoji: '📅', label: type };
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const statusConfig = getStatusConfig(appointment.status);
  const typeConfig = getTypeConfig(appointment.type);
  const StatusIcon = statusConfig.icon;

  const handleAction = (action: () => void, haptic: 'light' | 'medium' | 'heavy' = 'light') => {
    const hapticStyle = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    Haptics.impactAsync(hapticStyle[haptic]);
    action();
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeInfo}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{typeConfig.emoji}</Text>
          </View>
          <View>
            <Text style={styles.typeLabel}>{typeConfig.label}</Text>
            <Badge
              label={statusConfig.label}
              variant={appointment.status === 'upcoming' ? 'success' : appointment.status === 'completed' ? 'primary' : 'error'}
              size="sm"
            />
          </View>
        </View>

        {appointment.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => handleAction(() => onCancel?.(appointment.id), 'medium')}
          >
            <MoreVertical size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Doctor Info */}
      <View style={styles.doctorSection}>
        <Avatar
          source={{ uri: appointment.doctorAvatar }}
          name={appointment.doctorName}
          size="md"
        />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{appointment.doctorName}</Text>
          <Text style={styles.specialty}>{appointment.specialty}</Text>
        </View>
      </View>

      {/* Appointment Details */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <View style={styles.detailIconBox}>
            <Calendar size={16} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(appointment.date)}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIconBox}>
            <Clock size={16} color={COLORS.success} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{appointment.time}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIconBox}>
            <MapPin size={16} color={COLORS.error} />
          </View>
          <View style={styles.detailTextWrap}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{appointment.location}</Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      {appointment.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>{appointment.notes}</Text>
        </View>
      )}

      {/* Actions */}
      {appointment.status === 'upcoming' && onJoinCall && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleAction(() => onJoinCall(appointment.id), 'medium')}
            activeOpacity={0.9}
          >
            <Video size={18} color={COLORS.textInverse} />
            <Text style={styles.joinButtonText}>Join Consultation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleAction(() => {}, 'light')}
            activeOpacity={0.8}
          >
            <Phone size={18} color={COLORS.primary} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[4],
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING[1],
    fontWeight: FONT_WEIGHTS.medium,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    paddingBottom: SPACING[4],
    marginBottom: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceMuted,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  specialty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[3],
    gap: SPACING[2],
    flex: 1,
    minWidth: '45%',
  },
  detailIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
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
  detailTextWrap: {
    flex: 1,
  },
  notesSection: {
    marginTop: SPACING[4],
    padding: SPACING[3],
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
  },
  notesLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[4],
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    gap: SPACING[2],
    ...SHADOWS.sm,
  },
  joinButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
});
