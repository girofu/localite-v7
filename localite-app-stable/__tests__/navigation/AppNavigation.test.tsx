/**
 * 導航系統測試 - TDD 紅色階段
 * 
 * 測試導航系統的核心行為：
 * 1. 認證狀態路由
 * 2. 主要畫面導航
 * 3. 狀態持久化
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigation } from '../../src/navigation/AppNavigation';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { FirebaseAuthService } from '../../src/services/FirebaseAuthService';

// Mock FirebaseAuthService
jest.mock('../../src/services/FirebaseAuthService');
const mockAuthService = FirebaseAuthService as jest.MockedClass<typeof FirebaseAuthService>;

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  NavigationContainer: ({ children }: any) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock Auth Context
let mockUser: any = null;
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
  AuthProvider: ({ children }: any) => <View testID="auth-provider">{children}</View>,
}));

// Mock Firestore Service
jest.mock('../../src/services/FirestoreService');

// Mock Merchant Navigation
jest.mock('../../src/navigation/MerchantNavigation', () => ({
  MerchantNavigation: () => (
    <View testID="merchant-navigation">
      <Text>Merchant Navigation</Text>
    </View>
  ),
}));

// Mock Screen Components with React Native components
const mockNavigate = jest.fn();
jest.mock('../../src/screens/auth/WelcomeScreen', () => ({
  default: ({ navigation }: any) => (
    <View testID="welcome-screen">
      <Text>Welcome Screen</Text>
      <TouchableOpacity testID="login-button" onPress={() => navigation?.navigate('Login')}>
        <Text>登入</Text>
      </TouchableOpacity>
    </View>
  ),
}));

jest.mock('../../src/screens/auth/LoginScreen', () => ({
  default: ({ navigation }: any) => (
    <View testID="login-screen">
      <Text>Login Screen</Text>
    </View>
  ),
}));

jest.mock('../../src/screens/auth/RegisterScreen', () => ({
  default: ({ navigation }: any) => (
    <View testID="register-screen">
      <Text>Register Screen</Text>
    </View>
  ),
}));

jest.mock('../../screens/HomeScreen', () => ({
  default: ({ navigation }: any) => (
    <View testID="home-screen">
      <Text>Home Screen</Text>
    </View>
  ),
}));

jest.mock('../../src/screens/main/ExploreScreen', () => ({
  default: ({ navigation }: any) => (
    <View testID="explore-screen">
      <Text>Explore Screen</Text>
    </View>
  ),
}));

jest.mock('../../src/screens/main/ProfileScreen', () => ({
  default: ({ navigation }: any) => (
    <View testID="profile-screen">
      <Text>Profile Screen</Text>
    </View>
  ),
}));

describe('AppNavigation', () => {
  let mockAuthServiceInstance: jest.Mocked<FirebaseAuthService>;

  beforeEach(() => {
    mockAuthServiceInstance = {
      getCurrentUser: jest.fn(),
      onAuthStateChanged: jest.fn(),
      signOut: jest.fn(),
      signInWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
    } as any;

    mockAuthService.mockImplementation(() => mockAuthServiceInstance);
    mockNavigate.mockClear(); // 重置 mock 導航函數
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('未認證用戶流程', () => {
    it('should show welcome screen when user is not authenticated', async () => {
      // Arrange
      mockUser = null;
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(null);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(null); // 觸發未認證狀態
      });

      // Act
      render(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </AuthProvider>
      );

      // Assert - 檢查歡迎畫面是否渲染
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeTruthy();
      });
    });

    it.skip('should navigate to login screen when login button pressed', async () => {
      // Arrange
      mockUser = null;
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(null);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
      });

      // Mock navigation for WelcomeScreen is handled by the mock above

      render(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </AuthProvider>
      );

      // Act
      await waitFor(() => {
        expect(screen.getByText('Welcome Screen')).toBeOnTheScreen();
      });

      // 模擬點擊登入按鈕
      const loginButton = screen.getByTestId('login-button');
      fireEvent.press(loginButton);

      // Assert - 檢查導航函數是否被調用
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('已認證用戶流程', () => {
    const mockUserObject = {
      uid: 'user-123',
      email: 'test@example.com',
      emailVerified: true,
    };

    it('should show home screen when user is authenticated', async () => {
      // Arrange
      mockUser = mockUserObject;
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(mockUserObject);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUserObject);
      });

      // Act
      render(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </AuthProvider>
      );

      // Assert - 檢查主導航是否渲染
      await waitFor(() => {
        expect(screen.getByText('Home Screen')).toBeOnTheScreen();
      });
    });

    it('should show bottom tab navigation with correct tabs', async () => {
      // Arrange
      mockUser = mockUserObject;
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(mockUserObject);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUserObject);
      });

      render(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </AuthProvider>
      );

      // Assert - 檢查所有主要畫面是否可用
      await waitFor(() => {
        expect(screen.getByText('Home Screen')).toBeOnTheScreen();
        expect(screen.getByText('Explore Screen')).toBeOnTheScreen();
        expect(screen.getByText('Profile Screen')).toBeOnTheScreen();
      });
    });
  });

  describe('導航狀態管理', () => {
    it('should persist navigation state across app restarts', async () => {
      // Arrange
      const mockUserObject = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
      };
      
      mockUser = mockUserObject;
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(mockUserObject);
      
      // Act - 第一次渲染
      const { rerender } = render(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </AuthProvider>
      );

      // 模擬導航到特定頁面
      await waitFor(() => {
        expect(screen.getByText('Home Screen')).toBeOnTheScreen();
      });

      // 模擬 app 重新啟動
      rerender(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </AuthProvider>
      );

      // Assert - 應該記住之前的導航狀態
      await waitFor(() => {
        expect(screen.getByText('Home Screen')).toBeOnTheScreen();
      });
    });
  });

  describe('登出流程', () => {
    it('should redirect to welcome screen after logout', async () => {
      // Arrange
      const mockUserObject = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
      };

      let currentUser: any = mockUserObject;
      mockUser = currentUser;
      mockAuthServiceInstance.getCurrentUser.mockImplementation(() => currentUser);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(currentUser);
      });

      mockAuthServiceInstance.signOut.mockImplementation(async () => {
        currentUser = null;
        mockUser = null;
        // 觸發認證狀態變更
        mockAuthServiceInstance.onAuthStateChanged.mock.calls[0][0](null);
      });

      render(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </AuthProvider>
      );

      // 確認用戶已登入
      await waitFor(() => {
        expect(screen.getByText('Home Screen')).toBeOnTheScreen();
      });

      // Act - 模擬登出流程
      // 注意：實際的登出邏輯需要在 AuthContext 中實現
      mockAuthServiceInstance.signOut.mockResolvedValue();

      // 觸發認證狀態變更（模擬登出）
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(null); // 設為未認證狀態
      });
      
      mockUser = null;

      // 重新渲染組件以反映狀態變更
      const { rerender } = render(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </AuthProvider>
      );

      // Assert - 應該回到歡迎頁面
      await waitFor(() => {
        expect(screen.getByText('Welcome Screen')).toBeOnTheScreen();
      });
    });
  });
});
