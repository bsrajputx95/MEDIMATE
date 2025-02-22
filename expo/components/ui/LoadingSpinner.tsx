import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS } from '@/constants/design-tokens';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'large', 
  color = COLORS.primary,
  fullScreen = false 
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

interface LoadingDotsProps {
  color?: string;
  size?: number;
}

export function LoadingDots({ color = COLORS.primary, size = 8 }: LoadingDotsProps) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  React.useEffect(() => {
    const duration = 400;
    const delay = 150;

    dot1.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    setTimeout(() => {
      dot2.value = withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, delay);

    setTimeout(() => {
      dot3.value = withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, delay * 2);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.5 + dot1.value * 0.5 }],
    opacity: 0.4 + dot1.value * 0.6,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.5 + dot2.value * 0.5 }],
    opacity: 0.4 + dot2.value * 0.6,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.5 + dot3.value * 0.5 }],
    opacity: 0.4 + dot3.value * 0.6,
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, dot1Style]} />
      <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, dot2Style]} />
      <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, dot3Style]} />
    </View>
  );
}

interface ProgressIndicatorProps {
  progress: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressIndicator({ 
  progress, 
  color = COLORS.primary,
  height = 4,
  showLabel = false 
}: ProgressIndicatorProps) {
  const animatedWidth = useSharedValue(0);

  React.useEffect(() => {
    animatedWidth.value = withTiming(progress, { duration: 500 });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { height }]}>
        <Animated.View 
          style={[
            styles.progressFill, 
            { height, backgroundColor: color },
            progressStyle
          ]} 
        />
      </View>
      {showLabel && (
        <Animated.Text style={styles.progressLabel}>
          {Math.round(progress)}%
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  dot: {
    marginHorizontal: 2,
  },
  progressContainer: {
    width: '100%',
  },
  progressTrack: {
    width: '100%',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: RADIUS.full,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING[1],
  },
});
