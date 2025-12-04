import React, { useEffect, useRef, useState } from 'react';
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

interface Props {
  onBack: () => void;
  phoneNumber?: string;
  onSuccess?: () => void;
}

const LogInVerification: React.FC<Props> = ({ onBack, phoneNumber, onSuccess }) => {
  const { updateProfile } = useUserProfile();
  const [otpInputs, setOtpInputs] = useState(['', '', '', '']);
  const [otpCode, setOtpCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [resendTimer, setResendTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);
  const slideAnimation = useSlideIn({ direction: 'right', distance: 300, duration: 300 });
  const MAX_ATTEMPTS = 5;

  useEffect(() => {
    slideAnimation.slideIn();
  }, []);

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

  useEffect(() => {
    setOtpCode(otpInputs.join(''));
  }, [otpInputs]);

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 1) {
      const newOtpInputs = [...otpInputs];
      newOtpInputs[index] = numericValue;
      setOtpInputs(newOtpInputs);
      if (numericValue && index < 3) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otpInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const sendVerificationCode = async (phone: string) => {
    console.log('Sending verification code to:', phone);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const verifyOtpCode = async (code: string, phone: string) => {
    console.log('Verifying OTP code:', code, 'for phone:', phone);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return code === '1234';
  };

  const updatePhoneNumber = async (newPhoneNumber: string) => {
    try {
      console.log('Updating phone number in profile:', newPhoneNumber);
      await new Promise(resolve => setTimeout(resolve, 800));
      updateProfile({ phoneNumber: newPhoneNumber });
      return true;
    } catch (error) {
      throw new Error('Failed to update phone number');
    }
  };

  const handleResendCode = async () => {
    if (isTimerActive) return;
    try {
      setResendTimer(60);
      setIsTimerActive(true);
      setOtpInputs(['', '', '', '']);
      setAttempts(0);
      setIsLocked(false);
      inputRefs.current[0]?.focus();
      await sendVerificationCode(phoneNumber || '');
    } catch (error) {
      console.error('Resend failed', error);
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    }
  };

  const handleVerify = async () => {
    if (otpCode.length !== 4 || isLocked) return;
    try {
      setAttempts(prev => prev + 1);
      const isValid = await verifyOtpCode(otpCode, phoneNumber || '');
      if (isValid) {
        try {
          await updatePhoneNumber(phoneNumber || '');
          Alert.alert('Success!', 'You are logged in.', [
            { text: 'OK', onPress: () => (onSuccess ? onSuccess() : onBack()) },
          ]);
        } catch (updateError) {
          console.error('Failed to update phone number:', updateError);
          Alert.alert('Update Failed', 'OTP verified but failed to update your profile.', [{ text: 'OK' }]);
        }
      } else {
        setOtpInputs(['', '', '', '']);
        inputRefs.current[0]?.focus();
        if (attempts >= MAX_ATTEMPTS - 1) {
          setIsLocked(true);
          Alert.alert('Too Many Attempts', "You've reached the maximum number of attempts. Please request a new code.");
        } else {
          Alert.alert('Invalid Code', `Please check your code and try again. ${MAX_ATTEMPTS - attempts - 1} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error('Verification failed', error);
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffffff" />
        <Animated.View style={[styles.keyboardAvoidingView, { transform: [{ translateX: slideAnimation.translateX }] }]}>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.headerDivider} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.contentContainer}>
                <Text style={styles.mainTitle}>Verify Your Account</Text>
                <Text style={styles.subtitle}>
                  To verify and secure your account, enter the 4-digit code sent to your phone.
                </Text>

                <View style={styles.otpContainer}>
                  {otpInputs.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => { inputRefs.current[index] = ref; }}
                      style={[styles.otpInput, digit ? styles.otpInputFilled : {}, isLocked ? styles.otpInputLocked : {}]}
                      value={digit}
                      onChangeText={text => handleOtpChange(text, index)}
                      onKeyPress={event => handleKeyPress(event, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      editable={!isLocked}
                    />
                  ))}
                </View>

                <Text style={styles.helpText}>Didn't receive code? Check your messages.</Text>

                <TouchableOpacity
                  style={[styles.resendButton, isTimerActive ? styles.resendButtonDisabled : {}]}
                  onPress={handleResendCode}
                  disabled={isTimerActive}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendButtonText, isTimerActive ? styles.resendButtonTextDisabled : {}]}>
                    {isTimerActive ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                  </Text>
                </TouchableOpacity>

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

            <View style={styles.bottomContainer}>
              <TouchableOpacity
                style={[styles.verifyButton, otpCode.length !== 4 || isLocked ? styles.verifyButtonDisabled : {}]}
                onPress={handleVerify}
                disabled={otpCode.length !== 4 || isLocked}
              >
                <Text style={[styles.verifyButtonText, otpCode.length !== 4 || isLocked ? styles.verifyButtonTextDisabled : {}]}>
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
  container: { flex: 1, backgroundColor: '#ffffffff' },
  keyboardAvoidingView: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: { padding: 4 },
  headerDivider: { height: 1, backgroundColor: '#E5E5E5' },
  scrollView: { flex: 1 },
  contentContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 40 },
  mainTitle: { fontSize: 30, fontFamily: 'OpenSans_700Bold', color: '#191716', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#191716', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 30 },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: '#1f1e1eff',
    borderRadius: 12,
    fontSize: 24,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#000',
    backgroundColor: '#fff',
  },
  otpInputFilled: { borderColor: '#F57C00', backgroundColor: '#FFF9F0' },
  otpInputLocked: { backgroundColor: '#F5F5F5', color: '#999' },
  helpText: { fontSize: 12, color: '#666', textAlign: 'center' },
  resendButton: { alignItems: 'center', paddingVertical: 12 },
  resendButtonDisabled: { opacity: 0.6 },
  resendButtonText: { fontSize: 12, color: '#F57C00', fontFamily: 'OpenSans_600SemiBold',},
  resendButtonTextDisabled: { color: '#999' },
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
  warningText: { flex: 1, marginLeft: 8, fontSize: 14, color: '#FF4444', lineHeight: 18 },
  bottomContainer: { paddingHorizontal: 16, paddingBottom: 20, backgroundColor: '#fff' },
  verifyButton: { backgroundColor: '#F57C00', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  verifyButtonDisabled: { backgroundColor: '#E0E0E0' },
  verifyButtonText: { color: '#fff', fontSize: 16, fontFamily: 'OpenSans_700Bold',},
  verifyButtonTextDisabled: { color: '#999' },
});

export default LogInVerification;