import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/design-tokens';
import { Bot } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FloatingAssistantBotProps {
  onPress: () => void;
}

const FloatingAssistantBot: React.FC<FloatingAssistantBotProps> = ({ onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);
    };

    const createGlowAnimation = () => {
      return Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]);
    };

    const pulseLoop = Animated.loop(createPulseAnimation());
    const glowLoop = Animated.loop(createGlowAnimation());

    pulseLoop.start();
    glowLoop.start();

    return () => {
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, [pulseAnim, glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const bottomOffset = Platform.OS === 'web' ? 100 : 90 + insets.bottom;

  return (
    <View style={[styles.container, { bottom: bottomOffset, left: SPACING['2xl'] }]}>
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: glowOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.botContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.botButton}
          onPress={onPress}
          activeOpacity={0.8}
          testID="floating-assistant-bot"
        >
          <View style={styles.botIconContainer}>
            <Bot size={24} color={COLORS.textInverse} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  glowContainer: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    top: -5,
    left: -5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  botContainer: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
  },
  botButton: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  botIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingAssistantBot;