import { Platform } from 'react-native';

// server address: localhost for web/simulator, local network IP for physical devices
export const DEFAULT_SERVER_URL =
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://10.7.6.11:3000';
