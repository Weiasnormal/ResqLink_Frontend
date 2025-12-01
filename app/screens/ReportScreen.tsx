import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import ReportBody from '../components/body/ReportBody';
import FooterNav from '../components/FooterNav';

interface ReportScreenProps {
  onTabPress?: (tab: string) => void;
}

const ReportScreen = ({ onTabPress }: ReportScreenProps) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffffff" />
        <View style={styles.wrapper}>
          <Header title="Report" />
          <View style={styles.body}>
            <ReportBody />
          </View>
          <FooterNav activeTab="report" onTabPress={onTabPress} />
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

export default ReportScreen;