import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Download,
  Calendar,
  User,
  Building,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react-native';
import { TestReport } from '../../types/cura';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { Badge } from '@/components/ui';

interface TestReportCardProps {
  report: TestReport;
  onView?: (reportId: string) => void;
  onDownload?: (reportId: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function TestReportCard({ report, onView, onDownload }: TestReportCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: COLORS.success,
          bgColor: COLORS.successMuted,
          icon: CheckCircle,
          label: 'Completed',
          variant: 'success' as const,
        };
      case 'pending':
        return {
          color: COLORS.warning,
          bgColor: COLORS.warningMuted,
          icon: Clock,
          label: 'Pending',
          variant: 'warning' as const,
        };
      case 'in-progress':
        return {
          color: COLORS.primary,
          bgColor: COLORS.primaryMuted,
          icon: AlertCircle,
          label: 'In Progress',
          variant: 'primary' as const,
        };
      default:
        return {
          color: COLORS.textMuted,
          bgColor: COLORS.surfaceMuted,
          icon: FileText,
          label: status,
          variant: 'default' as const,
        };
    }
  };

  const getTestTypeConfig = (type: string) => {
    const configs: Record<string, { emoji: string; color: string }> = {
      blood: { emoji: '🩸', color: COLORS.error },
      urine: { emoji: '🧪', color: COLORS.warning },
      'x-ray': { emoji: '🦴', color: COLORS.textSecondary },
      mri: { emoji: '🧠', color: COLORS.primary },
      ct: { emoji: '📷', color: COLORS.textSecondary },
      lab: { emoji: '🔬', color: COLORS.success },
      diagnostic: { emoji: '📋', color: COLORS.primary },
      scan: { emoji: '📡', color: COLORS.primary },
    };
    return configs[type] || { emoji: '📄', color: COLORS.textMuted };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusConfig = getStatusConfig(report.status);
  const testTypeConfig = getTestTypeConfig(report.testType);

  const handleAction = (action: () => void) => {
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
        <View style={styles.testInfo}>
          <View style={[styles.testIconBox, { backgroundColor: `${testTypeConfig.color}15` }]}>
            <Text style={styles.testEmoji}>{testTypeConfig.emoji}</Text>
          </View>
          <View style={styles.testDetails}>
            <Text style={styles.testName}>{report.testName}</Text>
            <Text style={styles.testType}>{report.testType.toUpperCase()}</Text>
          </View>
        </View>

        <Badge
          label={statusConfig.label}
          variant={statusConfig.variant}
          size="sm"
        />
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailCard}>
          <Calendar size={16} color={COLORS.primary} />
          <View>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(report.date)}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <User size={16} color={COLORS.success} />
          <View>
            <Text style={styles.detailLabel}>Doctor</Text>
            <Text style={styles.detailValue}>{report.doctorName}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Building size={16} color={COLORS.error} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Clinic</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{report.clinic}</Text>
          </View>
        </View>
      </View>

      {/* Results */}
      {report.results && (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsLabel}>Results</Text>
          <Text style={styles.resultsText}>{report.results}</Text>
        </View>
      )}

      {/* Values */}
      {report.value && report.normalRange && (
        <View style={styles.valuesCard}>
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>Measured Value</Text>
            <Text style={styles.valueText}>{report.value}</Text>
          </View>
          <View style={styles.valueDivider} />
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>Normal Range</Text>
            <Text style={styles.normalRangeText}>{report.normalRange}</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      {report.status === 'completed' && (
        <View style={styles.actions}>
          {onView && (
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleAction(() => onView(report.id))}
              activeOpacity={0.8}
            >
              <Eye size={18} color={COLORS.primary} />
              <Text style={styles.viewButtonText}>View Report</Text>
            </TouchableOpacity>
          )}

          {onDownload && (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleAction(() => onDownload(report.id))}
              activeOpacity={0.9}
            >
              <Download size={18} color={COLORS.textInverse} />
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
          )}
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
  testInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING[3],
  },
  testIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testEmoji: {
    fontSize: 24,
  },
  testDetails: {
    flex: 1,
  },
  testName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  testType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.5,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    gap: SPACING[2],
    flex: 1,
    minWidth: '45%',
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
  resultsCard: {
    backgroundColor: COLORS.successMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  resultsLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#166534',
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsText: {
    fontSize: FONT_SIZES.sm,
    color: '#15803D',
    lineHeight: 20,
  },
  valuesCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    marginBottom: SPACING[4],
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING[2],
  },
  valueLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  valueText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  normalRangeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[3],
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    gap: SPACING[2],
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  downloadButton: {
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
  downloadButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
