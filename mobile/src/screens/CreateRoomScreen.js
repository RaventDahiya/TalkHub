import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../utils/api';
import colors from '../theme/colors';

export default function CreateRoomScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Room name is required');
      return;
    }
    if (isPrivate && !accessKey.trim()) {
      setError('Access key is required for private rooms');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/rooms', {
        name: name.trim(),
        description: description.trim(),
        isPrivate,
        accessKey: isPrivate ? accessKey.trim() : ''
      });
      // The socket event will globally broadcast the room creation,
      // and we can simply pop back to the RoomListScreen
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>◀ Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Chat Room</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.card}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Room Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter room name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What is this room about?"
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.switchGroup}>
              <View>
                <Text style={styles.switchLabel}>Private Room</Text>
                <Text style={styles.switchSub}>Require a key to join</Text>
              </View>
              <Switch
                trackColor={{ false: '#cbd5e0', true: '#a3ffd6' }}
                thumbColor={isPrivate ? colors.secondary : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setIsPrivate}
                value={isPrivate}
              />
            </View>

            {isPrivate ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Access Key *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Set access key"
                  placeholderTextColor={colors.textMuted}
                  value={accessKey}
                  onChangeText={setAccessKey}
                  secureTextEntry
                />
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Create Room</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgHeader,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMain,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  errorContainer: {
    backgroundColor: colors.dangerBg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textMain,
    backgroundColor: colors.lightGray,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  switchSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
