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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSlideIn } from '../_transitions/slideIn';
import { useUserProfile } from '../_contexts/UserProfileContext';

// Import API hooks
import { useVerifyOtp, useGenerateOtp } from '../_hooks/useApi';
import { formatApiError } from '../_utils/apiHelpers';
import { notificationManager, DomainEventType } from '../_utils/notificationManager';

interface Props {
  onBack: () => void;
  phoneNumber?: string;
  onSuccess?: () => void;
}

const LogInVerification: React.FC<Props> = ({ onBack, phoneNumber, onSuccess }) => {
  const { updateProfile } = useUserProfile();
  const router = useRouter();
  const [otpInputs, setOtpInputs] = useState(['', '', '', '']);
  const [otpCode, setOtpCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [resendTimer, setResendTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);
  const slideAnimation = useSlideIn({ direction: 'right', distance: 300, duration: 300 });
  const MAX_ATTEMPTS = 5;

  // API hooks
  const verifyOtpMutation = useVerifyOtp();
  const generateOtpMutation = useGenerateOtp();

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



  const handleResendCode = async () => {
    if (isTimerActive || generateOtpMutation.isPending) return;
    try {
      const result = await generateOtpMutation.mutateAsync({
        mobileNumber: phoneNumber || '',
      });

      if (result.success) {
        setResendTimer(60);
        setIsTimerActive(true);
        setOtpInputs(['', '', '', '']);
        setAttempts(0);
        setIsLocked(false);
        inputRefs.current[0]?.focus();
        
        Alert.alert('Code Sent', 'A new verification code has been sent to your phone.');
      }
    } catch (error: any) {
      const errorMessage = formatApiError(error.message || 'Failed to resend code');
      Alert.alert('Resend Failed', errorMessage);
    }
  };

  const handleVerify = async () => {
    if (otpCode.length !== 4 || isLocked || verifyOtpMutation.isPending) return;
    
    try {
      const result = await verifyOtpMutation.mutateAsync({
        mobileNumber: phoneNumber || '',
        otp: otpCode,
      });

      if (result.success) {
        // Update user profile context
        await updateProfile({ phoneNumber: phoneNumber || '' });
        
        // Show login success notification
        await notificationManager.handleDomainEvent({
          eventId: Date.now().toString(),
          eventType: DomainEventType.UserLoggedIn,
          aggregateId: '',
          aggregateType: 'User',
          timestamp: new Date().toISOString(),
          data: { phoneNumber: phoneNumber || '' },
          correlationId: '',
        });
        
        // Navigate directly to home - user is logged in
        router.replace({ pathname: '/(tabs)', params: { tab: 'home' } });
      }
    } catch (error: any) {
      setAttempts(prev => prev + 1);
      setOtpInputs(['', '', '', '']);
      inputRefs.current[0]?.focus();
      
      if (attempts >= MAX_ATTEMPTS - 1) {
        setIsLocked(true);
        Alert.alert('Too Many Attempts', "You've reached the maximum number of attempts. Please request a new code.");
      } else {
        const errorMessage = formatApiError(error.message || 'Verification failed');
        Alert.alert('Invalid Code', `${errorMessage} ${MAX_ATTEMPTS - attempts - 1} attempts remaining.`);
      }
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
                      style={[
                        styles.otpInput, 
                        digit ? styles.otpInputFilled : {}, 
                        (isLocked || verifyOtpMutation.isPending) ? styles.otpInputLocked : {}
                      ]}
                      value={digit}
                      onChangeText={text => handleOtpChange(text, index)}
                      onKeyPress={event => handleKeyPress(event, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      editable={!isLocked && !verifyOtpMutation.isPending}
                    />
                  ))}
                </View>

                <Text style={styles.helpText}>Didn't receive code? Check your messages.</Text>

                {/* Loading indicator */}
                {(verifyOtpMutation.isPending || generateOtpMutation.isPending) && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FF9427" />
                    <Text style={styles.loadingText}>
                      {verifyOtpMutation.isPending ? 'Verifying...' : 'Sending code...'}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.resendButton, (isTimerActive || generateOtpMutation.isPending) ? styles.resendButtonDisabled : {}]}
                  onPress={handleResendCode}
                  disabled={isTimerActive || generateOtpMutation.isPending}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendButtonText, (isTimerActive || generateOtpMutation.isPending) ? styles.resendButtonTextDisabled : {}]}>
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
                style={[styles.verifyButton, (otpCode.length !== 4 || isLocked || verifyOtpMutation.isPending) ? styles.verifyButtonDisabled : {}]}
                onPress={handleVerify}
                disabled={otpCode.length !== 4 || isLocked || verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending ? (
                  <View style={styles.buttonLoadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={[styles.verifyButtonText, { marginLeft: 8 }]}>Verifying...</Text>
                  </View>
                ) : (
                  <Text style={[styles.verifyButtonText, (otpCode.length !== 4 || isLocked) ? styles.verifyButtonTextDisabled : {}]}>
                    Verify
                  </Text>
                )}
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontFamily: 'OpenSans_400Regular',
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default LogInVerification;