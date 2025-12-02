import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import FooterNav from '../../src/components/FooterNav';
import ProfileBody from '../../src/components/body/ProfileBody';

interface ProfileScreenProps {
  onTabPress: (tab: string) => void;
  onEditInformation?: () => void;
  onPhoneNumberPress?: () => void;
  onRecentReports?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onTabPress, onEditInformation, onPhoneNumberPress, onRecentReports }) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#FC8100" />
        <View style={styles.wrapper}>
          <View style={styles.body}>
            <ProfileBody 
              onTabPress={onTabPress} 
              onEditInformation={onEditInformation}
              onPhoneNumberPress={onPhoneNumberPress}
              onRecentReports={onRecentReports}
            />
          </View>
          
          <FooterNav activeTab="profile" onTabPress={onTabPress} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wrapper: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
});

export default ProfileScreen;

