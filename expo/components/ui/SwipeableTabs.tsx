import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  Animated,
  Platform,
} from 'react-native';
import { COLORS, SPACING } from '@/constants/design-tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_VELOCITY_THRESHOLD = 500;

interface SwipeableTabsProps {
  children: React.ReactNode[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  disabled?: boolean;
}

export const SwipeableTabs: React.FC<SwipeableTabsProps> = ({
  children,
  activeIndex,
  onIndexChange,
  disabled = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const translateX = useRef(new Animated.Value(activeIndex * -SCREEN_WIDTH)).current;
  const panResponder = useRef<any>(null);
  const isSwiping = useRef(false);

  useEffect(() => {
    if (activeIndex !== currentIndex) {
      setCurrentIndex(activeIndex);
      Animated.spring(translateX, {
        toValue: activeIndex * -SCREEN_WIDTH,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [activeIndex]);

  const goToIndex = useCallback((index: number) => {
    if (index < 0 || index >= children.length) return;
    
    setCurrentIndex(index);
    onIndexChange(index);
    
    Animated.spring(translateX, {
      toValue: index * -SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [children.length, onIndexChange]);

  const handleSwipeEnd = useCallback((velocity: number, translationX: number) => {
    const shouldSwipeRight = velocity > SWIPE_VELOCITY_THRESHOLD || translationX > SWIPE_THRESHOLD;
    const shouldSwipeLeft = velocity < -SWIPE_VELOCITY_THRESHOLD || translationX < -SWIPE_THRESHOLD;

    if (shouldSwipeRight && currentIndex > 0) {
      goToIndex(currentIndex - 1);
    } else if (shouldSwipeLeft && currentIndex < children.length - 1) {
      goToIndex(currentIndex + 1);
    } else {
      // Snap back to current position
      Animated.spring(translateX, {
        toValue: currentIndex * -SCREEN_WIDTH,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [currentIndex, children.length, goToIndex]);

  useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return !disabled && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderGrant: () => {
        isSwiping.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        if (disabled) return;
        
        const { dx } = gestureState;
        const baseTranslate = currentIndex * -SCREEN_WIDTH;
        const newTranslate = baseTranslate + dx;
        
        // Add resistance at boundaries
        if ((currentIndex === 0 && dx > 0) || (currentIndex === children.length - 1 && dx < 0)) {
          translateX.setValue(baseTranslate + dx * 0.3);
        } else {
          translateX.setValue(newTranslate);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        isSwiping.current = false;
        handleSwipeEnd(gestureState.vx, gestureState.dx);
      },
      onPanResponderTerminate: (_, gestureState) => {
        isSwiping.current = false;
        handleSwipeEnd(gestureState.vx, gestureState.dx);
      },
    });
  }, [currentIndex, children.length, disabled, handleSwipeEnd]);

  return (
    <View style={styles.container} {...panResponder?.panHandlers}>
      <Animated.View 
        style={[
          styles.tabsContainer, 
          { 
            width: SCREEN_WIDTH * children.length,
            transform: [{ translateX }] 
          }
        ]}
      >
        {React.Children.map(children, (child, index) => (
          <View key={index} style={styles.tabContent}>
            {child}
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

// Hook for managing swipeable tabs state
export const useSwipeableTabs = (initialIndex: number = 0) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const goToNext = useCallback(() => {
    setActiveIndex(prev => prev + 1);
  }, []);

  const goToPrevious = useCallback(() => {
    setActiveIndex(prev => Math.max(0, prev - 1));
  }, []);

  const goToIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return {
    activeIndex,
    setActiveIndex,
    goToNext,
    goToPrevious,
    goToIndex,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tabContent: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
});

export default SwipeableTabs;
