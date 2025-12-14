import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WhiteLogo from '../../assets/White-Logo.svg';
import WelcomeIllustration from '../../assets/Welcome-Illustration1.svg';
import { redirectIfAuthenticated } from '../_utils/authGuard';
import { notificationManager, DomainEventType } from '../_utils/notificationManager';

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Redirect to home if already authenticated
    redirectIfAuthenticated();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9427', '#F57C00']} style={styles.fullGradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.top}>
            <View style={styles.logoContainer}>
              <WhiteLogo
                width={34}
                height={34}
              />
              <Text style={styles.logo}>ResqLine</Text>
            </View>
          </View>

          <View style={styles.center}>
            <View style={styles.illustrationContainer}>
              <WelcomeIllustration
                width={250}
                height={300}
              />
              <Text style={styles.tagline}>
                Stay Alert. Stay Connected. Stay Safe.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.bottomSection}>
        <StatusBar backgroundColor="#FF9427" barStyle="dark-content" />
        <View style={[styles.bottomContent, { paddingBottom: 25 + insets.bottom }]}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => {
              router.push('/SignUp-BasicInfo');
            }}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logInButton}
            onPress={() => router.push('/LogIn-Number')}
          >
            <Text style={styles.logInText}>Log In</Text>
          </TouchableOpacity>

          {/* Continue as Guest - Commented out */}
          {/* <TouchableOpacity
            style={styles.guestButton}
            onPress={async () => {
              // Show guest mode notification
              await notificationManager.handleDomainEvent({
                eventId: Date.now().toString(),
                eventType: DomainEventType.GuestModeActivated,
                aggregateId: '',
                aggregateType: 'User',
                timestamp: new Date().toISOString(),
                data: {},
                correlationId: '',
              });
              
              router.push({ pathname: '/(tabs)', params: { tab: 'home' } });
            }}
          >
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF9427' },
  safe: { flex: 1 },
  fullGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  top: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -60,
    paddingBottom:210,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  logo: {
    fontSize: 30,
    color: '#fff',
    marginLeft: 10,
    fontFamily: 'OpenSans_700Bold',
  },
  illustrationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  bottomContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: 'center',
    gap: 20,
    paddingBottom: 25,
  },
  tagline: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 20,
    fontFamily: 'OpenSans_400Regular',
  },
  signUpButton: {
    width: '100%',
    backgroundColor: '#FF9427',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'OpenSans_600SemiBold',
  },
  logInButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF9427',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingBottom: 10,
  },
  logInText: {
    color: '#FF9427',
    fontSize: 16,
    fontFamily: 'OpenSans_600SemiBold',
  },
  guestButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',

  },
  guestText: {
    color: '#FF9427',
    fontSize: 16,
    fontFamily: 'OpenSans_600SemiBold',
  },
});

export default WelcomeScreen;

