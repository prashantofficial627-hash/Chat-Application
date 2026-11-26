import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { login } from '../socket';
import { DEFAULT_SERVER_URL } from '../config';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // connect to server and proceed
  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(name.trim(), serverUrl.trim());
      setLoading(false);
      navigation.replace('Conversations');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Could not connect to server');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>💬 Chat App</Text>
        <Text style={styles.subtitle}>Enter your name to start chatting with friends</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Your Name (e.g. Rahul)"
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (error) setError('');
          }}
        />

        {/* Optional server address configuration */}
        <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
          <Text style={styles.toggleText}>
            {showSettings ? 'Hide Server Settings' : '⚙️ Server Settings'}
          </Text>
        </TouchableOpacity>

        {showSettings && (
          <View style={styles.settingsBox}>
            <Text style={styles.label}>Server IP Address:</Text>
            <TextInput
              style={styles.serverInput}
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              placeholder="http://10.7.6.11:3000"
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleJoin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Join Chat</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  toggleText: {
    color: '#2196f3',
    textAlign: 'center',
    marginBottom: 14,
    fontSize: 13,
  },
  settingsBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  serverInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: '#2196f3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#90caf9' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
