import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../src/contexts/AuthContext';
import { logger } from '../src/services/LoggingService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 設置全局 Promise rejection handler
  useEffect(() => {
    const handleUnhandledRejection = (event: any) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      // 記錄到日誌系統
      logger.logError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        'App.UnhandledPromiseRejection',
        {
          reason: event.reason,
          stack: event.reason?.stack,
        }
      );
      
      // 防止應用崩潰
      event.preventDefault();
    };

    // 添加事件監聽器
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }

    return () => {
      // 清理事件監聽器
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      }
    };
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
