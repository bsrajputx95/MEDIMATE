import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { Sparkles, Heart, Apple, Dumbbell, Moon, Brain, Droplets } from 'lucide-react-native';

interface SuggestedQuestion {
  id: string;
  question: string;
  icon: React.ReactNode;
  category: string;
}

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: '1',
    question: "What are some tips for better sleep?",
    icon: <Moon size={18} color={COLORS.primary} />,
    category: 'Wellness',
  },
  {
    id: '2',
    question: "How can I improve my diet?",
    icon: <Apple size={18} color={COLORS.success} />,
    category: 'Nutrition',
  },
  {
    id: '3',
    question: "What exercises are good for beginners?",
    icon: <Dumbbell size={18} color={COLORS.warning} />,
    category: 'Fitness',
  },
  {
    id: '4',
    question: "How much water should I drink daily?",
    icon: <Droplets size={18} color={COLORS.info} />,
    category: 'Hydration',
  },
  {
    id: '5',
    question: "How can I reduce stress and anxiety?",
    icon: <Brain size={18} color={COLORS.secondary} />,
    category: 'Mental Health',
  },
  {
    id: '6',
    question: "What are the benefits of meditation?",
    icon: <Heart size={18} color={COLORS.error} />,
    category: 'Mindfulness',
  },
];

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={16} color={COLORS.primary} />
        <Text style={styles.title}>Suggested Questions</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.questionsContainer}
      >
        {SUGGESTED_QUESTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.questionCard}
            onPress={() => onSelectQuestion(item.question)}
            activeOpacity={0.8}
          >
            <View style={styles.questionIcon}>
              {item.icon}
            </View>
            <Text style={styles.questionText} numberOfLines={2}>
              {item.question}
            </Text>
            <Text style={styles.categoryText}>{item.category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING['2xl'],
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  questionsContainer: {
    paddingHorizontal: SPACING['2xl'],
    gap: SPACING.md,
  },
  questionCard: {
    width: 140,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  questionIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  questionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
});

export default SuggestedQuestions;
