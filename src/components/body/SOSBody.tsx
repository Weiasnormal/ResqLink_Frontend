import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  PanResponder, 
  Linking,
  Alert,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SOSAlertModal from '../card_modal/SOSAlertModal';

const { width: screenWidth } = Dimensions.get('window');
const SLIDER_WIDTH = screenWidth - 60;
const BUTTON_SIZE = 60;
const SLIDE_THRESHOLD = SLIDER_WIDTH - BUTTON_SIZE - 10;

const SOSBody = () => {
  const [isSliding, setIsSliding] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fillAnimation = useRef(new Animated.Value(0)).current;
  const sosButtonScale = useRef(new Animated.Value(1)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsSliding(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        const clampedDx = Math.max(0, Math.min(dx, SLIDE_THRESHOLD));
        
        slideAnimation.setValue(clampedDx);
        fillAnimation.setValue(clampedDx / SLIDE_THRESHOLD);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;
        
        if (dx >= SLIDE_THRESHOLD * 0.8) {
          // Complete the slide
          Animated.parallel([
            Animated.timing(slideAnimation, {
              toValue: SLIDE_THRESHOLD,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(fillAnimation, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start(() => {
            handleEmergencyCall();
          });
        } else {
          // Reset the slide
          Animated.parallel([
            Animated.timing(slideAnimation, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(fillAnimation, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }),
          ]).start();
        }
        
        setIsSliding(false);
      },
    })
  ).current;

  const handleSOSPress = () => {
    // Enhanced press animation with depth effect
    Animated.sequence([
      // Press down - scale down and move slightly down/right to simulate depth
      Animated.timing(sosButtonScale, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      // Release - bounce back up with slight overshoot
      Animated.timing(sosButtonScale, {
        toValue: 1.08,
        duration: 120,
        useNativeDriver: true,
      }),
      // Settle back to normal
      Animated.timing(sosButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Show the SOS alert modal after animation completes
      setShowSOSModal(true);
    });
  };

  const handleCloseModal = () => {
    setShowSOSModal(false);
  };

  const handleEmergencyCall = async () => {
    try {
      const phoneNumber = 'tel:911';
      const supported = await Linking.canOpenURL(phoneNumber);
      
      if (supported) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to make emergency call. Please dial 911 manually.');
    }
    
    // Reset slider after call
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(fillAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start();
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* SOS Alert Section */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>SEND SOS ALERT</Text>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
          </View>
        </View>

        {/* SOS Button */}
        <View style={styles.sosButtonContainer}>
          <Animated.View style={[styles.sosButtonShadow, { transform: [{ scale: sosButtonScale }] }]}>
            <View style={styles.sosButtonDepth} />
            <TouchableOpacity style={styles.sosButton} onPress={handleSOSPress}>
              <Text style={styles.sosButtonText}>SOS</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Call 911 Section */}
        <View style={styles.callSection}>
          <Text style={styles.callTitle}>Call 911 (Direct Hotline)</Text>
          <Text style={styles.callSubtitle}>Speak directly with an emergency operator</Text>
        </View>

        {/* Slide to Call */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <Animated.View 
              style={[
                styles.sliderFill,
                {
                  width: fillAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} 
            />
            <Animated.View
              style={[
                styles.sliderButton,
                {
                  transform: [{ translateX: slideAnimation }],
                }
              ]}
              {...panResponder.panHandlers}
            >
              <Ionicons name="call" size={24} color="#fff" />
            </Animated.View>
            <View style={styles.sliderTextContainer}>
              <Text style={[styles.sliderText, isSliding && styles.sliderTextActive]}>
                Slide to Call
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={25} 
                color={isSliding ? "#fff" : "#000000ff"} 
                style={styles.arrowIcon} 
              />
            </View>
          </View>
        </View>
      </View>

      {/* SOS Alert Modal */}
      <SOSAlertModal 
        visible={showSOSModal} 
        onClose={handleCloseModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 60,
    alignItems: 'flex-start',
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginRight: 8,
    letterSpacing: 1,
  },
  sosButtonContainer: {
    marginBottom: 60,
    alignItems: 'center',
    position: 'relative',
  },
  sosButtonShadow: {
    position: 'relative',
  },
  sosButtonDepth: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#747070ff',
    top: 6,
    left: 6,
    zIndex: 0,
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4444',
    position: 'relative',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  sosButtonText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  callSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  callTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  callSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#FF4444',
    backgroundColor: '#fff',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#FF4444',
    borderRadius: 33,
  },
  sliderButton: {
    position: 'absolute',
    left: 5,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 30,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  },
  sliderTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  sliderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
    marginRight: 8,
    position: 'absolute',
  },
  sliderTextActive: {
    color: '#fff',
  },
  arrowIcon: {
    marginLeft: 4,
    paddingLeft: 230,
  },
});

export default SOSBody;