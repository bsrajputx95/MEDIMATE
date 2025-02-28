import { Easing } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  FadeInUp, 
  FadeOutUp,
  FadeInDown,
  FadeOutDown,
  FadeInLeft,
  FadeOutLeft,
  FadeInRight,
  FadeOutRight,
  SlideInRight,
  SlideOutRight,
  SlideInLeft,
  SlideOutLeft,
  SlideInUp,
  SlideOutUp,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceOut,
  FlipInEasyX,
  FlipOutEasyX,
  FlipInEasyY,
  FlipOutEasyY,
} from 'react-native-reanimated';

// Standard entrance animations
export const EntranceAnimations = {
  fadeIn: FadeIn.duration(300),
  fadeInUp: FadeInUp.duration(300).springify(),
  fadeInDown: FadeInDown.duration(300).springify(),
  fadeInLeft: FadeInLeft.duration(300).springify(),
  fadeInRight: FadeInRight.duration(300).springify(),
  slideInRight: SlideInRight.duration(300).easing(Easing.out(Easing.cubic)),
  slideInLeft: SlideInLeft.duration(300).easing(Easing.out(Easing.cubic)),
  slideInUp: SlideInUp.duration(300).easing(Easing.out(Easing.cubic)),
  slideInDown: SlideInDown.duration(300).easing(Easing.out(Easing.cubic)),
  zoomIn: ZoomIn.duration(300).springify(),
  bounceIn: BounceIn.duration(500),
  flipInX: FlipInEasyX.duration(400),
  flipInY: FlipInEasyY.duration(400),
};

// Standard exit animations
export const ExitAnimations = {
  fadeOut: FadeOut.duration(200),
  fadeOutUp: FadeOutUp.duration(200),
  fadeOutDown: FadeOutDown.duration(200),
  fadeOutLeft: FadeOutLeft.duration(200),
  fadeOutRight: FadeOutRight.duration(200),
  slideOutRight: SlideOutRight.duration(250).easing(Easing.in(Easing.cubic)),
  slideOutLeft: SlideOutLeft.duration(250).easing(Easing.in(Easing.cubic)),
  slideOutUp: SlideOutUp.duration(250).easing(Easing.in(Easing.cubic)),
  slideOutDown: SlideOutDown.duration(250).easing(Easing.in(Easing.cubic)),
  zoomOut: ZoomOut.duration(200),
  bounceOut: BounceOut.duration(300),
  flipOutX: FlipOutEasyX.duration(300),
  flipOutY: FlipOutEasyY.duration(300),
};

// Staggered animation helper
export function createStaggeredDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}

// Screen transition presets
export const ScreenTransitions = {
  // Default fade transition
  default: {
    entering: FadeIn.duration(300),
    exiting: FadeOut.duration(200),
  },
  // Slide from right (for navigation forward)
  slideFromRight: {
    entering: SlideInRight.duration(300).easing(Easing.out(Easing.cubic)),
    exiting: SlideOutLeft.duration(250).easing(Easing.in(Easing.cubic)),
  },
  // Slide from left (for navigation back)
  slideFromLeft: {
    entering: SlideInLeft.duration(300).easing(Easing.out(Easing.cubic)),
    exiting: SlideOutRight.duration(250).easing(Easing.in(Easing.cubic)),
  },
  // Slide from bottom (for modals)
  slideFromBottom: {
    entering: SlideInUp.duration(350).easing(Easing.out(Easing.cubic)),
    exiting: SlideOutDown.duration(250).easing(Easing.in(Easing.cubic)),
  },
  // Fade with scale (for overlays)
  fadeScale: {
    entering: ZoomIn.duration(300).springify(),
    exiting: ZoomOut.duration(200),
  },
  // Card flip (for detail views)
  flip: {
    entering: FlipInEasyY.duration(400),
    exiting: FlipOutEasyY.duration(300),
  },
};

// List item animation helper
export function getListItemAnimation(index: number, direction: 'up' | 'down' | 'left' | 'right' = 'up') {
  const delay = createStaggeredDelay(index, 50);
  
  switch (direction) {
    case 'up':
      return FadeInUp.delay(delay).duration(300).springify();
    case 'down':
      return FadeInDown.delay(delay).duration(300).springify();
    case 'left':
      return FadeInLeft.delay(delay).duration(300).springify();
    case 'right':
      return FadeInRight.delay(delay).duration(300).springify();
  }
}

// Modal animation presets
export const ModalAnimations = {
  slideUp: {
    entering: SlideInUp.duration(350).easing(Easing.out(Easing.cubic)),
    exiting: SlideOutDown.duration(250).easing(Easing.in(Easing.cubic)),
  },
  fade: {
    entering: FadeIn.duration(250),
    exiting: FadeOut.duration(200),
  },
  scale: {
    entering: ZoomIn.duration(300).springify(),
    exiting: ZoomOut.duration(200),
  },
  bounce: {
    entering: BounceIn.duration(500),
    exiting: ZoomOut.duration(200),
  },
};

// Card animation presets
export const CardAnimations = {
  fadeIn: FadeIn.duration(300),
  slideUp: FadeInUp.duration(300).springify(),
  scaleIn: ZoomIn.duration(300).springify(),
  bounceIn: BounceIn.duration(500),
};

// Animation timing constants
export const AnimationTiming = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Easing presets
export const AnimationEasing = {
  easeIn: Easing.in(Easing.cubic),
  easeOut: Easing.out(Easing.cubic),
  easeInOut: Easing.inOut(Easing.cubic),
  linear: Easing.linear,
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
};
