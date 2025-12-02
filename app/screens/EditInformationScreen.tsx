import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useSlideIn } from '../transitions/slideIn';
import ProfileEdit from '../../assets/ProfileEdit.svg';
import ChangeNumberScreen from './ChangeNumberScreen';

interface EditInformationScreenProps {
  onBack: () => void;
}

const EditInformationScreen: React.FC<EditInformationScreenProps> = ({ onBack }) => {
  const { profile, updateProfile } = useUserProfile();
  
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [username, setUsername] = useState(profile.username);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [showChangeNumber, setShowChangeNumber] = useState(false);
  
 
  const slideAnimation = useSlideIn({ 
    direction: 'right', 
    distance: 300, 
    duration: 300 
  });
  
  
  useEffect(() => {
    slideAnimation.slideIn();
  }, []);

  const handlePhoneNumberPress = () => {
    setShowChangeNumber(true);
  };

  const handleBackFromChangeNumber = () => {
    setShowChangeNumber(false);
  };

  const handleSave = () => {
    updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
    });
    handleBack(); 
  };

  const handleBack = () => {
    if (isAnimatingOut) return; // Prevent multiple taps
    
    setIsAnimatingOut(true);
    
    Animated.timing(slideAnimation.translateX, {
      toValue: 300,
      duration: 250, 
      useNativeDriver: true,
    }).start(() => {
      onBack(); 
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffffff" />
        <Animated.View style={[
          styles.keyboardAvoidingView, 
          {
            transform: [
              { translateX: slideAnimation.translateX }
            ]
          }
        ]}>
          <KeyboardAvoidingView 
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Information</Text>
            <View style={styles.headerSpacer} />
          </View>
          
          {/* Header Divider */}
          <View style={styles.headerDivider} />

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Profile Icon Area */}
            <View style={styles.profileIconContainer}>
              <View style={styles.profileIconCircle}>
                <ProfileEdit width={120} height={120} />
              </View>
            </View>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              {/* First Name and Last Name Row */}
              <View style={styles.nameRow}>
                <View style={styles.nameInputContainer}>
                  <Text style={styles.inputLabel}>First name</Text>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="First name"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholderTextColor="#999"
                  />
                </View>
                
                <View style={styles.nameInputContainer}>
                  <Text style={styles.inputLabel}>Last name</Text>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Last name"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Username */}
              <View style={styles.fullWidthInputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.fullWidthInput}
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Phone Number */}
              <View style={styles.fullWidthInputContainer}>
                <Text style={styles.inputLabel}>Phone number</Text>
                <TouchableOpacity 
                  style={styles.phoneNumberContainer} 
                  onPress={handlePhoneNumberPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.phoneNumberText}>{profile.phoneNumber || 'Add phone number'}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
        
        {/* Overlay ChangeNumberScreen */}
        {showChangeNumber && (
          <View style={styles.overlay}>
            <ChangeNumberScreen onBack={handleBackFromChangeNumber} />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSpacer: {
    width: 32, 
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  scrollView: {
    flex: 1,
  },
  profileIconContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 20,
  },
  profileIconCircle: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  nameRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  nameInputContainer: {
    flex: 1,
  },
  fullWidthInputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontWeight: '400',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  fullWidthInput: {
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#FF8A00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  phoneNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  phoneNumberText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
});

export default EditInformationScreen;