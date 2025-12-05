import { useRef } from 'react';
import { Animated, Easing } from 'react-native';

export interface SlideInConfig {
  duration?: number;
  delay?: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export const useSlideIn = (config: SlideInConfig = {}) => {
  const {
    duration = 500,
    delay = 0,
    easing = Easing.out(Easing.ease),
    useNativeDriver = true,
    direction = 'up',
    distance = 50,
  } = config;

  const translateX = useRef(new Animated.Value(
    direction === 'left' ? -distance : direction === 'right' ? distance : 0
  )).current;
  
  const translateY = useRef(new Animated.Value(
    direction === 'up' ? distance : direction === 'down' ? -distance : 0
  )).current;

  const slideIn = (callback?: () => void) => {
    const animation = Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        easing,
        useNativeDriver,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        easing,
        useNativeDriver,
      }),
    ]);

    if (delay > 0) {
      Animated.sequence([
        Animated.delay(delay),
        animation,
      ]).start(callback);
    } else {
      animation.start(callback);
    }
  };

  const slideOut = (callback?: () => void) => {
    const animations = [];
    
    // Only animate the relevant axis to prevent conflicts
    if (direction === 'left' || direction === 'right') {
      const targetX = direction === 'left' ? -distance : distance;
      animations.push(
        Animated.timing(translateX, {
          toValue: targetX,
          duration,
          easing,
          useNativeDriver,
        })
      );
    }
    
    if (direction === 'up' || direction === 'down') {
      const targetY = direction === 'up' ? -distance : distance;
      animations.push(
        Animated.timing(translateY, {
          toValue: targetY,
          duration,
          easing,
          useNativeDriver,
        })
      );
    }

    // Use single animation if only one axis, parallel if both
    const animation = animations.length === 1 ? animations[0] : Animated.parallel(animations);
    animation.start(callback);
  };

  const reset = () => {
    translateX.setValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
    translateY.setValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
  };

  return {
    translateX,
    translateY,
    slideIn,
    slideOut,
    reset,
    animatedStyle: {
      transform: [
        { translateX },
        { translateY },
      ],
    },
  };
};