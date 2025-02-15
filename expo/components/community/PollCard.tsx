import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { BarChart3, Users, Clock, Check } from 'lucide-react-native';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsAt?: string;
  hasVoted: boolean;
  votedOptionId?: string;
}

interface PollCardProps {
  poll: PollData;
  onVote: (pollId: string, optionId: string) => void;
  compact?: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  onVote,
  compact = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    poll.votedOptionId || null
  );
  const [animatedWidths] = useState(
    poll.options.map(() => new Animated.Value(0))
  );

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const handleVote = (optionId: string) => {
    if (poll.hasVoted) return;
    
    setSelectedOption(optionId);
    onVote(poll.id, optionId);

    // Animate the bars
    const optionIndex = poll.options.findIndex(o => o.id === optionId);
    const newTotal = poll.totalVotes + 1;
    
    poll.options.forEach((option, index) => {
      const percentage = option.id === optionId
        ? ((option.votes + 1) / newTotal) * 100
        : (option.votes / newTotal) * 100;
      
      Animated.spring(animatedWidths[index], {
        toValue: percentage,
        useNativeDriver: false,
        tension: 65,
        friction: 11,
      }).start();
    });
  };

  const getTimeRemaining = () => {
    if (!poll.endsAt) return null;
    
    const end = new Date(poll.endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const isWinner = (option: PollOption) => {
    if (!poll.hasVoted) return false;
    const maxVotes = Math.max(...poll.options.map(o => o.votes));
    return option.votes === maxVotes && option.votes > 0;
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <BarChart3 size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.headerLabel}>POLL</Text>
        {poll.endsAt && (
          <View style={styles.timeRemaining}>
            <Clock size={12} color={COLORS.textSecondary} />
            <Text style={styles.timeText}>{getTimeRemaining()}</Text>
          </View>
        )}
      </View>

      {/* Question */}
      <Text style={styles.question}>{poll.question}</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {poll.options.map((option, index) => {
          const percentage = getPercentage(option.votes);
          const isSelected = selectedOption === option.id;
          const winner = isWinner(option);

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionContainer,
                poll.hasVoted && styles.optionContainerVoted,
                isSelected && styles.optionContainerSelected,
                winner && styles.optionContainerWinner,
              ]}
              onPress={() => handleVote(option.id)}
              disabled={poll.hasVoted}
              activeOpacity={0.8}
            >
              {poll.hasVoted ? (
                <>
                  {/* Progress Bar */}
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          width: animatedWidths[index].interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                        winner && styles.progressFillWinner,
                      ]}
                    />
                  </View>

                  {/* Option Content */}
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.optionText,
                      winner && styles.optionTextWinner,
                    ]}>
                      {option.text}
                    </Text>
                    <View style={styles.optionRight}>
                      <Text style={[
                        styles.percentageText,
                        winner && styles.percentageTextWinner,
                      ]}>
                        {percentage}%
                      </Text>
                      {isSelected && (
                        <View style={styles.votedCheck}>
                          <Check size={14} color={COLORS.textInverse} />
                        </View>
                      )}
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.optionContent}>
                  <View style={styles.optionRadio}>
                    {isSelected && <View style={styles.optionRadioInner} />}
                  </View>
                  <Text style={styles.optionText}>{option.text}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.votesInfo}>
          <Users size={14} color={COLORS.textSecondary} />
          <Text style={styles.votesText}>
            {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
          </Text>
        </View>
        {poll.hasVoted && (
          <Text style={styles.votedLabel}>You voted</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  containerCompact: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  timeRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: SPACING.xs,
  },
  timeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  question: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionContainer: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  optionContainerVoted: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.borderMuted,
  },
  optionContainerSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  optionContainerWinner: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successMuted,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.lg,
  },
  progressFillWinner: {
    backgroundColor: '#BBF7D0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  optionTextWinner: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.success,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  percentageText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  percentageTextWinner: {
    color: COLORS.success,
  },
  votedCheck: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderMuted,
  },
  votesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  votesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  votedLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default PollCard;
