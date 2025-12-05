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
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSlideIn } from '../_transitions/slideIn';
import { useUserProfile } from '../_contexts/UserProfileContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Props {
  onBack?: () => void;
  onSuccess?: () => void;
}

const SignUpVerification: React.FC<Props> = ({ onBack, onSuccess }) => {
  const params = useLocalSearchParams();
  const phoneNumber = (params.phoneNumber as string) ?? '';
  const firstName = (params.firstName as string) ?? '';
  const lastName = (params.lastName as string) ?? '';

  const { updateProfile } = useUserProfile();
  const router = useRouter();

  const [digits, setDigits] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(15);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const slideAnimation = useSlideIn({ direction: 'right', distance: 300, duration: 280 });

  useEffect(() => {
    slideAnimation.slideIn();
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      t = setInterval(() => setTimer(p => (p > 0 ? p - 1 : 0)), 1000);
    } else {
      setIsTimerActive(false);
    }
    return () => clearInterval(t);
  }, [isTimerActive, timer]);

  const code = digits.join('');

  useEffect(() => {
    if (code.length === 4) {
      // optional: auto-verify after short delay
    }
  }, [code]);

  const handleChange = (value: string, ix: number) => {
    const numeric = value.replace(/[^0-9]/g, '');
    if (numeric.length > 1) {
      // If user pastes full code, distribute
      const chars = numeric.split('').slice(0, 4);
      const next = [...digits];
      for (let i = 0; i < chars.length; i++) next[i + ix] = chars[i];
      setDigits(next);
      const nextIndex = ix + chars.length - 1;
      inputRefs.current[Math.min(nextIndex + 1, 3)]?.focus();
      return;
    }

    const next = [...digits];
    next[ix] = numeric;
    setDigits(next);
    if (numeric && ix < 3) inputRefs.current[ix + 1]?.focus();
  };

  const handleKeyPress = (e: any, ix: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[ix] && ix > 0) {
      inputRefs.current[ix - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (isTimerActive) return;
    try {
      setTimer(60);
      setIsTimerActive(true);
      setDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
      await sendVerificationCode(phoneNumber);
      Alert.alert('Sent', `Verification code resent to ${phoneNumber || 'your number'}.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to resend code. Try again.');
    }
  };

  const handleVerify = async () => {
    if (isLocked || code.length !== 4) return;
    setAttempts(a => a + 1);

    try {
      const ok = await verifyOtpCode(code, phoneNumber);
      if (!ok) {
        if (attempts + 1 >= 5) {
          setIsLocked(true);
          Alert.alert('Locked', 'Too many attempts. Please request a new code.');
        } else {
          setDigits(['', '', '', '']);
          inputRefs.current[0]?.focus();
          Alert.alert('Invalid', `Code is incorrect. ${5 - (attempts + 1)} attempts left.`);
        }
        return;
      }

      // success path: navigate to Account Created and pass along the collected info
      if (onSuccess) onSuccess();
      else {
        const path = `(screens)/SignUp-AccountCreated?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&phoneNumber=${encodeURIComponent(phoneNumber)}`;
        router.push(path);
      }
    } catch (err) {
      Alert.alert('Error', 'Verification failed. Try again.');
    }
  };

  // Placeholder backend calls
  const sendVerificationCode = async (phone: string) => {
    console.log('sendVerificationCode ->', phone);
    await new Promise(r => setTimeout(r, 700));
    return true;
  };

  const verifyOtpCode = async (codeToVerify: string, phone: string) => {
    console.log('verifyOtpCode', codeToVerify, phone);
    await new Promise(r => setTimeout(r, 700));
    return codeToVerify === '1234'; // demo only
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (isAnimatingOut) return;
    setIsAnimatingOut(true);
    Animated.timing(slideAnimation.translateX, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => router.back());
  };

  const isDisabled = code.length !== 4 || isLocked;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnimation.translateX }] }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backWrap}>
              <Ionicons name="chevron-back" size={22} color="#191716" />
            </TouchableOpacity>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.body}>
            <Text style={styles.title}>Verify Your Account</Text>
            <Text style={styles.subtitle}>
              To verify and secure your account, enter the 4-digit code sent to your phone.
            </Text>

            <View style={styles.otpRow}>
              {digits.map((d, i) => (
                <TextInput
                  key={i}
                  ref={(r: TextInput | null) => { inputRefs.current[i] = r; }}
                  value={d}
                  onChangeText={t => handleChange(t, i)}
                  onKeyPress={e => handleKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[styles.otpInput, d ? styles.otpFilled : null, isLocked ? styles.otpLocked : null]}
                  textAlign="center"
                  editable={!isLocked}
                />
              ))}
            </View>

            <Text style={styles.hint}>Didn't receive code? Check your messages.</Text>

            <TouchableOpacity onPress={handleResend} disabled={isTimerActive} style={styles.resendWrap}>
              <Text style={[styles.resendText, isTimerActive ? styles.resendDisabled : null]}>
                {isTimerActive ? `Resend Code (${timer}s)` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.verifyButton, isDisabled ? styles.verifyDisabled : null]} onPress={handleVerify} disabled={isDisabled}>
              <Text style={[styles.verifyText, isDisabled ? styles.verifyTextDisabled : null]}>Verify</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  flex: { flex: 1, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: '#fff',
  },
  backWrap: { padding: 4 },
  headerTitle: { fontSize: 14, fontFamily: 'OpenSans_600SemiBold', color: '#444' },
  body: { paddingHorizontal: 20, paddingTop: 20, flex: 1 },
  title: { fontSize: 30, fontFamily: 'OpenSans_700Bold', color: '#111', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#191716', textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 },
  otpInput: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D6D6',
    fontSize: 22,
    fontFamily: 'OpenSans_600SemiBold',
    backgroundColor: '#fff',
    color: '#111',
  },
  otpFilled: { borderColor: '#F57C00', backgroundColor: '#FFF9F0' },
  otpLocked: { backgroundColor: '#F5F5F5', color: '#999' as any },
  hint: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 10, marginTop: 10, fontFamily: 'OpenSans_600SemiBold' },
  resendWrap: { alignItems: 'center', marginBottom: 20 },
  resendText: { color: '#F57C00', fontFamily: 'OpenSans_600SemiBold', fontSize: 12 },
  resendDisabled: { color: '#999' },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  verifyButton: {
    backgroundColor: '#FF9427',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  verifyDisabled: { backgroundColor: '#E0E0E0' },
  verifyText: { color: '#fff', fontFamily: 'OpenSans_700Bold', fontSize: 16 },
  verifyTextDisabled: { color: '#fff' },
});

export default SignUpVerification;