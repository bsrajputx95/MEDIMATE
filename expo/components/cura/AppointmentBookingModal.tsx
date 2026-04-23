import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Calendar,
  Clock,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { Button, Card, Badge } from '@/components/ui';
import { Doctor } from '@/hooks';

interface AppointmentBookingModalProps {
  visible: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onBook: (appointment: {
    doctorId: string;
    date: string;
    time: string;
    type: string;
    notes?: string;
  }) => Promise<void>;
}

const APPOINTMENT_TYPES = [
  { id: 'checkup', label: 'General Checkup', duration: '30 min' },
  { id: 'followup', label: 'Follow-up', duration: '20 min' },
  { id: 'consultation', label: 'Consultation', duration: '45 min' },
  { id: 'emergency', label: 'Urgent Care', duration: '60 min' },
];

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

export default function AppointmentBookingModal({
  visible,
  onClose,
  doctors,
  onBook,
}: AppointmentBookingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Generate next 14 days
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedTime || !selectedType) {
      Alert.alert('Missing Information', 'Please complete all required fields.');
      return;
    }

    setIsBooking(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await onBook({
        doctorId: selectedDoctor.id,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        type: selectedType,
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        'Appointment Booked!',
        `Your appointment with ${selectedDoctor.name} on ${formatFullDate(selectedDate)} at ${selectedTime} has been confirmed.`,
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      Alert.alert('Booking Failed', 'Unable to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDoctor(null);
    setSelectedDate(new Date());
    setSelectedTime('');
    setSelectedType('');
    setNotes('');
    onClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedDoctor !== null;
      case 2: return selectedType !== '';
      case 3: return selectedTime !== '';
      case 4: return true;
      default: return false;
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((s) => (
        <View key={s} style={styles.stepItem}>
          <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
            {step > s ? (
              <Check size={14} color={COLORS.textInverse} />
            ) : (
              <Text style={[styles.stepNumber, step >= s && styles.stepNumberActive]}>{s}</Text>
            )}
          </View>
          {s < 4 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Animated.View entering={FadeInUp.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Doctor</Text>
      <Text style={styles.stepSubtitle}>Choose a healthcare provider for your appointment</Text>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.doctorsList}>
        {doctors.map((doctor, index) => (
          <Animated.View
            key={doctor.id}
            entering={FadeInDown.delay(index * 50).springify()}
          >
            <TouchableOpacity
              style={[
                styles.doctorCard,
                selectedDoctor?.id === doctor.id && styles.doctorCardSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedDoctor(doctor);
              }}
            >
              <View style={styles.doctorInfo}>
                <View style={styles.doctorAvatar}>
                  <User size={24} color={COLORS.primary} />
                </View>
                <View style={styles.doctorDetails}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                  <View style={styles.doctorMeta}>
                    <Text style={styles.doctorMetaText}>{doctor.experience}</Text>
                    <Text style={styles.doctorMetaDot}>•</Text>
                    <Text style={styles.doctorMetaText}>{doctor.rating} ⭐</Text>
                  </View>
                </View>
              </View>
              <View style={styles.doctorRight}>
                <Text style={styles.doctorFee}>${doctor.consultationFee}</Text>
                {selectedDoctor?.id === doctor.id && (
                  <View style={styles.selectedCheck}>
                    <Check size={16} color={COLORS.textInverse} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={FadeInUp.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>Appointment Type</Text>
      <Text style={styles.stepSubtitle}>What type of appointment do you need?</Text>
      
      <View style={styles.typesGrid}>
        {APPOINTMENT_TYPES.map((type, index) => (
          <Animated.View
            key={type.id}
            entering={FadeInDown.delay(index * 50).springify()}
          >
            <TouchableOpacity
              style={[
                styles.typeCard,
                selectedType === type.id && styles.typeCardSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedType(type.id);
              }}
            >
              <Text style={[
                styles.typeLabel,
                selectedType === type.id && styles.typeLabelSelected,
              ]}>
                {type.label}
              </Text>
              <Text style={styles.typeDuration}>{type.duration}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View entering={FadeInUp.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Date & Time</Text>
      <Text style={styles.stepSubtitle}>Choose your preferred appointment slot</Text>
      
      {/* Date Selection */}
      <View style={styles.dateSection}>
        <Text style={styles.sectionLabel}>Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.datesRow}>
            {availableDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCard,
                  selectedDate.toDateString() === date.toDateString() && styles.dateCardSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedDate(date);
                  setSelectedTime('');
                }}
              >
                <Text style={[
                  styles.dateDay,
                  selectedDate.toDateString() === date.toDateString() && styles.dateDaySelected,
                ]}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[
                  styles.dateNumber,
                  selectedDate.toDateString() === date.toDateString() && styles.dateNumberSelected,
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Time Selection */}
      <View style={styles.timeSection}>
        <Text style={styles.sectionLabel}>Available Times</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((time, index) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeCard,
                selectedTime === time && styles.timeCardSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTime(time);
              }}
            >
              <Text style={[
                styles.timeText,
                selectedTime === time && styles.timeTextSelected,
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderStep4 = () => (
    <Animated.View entering={FadeInUp.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirm Booking</Text>
      <Text style={styles.stepSubtitle}>Review your appointment details</Text>
      
      <Card variant="elevated" padding="lg" style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <User size={20} color={COLORS.primary} />
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryLabel}>Doctor</Text>
            <Text style={styles.summaryValue}>{selectedDoctor?.name}</Text>
            <Text style={styles.summarySubtext}>{selectedDoctor?.specialty}</Text>
          </View>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <Calendar size={20} color={COLORS.primary} />
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{formatFullDate(selectedDate)}</Text>
          </View>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <Clock size={20} color={COLORS.primary} />
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{selectedTime}</Text>
          </View>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <FileText size={20} color={COLORS.primary} />
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryValue}>
              {APPOINTMENT_TYPES.find(t => t.id === selectedType)?.label}
            </Text>
          </View>
        </View>
      </Card>

      {/* Notes */}
      <View style={styles.notesSection}>
        <Text style={styles.sectionLabel}>Additional Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Any specific concerns or questions..."
          placeholderTextColor={COLORS.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Fee Summary */}
      <View style={styles.feeSummary}>
        <Text style={styles.feeLabel}>Consultation Fee</Text>
        <Text style={styles.feeAmount}>${selectedDoctor?.consultationFee}</Text>
      </View>
    </Animated.View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} disabled={step === 1}>
            {step > 1 ? (
              <ChevronLeft size={24} color={COLORS.primary} />
            ) : (
              <X size={24} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {step < 4 ? (
            <Button
              variant="primary"
              onPress={handleNext}
              disabled={!canProceed()}
              fullWidth
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onPress={handleBook}
              disabled={isBooking}
              fullWidth
            >
              {isBooking ? (
                <ActivityIndicator size="small" color={COLORS.textInverse} />
              ) : (
                `Book Appointment - $${selectedDoctor?.consultationFee}`
              )}
            </Button>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[4],
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING[4],
    backgroundColor: COLORS.surface,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textSecondary,
  },
  stepNumberActive: {
    color: COLORS.textInverse,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.surfaceMuted,
    marginHorizontal: SPACING[2],
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: SPACING[5],
  },
  stepTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[2],
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING[5],
  },
  doctorsList: {
    flex: 1,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[3],
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  doctorCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  doctorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  doctorSpecialty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING[1],
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorMetaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  doctorMetaDot: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginHorizontal: SPACING[2],
  },
  doctorRight: {
    alignItems: 'flex-end',
  },
  doctorFee: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING[2],
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typesGrid: {
    gap: SPACING[3],
  },
  typeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  typeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  typeLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  typeLabelSelected: {
    color: COLORS.primary,
  },
  typeDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  dateSection: {
    marginBottom: SPACING[5],
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING[3],
  },
  datesRow: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  dateCard: {
    width: 60,
    height: 80,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  dateCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  dateDay: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING[1],
  },
  dateDaySelected: {
    color: COLORS.textInverse,
  },
  dateNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  dateNumberSelected: {
    color: COLORS.textInverse,
  },
  timeSection: {
    marginBottom: SPACING[5],
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  timeCard: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  timeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  timeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  timeTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  summaryCard: {
    marginBottom: SPACING[5],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryInfo: {
    flex: 1,
    marginLeft: SPACING[3],
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING[1],
  },
  summaryValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  summarySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING[3],
  },
  notesSection: {
    marginBottom: SPACING[5],
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    minHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  feeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
  },
  feeLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  feeAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING[5],
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
