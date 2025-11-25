import { useState, useCallback } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationCoordinates | null>;
  openDirections: (destination: LocationCoordinates, departmentName?: string) => Promise<void>;
  isLocationEnabled: boolean;
  isLoading: boolean;
}

export const useLocation = (): UseLocationReturn => {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to use navigation features.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setIsLocationEnabled(true);
        return true;
      } else {
        setIsLocationEnabled(false);
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to provide directions to emergency services. You can enable this in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      setIsLoading(true);

      // Check permission first
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const permissionGranted = await requestLocationPermission();
        if (!permissionGranted) {
          return null;
        }
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [requestLocationPermission]);

  const openDirections = useCallback(async (
    destination: LocationCoordinates, 
    departmentName?: string
  ): Promise<void> => {
    try {
      setIsLoading(true);

      // Get user's current location
      const currentLocation = await getCurrentLocation();
      
      let mapUrl: string;

      if (Platform.OS === 'ios') {
        // Apple Maps URL scheme
        if (currentLocation) {
          // Navigate from current location to destination
          mapUrl = `http://maps.apple.com/?saddr=${currentLocation.latitude},${currentLocation.longitude}&daddr=${destination.latitude},${destination.longitude}`;
        } else {
          // Just show destination
          mapUrl = `http://maps.apple.com/?q=${destination.latitude},${destination.longitude}`;
        }
        
        if (departmentName) {
          mapUrl += `&t=m&z=16`;
        }
      } else {
        // Google Maps URL scheme for Android
        if (currentLocation) {
          // Navigate from current location to destination
          mapUrl = `https://www.google.com/maps/dir/${currentLocation.latitude},${currentLocation.longitude}/${destination.latitude},${destination.longitude}`;
        } else {
          // Just show destination
          mapUrl = `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
        }
      }

      // Open the map application
      const canOpen = await Linking.canOpenURL(mapUrl);
      if (canOpen) {
        await Linking.openURL(mapUrl);
      } else {
        // Fallback to generic maps URL
        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
        await Linking.openURL(fallbackUrl);
      }
    } catch (error) {
      console.error('Error opening directions:', error);
      Alert.alert(
        'Error',
        'Failed to open directions. Please check if you have a maps application installed.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentLocation]);

  return {
    requestLocationPermission,
    getCurrentLocation,
    openDirections,
    isLocationEnabled,
    isLoading,
  };
};