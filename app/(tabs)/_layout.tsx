import React, { useState } from 'react';
import { View } from 'react-native';

// Import screens
import ReportScreen from '../screens/ReportScreen';
import SOSScreen from '../screens/SOSScreen';
import HotlineScreen from '../screens/HotlineScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditInformationScreen from '../screens/EditInformationScreen';
import { UserProfileProvider } from '../contexts/UserProfileContext';

const TabsLayout = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    setIsEditingProfile(false); 
  };

  const handleEditInformation = () => {
    setIsEditingProfile(true);
  };

  const handleBackFromEdit = () => {
    setIsEditingProfile(false);
  };

  const renderScreen = () => {
    // Show EditInformationScreen when editing profile
    if (isEditingProfile) {
      return <EditInformationScreen onBack={handleBackFromEdit} />;
    }

    switch (activeTab) {
      case 'sos':
        return <SOSScreen onTabPress={handleTabPress} />;
      case 'hotline':
        return <HotlineScreen onTabPress={handleTabPress} />;
      case 'report':
        return <ReportScreen onTabPress={handleTabPress} />;
      case 'profile':
        return <ProfileScreen onTabPress={handleTabPress} onEditInformation={handleEditInformation} />;
      case 'home':
      default:
        return <HomeScreen onTabPress={handleTabPress} />;
    }
  };

  return (
    <UserProfileProvider>
      <View style={{ flex: 1 }}>{renderScreen()}</View>
    </UserProfileProvider>
  );
};

export default TabsLayout;