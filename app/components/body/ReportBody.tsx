import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Animated, ActivityIndicator, Image, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// Import API hooks and utilities
import { useCreateReport } from '../../_hooks/useApi';
import { useUserProfile } from '../../_contexts/UserProfileContext';
import { convertImageToBase64, validateReportData, formatApiError } from '../../_utils/apiHelpers';
import { Category, mapCategoryToEnum } from '../../_api/reports';
import { notificationManager, DomainEventType } from '../../_utils/notificationManager';
import { Photo, showPhotoPickerAlert } from '../../_utils/camera';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const ReportBody = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [address, setAddress] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  // API hooks and context
  const { profile } = useUserProfile();
  const createReportMutation = useCreateReport();

  // Memoized location fetcher with no dependencies that could cause loops
  const fetchLocation = useCallback(async () => {
    if (isLocationLoading) return; // Prevent duplicate calls
    
    setIsLocationLoading(true);
    setLocationError(null);
    setCoords(null);
    setAddress('');

    try {
      // Request foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Location permission denied. Unable to auto-fill location.');
        return;
      }

      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setLocationError('Location services are disabled. Please enable them in device settings.');
        return;
      }

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
      });

      const { latitude, longitude } = location.coords;
      setCoords({ latitude, longitude });

      // Reverse geocode to get human-readable address
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

          const formattedAddress = addressParts.length > 0 
            ? addressParts.join(', ')
            : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          setAddress(formattedAddress);
        } else {
          // Fallback to coordinates
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
      } catch (geocodeError) {
        console.log('Reverse geocoding failed, using coordinates:', geocodeError);
        setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }

    } catch (error: any) {
      console.error('Error fetching location:', error);
      
      if (error.code === 'E_LOCATION_TIMEOUT') {
        setLocationError('Location request timed out. Please check your GPS signal.');
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        setLocationError('Location temporarily unavailable. Please try again.');
      } else {
        setLocationError('Failed to get location. Please ensure GPS is enabled.');
      }
    } finally {
      setIsLocationLoading(false);
    }
  }, []); // Empty dependency array - no dependencies that could cause loops

  // Fetch location when screen comes into focus - NO dependency on fetchLocation to avoid loops
  useFocusEffect(
    useCallback(() => {
      fetchLocation();
    }, [fetchLocation]) // Only fetchLocation as dependency, which has empty deps
  );

  const categories = [
    { label: 'Select Category', value: '' },
    { label: 'Traffic Accident', value: 'traffic accident' },
    { label: 'Fire Incident', value: 'fire incident' },
    { label: 'Flooding', value: 'flooding' },
    { label: 'Structural Damage', value: 'structural damage' },
    { label: 'Medical Emergency', value: 'medical emergency' },
    { label: 'Other / General Incident', value: 'other' },
  ];

  const handleAddPhoto = () => {
    showPhotoPickerAlert(
      (photo) => setPhotos([...photos, photo]),
      5,
      photos.length
    );
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter(photo => photo.id !== id));
  };

  const handlePhotoLongPress = (photo: Photo) => {
    setPreviewPhoto(photo);
    setIsPreviewVisible(true);
  };

  const closePreview = () => {
    setIsPreviewVisible(false);
    setPreviewPhoto(null);
  };

  const toggleDropdown = () => {
    const toValue = isDropdownOpen ? 0 : 1;
    setIsDropdownOpen(!isDropdownOpen);
    
    Animated.timing(dropdownAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const selectCategory = (categoryValue: string, categoryLabel: string) => {
    setCategory(categoryValue);
    toggleDropdown();
  };

  const getSelectedCategoryLabel = () => {
    const selectedCategory = categories.find(cat => cat.value === category);
    return selectedCategory ? selectedCategory.label : 'Select Category';
  };

  const handleReport = async () => {
    if (!isFormValid()) return;

    // Check if image is required and present
    if (photos.length === 0) {
      Alert.alert('Image Required', 'Please add at least one photo to your report.');
      return;
    }

    // Validate report data
    const validationError = validateReportData({
      category,
      location: coords,
    });

    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      // Convert all photos to base64 (up to 5)
      const base64Images: string[] = [];
      let totalSizeKB = 0;
      
      for (const photo of photos) {
        const base64 = await convertImageToBase64(photo.uri);
        if (base64) {
          base64Images.push(base64);
          totalSizeKB += Math.round(base64.length / 1024);
        }
      }
      
      // Log images info
      console.log(`📸 Converting ${photos.length} images, total size: ${totalSizeKB} KB`);
      
      // Warn if total images are very large (> 5MB)
      if (totalSizeKB > 5120) {
        Alert.alert(
          'Large Images Warning',
          `Total images size is ${totalSizeKB} KB. This may take longer to upload. Continue?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => { throw new Error('Upload cancelled'); } },
            { text: 'Continue', onPress: () => {} }
          ]
        );
      }

      // Create report data matching API structure
      const reportData = {
        images: base64Images,
        category: mapCategoryToEnum(category),
        description: description.trim(),
        location: {
          latitude: coords?.latitude || 0,
          longitude: coords?.longitude || 0,
          altitude: 0,
          accuracy: 10,
          altitudeAccuracy: 0,
          reverseGeoCode: address, // Include reverse geocoded address
        },
      };

        console.log('📤 Submitting report with:');
        console.log('  - Category:', reportData.category);
        console.log('  - Description length:', reportData.description.length);
        console.log('  - Images count:', reportData.images.length);
        console.log('  - Total size:', `${totalSizeKB} KB`);
        console.log('  - Location:', `${reportData.location.latitude}, ${reportData.location.longitude}`);
        console.log('  - ReverseGeoCode:', reportData.location.reverseGeoCode);

      // Submit report
      const result = await createReportMutation.mutateAsync(reportData);

      if (result.success) {
        // Trigger ReportSubmitted domain event notification
        await notificationManager.handleDomainEvent({
          eventId: Date.now().toString(),
          eventType: DomainEventType.ReportSubmitted,
          aggregateId: result.data || '',
          aggregateType: 'Report',
          timestamp: new Date().toISOString(),
          data: {
            category,
            location: `${coords?.latitude}, ${coords?.longitude}`,
          },
          correlationId: '',
        });

        Alert.alert(
          'Report Submitted',
          'Your emergency report has been submitted successfully.',
          [{ text: 'OK' }]
        );

        // Reset form
        setDescription('');
        setAddress('');
        setCoords(null);
        setCategory('');
        setPhotos([]);
        
        // Optionally refetch location for next report
        fetchLocation();
      }
    } catch (error: any) {
        console.error('❌ Report submission error:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
      const errorMessage = formatApiError(error.message || 'Failed to submit report');
        Alert.alert(
          'Submit Failed', 
          errorMessage + (error.response?.data?.title ? `\n\nDetails: ${error.response.data.title}` : '')
        );
    }
  };

  const isFormValid = () => {
    return photos.length > 0 && description.trim() !== '' && category !== '' && address.trim() !== '';
  };

  return (
    <>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity 
        style={styles.content} 
        activeOpacity={1} 
        onPress={() => {
          if (isDropdownOpen) {
            toggleDropdown();
          }
        }}
      >
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>Report an Emergency</Text>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
          </View>
          <Text style={styles.subtitle}>Provide details to help responders act fast</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Add Photo {photos.length}/5 <Text style={styles.required}>*</Text></Text>
          <View style={styles.photoContainer}>
            <TouchableOpacity style={styles.photoButton} onPress={handleAddPhoto}>
              <Ionicons name="camera-outline" size={24} color="#FF8C00" />
              <Text style={styles.photoButtonText}>Add {'\n'}Photo</Text>
            </TouchableOpacity>
            
            {photos.length > 0 && (
              <ScrollView 
                style={styles.photosList}
                contentContainerStyle={styles.photosListContent}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              >
                {photos.map((photo) => (
                  <TouchableOpacity 
                    key={photo.id} 
                    style={styles.photoItem}
                    onLongPress={() => handlePhotoLongPress(photo)}
                    delayLongPress={500}
                  >
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => removePhoto(photo.id)}
                    >
                      <Ionicons name="close-circle" size={18} color="#FF4444" />
                    </TouchableOpacity>
                    <Ionicons name="image-outline" size={20} color="#666" />
                    <Text style={styles.photoName}>Photo {photos.indexOf(photo) + 1}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Type of Emergency <Text style={styles.required}>*</Text></Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={[styles.dropdownButton, category === '' ? styles.pickerError : null]}
              onPress={toggleDropdown}
            >
              <Text style={[styles.dropdownButtonText, category === '' && styles.placeholderText]}>
                {getSelectedCategoryLabel()}
              </Text>
              <Animated.View
                style={{
                  transform: [{
                    rotate: dropdownAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    })
                  }]
                }}
              >
                <Ionicons name="chevron-down" size={20} color="#666" />
              </Animated.View>
            </TouchableOpacity>
            
            {isDropdownOpen && (
              <Animated.View
                style={[
                  styles.dropdownMenu,
                  {
                    opacity: dropdownAnimation,
                    transform: [{
                      scaleY: dropdownAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      })
                    }]
                  }
                ]}
              >
                <ScrollView 
                  style={styles.dropdownScroll} 
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.dropdownItem,
                        category === cat.value && styles.dropdownItemSelected
                      ]}
                      onPress={() => selectCategory(cat.value, cat.label)}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        category === cat.value && styles.dropdownItemTextSelected
                      ]}>
                        {cat.label}
                      </Text>
                      {category === cat.value && (
                        <Ionicons name="checkmark" size={18} color="#FF4444" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea, description.trim() === '' ? styles.inputError : null]}
              placeholder="Describe the emergency situation in detail"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.locationHeader}>
              <Text style={styles.inputLabel}>Current Location <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={styles.locationRefreshButton}
                onPress={fetchLocation}
                disabled={isLocationLoading}
              >
                <Ionicons 
                  name={isLocationLoading ? "sync" : "refresh-outline"} 
                  size={16} 
                  color="#FF8C00" 
                />
                <Text style={styles.locationRefreshText}>
                  {isLocationLoading ? 'Updating...' : 'Refresh GPS'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Read-only location input field */}
            <TextInput
              style={[styles.input, styles.readOnlyInput, address.trim() === '' ? styles.inputError : null]}
              placeholder="Location will auto-fill from GPS..."
              value={address}
              editable={false}
              selectTextOnFocus={false}
              placeholderTextColor="#999"
            />
            
            {/* Loading indicator overlay */}
            {isLocationLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#FF8C00" />
                <Text style={styles.loadingText}>Getting your location...</Text>
              </View>
            )}
            
            {locationError && (
              <View style={styles.locationErrorContainer}>
                <Ionicons name="warning-outline" size={14} color="#FF6B6B" />
                <Text style={styles.locationErrorText}>{locationError}</Text>
              </View>
            )}
          </View>
        </View>

        {!isFormValid() && (
          <View style={styles.validationContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#FF6B6B" />
            <Text style={styles.validationText}>Please fill in all required fields (*) to submit your report</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.reportButton, 
            (isFormValid() && !createReportMutation.isPending) ? styles.reportButtonActive : styles.reportButtonDisabled
          ]}
          onPress={handleReport}
          disabled={!isFormValid() || createReportMutation.isPending}
        >
          {createReportMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.reportButtonText, { marginLeft: 8 }]}>Submitting...</Text>
            </View>
          ) : (
            <Text style={[styles.reportButtonText, !isFormValid() && styles.reportButtonTextDisabled]}>
              {isFormValid() ? 'Submit Emergency Report' : 'Complete Required Fields'}
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </ScrollView>

    {/* Photo Preview Modal */}
    <Modal
      visible={isPreviewVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closePreview}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalCloseArea} 
          activeOpacity={1} 
          onPress={closePreview}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={closePreview}
            >
              <Ionicons name="close-circle" size={32} color="#fff" />
            </TouchableOpacity>
            
            {previewPhoto && (
              <Image 
                source={{ uri: previewPhoto.uri }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            
            <View style={styles.previewFooter}>
              <Text style={styles.previewText}>
                Photo {previewPhoto ? photos.indexOf(previewPhoto) + 1 : 0} of {photos.length}
              </Text>
              <TouchableOpacity 
                style={styles.deletePhotoButton}
                onPress={() => {
                  if (previewPhoto) {
                    removePhoto(previewPhoto.id);
                    closePreview();
                  }
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.deletePhotoText}>Delete Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#000',
    marginRight: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
    fontFamily: 'OpenSans_400Regular',
  },
  photoButton: {
    width: 100,
    height: 95,
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9F0',
  },
  photoButtonText: {
    color: '#FF8C00',
    marginTop: 3,
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'OpenSans_400Regular',
  },
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  photosList: {
    flex: 1,
    maxHeight: 95,
  },
  photosListContent: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    paddingRight: 10,
  },
  photoItem: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 6,
    width: 100,
    height: 95,
    position: 'relative',
  },
  photoName: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 9,
    zIndex: 1,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 16,
    minHeight: 55,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 350,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#FFF0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#FF4444',
    fontFamily: 'OpenSans_600SemiBold',
  },
  pickerError: {
    borderColor: '#FFB3B3',
    backgroundColor: '#FFF8F8',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontFamily: 'OpenSans_400Regular',
  },
  required: {
    color: '#FC8100',
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
  },
  inputError: {
    borderColor: '#FFB3B3',
    backgroundColor: '#FFF8F8',
  },
  reportButton: {
    backgroundColor: '#E0E0E0',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  reportButtonActive: {
    backgroundColor: '#FC8100',
    shadowColor: '#FC8100',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  reportButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'OpenSans_600SemiBold',
    textAlign: 'center',
  },
  reportButtonTextDisabled: {
    color: '#999',
  },
  validationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFE0E0',
    marginTop: 5,
  },
  validationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#FC8100',
    fontFamily: 'OpenSans_400Regular',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF9F0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  locationRefreshText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#FF8C00',
    fontFamily: 'OpenSans_600SemiBold',
  },
  locationErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  locationErrorText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#FF6B6B',
    flex: 1,
  },
  readOnlyInput: {
    backgroundColor: '#F8F9FA',
    color: '#333',
    fontFamily: 'OpenSans_400Regular',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    height: 55,
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF8C00',
    fontFamily: 'OpenSans_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginTop: 40,
  },
  previewFooter: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
    gap: 12,
  },
  previewText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'OpenSans_400Regular',
    marginBottom: 8,
  },
  deletePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  deletePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'OpenSans_600SemiBold',
  },
});

export default ReportBody;