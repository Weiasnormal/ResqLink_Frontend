import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFadeOut, useCircularFadeTransition } from '../_transitions';

// Import SVG logos
import Logo from '../../assets/Logo.svg';
import LogoWhite from '../../assets/LogoWhite.svg';

const { width, height } = Dimensions.get('window');
const SCREEN_DIAGONAL = Math.sqrt(width * width + height * height);

// Prevent expo splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const IntroScreen: React.FC = () => {
  const [stage, setStage] = useState<'stage1' | 'stage2' | 'fadeOut'>('stage1');

  // Use reusable transition hooks
  const circularFade = useCircularFadeTransition({ duration: 800 });
  const finalFade = useFadeOut({ duration: 500 });

  useEffect(() => {
    const runIntroSequence = async () => {
      try {
        // Hide expo splash screen immediately
        await SplashScreen.hideAsync();
      } catch (error) {
        console.log('Splash screen already hidden');
      }

      // Stage 1: Display for 1 second
      setTimeout(() => {
        // Start circular fade transition
        circularFade.startTransition(() => {
          // Page 1 is now completely hidden, switch to stage 2
          setStage('stage2');
        });
      }, 1000);

      // Final fade out after circular transition completes + some time for stage 2
      setTimeout(() => {
        setStage('fadeOut');
        finalFade.fadeOut(() => {
          router.replace('/(tabs)?tab=welcome');
        });
      }, 3000); // 1s (stage1) + 1.2s (circular transition) + 0.8s (stage2 display) = 3s total
    };

    runIntroSequence();
  }, []);

  return (
    <Animated.View style={[styles.container, finalFade.animatedStyle]}>
      {/* Stage 1: Orange Background with White Logo - hide completely after circular transition */}
      {stage === 'stage1' && (
        <View style={styles.stage1Container}>
          <View style={styles.logoWhiteContainer}>
            <LogoWhite width={250} height={250} />
          </View>
        </View>
      )}

      {/* Stage 2: White Background with Colored Logo and Text - always rendered but behind stage1 initially */}
      <View style={styles.stage2Container}>
        <View style={styles.logoContainer}>
          <Logo width={250} height={250} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.appName}>ResqLine</Text>
        </View>
      </View>

      {/* Circular mask that reveals stage 2 by covering stage 1 - only during transition */}
      {stage === 'stage1' && (
        <View style={circularFade.maskContainerStyle}>
          <Animated.View style={circularFade.circularMaskStyle} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  stage1Container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F57C00',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoWhiteContainer: {
    padding: 20,
  },
  stage2Container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0, // Behind the orange page initially
  },

  logoContainer: {
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 30,
    fontFamily: 'OpenSans_700Bold',
    color: '#191716',
  },
});

export default IntroScreen;