import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { VenueEntryProvider } from './src/contexts/VenueEntryContext';
import { SpeechProvider } from './src/contexts/SpeechContext';
import { AppNavigation } from './src/navigation/AppNavigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <VenueEntryProvider>
          <SpeechProvider>
            <AppNavigation />
          </SpeechProvider>
        </VenueEntryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}