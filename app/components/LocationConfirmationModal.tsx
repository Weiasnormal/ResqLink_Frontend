import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LocationConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onRefresh: () => void;
  onCancel: () => void;
  address: string;
  isLoading: boolean;
  error?: string | null;
}

const LocationConfirmationModal: React.FC<LocationConfirmationModalProps> = ({
  visible,
  onConfirm,
  onRefresh,
  onCancel,
  address,
  isLoading,
  error,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={32} color="#FC8100" />
              </View>
              <Text style={styles.title}>Confirm Your Exact Location</Text>
              <Text style={styles.subtitle}>
                Please confirm this location is accurate for emergency responders to reach you
              </Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FC8100" />
                  <Text style={styles.loadingText}>Getting your location...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
                  <Text style={styles.errorTitle}>Location Error</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : (
                <View style={styles.addressContainer}>
                  <Text style={styles.questionText}>Please confirm this is your exact current location:</Text>
                  <View style={styles.addressBox}>
                    <Ionicons name="location-outline" size={20} color="#666" />
                    <Text style={styles.addressText}>{address}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {isLoading ? (
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              ) : error ? (
                <>
                  <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.refreshButtonText}>Try Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.refreshButtonText}>Refresh Location</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  addressContainer: {
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    width: '100%',
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginLeft: 12,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FC8100',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
});

export default LocationConfirmationModal;