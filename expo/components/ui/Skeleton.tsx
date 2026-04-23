import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '@/constants/design-tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius,
  style,
  variant = 'rectangular'
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  // Shimmer effect - translateX
  const shimmerTranslate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const getBorderRadius = () => {
    if (borderRadius !== undefined) return borderRadius;
    if (variant === 'circular') return 999;
    if (variant === 'text') return RADIUS.sm;
    return RADIUS.md;
  };

  return (
    <View
      style={[
        styles.skeletonContainer,
        {
          width,
          height,
          borderRadius: getBorderRadius(),
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.skeleton,
          {
            opacity,
          },
        ]}
      />
      <Animated.View 
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerTranslate }],
          }
        ]} 
      />
    </View>
  );
}

// Preset skeleton components
export function SkeletonText({ lines = 3, lastLineWidth = '60%' }: { lines?: number; lastLineWidth?: string | number }) {
  return (
    <View style={styles.skeletonTextContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={14}
          variant="text"
          style={index > 0 ? { marginTop: 8 } : undefined}
        />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonCardHeader}>
        <Skeleton width={40} height={40} variant="circular" />
        <View style={styles.skeletonCardHeaderText}>
          <Skeleton width="60%" height={14} variant="text" />
          <Skeleton width="40%" height={12} variant="text" style={{ marginTop: 4 }} />
        </View>
      </View>
      <SkeletonText lines={2} lastLineWidth="80%" />
    </View>
  );
}

export function SkeletonStatCard() {
  return (
    <View style={styles.skeletonStatCard}>
      <Skeleton width={32} height={32} borderRadius={RADIUS.lg} />
      <Skeleton width="70%" height={24} variant="text" style={{ marginTop: 8 }} />
      <Skeleton width="50%" height={14} variant="text" style={{ marginTop: 4 }} />
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    backgroundColor: COLORS.surfaceMuted,
    overflow: 'hidden',
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surfaceMuted,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skeletonTextContainer: {
    width: '100%',
  },
  skeletonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonCardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonStatCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: 'center',
    width: '48%',
  },
  skeletonList: {
    padding: 16,
  },
});
