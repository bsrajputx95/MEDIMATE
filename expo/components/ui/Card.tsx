import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SHADOWS, SPACING, ANIMATION } from '@/constants/design-tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  radius = 'lg',
  style,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const elevation = useSharedValue(variant === 'elevated' ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, ANIMATION.spring.snappy);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, ANIMATION.spring.gentle);
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: COLORS.surface,
          ...SHADOWS.md,
        };
      case 'outlined':
        return {
          backgroundColor: COLORS.surface,
          borderWidth: 1,
          borderColor: COLORS.border,
        };
      case 'filled':
        return {
          backgroundColor: COLORS.surfaceMuted,
        };
      default:
        return {};
    }
  };

  const getPaddingStyles = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return {};
      case 'sm':
        return { padding: SPACING[3] };
      case 'md':
        return { padding: SPACING[4] };
      case 'lg':
        return { padding: SPACING[6] };
      default:
        return {};
    }
  };

  const getRadiusStyles = (): ViewStyle => {
    switch (radius) {
      case 'md':
        return { borderRadius: RADIUS.md };
      case 'lg':
        return { borderRadius: RADIUS.lg };
      case 'xl':
        return { borderRadius: RADIUS.xl };
      default:
        return {};
    }
  };

  const content = (
    <View style={[getVariantStyles(), getPaddingStyles(), getRadiusStyles(), style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        style={[animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
};

export default Card;
