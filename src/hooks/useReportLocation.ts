import { useState, useCallback, useRef } from 'react';
import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface UseReportLocationReturn {
  locationData: LocationData | null;
  isLoading: boolean;
  error: string | null;
  showModal: boolean;
  fetchCurrentLocation: () => Promise<void>;
  confirmLocation: () => void;
  refreshLocation: () => void;
  cancelLocationRequest: () => void;
}

export const useReportLocation = (
  onLocationConfirmed: (location: LocationData) => void
): UseReportLocationReturn => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const isRequestingRef = useRef(false);

  const checkLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setError('Location services are disabled. Please enable them in your device settings.');
        return false;
      }

      // Check current permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status === 'granted') {
        return true;
      }

      // Request permission if not granted
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (newStatus === 'granted') {
        return true;
      } else if (newStatus === 'denied') {
        // Handle graceful denial - don't force user
        setError('Location permission was denied. For accurate emergency reporting, we recommend enabling location access in your device settings.');
        return false;
      } else {
        // Permission permanently denied
        setError('Location access has been permanently denied. Please enable it in device settings for automatic location detection.');
        showSettingsAlert();
        return false;
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setError('Failed to check location permissions');
      return false;
    }
  }, []);

  const showSettingsAlert = useCallback(() => {
    Alert.alert(
      'Location Access Required',
      'Location permission has been disabled. To enable automatic location detection for emergency reports, please:\\n\\n1. Go to Settings\\n2. Find ResqLink app\\n3. Enable Location permissions',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ]
    );
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
      });

      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get address
      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`; // Fallback coordinates
      
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode.length > 0) {
          const result = reverseGeocode[0];
          const addressParts = [
            result.streetNumber,
            result.street,
            result.district,
            result.city,
            result.region,
            result.postalCode,
            result.country,
          ].filter(Boolean);

          if (addressParts.length > 0) {
            address = addressParts.join(', ');
          }
        }
      } catch (geocodeError) {
        console.log('Reverse geocoding failed, using coordinates:', geocodeError);
        // Keep coordinate fallback
      }

      return {
        latitude,
        longitude,
        address,
      };
    } catch (error: any) {
      console.error('Error getting current location:', error);
      
      if (error.code === 'E_LOCATION_TIMEOUT') {
        throw new Error('Location request timed out. Please check your GPS signal and try again.');
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        throw new Error('Location is temporarily unavailable. Please try again in a moment.');
      } else {
        throw new Error('Failed to get your current location. Please check your GPS signal.');
      }
    }
  }, []);

  const fetchCurrentLocation = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isRequestingRef.current) {
      return;
    }

    isRequestingRef.current = true;
    setIsLoading(true);
    setError(null);
    setLocationData(null);
    setShowModal(true);

    try {
      // Always request fresh permission - never assume previous grants
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        setError('Location access is required for accurate emergency reporting. Please enable location permissions to continue.');
        return;
      }

      // Get fresh current location with high accuracy
      const location = await getCurrentLocation();
      if (location) {
        setLocationData(location);
        setError(null);
      } else {
        setError('Unable to determine your current location. Please check your GPS signal and try again.');
      }
    } catch (error: any) {
      console.error('Error fetching location:', error);
      setError(error.message || 'Failed to get your current location. Please ensure GPS is enabled and try again.');
    } finally {
      setIsLoading(false);
      isRequestingRef.current = false;
    }
  }, [checkLocationPermission, getCurrentLocation]);

  const confirmLocation = useCallback(() => {
    if (locationData) {
      onLocationConfirmed(locationData);
      setShowModal(false);
      setLocationData(null);
      setError(null);
    }
  }, [locationData, onLocationConfirmed]);

  const refreshLocation = useCallback(async () => {
    if (isRequestingRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setLocationData(null);
    isRequestingRef.current = true;

    try {
      const location = await getCurrentLocation();
      if (location) {
        setLocationData(location);
        setError(null);
      }
    } catch (error: any) {
      console.error('Error refreshing location:', error);
      setError(error.message || 'Failed to refresh location');
    } finally {
      setIsLoading(false);
      isRequestingRef.current = false;
    }
  }, [getCurrentLocation]);

  const cancelLocationRequest = useCallback(() => {
    setShowModal(false);
    setLocationData(null);
    setError(null);
    setIsLoading(false);
    isRequestingRef.current = false;
  }, []);

  return {
    locationData,
    isLoading,
    error,
    showModal,
    fetchCurrentLocation,
    confirmLocation,
    refreshLocation,
    cancelLocationRequest,
  };
};