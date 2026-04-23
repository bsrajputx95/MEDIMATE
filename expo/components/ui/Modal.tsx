import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal as RNModal,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOWS, ANIMATION } from '@/constants/design-tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  size = 'md',
  children,
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, ANIMATION.spring.gentle);
      backdropOpacity.value = withTiming(0.5, { duration: ANIMATION.duration.normal });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: ANIMATION.duration.normal });
      backdropOpacity.value = withTiming(0, { duration: ANIMATION.duration.normal });
    }
  }, [visible]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { maxHeight: SCREEN_HEIGHT * 0.4 };
      case 'md':
        return { maxHeight: SCREEN_HEIGHT * 0.6 };
      case 'lg':
        return { maxHeight: SCREEN_HEIGHT * 0.8 };
      case 'full':
        return { flex: 1 };
      default:
        return {};
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>
        
        <Animated.View style={[styles.modalContainer, getSizeStyles(), animatedModalStyle]}>
          <View style={styles.handle} />
          
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.neutral[900],
  },
  backdropPressable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS['3xl'],
    borderTopRightRadius: RADIUS['3xl'],
    ...SHADOWS.xl,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.neutral[300],
    borderRadius: RADIUS.full,
    alignSelf: 'center',
    marginTop: SPACING[3],
    marginBottom: SPACING[2],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING[1],
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
  },
});

export default Modal;
