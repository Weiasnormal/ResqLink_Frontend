import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#FF9427', '#F57C00']} style={styles.container}>
        <View style={styles.top}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/White-Logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logo}>ResqLine</Text>
          </View>
        </View>

        <View style={styles.center}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../assets/Welcome-Illustration.png')}
              style={styles.illustration}
              resizeMode="contain"
            />

            {/* Tagline */}
            <Text style={styles.tagline}>
              Stay Alert. Stay Connected. Stay Safe.
            </Text>
          </View>
        </View>

        {/* White Section */}
        <View style={[styles.whiteSection, { paddingBottom: 30 + insets.bottom }]}>
          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => {
              router.push('(screens)/SignUp-BasicInfo');
            }}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Log In Button */}
          <TouchableOpacity
            style={styles.logInButton}
            onPress={() => router.push('(screens)/LogIn-Number')}
          >
            <Text style={styles.logInText}>Log In</Text>
          </TouchableOpacity>

          {/* Continue as Guest Button */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => router.push('(tabs)?tab=home')}
          >
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FF9427' },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  top: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center', // centered logo/logoContainer
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  logoImage: {
    width: 34,
    height: 34,
  },
  logo: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
  },
  illustrationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  illustration: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  whiteSection: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 20,
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
    fontWeight: '600',
  },
  logInButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF9427',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logInText: {
    color: '#FF9427',
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '600',
  },
});

export default WelcomeScreen;

