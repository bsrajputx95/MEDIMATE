import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS } from '@/constants/design-tokens';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackAnimationProps {
  type: FeedbackType;
  visible: boolean;
  onAnimationEnd?: () => void;
  size?: number;
}

export function FeedbackAnimation({ 
  type, 
  visible, 
  onAnimationEnd,
  size = 64 
}: FeedbackAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Animate in
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      checkScale.value = withSequence(
        withTiming(0, { duration: 100 }),
        withSpring(1, { damping: 8, stiffness: 300 }, () => {
          if (onAnimationEnd) {
            runOnJS(onAnimationEnd)();
          }
        })
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 });
    }
  }, [visible, type]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const getIcon = () => {
    const iconProps = { size: size * 0.5, color: COLORS.textInverse };
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <XCircle {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      case 'info':
        return COLORS.info;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={[styles.iconContainer, { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        backgroundColor: getBackgroundColor() 
      }]}>
        <Animated.View style={iconStyle}>
          {getIcon()}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// Toast-style feedback component
interface ToastFeedbackProps {
  type: FeedbackType;
  message: string;
  visible: boolean;
  onHide?: () => void;
  duration?: number;
}

export function ToastFeedback({ 
  type, 
  message, 
  visible, 
  onHide,
  duration = 3000 
}: ToastFeedbackProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Trigger haptic
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Animate in
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto hide
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          if (onHide) {
            runOnJS(onHide)();
          }
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, type, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      case 'info':
        return COLORS.info;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toastContainer, animatedStyle, { backgroundColor: getBackgroundColor() }]}>
      {type === 'success' && <CheckCircle size={20} color={COLORS.textInverse} />}
      {type === 'error' && <XCircle size={20} color={COLORS.textInverse} />}
      {type === 'warning' && <AlertTriangle size={20} color={COLORS.textInverse} />}
      {type === 'info' && <Info size={20} color={COLORS.textInverse} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  toastContainer: {
    position: 'absolute',
    top: SPACING[6],
    left: SPACING[4],
    right: SPACING[4],
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    gap: SPACING[3],
    zIndex: 1000,
  },
});
