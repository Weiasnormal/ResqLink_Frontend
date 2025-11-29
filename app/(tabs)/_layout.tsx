import React, { useState } from 'react';
import { View } from 'react-native';

// Import screens
import ReportScreen from '../screens/ReportScreen';
import SOSScreen from '../screens/SOSScreen';
import HotlineScreen from '../screens/HotlineScreen';
import HomeScreen from '../screens/HomeScreen';

const TabsLayout = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'sos':
        return <SOSScreen onTabPress={handleTabPress} />;
      case 'hotline':
        return <HotlineScreen onTabPress={handleTabPress} />;
      case 'report':
        return <ReportScreen onTabPress={handleTabPress} />;
      case 'home':
      default:
        return <HomeScreen onTabPress={handleTabPress} />;
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
};

export default TabsLayout;