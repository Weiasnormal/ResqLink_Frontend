import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProfileProvider } from '../../src/contexts/UserProfileContext';

const WelcomeScreen = ({ navigation }: any) => {
  return (
    <UserProfileProvider>
      <LinearGradient colors={['#FF9427', '#F57C00']} style={styles.container}>
        <View style={styles.content}>
          {/* Logo */}
          <Text style={styles.logo}>🏠 ResqLine</Text>

          {/* Illustration Placeholder */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../assets/Welcome-Illustration.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* White Section */}
          <View style={styles.whiteSection}>
            {/* Tagline */}
            <Text style={styles.tagline}>
              Stay Alert. Stay Connected. Stay Safe.
            </Text>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.signUpText}>Sign up</Text>
            </TouchableOpacity>

            {/* Log In Button */}
            <TouchableOpacity
              style={styles.logInButton}
              onPress={() => navigation.navigate('LogIn')}
            >
              <Text style={styles.logInText}>Log In</Text>
            </TouchableOpacity>

            {/* Continue as Guest Button */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </UserProfileProvider>
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
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  illustration: {
    width: 250,
    height: 250,
  },
  whiteSection: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    gap: 12,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  signUpButton: {
    width: '100%',
    backgroundColor: '#FF9427',
    borderRadius: 8,
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
    borderRadius: 8,
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

