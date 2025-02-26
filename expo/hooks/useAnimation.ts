import { useRef, useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { ANIMATION } from '@/constants/design-tokens';

export const useAnimation = () => {
  const createScaleAnimation = (initialValue = 1) => {
    const scale = useSharedValue(initialValue);
    
    const scaleIn = useCallback((callback?: () => void) => {
      scale.value = withSpring(1, ANIMATION.spring.gentle, () => {
        if (callback) runOnJS(callback)();
      });
    }, []);

    const scaleOut = useCallback((callback?: () => void) => {
      scale.value = withSpring(0, ANIMATION.spring.gentle, () => {
        if (callback) runOnJS(callback)();
      });
    }, []);

    const pressIn = useCallback(() => {
      scale.value = withSpring(0.97, ANIMATION.spring.snappy);
    }, []);

    const pressOut = useCallback(() => {
      scale.value = withSpring(1, ANIMATION.spring.gentle);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return {
      scale,
      scaleIn,
      scaleOut,
      pressIn,
      pressOut,
      animatedStyle,
    };
  };

  const createFadeAnimation = (initialValue = 0) => {
    const opacity = useSharedValue(initialValue);

    const fadeIn = useCallback((duration = ANIMATION.duration.normal, callback?: () => void) => {
      opacity.value = withTiming(1, { duration }, () => {
        if (callback) runOnJS(callback)();
      });
    }, []);

    const fadeOut = useCallback((duration = ANIMATION.duration.normal, callback?: () => void) => {
      opacity.value = withTiming(0, { duration }, () => {
        if (callback) runOnJS(callback)();
      });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    return {
      opacity,
      fadeIn,
      fadeOut,
      animatedStyle,
    };
  };

  const createSlideAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up', initialValue = 100) => {
    const translate = useSharedValue(initialValue);

    const slideIn = useCallback((callback?: () => void) => {
      translate.value = withSpring(0, ANIMATION.spring.gentle, () => {
        if (callback) runOnJS(callback)();
      });
    }, []);

    const slideOut = useCallback((callback?: () => void) => {
      translate.value = withSpring(initialValue, ANIMATION.spring.gentle, () => {
        if (callback) runOnJS(callback)();
      });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      const transform = direction === 'up' || direction === 'down'
        ? [{ translateY: direction === 'up' ? translate.value : -translate.value }]
        : [{ translateX: direction === 'right' ? translate.value : -translate.value }];
      
      return { transform };
    });

    return {
      translate,
      slideIn,
      slideOut,
      animatedStyle,
    };
  };

  const createStaggeredAnimation = (itemCount: number, staggerDelay = 50) => {
    const items = Array.from({ length: itemCount }, () => ({
      opacity: useSharedValue(0),
      translateY: useSharedValue(20),
    }));

    const animate = useCallback(() => {
      items.forEach((item, index) => {
        item.opacity.value = withDelay(
          index * staggerDelay,
          withTiming(1, { duration: ANIMATION.duration.normal })
        );
        item.translateY.value = withDelay(
          index * staggerDelay,
          withSpring(0, ANIMATION.spring.gentle)
        );
      });
    }, []);

    const getAnimatedStyle = (index: number) => useAnimatedStyle(() => ({
      opacity: items[index].opacity.value,
      transform: [{ translateY: items[index].translateY.value }],
    }));

    return {
      animate,
      getAnimatedStyle,
    };
  };

  return {
    createScaleAnimation,
    createFadeAnimation,
    createSlideAnimation,
    createStaggeredAnimation,
  };
};

export default useAnimation;
