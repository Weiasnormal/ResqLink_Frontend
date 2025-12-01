import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import HotlineBody from '../components/body/HotlineBody';
import FooterNav from '../components/FooterNav';

interface HotlineScreenProps {
  onTabPress?: (tab: string) => void;
}

const HotlineScreen = ({ onTabPress }: HotlineScreenProps) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffffff" />
        <View style={styles.wrapper}>
          <Header title="Hotline" />
          <View style={styles.body}>
            <HotlineBody />
          </View>
          <FooterNav activeTab="hotline" onTabPress={onTabPress} />
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

export default HotlineScreen;