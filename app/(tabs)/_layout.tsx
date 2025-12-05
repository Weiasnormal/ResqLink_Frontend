import React, { useState, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';

import WelcomeScreen from '../(screens)/WelcomeScreen';
import ReportScreen from '../(screens)/ReportScreen';
import SOSScreen from '../(screens)/SOSScreen';
import HotlineScreen from '../(screens)/HotlineScreen';
import HomeScreen from '../(screens)/HomeScreen';
import ProfileScreen from '../(screens)/ProfileScreen';
import EditInformationScreen from '../(screens)/EditInformationScreen';
import ChangeNumberScreen from '../(screens)/ChangeNumberScreen';
import RecentReportScreen from '../(screens)/RecentReportScreen';
// Sign-up screens are routed separately; do not include them here
import { useLocalSearchParams } from 'expo-router';

import { useFonts, OpenSans_400Regular, OpenSans_600SemiBold, OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import { UserProfileProvider } from '../_contexts/UserProfileContext';

// Cast imported screen modules to a React component type that accepts any props
const Welcome = WelcomeScreen as React.ComponentType<any>;
const Report = ReportScreen as React.ComponentType<any>;
const SOS = SOSScreen as React.ComponentType<any>;
const Hotline = HotlineScreen as React.ComponentType<any>;
const Home = HomeScreen as React.ComponentType<any>;
const Profile = ProfileScreen as React.ComponentType<any>;
const EditInformation = EditInformationScreen as React.ComponentType<any>;
const ChangeNumber = ChangeNumberScreen as React.ComponentType<any>;
const RecentReport = RecentReportScreen as React.ComponentType<any>;

const TabsLayout = () => {
  const { tab } = useLocalSearchParams();
  const initialTab = Array.isArray(tab) ? tab[0] ?? 'welcome' : tab ?? 'welcome';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
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
      return <EditInformation onBack={handleBackFromEdit} />;
    }

    if (isChangingNumberFromProfile) {
      return <ChangeNumber onBack={handleBackFromChangeNumberProfile} />;
    }

    if (isViewingRecentReports) {
      return <RecentReport onBack={handleBackFromRecentReports} />;
    }

    switch (activeTab) {
      case 'welcome':
        return <Welcome onTabPress={handleTabPress} />;
      case 'sos':
        return <SOS onTabPress={handleTabPress} />;
      case 'hotline':
        return <Hotline onTabPress={handleTabPress} />;
      case 'report':
        return <Report onTabPress={handleTabPress} />;
      case 'profile':
        return <Profile onTabPress={handleTabPress} onEditInformation={handleEditInformation} onPhoneNumberPress={handlePhoneNumberPressFromProfile} onRecentReports={handleRecentReports} />;
      case 'home':
      default:
        return <Home onTabPress={handleTabPress} onRecentReports={handleRecentReports} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>{renderScreen()}</View>
  );
};

// Fonts wrapper: load Open Sans and set global default font for Text and TextInput
const AppWithFonts: React.FC = () => {
  const [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
    if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};

    const defaultFontFamily = 'OpenSans_400Regular';
    const textDefault = (Text as any).defaultProps.style;
    (Text as any).defaultProps.style = Array.isArray(textDefault) ? [{ fontFamily: defaultFontFamily }, ...textDefault] : [{ fontFamily: defaultFontFamily }, textDefault];

    const inputDefault = (TextInput as any).defaultProps.style;
    (TextInput as any).defaultProps.style = Array.isArray(inputDefault) ? [{ fontFamily: defaultFontFamily }, ...inputDefault] : [{ fontFamily: defaultFontFamily }, inputDefault];
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // Wrap TabsLayout with UserProfileProvider so useUserProfile() works
  return (
    <UserProfileProvider>
      <TabsLayout />
    </UserProfileProvider>
  );
};

export default AppWithFonts;
