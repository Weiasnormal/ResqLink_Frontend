import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

// Convert image to base64 for API upload
export const convertImageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    // Handle different URI types
    if (!uri) {
      console.error('No URI provided for image conversion');
      return null;
    }

    // For all URI types, use FileSystem.readAsStringAsync
    // This works for file://, content://, and other URI schemes in React Native
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    Alert.alert('Image Error', 'Failed to process image. Please try another image.');
    return null;
  }
};

// Pick image and convert to base64
export const pickAndConvertImage = async (): Promise<string | null> => {
  try {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permissions to select photos.');
      return null;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // Compress to reduce file size
    });

    if (!result.canceled && result.assets[0]) {
      return await convertImageToBase64(result.assets[0].uri);
    }

    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to select image');
    return null;
  }
};

// Format phone number for API (remove formatting)
export const formatPhoneForApi = (phone: string): string => {
  return phone.replace(/\D/g, ''); // Remove all non-digit characters
};

// Format date for display
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

// Validate required fields for report creation
export const validateReportData = (data: {
  category: string;
  location?: any;
}): string | null => {
  if (!data.category || data.category === '' || data.category === 'other') {
    return 'Please select a valid category';
  }
  
  if (!data.location) {
    return 'Location is required';
  }
  
  return null; // Valid
};

// Format error message for user display
export const formatApiError = (error: string): string => {
  // Common API error translations
  const errorMap: Record<string, string> = {
    'Network Error': 'Please check your internet connection and try again.',
    'Request timeout': 'The request is taking too long. Please try again.',
    'Invalid OTP': 'The verification code is incorrect. Please check and try again.',
    'User not found': 'Account not found. Please check your phone number.',
    'Unauthorized': 'Session expired. Please log in again.',
  };
  
  return errorMap[error] || error;
};