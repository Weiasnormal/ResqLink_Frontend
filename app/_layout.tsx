import { Stack } from 'expo-router';
import { UserProfileProvider } from '../src/contexts/UserProfileContext';

export default function RootLayout() {
  return (
    <UserProfileProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </UserProfileProvider>
  );
}