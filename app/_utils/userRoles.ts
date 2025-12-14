import * as SecureStore from 'expo-secure-store';

export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
}

const USER_ROLE_KEY = 'resqline_user_role';

export const userRoleManager = {
  // Set user role
  setRole: async (role: UserRole): Promise<void> => {
    try {
      await SecureStore.setItemAsync(USER_ROLE_KEY, role);
    } catch (error) {
      console.error('Failed to set user role:', error);
    }
  },

  // Get current user role
  getRole: async (): Promise<UserRole> => {
    try {
      const role = await SecureStore.getItemAsync(USER_ROLE_KEY);
      return role === UserRole.USER ? UserRole.USER : UserRole.GUEST;
    } catch (error) {
      console.error('Failed to get user role:', error);
      return UserRole.GUEST;
    }
  },

  // Check if user is a guest
  isGuest: async (): Promise<boolean> => {
    const role = await userRoleManager.getRole();
    return role === UserRole.GUEST;
  },

  // Check if user is authenticated (registered/logged in)
  isAuthenticatedUser: async (): Promise<boolean> => {
    const role = await userRoleManager.getRole();
    return role === UserRole.USER;
  },

  // Clear user role (on logout)
  clearRole: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(USER_ROLE_KEY);
    } catch (error) {
      console.error('Failed to clear user role:', error);
    }
  },
};
