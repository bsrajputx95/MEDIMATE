import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '@/constants/design-tokens';
import { User } from 'lucide-react-native';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  style,
}) => {
  const getSize = (): number => {
    switch (size) {
      case 'sm':
        return 32;
      case 'md':
        return 40;
      case 'lg':
        return 56;
      case 'xl':
        return 80;
      default:
        return 40;
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return FONT_SIZES.sm;
      case 'md':
        return FONT_SIZES.base;
      case 'lg':
        return FONT_SIZES.xl;
      case 'xl':
        return FONT_SIZES['2xl'];
      default:
        return FONT_SIZES.base;
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const dimension = getSize();

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[
          styles.avatar,
          { width: dimension, height: dimension, borderRadius: dimension / 2 },
          style,
        ]}
      />
    );
  }

  if (name) {
    return (
      <View
        style={[
          styles.avatar,
          styles.avatarPlaceholder,
          { width: dimension, height: dimension, borderRadius: dimension / 2 },
          style,
        ]}
      >
        <Text style={[styles.initials, { fontSize: getFontSize() }]}>
          {getInitials(name)}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        styles.avatarPlaceholder,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
        style,
      ]}
    >
      <User size={dimension * 0.5} color={COLORS.textInverse} />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: COLORS.primary,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHTS.bold,
  },
});

export default Avatar;
