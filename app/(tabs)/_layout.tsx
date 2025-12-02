import React, { useState } from 'react';
import { View } from 'react-native';

import WelcomeScreen from '../screens/WelcomeScreen';
import ReportScreen from '../screens/ReportScreen';
import SOSScreen from '../screens/SOSScreen';
import HotlineScreen from '../screens/HotlineScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditInformationScreen from '../screens/EditInformationScreen';
import ChangeNumberScreen from '../screens/ChangeNumberScreen';
import RecentReportScreen from '../screens/RecentReportScreen';
import { UserProfileProvider } from '../../src/contexts/UserProfileContext';

const TabsLayout = () => {
  const [activeTab, setActiveTab] = useState('welcome');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingNumberFromProfile, setIsChangingNumberFromProfile] = useState(false);
  const [isViewingRecentReports, setIsViewingRecentReports] = useState(false);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    setIsEditingProfile(false);
    setIsViewingRecentReports(false);
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

  const handleRecentReports = () => {
    setIsViewingRecentReports(true);
  };

  const handleBackFromRecentReports = () => {
    setIsViewingRecentReports(false);
  };

  const renderScreen = () => {

    if (isEditingProfile) {
      return <EditInformationScreen onBack={handleBackFromEdit} />;
    }
    
    if (isChangingNumberFromProfile) {
      return <ChangeNumberScreen onBack={handleBackFromChangeNumberProfile} />;
    }

    if (isViewingRecentReports) {
      return <RecentReportScreen onBack={handleBackFromRecentReports} />;
    }

    switch (activeTab) {
      case 'welcome':
        return <WelcomeScreen navigation={{ navigate: handleTabPress }} />;
      case 'sos':
        return <SOSScreen onTabPress={handleTabPress} />;
      case 'hotline':
        return <HotlineScreen onTabPress={handleTabPress} />;
      case 'report':
        return <ReportScreen onTabPress={handleTabPress} />;
      case 'profile':
        return <ProfileScreen onTabPress={handleTabPress} onEditInformation={handleEditInformation} onPhoneNumberPress={handlePhoneNumberPressFromProfile} onRecentReports={handleRecentReports} />;
      case 'home':
      default:
        return <HomeScreen onTabPress={handleTabPress} onRecentReports={handleRecentReports} />;
    }
  };

  return (
    <UserProfileProvider>
      <View style={{ flex: 1 }}>{renderScreen()}</View>
    </UserProfileProvider>
  );
};

export default TabsLayout;
