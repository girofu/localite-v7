import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { logger } from '../src/services/LoggingService';
import { DeepLinkHandler } from '../src/services/DeepLinkHandler';

// 內部組件，處理深度連結
function AppContent() {
  const { handleEmailVerificationLink } = useAuth();
  const deepLinkHandler = useRef<DeepLinkHandler | null>(null);

  useEffect(() => {
    // 初始化深度連結處理器
    deepLinkHandler.current = new DeepLinkHandler({
      onEmailVerificationLink: async (url: string) => {
        try {
          logger.info('收到郵件驗證連結', { url });
          const result = await handleEmailVerificationLink(url);
          if (result.success) {
            logger.info('郵件驗證連結處理成功');
          } else {
            logger.warn('郵件驗證連結處理失敗', { error: result.error });
          }
        } catch (error) {
          logger.logError(error as Error, 'AppContent.handleEmailVerificationLink');
        }
      },
      onOtherLink: async (url: string) => {
        logger.info('收到其他深度連結', { url });
        // 可以在這裡處理其他類型的深度連結
      }
    });

    deepLinkHandler.current.initialize();

    return () => {
      deepLinkHandler.current?.cleanup();
    };
  }, [handleEmailVerificationLink]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

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
          <AppContent />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
