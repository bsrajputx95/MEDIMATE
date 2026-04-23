import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS, RADIUS, ANIMATION } from '@/constants/design-tokens';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  showLabel?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = COLORS.primary,
  backgroundColor = COLORS.neutral[200],
  height = 8,
  animated = true,
  showLabel = false,
  style,
}) => {
  const width = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      width.value = withDelay(
        100,
        withSpring(Math.min(100, Math.max(0, progress)), ANIMATION.spring.gentle)
      );
    } else {
      width.value = Math.min(100, Math.max(0, progress));
    }
  }, [progress, animated]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, height },
          animatedFillStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.full,
  },
});

export default ProgressBar;
