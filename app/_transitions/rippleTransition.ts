import { useRef } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');
const SCREEN_DIAGONAL = Math.sqrt(width * width + height * height);

export interface CircularFadeTransitionConfig {
  duration?: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
}

export const useCircularFadeTransition = (config: CircularFadeTransitionConfig = {}) => {
  const {
    duration = 1200, // Slower transition
    easing = Easing.out(Easing.ease), // Smoother easing
    useNativeDriver = true,
  } = config;

  const maskScale = useRef(new Animated.Value(0)).current;

  const startTransition = (callback?: () => void) => {
    Animated.timing(maskScale, {
      toValue: 1,
      duration,
      easing,
      useNativeDriver,
    }).start(callback);
  };

  const reset = () => {
    maskScale.setValue(0);
  };

  // Calculate the radius needed to cover the entire screen from center
  const maxRadius = Math.sqrt((width/2) * (width/2) + (height/2) * (height/2)) * 1.5;

  const circularMaskStyle = {
    backgroundColor: '#FFFFFF',
    width: maxRadius * 2,
    height: maxRadius * 2,
    borderRadius: maxRadius,
    position: 'absolute' as const,
    left: width / 2 - maxRadius,
    top: height / 2 - maxRadius,
    transform: [
      {
        scale: maskScale,
      },
    ],
  };

  const maskContainerStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  };

  return {
    maskScale,
    startTransition,
    reset,
    circularMaskStyle,
    maskContainerStyle,
  };
};