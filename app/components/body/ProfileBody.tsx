import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { locationService, UserLocation } from '../../_services/locationService';
import { useUserProfile } from '../../_contexts/UserProfileContext';

import Profilebg from '../../../assets/Profilebg.svg';
import Profile from '../../../assets/Profile.svg';
import LogoutConfirm from '../overlays/LogoutConfirm';
import DeleteConfirm from '../overlays/DeleteConfirm';
import { useRouter } from 'expo-router';

interface ProfileBodyProps {
  onTabPress?: (tab: string) => void;
  onEditInformation?: () => void;
  onPhoneNumberPress?: () => void;
  onRecentReports?: () => void;
}

const ProfileBody: React.FC<ProfileBodyProps> = ({ onTabPress, onEditInformation, onPhoneNumberPress, onRecentReports }) => {
  const { profile, getFullName } = useUserProfile();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserLocation = async () => {
        setIsLoadingLocation(true);
        try {
          const location = await locationService.getCurrentLocation(true);
          setUserLocation(location);
        } catch (error) {
          console.log('Failed to get user location:', error);
        } finally {
          setIsLoadingLocation(false);
        }
      };

      fetchUserLocation();
    }, [])
  );

  const handleRecentReports = () => {
    onRecentReports?.();
  };
  const handleEditInformation = () => {
    onEditInformation?.();
  };
  const handlePhoneNumber = () => {
    onPhoneNumberPress?.();
  };
  const handleHelpSupport = () => {};
  const handleReportProblem = () => {};
  const handleAboutResqLine = () => {};
  const handlePrivacyPolicy = () => {};
  const handleTermsOfService = () => {};
  const handleLogOut = () => {
    setShowLogoutConfirm(true);
  };
  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/\D/g, '');
    let cleanNumber = digits;
    if (digits.startsWith('63')) {
      cleanNumber = digits.slice(2);
    } else if (digits.startsWith('0')) {
      cleanNumber = digits.slice(1);
    }
    if (cleanNumber.length >= 10) {
      const part1 = cleanNumber.slice(0, 3);
      const part2 = cleanNumber.slice(3, 6);
      const part3 = cleanNumber.slice(6, 10);
      return `+63 ${part1} ${part2} ${part3}`;
    }
    return `+63 ${cleanNumber}`;
  };

  const getUserLocationText = () => {
    if (isLoadingLocation) {
      return 'Getting your location...';
    }
    if (userLocation?.address) {
      return userLocation.address;
    }
    if (userLocation?.latitude && userLocation?.longitude) {
      return `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`;
    }
    return 'Secret Location';
  };

  const renderSectionItem = (
    title: string,
    iconName: keyof typeof Ionicons.glyphMap,
    onPress: () => void,
    showDivider: boolean = true,
    disabled: boolean = false
  ) => {
    const disabledColor = '#C7C5CD';
    const iconColor = disabled ? disabledColor : '#666';
    const textColor = disabled ? disabledColor : '#333';
    const chevronColor = disabled ? disabledColor : '#000000ff';

    return (
      <>
        <TouchableOpacity
          style={[styles.sectionItem, disabled && styles.disabledRow]}
          onPress={onPress}
          disabled={disabled}
        >
          <View style={styles.sectionItemLeft}>
            <Ionicons name={iconName} size={20} color={iconColor} style={styles.sectionIcon} />
            <Text style={[styles.sectionItemText, { color: textColor }]}>{title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={chevronColor} />
        </TouchableOpacity>
        {showDivider && <View style={styles.divider} />}
      </>
    );
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Scrollable Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.headerBackground}>
          <Profilebg width="100%" height={180} preserveAspectRatio="xMidYMid slice" />
        </View>

        <View style={styles.profileOverlay}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              <Profile width={75} height={75} />
            </View>

            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{getFullName()}</Text>
              <Text style={styles.userPhone}>{formatPhoneNumber(profile.phoneNumber || '')}</Text>
              <Text style={styles.userLocation}>{getUserLocationText()}</Text>
            </View>

            <TouchableOpacity style={styles.chevronContainer} onPress={onEditInformation}>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Activities Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activities</Text>
        {renderSectionItem('Recent Reports', 'time-outline', handleRecentReports, false)}
      </View>

      {/* Account & Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account & Security</Text>
        {renderSectionItem('Edit Information', 'person-outline', handleEditInformation)}
        {renderSectionItem('Phone Number', 'call-outline', handlePhoneNumber, false)}
      </View>

      {/* Contact Us Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        {renderSectionItem('Help & Support', 'help-circle-outline', handleHelpSupport, true, true)}
        {renderSectionItem('Report a Problem', 'warning-outline', handleReportProblem, true, true)}
        {renderSectionItem('About ResqLine', 'information-circle-outline', handleAboutResqLine, false, true)}
      </View>

      {/* Legal Section */}
      <View style={styles.sectionLegal}>
        <Text style={styles.sectionTitle}>Legal</Text>
        {renderSectionItem('Privacy Policy', 'document-text-outline', handlePrivacyPolicy, true, true)}
        {renderSectionItem('Terms of Service', 'document-outline', handleTermsOfService, false, true)}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {/* Log Out Button */}
        <TouchableOpacity style={styles.logOutButton} onPress={handleLogOut}>
          <Text style={styles.logOutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Logout confirmation overlay */}
      <LogoutConfirm
        visible={showLogoutConfirm}
        onCancel={handleCancelLogout}
        onLogout={() => {
          // optional: clear local profile/auth state here before redirect
          setShowLogoutConfirm(false);
          router.replace('(screens)/WelcomeScreen');
        }}
      />

      {/* Delete confirmation overlay */}
      <DeleteConfirm
        visible={showDeleteConfirm}
        onCancel={handleCancelDelete}
        onDelete={() => {
          // hide overlay then navigate to AccountDeletion screen
          setShowDeleteConfirm(false);
          router.push('(screens)/AccountDeletion');
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  profileHeader: {
    position: 'relative',
    height: 150,
    marginBottom: 5,
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  profileOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    borderRadius: 35,
    padding: 5,
  },
  userInfoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  chevronContainer: {
    padding: 8,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'OpenSans_700Bold',
    color: '#FFF',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
  },

  // Section Styles
  section: {
    backgroundColor: '#FFF',
    marginBottom: 5,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionLegal: {
    backgroundColor: '#FFF',
    marginBottom: 5,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'OpenSans_700Bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionItemText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    marginLeft: 32,
  },
  disabledRow: {
    opacity: 0.55,
  },

  // Action Buttons Styles
  actionButtonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  logOutButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  logOutButtonText: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: '#333',
  },
  deleteAccountButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteAccountButtonText: {
    fontSize: 14,
    color: '#FF4444',
    fontFamily: 'OpenSans_700Bold',
  },
});

export default ProfileBody;