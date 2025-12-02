import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSlideIn } from '../../src/transitions/slideIn';
import { useUserProfile } from '../../src/contexts/UserProfileContext';

interface VerifyNumberScreenProps {
  onBack: () => void;
  phoneNumber?: string; // The phone number being verified
  onSuccess?: () => void; // Called when phone number is successfully updated
}

const VerifyNumberScreen: React.FC<VerifyNumberScreenProps> = ({ onBack, phoneNumber, onSuccess }) => {
  const { updateProfile } = useUserProfile();
  const [otpInputs, setOtpInputs] = useState(['', '', '', '']);
  const [otpCode, setOtpCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [resendTimer, setResendTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const MAX_ATTEMPTS = 5;
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);
  
  const slideAnimation = useSlideIn({ 
    direction: 'right', 
    distance: 300, 
    duration: 300 
  });
  
  useEffect(() => {
    slideAnimation.slideIn();
  }, []);

  // Timer logic for resend code
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, resendTimer]);

  // Update otpCode when inputs change
  useEffect(() => {
    const code = otpInputs.join('');
    setOtpCode(code);
  }, [otpInputs]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newOtpInputs = [...otpInputs];
      newOtpInputs[index] = numericValue;
      setOtpInputs(newOtpInputs);
      
      // Auto-jump to next input
      if (numericValue && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    // Handle backspace - go to previous input
    if (event.nativeEvent.key === 'Backspace' && !otpInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (isTimerActive) return;
    
    try {
      // Reset timer
      setResendTimer(60);
      setIsTimerActive(true);
      
      // Clear current inputs
      setOtpInputs(['', '', '', '']);
      setAttempts(0);
      setIsLocked(false);
      
      // Focus first input
      inputRefs.current[0]?.focus();
      
      // Placeholder for backend integration
      await sendVerificationCode(phoneNumber || '');
      console.log('Verification code resent');
      
    } catch (error) {
      console.error('Failed to resend verification code:', error);
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    }
  };

  const handleVerify = async () => {
    if (otpCode.length !== 4 || isLocked) return;
    
    try {
      setAttempts(prev => prev + 1);
      
      // Placeholder for backend integration
      const isValid = await verifyOtpCode(otpCode, phoneNumber || '');
      
      if (isValid) {
        console.log('OTP verified successfully');
        
        try {
          // Update the user's phone number in the profile context
          await updatePhoneNumber(phoneNumber || '');
          
          // Show success message and navigate properly
          Alert.alert(
            'Success!', 
            'Your phone number has been updated successfully.',
            [{ text: 'OK', onPress: () => onSuccess ? onSuccess() : handleBack() }]
          );
        } catch (updateError) {
          console.error('Failed to update phone number:', updateError);
          Alert.alert(
            'Update Failed',
            'OTP verified but failed to update your phone number. Please try again or contact support.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log('Invalid OTP code');
        
        // Clear inputs
        setOtpInputs(['', '', '', '']);
        inputRefs.current[0]?.focus();
        
        // Check if max attempts reached
        if (attempts >= MAX_ATTEMPTS - 1) {
          setIsLocked(true);
          Alert.alert(
            'Too Many Attempts', 
            "You've reached the maximum number of attempts. Please request a new code."
          );
        } else {
          Alert.alert('Invalid Code', `Please check your code and try again. ${MAX_ATTEMPTS - attempts - 1} attempts remaining.`);
        }
      }
      
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    }
  };

  const handleBack = () => {
    if (isAnimatingOut) return; 
    
    setIsAnimatingOut(true);
    
    Animated.timing(slideAnimation.translateX, {
      toValue: 300,
      duration: 250, 
      useNativeDriver: true,
    }).start(() => {
      onBack(); 
    });
  };

  // Placeholder functions for backend integration
  const sendVerificationCode = async (phone: string) => {
    
    console.log('Sending verification code to:', phone);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const verifyOtpCode = async (code: string, phone: string) => {
    // TODO: Implement actual API call
    console.log('Verifying OTP code:', code, 'for phone:', phone);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // For demo purposes, return true if code is '1234'
    return code === '1234';
  };

  const updatePhoneNumber = async (newPhoneNumber: string) => {
    try {
      // TODO: Implement actual API call to update phone number in database
      console.log('Updating phone number in database:', newPhoneNumber);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the local profile context
      updateProfile({
        phoneNumber: newPhoneNumber
      });
      
      console.log('Phone number updated successfully in profile');
      return true;
    } catch (error) {
      console.error('Failed to update phone number:', error);
      throw new Error('Failed to update phone number in database');
    }
  };

  const isVerifyDisabled = otpCode.length !== 4 || isLocked;

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
                <Text style={styles.mainTitle}>Verify Your Number</Text>
                
                {/* Subtitle */}
                <Text style={styles.subtitle}>
                  To verify and secure your account, enter{"\n"} the 4-digit code sent to your phone.
                </Text>

                {/* OTP Input Boxes */}
                <View style={styles.otpContainer}>
                  {otpInputs.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => { inputRefs.current[index] = ref; }}
                      style={[
                        styles.otpInput,
                        digit ? styles.otpInputFilled : {},
                        isLocked ? styles.otpInputLocked : {}
                      ]}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(event) => handleKeyPress(event, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                      editable={!isLocked}
                    />
                  ))}
                </View>

                {/* Help Text */}
                <Text style={styles.helpText}>
                  Didn't receive code? Check your messages.
                </Text>

                {/* Resend Code */}
                <TouchableOpacity 
                  style={[
                    styles.resendButton,
                    isTimerActive ? styles.resendButtonDisabled : {}
                  ]}
                  onPress={handleResendCode}
                  disabled={isTimerActive}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.resendButtonText,
                    isTimerActive ? styles.resendButtonTextDisabled : {}
                  ]}>
                    {isTimerActive ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                  </Text>
                </TouchableOpacity>

                {/* Max Attempts Warning */}
                {isLocked && (
                  <View style={styles.warningContainer}>
                    <Ionicons name="warning-outline" size={20} color="#FF4444" />
                    <Text style={styles.warningText}>
                      You've reached the maximum number of attempts. Please request a new code.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
              <TouchableOpacity 
                style={[
                  styles.verifyButton,
                  isVerifyDisabled ? styles.verifyButtonDisabled : {}
                ]} 
                onPress={handleVerify}
                disabled={isVerifyDisabled}
              >
                <Text style={[
                  styles.verifyButtonText,
                  isVerifyDisabled ? styles.verifyButtonTextDisabled : {}
                ]}>
                  Verify
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
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
    paddingTop: 40,
  },
  mainTitle: {
    fontSize:32,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  otpInput: {
    width:50,
    height: 60,
    borderWidth: 1,
    borderColor: '#1f1e1eff',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: '#F57C00',
    backgroundColor: '#FFF9F0',
  },
  otpInputLocked: {
    backgroundColor: '#F5F5F5',
    color: '#999',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#F57C00',
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0',
    marginTop: 20,
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#FF4444',
    lineHeight: 18,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  verifyButton: {
    backgroundColor: '#F57C00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  verifyButtonTextDisabled: {
    color: '#999',
  },
});

export default VerifyNumberScreen;

