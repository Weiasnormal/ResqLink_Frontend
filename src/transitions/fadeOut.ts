import { useRef } from 'react';
import { Animated, Easing } from 'react-native';

export interface FadeOutConfig {
  duration?: number;
  delay?: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
}

export const useFadeOut = (config: FadeOutConfig = {}) => {
  const {
    duration = 500,
    delay = 0,
    easing = Easing.out(Easing.ease),
    useNativeDriver = true,
  } = config;

  const opacity = useRef(new Animated.Value(1)).current;

  const fadeOut = (callback?: () => void) => {
    const animation = Animated.timing(opacity, {
      toValue: 0,
      duration,
      easing,
      useNativeDriver,
    });

    if (delay > 0) {
      Animated.sequence([
        Animated.delay(delay),
        animation,
      ]).start(callback);
    } else {
      animation.start(callback);
    }
  };

  const reset = () => {
    opacity.setValue(1);
  };

  return {
    opacity,
    fadeOut,
    reset,
    animatedStyle: { opacity },
  };
};