import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export class LocationService {
  private static instance: LocationService;
  private cachedLocation: UserLocation | null = null;
  private isPermissionRequested: boolean = false;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestLocationPermission(): Promise<boolean> {
    try {
      if (this.isPermissionRequested) {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status === 'granted';
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        return false;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      this.isPermissionRequested = true;
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentLocation(useCache: boolean = true): Promise<UserLocation | null> {
    try {
      // Return cached location if available and cache is enabled
      if (useCache && this.cachedLocation) {
        return this.cachedLocation;
      }

      // Check permission
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
      });

      const userLocation: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Try to get address if possible
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        });

        if (reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          userLocation.address = [
            address.streetNumber,
            address.street,
            address.district,
            address.city,
            address.region,
            address.postalCode,
            address.country,
          ]
            .filter(Boolean)
            .join(', ');
        }
      } catch (geocodeError) {
        console.log('Reverse geocoding failed, but location obtained:', geocodeError);
      }

      // Cache the location
      this.cachedLocation = userLocation;
      return userLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async getLocationAddress(latitude: number, longitude: number): Promise<string | null> {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        return [
          address.streetNumber,
          address.street,
          address.district,
          address.city,
          address.region,
          address.postalCode,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');
      }
      return null;
    } catch (error) {
      console.error('Error getting location address:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cachedLocation = null;
  }

  getCachedLocation(): UserLocation | null {
    return this.cachedLocation;
  }
}

// Export singleton instance for easy access
export const locationService = LocationService.getInstance();