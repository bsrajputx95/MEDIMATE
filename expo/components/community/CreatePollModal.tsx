import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { X, Plus, Trash2, Clock, Send } from 'lucide-react-native';

interface PollOption {
  id: string;
  text: string;
}

interface CreatePollModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (poll: {
    question: string;
    options: string[];
    duration: number | null;
  }) => void;
}

const DURATION_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '6 hours', value: 6 },
  { label: '24 hours', value: 24 },
  { label: '3 days', value: 72 },
  { label: '1 week', value: 168 },
];

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(24);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);

  const addOption = () => {
    if (options.length >= 6) {
      Alert.alert('Limit Reached', 'Maximum 6 options allowed');
      return;
    }
    setOptions([...options, { id: Date.now().toString(), text: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      Alert.alert('Minimum Required', 'At least 2 options are required');
      return;
    }
    setOptions(options.filter(o => o.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };

  const handleSubmit = () => {
    if (!question.trim()) {
      Alert.alert('Missing Question', 'Please enter a question for your poll');
      return;
    }

    const validOptions = options.filter(o => o.text.trim());
    if (validOptions.length < 2) {
      Alert.alert('Insufficient Options', 'Please provide at least 2 options');
      return;
    }

    onSubmit({
      question: question.trim(),
      options: validOptions.map(o => o.text.trim()),
      duration: selectedDuration,
    });

    // Reset form
    setQuestion('');
    setOptions([
      { id: '1', text: '' },
      { id: '2', text: '' },
    ]);
    setSelectedDuration(24);
    setAllowMultipleVotes(false);
    onClose();
  };

  const handleClose = () => {
    if (question.trim() || options.some(o => o.text.trim())) {
      Alert.alert(
        'Discard Poll?',
        'You have unsaved changes. Are you sure you want to discard this poll?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setQuestion('');
              setOptions([
                { id: '1', text: '' },
                { id: '2', text: '' },
              ]);
              onClose();
            }
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Poll</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Question Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Question</Text>
              <TextInput
                style={styles.questionInput}
                placeholder="What would you like to ask?"
                placeholderTextColor={COLORS.textMuted}
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={200}
              />
              <Text style={styles.charCount}>{question.length}/200</Text>
            </View>

            {/* Options */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.label}>Options</Text>
                <TouchableOpacity style={styles.addButton} onPress={addOption}>
                  <Plus size={18} color={COLORS.primary} />
                  <Text style={styles.addButtonText}>Add Option</Text>
                </TouchableOpacity>
              </View>

              {options.map((option, index) => (
                <View key={option.id} style={styles.optionRow}>
                  <Text style={styles.optionNumber}>{index + 1}</Text>
                  <TextInput
                    style={styles.optionInput}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor={COLORS.textMuted}
                    value={option.text}
                    onChangeText={(text) => updateOption(option.id, text)}
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeOption(option.id)}
                    >
                      <Trash2 size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={18} color={COLORS.textSecondary} />
                <Text style={styles.label}>Poll Duration</Text>
              </View>
              <View style={styles.durationOptions}>
                {DURATION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.durationOption,
                      selectedDuration === option.value && styles.durationOptionSelected,
                    ]}
                    onPress={() => setSelectedDuration(option.value)}
                  >
                    <Text style={[
                      styles.durationText,
                      selectedDuration === option.value && styles.durationTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Settings */}
            <View style={styles.section}>
              <Text style={styles.label}>Settings</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Allow multiple votes</Text>
                <Switch
                  value={allowMultipleVotes}
                  onValueChange={setAllowMultipleVotes}
                  trackColor={{ false: COLORS.border, true: COLORS.primaryMuted }}
                  thumbColor={allowMultipleVotes ? COLORS.primary : COLORS.textMuted}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Send size={18} color={COLORS.textInverse} />
              <Text style={styles.submitButtonText}>Create Poll</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
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
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
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
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  questionInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  charCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  addButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  optionNumber: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    lineHeight: 24,
  },
  optionInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  removeButton: {
    padding: SPACING.sm,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  durationOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  durationOptionSelected: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  durationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  durationTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
  },
  settingLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
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
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
});

export default CreatePollModal;
