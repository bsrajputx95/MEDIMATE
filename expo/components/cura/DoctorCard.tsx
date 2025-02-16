import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Award,
  Globe,
} from 'lucide-react-native';
import { Doctor } from '../../types/cura';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { Avatar, Badge, Button } from '@/components/ui';

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment?: (doctorId: string) => void;
  onViewProfile?: (doctorId: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function DoctorCard({ doctor, onBookAppointment, onViewProfile }: DoctorCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      const isFilled = i < fullStars;
      stars.push(
        <Star
          key={i}
          size={14}
          color={isFilled ? COLORS.warning : COLORS.border}
          fill={isFilled ? COLORS.warning : 'transparent'}
        />
      );
    }

    return stars;
  };

  const getAvailabilityConfig = (availability: string) => {
    if (availability.toLowerCase().includes('today')) {
      return { color: COLORS.success, variant: 'success' as const };
    }
    if (availability.toLowerCase().includes('tomorrow')) {
      return { color: COLORS.warning, variant: 'warning' as const };
    }
    return { color: COLORS.primary, variant: 'primary' as const };
  };

  const availabilityConfig = getAvailabilityConfig(doctor.availability);

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action();
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
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          source={{ uri: doctor.avatar }}
          name={doctor.name}
          size="lg"
        />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              {renderStars(doctor.rating)}
            </View>
            <Text style={styles.ratingValue}>{doctor.rating}</Text>
            <Text style={styles.ratingCount}>({doctor.experience})</Text>
          </View>
        </View>
      </View>

      {/* Availability Badge */}
      <View style={styles.availabilityRow}>
        <Badge
          label={doctor.availability}
          variant={availabilityConfig.variant}
          size="md"
        />
        <View style={styles.consultationFee}>
          <DollarSign size={14} color={COLORS.success} />
          <Text style={styles.feeText}>${doctor.consultationFee}</Text>
          <Text style={styles.feeLabel}>/ session</Text>
        </View>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <View style={styles.detailIconBox}>
            <MapPin size={16} color={COLORS.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{doctor.location}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIconBox}>
            <Award size={16} color={COLORS.success} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Experience</Text>
            <Text style={styles.detailValue}>{doctor.experience}</Text>
          </View>
        </View>
      </View>

      {/* Languages */}
      <View style={styles.languagesSection}>
        <View style={styles.languagesHeader}>
          <Globe size={14} color={COLORS.textMuted} />
          <Text style={styles.languagesLabel}>Languages</Text>
        </View>
        <View style={styles.languagesList}>
          {doctor.languages.map((language, index) => (
            <View key={language} style={styles.languageTag}>
              <Text style={styles.languageText}>{language}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onViewProfile && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => handlePress(() => onViewProfile(doctor.id))}
            activeOpacity={0.8}
          >
            <Text style={styles.profileButtonText}>View Profile</Text>
          </TouchableOpacity>
        )}

        {onBookAppointment && (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => handlePress(() => onBookAppointment(doctor.id))}
            activeOpacity={0.9}
          >
            <Calendar size={18} color={COLORS.textInverse} />
            <Text style={styles.bookButtonText}>Book Appointment</Text>
          </TouchableOpacity>
        )}
      </View>
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
    alignItems: 'center',
    gap: SPACING[4],
    marginBottom: SPACING[4],
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  specialty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING[2],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  ratingCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[4],
  },
  consultationFee: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  feeText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.bold,
  },
  feeLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING[1],
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    gap: SPACING[2],
  },
  detailIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
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
  languagesSection: {
    marginBottom: SPACING[4],
  },
  languagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[2],
  },
  languagesLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  languagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  languageTag: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
  },
  languageText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[3],
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
  },
  profileButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  bookButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    gap: SPACING[2],
    ...SHADOWS.sm,
  },
  bookButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
