/**
 * MediMate UI Components
 * Premium, animated components for health & wellness app
 */

// Core Components
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';
export { Modal } from './Modal';

// Display Components
export { StatCard } from './StatCard';
export { ProgressBar } from './ProgressBar';
export { Badge } from './Badge';
export { Avatar } from './Avatar';

// Navigation Components
export { Header } from './Header';
export { TabBar } from './TabBar';
export { FloatingActionButton } from './FloatingActionButton';

// Loading Components
export { LoadingSpinner, LoadingDots, ProgressIndicator } from './LoadingSpinner';

// Skeleton Components
export { Skeleton, SkeletonText, SkeletonCard, SkeletonStatCard, SkeletonList } from './Skeleton';

// Feedback Components
export { FeedbackAnimation, ToastFeedback } from './FeedbackAnimation';

// Legacy Components (for backward compatibility)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '@/constants/design-tokens';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionLabel, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.actionText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, actionLabel, onAction }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyStateIcon}>{icon}</View>
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity style={styles.emptyStateButton} onPress={onAction} activeOpacity={0.8}>
        <Text style={styles.emptyStateButtonText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ width = '100%', height = 20, style }) => (
  <View style={[styles.skeleton, { width, height }, style]} />
);

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  actionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'] || 40,
    paddingHorizontal: SPACING['2xl'] || 24,
  },
  emptyStateIcon: {
    marginBottom: SPACING.lg || 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm || 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg || 16,
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md || 12,
    paddingHorizontal: SPACING['2xl'] || 24,
  },
  emptyStateButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  skeleton: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.sm,
  },
});
