import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FooterNav = () => {
  const handleNavPress = (screen: string) => {
    console.log(`Navigate to ${screen}`);
    // Add navigation logic here when implementing with navigation library
  };

  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', key: 'home' },
    { name: 'Report', icon: 'document-text-outline', activeIcon: 'document-text', key: 'report' },
    { name: 'SOS', icon: 'ellipse', activeIcon: 'ellipse', key: 'sos', isSpecial: true },
    { name: 'Hotline', icon: 'call-outline', activeIcon: 'call', key: 'hotline' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', key: 'profile' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.tabItem, item.isSpecial && styles.specialTab]}
            onPress={() => handleNavPress(item.key)}
          >
            {item.isSpecial ? (
              <View style={styles.sosButton}>
              </View>
            ) : (
              <Ionicons
                name={item.key === 'report' ? item.activeIcon as any : item.icon as any}
                size={24}
                color={item.key === 'report' ? '#000' : '#999'}
              />
            )}
            <Text style={[
              styles.tabLabel,
              item.key === 'report' && styles.activeTabLabel,
              item.isSpecial && styles.sosLabel
            ]}>
              {item.name}
            </Text>
            {item.key === 'report' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  tabBar: {
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  specialTab: {
    position: 'relative',
  },
  sosButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#000',
    fontWeight: '600',
  },
  sosLabel: {
    color: '#FF4444',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
  },
});

export default FooterNav;