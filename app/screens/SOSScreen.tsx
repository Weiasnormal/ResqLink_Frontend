import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../src/components/Header';
import SOSBody from '../../src/components/body/SOSBody';
import FooterNav from '../../src/components/FooterNav';

interface SOSScreenProps {
  onTabPress?: (tab: string) => void;
}

const SOSScreen = ({ onTabPress }: SOSScreenProps) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffffff" />
        <View style={styles.wrapper}>
          <Header title="SOS" />
          <View style={styles.body}>
            <SOSBody />
          </View>
          <FooterNav activeTab="sos" onTabPress={onTabPress} />
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

export default SOSScreen;

