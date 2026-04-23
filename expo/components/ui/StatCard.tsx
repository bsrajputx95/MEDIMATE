import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, FONT_SIZES, FONT_WEIGHTS, ANIMATION } from '@/constants/design-tokens';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: { value: number; direction: 'up' | 'down' };
  icon?: React.ReactNode;
  color?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  trend,
  icon,
  color = COLORS.primary,
  style,
}) => {
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, ANIMATION.spring.gentle);
    opacity.value = withTiming(1, { duration: ANIMATION.duration.normal });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getTrendColor = () => {
    if (!trend) return COLORS.textSecondary;
    return trend.direction === 'up' ? COLORS.success : COLORS.error;
  };

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      
      {trend && (
        <View style={styles.trendContainer}>
          {trend.direction === 'up' ? (
            <TrendingUp size={12} color={COLORS.success} />
          ) : (
            <TrendingDown size={12} color={COLORS.error} />
          )}
          <Text style={[styles.trendValue, { color: getTrendColor() }]}>
            {trend.direction === 'up' ? '+' : '-'}{Math.abs(trend.value)}%
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING[4],
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[3],
  },
  title: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING[2],
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING[1],
  },
  value: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
  },
  unit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING[1],
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    marginTop: SPACING[1],
  },
  trendValue: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default StatCard;
