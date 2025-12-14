import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  username?: string;
  isGuest?: boolean;
  [key: string]: any;
}

interface UserProfileContextValue {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setProfile: (next: UserProfile) => Promise<void>;
  getFullName: () => string;
  clearProfile: () => Promise<void>;
  isGuest: () => boolean;
  setGuestMode: (isGuest: boolean) => Promise<void>;
}

const STORAGE_KEY = 'resqline_user_profile';

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>({});

  // load from secure store once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (!mounted) return;
        if (raw) {
          setProfileState(JSON.parse(raw));
        }
      } catch (err) {
        console.warn('Failed to load user profile from SecureStore:', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // set full profile and persist
  const setProfile = async (next: UserProfile) => {
    try {
      setProfileState(next);
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.warn('Failed to persist profile to SecureStore:', err);
    }
  };

  // merge partial updates and persist
  const updateProfile = async (updates: Partial<UserProfile>) => {
    // use functional update so we always merge against latest state
    setProfileState(prev => {
      const next = { ...(prev || {}), ...(updates || {}) };
      // persist in background (await not required here)
      SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next)).catch(err =>
        console.warn('Failed to persist profile to SecureStore:', err)
      );
      return next;
    });
  };

  const clearProfile = async () => {
    try {
      setProfileState({});
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear profile from SecureStore:', err);
    }
  };

  const getFullName = () => {
    const fn = profile.firstName?.trim() ?? '';
    const ln = profile.lastName?.trim() ?? '';
    if (!fn && !ln) return '';
    return `${fn}${fn && ln ? ' ' : ''}${ln}`.trim();
  };

  const isGuest = () => {
    return profile.isGuest === true;
  };

  const setGuestMode = async (guest: boolean) => {
    await updateProfile({ isGuest: guest });
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        updateProfile,
        setProfile,
        getFullName,
        clearProfile,
        isGuest,
        setGuestMode,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextValue => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within a UserProfileProvider');
  return ctx;
};