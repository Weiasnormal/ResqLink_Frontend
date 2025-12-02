import { useRef } from 'react';
import { Animated, Easing } from 'react-native';

export interface ScaleInConfig {
  duration?: number;
  delay?: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
  fromScale?: number;
  toScale?: number;
}

export const useScaleIn = (config: ScaleInConfig = {}) => {
  const {
    duration = 600,
    delay = 0,
    easing = Easing.out(Easing.back(1.2)),
    useNativeDriver = true,
    fromScale = 0.95,
    toScale = 1,
  } = config;

  const scale = useRef(new Animated.Value(fromScale)).current;

  const scaleIn = (callback?: () => void) => {
    const animation = Animated.timing(scale, {
      toValue: toScale,
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
    scale.setValue(fromScale);
  };

  return {
    scale,
    scaleIn,
    reset,
    animatedStyle: { transform: [{ scale }] },
  };
};