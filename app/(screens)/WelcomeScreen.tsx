import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const WelcomeScreen: React.FC = () => {
  const router = useRouter();

  return (
    <LinearGradient colors={['#FF9427', '#F57C00']} style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/White-Logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logo}>ResqLine</Text>
        </View>

        {/* Illustration Placeholder */}
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

        {/* White Section */}
        <View style={styles.whiteSection}>
          
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
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  logoImage: {
    width: 34,
    height: 34,
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 20,
    marginTop: 40,
  },
  illustration: {
    width: 250,
    height: 250,
  },
  whiteSection: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 50,
    alignItems: 'center',
    gap: 25,
  },
  tagline: {
    fontSize: 24,
    fontWeight: 'regular',
    color: '#ffffffff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  signUpButton: {
    width: '100%',
    backgroundColor: '#FF9427',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
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

