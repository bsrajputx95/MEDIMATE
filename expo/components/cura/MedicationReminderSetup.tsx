import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { Bell, Clock, Calendar, Pill, Plus, X, Check, Volume2, Vibrate } from 'lucide-react-native';

interface ReminderTime {
  id: string;
  time: string;
  enabled: boolean;
  days: string[];
}

interface MedicationReminderSetupProps {
  medicationId: string;
  medicationName: string;
  existingReminders?: ReminderTime[];
  onSave: (reminders: ReminderTime[]) => void;
  onClose: () => void;
  visible: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MedicationReminderSetup: React.FC<MedicationReminderSetupProps> = ({
  medicationId,
  medicationName,
  existingReminders = [],
  onSave,
  onClose,
  visible,
}) => {
  const [reminders, setReminders] = useState<ReminderTime[]>(
    existingReminders.length > 0 ? existingReminders : [
      {
        id: '1',
        time: '08:00',
        enabled: true,
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
    ]
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);

  const addReminder = () => {
    const newReminder: ReminderTime = {
      id: Date.now().toString(),
      time: '12:00',
      enabled: true,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    };
    setReminders([...reminders, newReminder]);
  };

  const removeReminder = (id: string) => {
    if (reminders.length <= 1) {
      Alert.alert('Cannot Remove', 'At least one reminder is required.');
      return;
    }
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const toggleDay = (reminderId: string, day: string) => {
    setReminders(reminders.map(r => {
      if (r.id !== reminderId) return r;
      const newDays = r.days.includes(day)
        ? r.days.filter(d => d !== day)
        : [...r.days, day];
      return { ...r, days: newDays };
    }));
  };

  const updateTime = (id: string, time: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, time } : r
    ));
    setShowTimePicker(false);
    setSelectedReminderId(null);
  };

  const handleSave = () => {
    const enabledReminders = reminders.filter(r => r.enabled);
    if (enabledReminders.length === 0) {
      Alert.alert('No Reminders', 'Please enable at least one reminder.');
      return;
    }
    onSave(reminders);
  };

  const TimePickerModal = () => {
    const [hours, setHours] = useState(12);
    const [minutes, setMinutes] = useState(0);
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

    const hoursList = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutesList = Array.from({ length: 60 }, (_, i) => i);

    const confirmTime = () => {
      const hour24 = period === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
      const timeString = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      if (selectedReminderId) {
        updateTime(selectedReminderId, timeString);
      }
    };

    return (
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <X size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerWheels}>
              <ScrollView 
                style={styles.timeWheel}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
              >
                {hoursList.map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.timeOption,
                      hours === h && styles.timeOptionSelected
                    ]}
                    onPress={() => setHours(h)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      hours === h && styles.timeOptionTextSelected
                    ]}>
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.timeSeparator}>:</Text>

              <ScrollView 
                style={styles.timeWheel}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
              >
                {minutesList.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.timeOption,
                      minutes === m && styles.timeOptionSelected
                    ]}
                    onPress={() => setMinutes(m)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      minutes === m && styles.timeOptionTextSelected
                    ]}>
                      {m.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.periodSelector}>
                {(['AM', 'PM'] as const).map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.periodOption,
                      period === p && styles.periodOptionSelected
                    ]}
                    onPress={() => setPeriod(p)}
                  >
                    <Text style={[
                      styles.periodText,
                      period === p && styles.periodTextSelected
                    ]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.confirmTimeButton} onPress={confirmTime}>
              <Check size={20} color={COLORS.textInverse} />
              <Text style={styles.confirmTimeText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Pill size={24} color={COLORS.primary} />
              <View style={styles.headerText}>
                <Text style={styles.title}>Medication Reminders</Text>
                <Text style={styles.subtitle}>{medicationName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Reminder Times */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Reminder Times</Text>
                <TouchableOpacity style={styles.addButton} onPress={addReminder}>
                  <Plus size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {reminders.map((reminder) => (
                <View key={reminder.id} style={styles.reminderCard}>
                  <View style={styles.reminderHeader}>
                    <TouchableOpacity 
                      style={styles.timeButton}
                      onPress={() => {
                        setSelectedReminderId(reminder.id);
                        setShowTimePicker(true);
                      }}
                    >
                      <Clock size={20} color={COLORS.primary} />
                      <Text style={styles.timeText}>
                        {formatTime12Hour(reminder.time)}
                      </Text>
                    </TouchableOpacity>
                    
                    <View style={styles.reminderActions}>
                      <Switch
                        value={reminder.enabled}
                        onValueChange={() => toggleReminder(reminder.id)}
                        trackColor={{ false: COLORS.border, true: COLORS.primaryMuted }}
                        thumbColor={reminder.enabled ? COLORS.primary : COLORS.textMuted}
                      />
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeReminder(reminder.id)}
                      >
                        <X size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Days Selection */}
                  <View style={styles.daysContainer}>
                    {DAYS.map(day => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayButton,
                          reminder.days.includes(day) && styles.dayButtonSelected
                        ]}
                        onPress={() => toggleDay(reminder.id, day)}
                      >
                        <Text style={[
                          styles.dayText,
                          reminder.days.includes(day) && styles.dayTextSelected
                        ]}>
                          {day.charAt(0)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Notification Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Settings</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Volume2 size={20} color={COLORS.textSecondary} />
                  <Text style={styles.settingLabel}>Sound</Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: COLORS.border, true: COLORS.primaryMuted }}
                  thumbColor={soundEnabled ? COLORS.primary : COLORS.textMuted}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Vibrate size={20} color={COLORS.textSecondary} />
                  <Text style={styles.settingLabel}>Vibration</Text>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{ false: COLORS.border, true: COLORS.primaryMuted }}
                  thumbColor={vibrationEnabled ? COLORS.primary : COLORS.textMuted}
                />
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
              <Bell size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                You'll receive notifications at the scheduled times. Make sure to enable notifications in your device settings.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Check size={20} color={COLORS.textInverse} />
              <Text style={styles.saveButtonText}>Save Reminders</Text>
            </TouchableOpacity>
          </View>

          <TimePickerModal />
        </View>
      </View>
    </Modal>
  );
};

// Helper function to format 24h time to 12h
const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  content: {
    padding: SPACING['2xl'],
  },
  section: {
    marginBottom: SPACING['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  timeText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  removeButton: {
    padding: SPACING.sm,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  dayTextSelected: {
    color: COLORS.textInverse,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  settingLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.primaryMuted,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING['2xl'],
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
  // Time Picker Modal
  timePickerContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    padding: SPACING['2xl'],
  },
  timePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING['2xl'],
  },
  timePickerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  timePickerWheels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: SPACING['2xl'],
  },
  timeWheel: {
    height: 200,
    width: 80,
  },
  timeOption: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.md,
  },
  timeOptionText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  timeOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  timeSeparator: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.sm,
  },
  periodSelector: {
    marginLeft: SPACING.md,
  },
  periodOption: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  periodOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  periodTextSelected: {
    color: COLORS.textInverse,
  },
  confirmTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  confirmTimeText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
});

export default MedicationReminderSetup;
