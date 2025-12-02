import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
}

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  getFullName: () => string;
}

const defaultProfile: UserProfile = {
  firstName: 'Wincel',
  lastName: 'Crusit',
  username: '',
  phoneNumber: '+63 909 246 5965',
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      ...updates,
    }));
  };

  const getFullName = () => {
    // Prioritize username if it's filled
    if (profile.username && profile.username.trim()) {
      return profile.username.trim();
    }
    
    if (!profile.firstName && !profile.lastName) {
      return 'Wincel Crusit'; // fallback
    }
    return `${profile.firstName} ${profile.lastName}`.trim();
  };

  const value: UserProfileContextType = {
    profile,
    updateProfile,
    getFullName,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export default UserProfileProvider;