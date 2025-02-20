import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '@/constants/design-tokens';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: COLORS.success.light,
        };
      case 'warning':
        return {
          backgroundColor: COLORS.warning.light,
        };
      case 'error':
        return {
          backgroundColor: COLORS.error.light,
        };
      case 'info':
        return {
          backgroundColor: COLORS.info.light,
        };
      case 'primary':
        return {
          backgroundColor: COLORS.primaryMuted,
        };
      default:
        return {
          backgroundColor: COLORS.neutral[100],
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'success':
        return COLORS.success.dark;
      case 'warning':
        return COLORS.warning.dark;
      case 'error':
        return COLORS.error.dark;
      case 'info':
        return COLORS.info.dark;
      case 'primary':
        return COLORS.primary;
      default:
        return COLORS.neutral[700];
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: SPACING[2],
          paddingVertical: SPACING[1],
        };
      case 'md':
        return {
          paddingHorizontal: SPACING[3],
          paddingVertical: SPACING[1],
        };
      default:
        return {};
    }
  };

  return (
    <View style={[styles.badge, getVariantStyles(), getSizeStyles(), style]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.3,
  },
});

export default Badge;
