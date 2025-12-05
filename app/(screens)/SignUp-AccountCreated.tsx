import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserProfile } from '../_contexts/UserProfileContext';

const AccountCreated: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const firstName = params.firstName as string | undefined;
  const lastName = params.lastName as string | undefined;
  const phoneNumber = params.phoneNumber as string | undefined;
  const username = params.username as string | undefined;

  const { updateProfile } = useUserProfile();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.illustrationWrap}>
          {/* Placeholder PNG: add assets/check-placeholder.png */}
          <Image
            source={require('../../assets/CheckConfirmation.png')}
            style={styles.checkImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Account Created!</Text>
        <Text style={styles.subtitle}>Welcome to ResqLine! You're all set.</Text>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            const updates: Partial<any> = {};
            if (firstName) updates.firstName = firstName;
            if (lastName) updates.lastName = lastName;
            if (phoneNumber) updates.phoneNumber = phoneNumber;
            if (username) updates.username = username;
            if (Object.keys(updates).length) updateProfile(updates);
            router.replace('(tabs)?tab=home');
          }}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  illustrationWrap: { marginBottom: 28, width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  checkImage: { width: 140, height: 140, borderRadius: 70 },
  title: { fontSize: 30, fontFamily: 'OpenSans_700Bold', color: '#191716', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#191716', textAlign: 'center', marginBottom: 48, paddingHorizontal: 12 },
  continueButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    backgroundColor: '#FF9427',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueText: { color: '#fff', fontFamily: 'OpenSans_700Bold', fontSize: 16 },
});

export default AccountCreated;
