import React, { useState } from 'react';
import { View } from 'react-native';

// Import screens
import ReportScreen from '../screens/ReportScreen';
import SOSScreen from '../screens/SOSScreen';
import HotlineScreen from '../screens/HotlineScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditInformationScreen from '../screens/EditInformationScreen';
import ChangeNumberScreen from '../screens/ChangeNumberScreen';
import { UserProfileProvider } from '../contexts/UserProfileContext';

const TabsLayout = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingNumberFromProfile, setIsChangingNumberFromProfile] = useState(false);

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

  const handlePhoneNumberPressFromProfile = () => {
    setIsChangingNumberFromProfile(true);
  };

  const handleBackFromChangeNumberProfile = () => {
    setIsChangingNumberFromProfile(false);
  };

  const renderScreen = () => {

    if (isEditingProfile) {
      return <EditInformationScreen onBack={handleBackFromEdit} />;
    }

    
    if (isChangingNumberFromProfile) {
      return <ChangeNumberScreen onBack={handleBackFromChangeNumberProfile} />;
    }

    switch (activeTab) {
      case 'sos':
        return <SOSScreen onTabPress={handleTabPress} />;
      case 'hotline':
        return <HotlineScreen onTabPress={handleTabPress} />;
      case 'report':
        return <ReportScreen onTabPress={handleTabPress} />;
      case 'profile':
        return <ProfileScreen onTabPress={handleTabPress} onEditInformation={handleEditInformation} onPhoneNumberPress={handlePhoneNumberPressFromProfile} />;
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