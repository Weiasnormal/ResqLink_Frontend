import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface SOSAlertModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Photo {
  uri: string;
  id: string;
}

const SOSAlertModal = ({ visible, onClose }: SOSAlertModalProps) => {
  const [details, setDetails] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const pickImage = async () => {
    if (photos.length >= 2) {
      Alert.alert('Photo Limit', 'You can only add up to 2 photos.');
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

  const handleSendDetails = () => {
    const alertData = {
      details,
      photos: photos.map(photo => photo.uri),
      timestamp: new Date().toISOString(),
    };

    console.log('SOS Alert Details:', alertData);
    
    Alert.alert(
      'Details Sent',
      'Your additional details have been sent to emergency responders.',
      [{ 
        text: 'OK',
        onPress: () => {
          setDetails('');
          setPhotos([]);
          onClose();
        }
      }]
    );
  };

  const handleSkip = () => {
    setDetails('');
    setPhotos([]);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.container} 
          activeOpacity={1} 
          onPress={() => {
            if (isInputFocused) {
              Keyboard.dismiss();
              setIsInputFocused(false);
            }
          }}
        >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Help is on the way!</Text>
          <Text style={styles.headerSubtitle}>Responders have received your location.</Text>
        </View>

        {/* Content */}
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
        <View style={styles.content}>
          <Text style={styles.instructionText}>Add more information if you can.</Text>

          {/* Details Input */}
          <TextInput
            style={[styles.detailsInput, isInputFocused && styles.detailsInputFocused]}
            placeholder="Add Details (Optional)"
            placeholderTextColor="#999"
            value={details}
            onChangeText={setDetails}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            multiline
            numberOfLines={isInputFocused ? 3 : 4}
            textAlignVertical="top"
          />

          {/* Done Button - Shown when typing */}
          {isInputFocused && (
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={() => {
                Keyboard.dismiss();
                setIsInputFocused(false);
              }}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          )}

          {/* Photo Section - Hidden when typing */}
          {!isInputFocused && (
          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>Add Photo {photos.length}/2 (Optional)</Text>
            <View style={styles.photoRow}>
              {/* Square Add Photo Button */}
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Ionicons name="camera-outline" size={24} color="#FF4444" />
                <Text style={styles.photoButtonText}>Add Photo</Text>
              </TouchableOpacity>
              
              {/* Horizontal Photo List */}
              <View style={styles.photosList}>
                {photos.map((photo, index) => (
                  <View key={photo.id} style={styles.photoItem}>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setPhotos(photos.filter(p => p.id !== photo.id))}
                    >
                      <Ionicons name="close-circle" size={16} color="#FF4444" />
                    </TouchableOpacity>
                    <Ionicons name="image-outline" size={18} color="#666" />
                    <Text style={styles.photoName}>Photo {index + 1}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          )}
        </View>
        </TouchableOpacity>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.sendButton} onPress={handleSendDetails}>
              <Text style={styles.sendButtonText}>Send Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '95%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    backgroundColor: '#FF4444',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
    minHeight: 180,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 10,
    height: 70,
    textAlignVertical: 'top',
  },
  detailsInputFocused: {
    height: 60,
    marginBottom: 8,
  },
  doneButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  photoSection: {
    marginBottom: 5,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  photoLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
    fontWeight: '500',
  },
  photoButton: {
    width: 85,
    height: 80,
    borderWidth: 2,
    borderColor: '#FF4444',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffffff',
  },
  photoButtonText: {
    color: '#FF4444',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  photosList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-start',
  },
  photoItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 80,
    minHeight: 80,
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
    borderRadius: 8,
    zIndex: 1,
  },
  buttonContainer: {
    paddingTop: 0,
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 15,
  },
  skipButtonText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SOSAlertModal;