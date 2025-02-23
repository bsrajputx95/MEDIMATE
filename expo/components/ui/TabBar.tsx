import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';

const { width } = Dimensions.get('window');

interface TabItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export function TabBar({ 
  tabs, 
  activeTab, 
  onTabChange,
  variant = 'pills' 
}: TabBarProps) {
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const handleTabPress = (key: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate indicator
    const tabWidth = (width - SPACING[5] * 2) / tabs.length;
    indicatorPosition.value = withSpring(index * tabWidth);
    indicatorWidth.value = withSpring(tabWidth);
    
    onTabChange(key);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
    width: indicatorWidth.value,
  }));

  if (variant === 'pills') {
    return (
      <View style={styles.pillsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.pillTab,
                isActive && styles.activePillTab,
              ]}
              onPress={() => handleTabPress(tab.key, tabs.indexOf(tab))}
              activeOpacity={0.8}
            >
              {tab.icon}
              <Animated.Text style={[
                styles.pillTabText,
                isActive && styles.activePillTabText,
              ]}>
                {tab.label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  if (variant === 'underline') {
    return (
      <View style={styles.underlineContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.underlineTab}
              onPress={() => handleTabPress(tab.key, tabs.indexOf(tab))}
              activeOpacity={0.8}
            >
              {tab.icon}
              <Animated.Text style={[
                styles.underlineTabText,
                isActive && styles.activeUnderlineTabText,
              ]}>
                {tab.label}
              </Animated.Text>
              {isActive && <View style={styles.underlineIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // Default variant
  return (
    <View style={styles.defaultContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const scale = useSharedValue(1);
        
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        }));

        const handlePressIn = () => {
          scale.value = withTiming(0.95, { duration: 100 });
        };

        const handlePressOut = () => {
          scale.value = withSpring(1);
        };

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.defaultTab}
            onPress={() => handleTabPress(tab.key, tabs.indexOf(tab))}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.defaultTabContent, animatedStyle]}>
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                {isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
              </View>
              <Animated.Text style={[
                styles.defaultTabText,
                isActive && styles.activeDefaultTabText,
              ]}>
                {tab.label}
              </Animated.Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Pills variant
  pillsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
    gap: SPACING[1],
  },
  pillTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[2],
    borderRadius: RADIUS.md,
    gap: SPACING[1],
  },
  activePillTab: {
    backgroundColor: COLORS.primary,
  },
  pillTabText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  activePillTabText: {
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Underline variant
  underlineContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  underlineTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING[3],
    gap: SPACING[1],
  },
  underlineTabText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  activeUnderlineTabText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  underlineIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },

  // Default variant
  defaultContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  defaultTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[2],
  },
  defaultTabContent: {
    alignItems: 'center',
    gap: SPACING[1],
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: COLORS.primaryMuted,
  },
  defaultTabText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  activeDefaultTabText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
