import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface Photo {
  uri: string;
  id: string;
}

const ReportBody = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  const categories = [
    { label: 'Select Category', value: '' },
    { label: 'Fire', value: 'fire' },
    { label: 'Medical Emergency', value: 'medical' },
    { label: 'Traffic Accident', value: 'accident' },
    { label: 'Crime', value: 'crime' },
    { label: 'Natural Disaster', value: 'disaster' },
    { label: 'Other', value: 'other' },
  ];

  const pickImage = async () => {
    if (photos.length >= 5) {
      Alert.alert('Photo Limit', 'You can only add up to 5 photos.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permissions to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto: Photo = {
        uri: result.assets[0].uri,
        id: Date.now().toString(),
      };
      setPhotos([...photos, newPhoto]);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter(photo => photo.id !== id));
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

  const handleReport = () => {
    const reportData = {
      title,
      description,
      location,
      category,
      photos: photos.map(photo => photo.uri),
    };

    console.log('Report Data:', reportData);
    
    // Show success alert
    Alert.alert(
      'Report Submitted',
      'Your emergency report has been submitted successfully.',
      [{ text: 'OK' }]
    );

    // Reset form
    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('');
    setPhotos([]);
  };

  const isFormValid = () => {
    return title.trim() !== '' && category !== '' && location.trim() !== '';
  };

  return (
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
          <Text style={styles.label}>Add Photo {photos.length}/5 (Optional)</Text>
          <View style={styles.photoContainer}>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Ionicons name="camera-outline" size={24} color="#FF8C00" />
              <Text style={styles.photoButtonText}>Add Photo</Text>
            </TouchableOpacity>
            
            {photos.length > 0 && (
              <ScrollView 
                style={styles.photosList}
                contentContainerStyle={styles.photosListContent}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              >
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoItem}>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => removePhoto(photo.id)}
                    >
                      <Ionicons name="close-circle" size={18} color="#FF4444" />
                    </TouchableOpacity>
                    <Ionicons name="image-outline" size={20} color="#666" />
                    <Text style={styles.photoName}>Photo {photos.indexOf(photo) + 1}</Text>
                  </View>
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
          <Text style={styles.label}>Details</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, title.trim() === '' ? styles.inputError : null]}
              placeholder="Enter emergency title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide additional details (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, location.trim() === '' ? styles.inputError : null]}
              placeholder="Enter exact location"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {!isFormValid() && (
          <View style={styles.validationContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#FF6B6B" />
            <Text style={styles.validationText}>Please fill in all required fields (*) to submit your report</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.reportButton, isFormValid() ? styles.reportButtonActive : styles.reportButtonDisabled]}
          onPress={handleReport}
          disabled={!isFormValid()}
        >
          <Text style={[styles.reportButtonText, !isFormValid() && styles.reportButtonTextDisabled]}>
            {isFormValid() ? 'Submit Emergency Report' : 'Complete Required Fields'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </ScrollView>
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
    fontSize: 18,
    fontWeight: '600',
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
    fontWeight: '500',
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
    marginTop: 8,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
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
    fontWeight: '600',
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
    fontWeight: '500',
  },
  required: {
    color: '#FC8100',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontWeight: '600',
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
    marginTop: 10,
  },
  validationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#FC8100',
    fontWeight: '500',
  },
});

export default ReportBody;