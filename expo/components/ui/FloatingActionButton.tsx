import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, ANIMATION } from '@/constants/design-tokens';

interface FloatingActionButtonProps {
  icon?: React.ReactNode;
  onPress: () => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  color = COLORS.primary,
  size = 'md',
  style,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, ANIMATION.spring.snappy);
    rotation.value = withSpring(45, ANIMATION.spring.gentle);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, ANIMATION.spring.bouncy);
    rotation.value = withSpring(0, ANIMATION.spring.gentle);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getSize = (): number => {
    switch (size) {
      case 'sm':
        return 48;
      case 'md':
        return 56;
      case 'lg':
        return 64;
      default:
        return 56;
    }
  };

  const dimension = getSize();

  return (
    <AnimatedPressable
      style={[
        styles.fab,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: color,
        },
        animatedStyle,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {icon || <Plus size={24} color={COLORS.textInverse} />}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
});

export default FloatingActionButton;
