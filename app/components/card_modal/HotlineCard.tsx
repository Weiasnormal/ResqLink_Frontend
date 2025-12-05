import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Department } from '../../_data/emergencyDepartments';
import { useLocation } from '../../_hooks/useLocation';

interface HotlineCardProps {
  department: Department;
}

const HotlineCard: React.FC<HotlineCardProps> = ({ department }) => {
  const { openDirections, isLoading } = useLocation();

  const handleCall = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleCopy = async (phoneNumber: string) => {
    try {
      await Clipboard.setString(phoneNumber);
      Alert.alert('Copied', 'Phone number copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDirection = async () => {
    if (department.latitude && department.longitude) {
      await openDirections(
        {
          latitude: department.latitude,
          longitude: department.longitude,
        },
        department.name
      );
    } else {
      // Fallback to address-based navigation
      const encodedAddress = encodeURIComponent(department.address);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
    }
  };

  // Check if directions are available
  const hasCoordinates = department.latitude && department.longitude;

  return (
    <View style={styles.card}>
      <Text style={styles.departmentName}>{department.name}</Text>
      <Text style={styles.address}>{department.address}</Text>
      
      <View style={styles.contactsContainer}>
        {department.phones.map((phone, index) => (
          <View key={index} style={styles.contactRow}>
            <Text style={styles.contactNumber}>{phone}</Text>
            <View style={styles.contactActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton]} 
                onPress={() => handleCall(phone)}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.copyButton]} 
                onPress={() => handleCopy(phone)}
                activeOpacity={0.7}
              >
                <Ionicons name="copy" size={20} color="#FF8C42" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.directionButton, 
          !hasCoordinates && styles.directionButtonDisabled
        ]} 
        onPress={handleDirection}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        <Ionicons 
          name="location-outline" 
          size={18} 
          color={hasCoordinates ? "#FF8C42" : "#ccc"} 
        />
        <Text style={[
          styles.directionText,
          !hasCoordinates && styles.directionTextDisabled
        ]}>
          {isLoading ? 'Loading...' : hasCoordinates ? 'Direction' : 'No Location'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#696969ff',
  },
  departmentName: {
    fontSize: 18,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF8C42',
    marginTop: 16,
  },
  directionText: {
    fontSize: 14,
    color: '#FF8C42',
    fontFamily: 'OpenSans_400Regular',
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
    marginTop: 8,
  },
  contactsContainer: {
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactNumber: {
    fontSize: 16,
    fontFamily: 'OpenSans_400Regular',
    color: '#1A1A1A',
    flex: 1,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  callButton: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  copyButton: {
    backgroundColor: '#ffffff',
    borderColor: '#FF8C42',
  },
  directionButtonDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  directionTextDisabled: {
    color: '#ccc',
  },
});

export default HotlineCard;