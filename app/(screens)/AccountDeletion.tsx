import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AccountDeletion: React.FC = () => {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [focused, setFocused] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleDelete = () => {
    // perform deletion logic here (API call / clear storage)
    // then redirect to welcome screen
    router.replace('(screens)/WelcomeScreen');
  };

  const isDeletable = confirmation === 'DELETE';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backWrap}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Confirm Account Deletion</Text>
          <Text style={styles.description}>
            Deleting your account will permanently remove all your personal information, emergency reports, and saved data.
            This action cannot be undone.
          </Text>

          <Text style={styles.instruction}>To continue, please type "DELETE" in the field below.</Text>

          <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
            {/* floating/inline label */}
            <Text
              style={[
                styles.label,
                (focused || confirmation.length > 0) ? styles.labelFocused : styles.labelUnfocused,
              ]}
            >
              Confirmation
            </Text>

            <TextInput
              style={styles.input}
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder={focused ? '' : ''}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.deleteButton, !isDeletable && styles.deleteButtonDisabled]}
            onPress={handleDelete}
            disabled={!isDeletable}
          >
            <Text style={[styles.deleteText, !isDeletable && styles.deleteTextDisabled]}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleBack}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backWrap: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111', textAlign: 'center', flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  description: { fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 20 },
  instruction: { fontSize: 13, color: '#666', marginBottom: 12 },

  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 12,
    marginBottom: 20,
    position: 'relative',
    backgroundColor: '#fff',
  },
  inputWrapperFocused: {
    borderColor: '#FF9427',
  },
  label: {
    position: 'absolute',
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    color: '#999',
  },
  labelUnfocused: {
    top: 18,
    fontSize: 14,
  },
  labelFocused: {
    top: -8,
    fontSize: 12,
    color: '#FF9427',
    fontWeight: '600',
  },
  input: {
    height: 40,
    fontSize: 16,
    color: '#111',
    padding: 0,
    margin: 0,
  },

  deleteButton: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonDisabled: {
    backgroundColor: '#F1B6B6',
  },
  deleteText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  deleteTextDisabled: { color: '#fff' },

  cancelButton: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: '#666', fontWeight: '600' },
});

export default AccountDeletion;