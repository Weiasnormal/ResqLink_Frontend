import React, { useEffect, useState } from 'react';
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
import { useSlideIn } from '../_transitions/slideIn';
import LogInVerification from './LogIn-Verification';
import { useRouter } from 'expo-router';
import InlineTextField from '../components/inputs/InlineTextField';

const LogInNumber: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [showVerifyScreen, setShowVerifyScreen] = useState(false);

  const slideAnimation = useSlideIn({
    direction: 'right',
    distance: 300,
    duration: 300,
  });

  const router = useRouter();

  useEffect(() => {
    slideAnimation.slideIn();
  }, []);

  const validatePhoneNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 10) {
      return 'Phone number must be 10 digits';
    }
    return '';
  };

  const handlePhoneNumberChange = (text: string) => {
    const numericText = text.replace(/\D/g, '');
    setPhoneNumber(numericText);
    if (validationError) setValidationError('');
  };

  const handleContinue = () => {
    const error = validatePhoneNumber(phoneNumber);
    if (error) {
      setValidationError(error);
      return;
    }
    // Show verification overlay
    setShowVerifyScreen(true);
  };

  const handleBackFromVerify = () => {
    setShowVerifyScreen(false);
  };

  const handleBack = () => {
    if (isAnimatingOut) return;
    setIsAnimatingOut(true);
    Animated.timing(slideAnimation.translateX, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffffff" />
        <Animated.View
          style={[
            styles.keyboardAvoidingView,
            { transform: [{ translateX: slideAnimation.translateX }] },
          ]}
        >
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.contentContainer}>
                {/* big left-aligned title */}
                <Text style={styles.title}>Welcome Back to ResqLine!</Text>

                <Text style={styles.subtitle}>
                  Quickly access your account to report emergencies and stay safe.
                </Text>

                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.flagEmoji}>🇵🇭</Text>
                    <Text style={styles.countryCode}>+63</Text>
                  </View>

                  <View style={styles.phoneInputWrapper}>
                    <InlineTextField
                      label="Phone number"
                      value={phoneNumber}
                      onChangeText={handlePhoneNumberChange}
                      containerStyle={{}}
                      keyboardType="numeric"
                      maxLength={10}
                      focusColor="#FF9427"
                      baseLabelColor="#999"
                      onBlur={() => {
                        const err = validatePhoneNumber(phoneNumber);
                        setValidationError(err);
                      }}
                    />
                  </View>
                </View>

                {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}

                <Text style={styles.termsText}>
                  By entering an account, you agree to the{' '}
                  <Text style={styles.termsLink}>Terms and Conditions</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </ScrollView>

            <View style={styles.bottomContainer}>
              <TouchableOpacity
                style={[styles.continueButton, !phoneNumber.trim() ? styles.continueButtonDisabled : {}]}
                onPress={handleContinue}
                disabled={!phoneNumber.trim()}
              >
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>

        {showVerifyScreen && (
          <View style={styles.overlay}>
            <LogInVerification
              phoneNumber={phoneNumber}
              onBack={handleBackFromVerify}
              onSuccess={() => {
                setShowVerifyScreen(false);
                // On successful verification navigate into the app
                router.replace('(tabs)?tab=home');
              }}
            />
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: '#fff',
  },
  backButton: { padding: 4 },
  headerSpacer: { width: 32 },

  scrollView: { flex: 1 },
  contentContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 32, paddingBottom: 20 },
  title: {
    fontSize: 30,
    lineHeight: 40,
    fontFamily: 'OpenSans_700Bold',
    color: '#000',
    textAlign: 'left',
    marginBottom: 6,
  },
  subtitle: { fontSize: 16, color: '#191919', textAlign: 'left', marginBottom: 20, lineHeight: 22 },
  phoneInputContainer: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#cce5ff',
  },
  flagEmoji: { fontSize: 16, marginRight: 6 },
  countryCode: { fontSize: 16, color: '#000', fontFamily: 'OpenSans_400Regular',},
  phoneInputWrapper: { flex: 1 },
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
  phoneInputError: { borderColor: '#FF4444', backgroundColor: '#FFF8F8' },
  errorText: { fontSize: 14, color: '#FF4444', marginTop: 8, marginLeft: 4 },
  termsText: { marginTop: 24, fontSize: 12, color: '#999', textAlign: 'center' },
  bottomContainer: { paddingHorizontal: 16, paddingBottom: 36, backgroundColor: '#fff' },
  continueButton: {
    backgroundColor: '#F57C00',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },

  termsLink: {
    color: '#FF9427',
    fontFamily: 'OpenSans_600SemiBold',
  },
  continueButtonDisabled: { backgroundColor: '#E0E0E0' },
  continueText: { color: '#fff', fontSize: 16, fontFamily: 'OpenSans_700Bold',},
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

export default LogInNumber;