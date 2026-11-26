import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Stack from './screens/Stack';

export default function App() {
  return (
    <SafeAreaProvider>
      <Stack />
    </SafeAreaProvider>
  );
}
