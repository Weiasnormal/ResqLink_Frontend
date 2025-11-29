import { useRef } from 'react';
import { Animated, Easing } from 'react-native';

export interface FadeInConfig {
  duration?: number;
  delay?: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
}

export const useFadeIn = (config: FadeInConfig = {}) => {
  const {
    duration = 500,
    delay = 0,
    easing = Easing.out(Easing.ease),
    useNativeDriver = true,
  } = config;

  const opacity = useRef(new Animated.Value(0)).current;

  const fadeIn = (callback?: () => void) => {
    const animation = Animated.timing(opacity, {
      toValue: 1,
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
    opacity.setValue(0);
  };

  return {
    opacity,
    fadeIn,
    reset,
    animatedStyle: { opacity },
  };
};