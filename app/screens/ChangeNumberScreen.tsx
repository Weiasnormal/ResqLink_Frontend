import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '../../src/contexts/UserProfileContext';
import { useSlideIn } from '../../src/transitions/slideIn';
import VerifyNumberScreen from './VerifyNumberScreen';

interface ChangeNumberScreenProps {
  onBack: () => void;
}

const ChangeNumberScreen: React.FC<ChangeNumberScreenProps> = ({ onBack }) => {
  const { profile } = useUserProfile();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [showVerifyScreen, setShowVerifyScreen] = useState(false);
  
  const slideAnimation = useSlideIn({ 
    direction: 'right', 
    distance: 300, 
    duration: 300 
  });
  
  useEffect(() => {
    slideAnimation.slideIn();
  }, []);

  const validatePhoneNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 11) {
      return 'Phone number must be 10-11 digits';
    }
    return '';
  };

  const handlePhoneNumberChange = (text: string) => {
    // Only allow numeric input
    const numericText = text.replace(/\D/g, '');
    setPhoneNumber(numericText);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const handleChangeNumber = () => {
    const error = validatePhoneNumber(phoneNumber);
    if (error) {
      setValidationError(error);
      return;
    }
    
    console.log('Proceeding to verify number:', phoneNumber);
    setShowVerifyScreen(true);
  };

  const handleBackFromVerify = () => {
    setShowVerifyScreen(false);
  };

  const handleBack = () => {
    if (isAnimatingOut) return; // Prevent multiple taps
    
    setIsAnimatingOut(true);
    
    Animated.timing(slideAnimation.translateX, {
      toValue: 300,
      duration: 250, 
      useNativeDriver: true,
    }).start(() => {
      onBack(); 
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffffff" />
        <Animated.View style={[
          styles.keyboardAvoidingView, 
          {
            transform: [
              { translateX: slideAnimation.translateX }
            ]
          }
        ]}>
          <KeyboardAvoidingView 
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Phone Number</Text>
              <View style={styles.headerSpacer} />
            </View>
            
            {/* Header Divider */}
            <View style={styles.headerDivider} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Main Content */}
              <View style={styles.contentContainer}>
                {/* Main Title */}
                <Text style={styles.mainTitle}>
                  Change your current{'\n'}Phone number?
                </Text>

                {/* Phone Input Row */}
                <View style={styles.phoneInputContainer}>
                  {/* Country Code Selector */}
                  <View style={styles.countrySelector}>
                    <Text style={styles.flagEmoji}>🇵🇭</Text>
                    <Text style={styles.countryCode}>+63</Text>
                  </View>

                  {/* Phone Number Input */}
                  <View style={styles.phoneInputWrapper}>
                    <TextInput
                      style={[
                        styles.phoneInput,
                        validationError ? styles.phoneInputError : {}
                      ]}
                      placeholder="New phone number"
                      value={phoneNumber}
                      onChangeText={handlePhoneNumberChange}
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={11}
                    />
                  </View>
                </View>

                {/* Validation Error */}
                {validationError ? (
                  <Text style={styles.errorText}>{validationError}</Text>
                ) : null}
              </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
              <TouchableOpacity 
                style={[
                  styles.changeButton,
                  !phoneNumber.trim() ? styles.changeButtonDisabled : {}
                ]} 
                onPress={handleChangeNumber}
                disabled={!phoneNumber.trim()}
              >
                <Text style={styles.changeButtonText}>Change Number</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
        
        {/* Overlay VerifyNumberScreen */}
        {showVerifyScreen && (
          <View style={styles.overlay}>
            <VerifyNumberScreen 
              onBack={handleBackFromVerify} 
              phoneNumber={phoneNumber}
              onSuccess={() => {
                setShowVerifyScreen(false);
                // Navigate back to previous screen (EditInformationScreen or ProfileScreen)
                handleBack();
              }}
            />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSpacer: {
    width: 32, 
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
    lineHeight: 36,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minWidth: 80,
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  phoneInputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF8F8',
  },
  errorText: {
    fontSize: 14,
    color: '#FF4444',
    marginTop: 8,
    marginLeft: 4,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom:60,
    backgroundColor: '#fff',
  },
  changeButton: {
    backgroundColor: '#F57C00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  changeButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
});

export default ChangeNumberScreen;

