import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { TOKEN_KEY } from '../_api/config';
import { notificationManager, DomainEventType } from './notificationManager';

// check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    console.log('🔑 Auth Check - Token exists:', !!token);
    console.log('🔑 Token Key:', TOKEN_KEY);
    if (token) {
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    }
    return !!token;
  } catch (error) {
    console.error('❌ Error checking authentication:', error);
    return false;
  }
};

// if the user is already logged in, redirect to home screen
export const redirectIfAuthenticated = async () => {
  console.log('🔍 Checking if should redirect to home...');
  const authenticated = await isAuthenticated();
  if (authenticated) {
    
    console.log('✅ User authenticated, redirecting to home tab');
    router.replace({ pathname: '/(tabs)', params: { tab: 'home' } });
  } else {
    console.log('❌ User not authenticated, staying on current screen');
  }
};

// if the user is not logged in, redirect to welcome screen
export const requireAuthentication = async () => {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    router.replace('/WelcomeScreen');
  }
};

//for logout functionality
export const handleLogout = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    
    // Show logout notification
    await notificationManager.handleDomainEvent({
      eventId: Date.now().toString(),
      eventType: DomainEventType.UserLoggedOut,
      aggregateId: '',
      aggregateType: 'User',
      timestamp: new Date().toISOString(),
      data: {},
      correlationId: '',
    });
    
    router.replace('/WelcomeScreen');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
