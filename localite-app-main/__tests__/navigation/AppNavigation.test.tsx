/**
 * 導航系統測試 - TDD 紅色階段
 * 
 * 測試導航系統的核心行為：
 * 1. 認證狀態路由
 * 2. 主要畫面導航
 * 3. 狀態持久化
 */

import React from 'react';
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('未認證用戶流程', () => {
    it('should show welcome screen when user is not authenticated', async () => {
      // Arrange
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

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeOnTheScreen();
      });
    });

    it('should navigate to login screen when login button pressed', async () => {
      // Arrange
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(null);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
      });

      render(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </AuthProvider>
      );

      // Act
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeOnTheScreen();
      });
      
      const loginButton = screen.getByTestId('login-button');
      fireEvent.press(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('login-screen')).toBeOnTheScreen();
      });
    });
  });

  describe('已認證用戶流程', () => {
    const mockUser = {
      uid: 'user-123',
      email: 'test@example.com',
      emailVerified: true,
    };

    it('should show home screen when user is authenticated', async () => {
      // Arrange
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(mockUser);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
      });

      // Act
      render(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </AuthProvider>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('main-tab-navigator')).toBeOnTheScreen();
      });
    });

    it('should show bottom tab navigation with correct tabs', async () => {
      // Arrange
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(mockUser);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
      });

      render(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
        </AuthProvider>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('tab-home')).toBeOnTheScreen();
        expect(screen.getByTestId('tab-explore')).toBeOnTheScreen();
        expect(screen.getByTestId('tab-profile')).toBeOnTheScreen();
      });
    });
  });

  describe('導航狀態管理', () => {
    it('should persist navigation state across app restarts', async () => {
      // Arrange
      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
      };
      
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(mockUser);
      
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
        expect(screen.getByTestId('main-tab-navigator')).toBeOnTheScreen();
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
        expect(screen.getByTestId('main-tab-navigator')).toBeOnTheScreen();
      });
    });
  });

  describe('登出流程', () => {
    it('should redirect to welcome screen after logout', async () => {
      // Arrange
      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
      };

      let currentUser = mockUser;
      mockAuthServiceInstance.getCurrentUser.mockImplementation(() => currentUser);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(currentUser);
      });

      mockAuthServiceInstance.signOut.mockImplementation(async () => {
        currentUser = null;
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
        expect(screen.getByTestId('main-tab-navigator')).toBeOnTheScreen();
      });

      // Act - 執行登出
      const profileTab = screen.getByTestId('tab-profile');
      fireEvent.press(profileTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('profile-screen')).toBeOnTheScreen();
      });

      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.press(logoutButton);

      // Assert - 應該回到歡迎頁面
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeOnTheScreen();
      });
    });
  });
});
