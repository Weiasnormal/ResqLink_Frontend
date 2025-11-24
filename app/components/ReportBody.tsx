import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
      <View style={styles.content}>
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
          <Text style={styles.label}>Type of Emergency</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
            
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          style={[styles.reportButton, !isFormValid() && styles.reportButtonDisabled]}
          onPress={handleReport}
          disabled={!isFormValid()}
        >
          <Text style={styles.reportButtonText}>Report</Text>
        </TouchableOpacity>
      </View>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 55,
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
  reportButton: {
    backgroundColor: '#FF8C00',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  reportButtonDisabled: {
    backgroundColor: '#CCC',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ReportBody;