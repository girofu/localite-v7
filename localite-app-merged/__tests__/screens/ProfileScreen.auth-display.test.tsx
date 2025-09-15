/**
 * ProfileScreen 認證顯示測試 - TDD 紅色階段
 * 
 * 測試問題：
 * 1. 🚫 ProfileScreen 不應該硬編碼顯示 "Dannypi@gmail.com"
 * 2. ✅ 應該根據實際認證狀態顯示用戶資料
 * 3. ✅ 登出功能應該正常運作
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../../screens/ProfileScreen';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import { FirebaseAuthService } from '../../src/services/FirebaseAuthService';

// Mock 認證服務
jest.mock('../../src/services/FirebaseAuthService');
jest.mock('../../src/services/FirestoreService');
jest.mock('../../src/services/LoggingService', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    logError: jest.fn(),
    logAuthEvent: jest.fn(),
    logUserAction: jest.fn(),
  },
}));

const mockFirebaseAuthService = FirebaseAuthService as jest.MockedClass<typeof FirebaseAuthService>;

describe('ProfileScreen 認證顯示測試', () => {
  let mockAuthServiceInstance: jest.Mocked<FirebaseAuthService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockAuthServiceInstance = {
      signUpWithEmail: jest.fn(),
      signInWithEmail: jest.fn(),
      signOut: jest.fn(),
      getCurrentUser: jest.fn(),
      onAuthStateChanged: jest.fn(),
    } as any;
    
    mockFirebaseAuthService.mockImplementation(() => mockAuthServiceInstance);
  });

  describe('🔴 RED: 用戶資料顯示問題', () => {
    it('should NOT display hardcoded Dannypi@gmail.com when no user is logged in', async () => {
      // Arrange - 沒有登入用戶
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(null);
      
      const mockProps = {
        onBack: jest.fn(),
        onLogout: jest.fn(),
        onUpgradeSubscription: jest.fn(),
        onDeleteAccount: jest.fn(),
      };

      // Act
      render(
        <AuthProvider>
          <ProfileScreen {...mockProps} />
        </AuthProvider>
      );

      // Assert - 🔥 這個測試應該會失敗，因為目前硬編碼了 Dannypi@gmail.com
      // 期望：不應該顯示 Dannypi@gmail.com 這個硬編碼的郵件
      expect(screen.queryByText('Dannypi@gmail.com')).toBeNull();
      
      // 期望：應該顯示未登入狀態或提示登入
      expect(screen.queryByText(/請先登入/i) || screen.queryByText(/未登入/i)).toBeTruthy();
    });

    it('should display actual logged-in user email instead of hardcoded data', async () => {
      // Arrange - 有實際登入的用戶
      const realUser = {
        uid: 'real-user-123',
        email: 'realuser@example.com',
        emailVerified: true,
      };
      
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(realUser);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(realUser);
      });
      
      const mockProps = {
        onBack: jest.fn(),
        onLogout: jest.fn(),
        onUpgradeSubscription: jest.fn(),
        onDeleteAccount: jest.fn(),
      };

      // Act
      render(
        <AuthProvider>
          <ProfileScreen {...mockProps} />
        </AuthProvider>
      );

      // Wait for auth state to update
      await waitFor(() => {
        // Assert - 🔥 這個測試應該會失敗，因為目前硬編碼了 Dannypi@gmail.com
        expect(screen.getByText('realuser@example.com')).toBeTruthy();
      });

      // 不應該顯示硬編碼的測試資料
      expect(screen.queryByText('Dannypi@gmail.com')).toBeNull();
      expect(screen.queryByText('Dannypi')).toBeNull();
    });

    it('should display correct user display name based on email prefix', async () => {
      // Arrange - 測試使用者名稱顯示邏輯
      const testUser = {
        uid: 'test-user-456',
        email: 'johndoe@gmail.com', 
        emailVerified: true,
      };
      
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(testUser);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(testUser);
      });
      
      const mockProps = {
        onBack: jest.fn(),
        onLogout: jest.fn(),
        onUpgradeSubscription: jest.fn(),
        onDeleteAccount: jest.fn(),
      };

      // Act
      render(
        <AuthProvider>
          <ProfileScreen {...mockProps} />
        </AuthProvider>
      );

      // Wait for auth state to update
      await waitFor(() => {
        // Assert - 🔥 這個測試應該會失敗，因為目前固定顯示 Dannypi
        expect(screen.getByText('johndoe')).toBeTruthy(); // 期望顯示郵件前綴
      });

      // 不應該顯示硬編碼的 Dannypi
      expect(screen.queryByText('Dannypi')).toBeNull();
    });
  });

  describe('🔴 RED: 登出功能測試', () => {
    it('should call signOut when logout button is pressed', async () => {
      // Arrange
      const realUser = {
        uid: 'logged-in-user',
        email: 'loggedin@example.com',
        emailVerified: true,
      };
      
      mockAuthServiceInstance.getCurrentUser.mockReturnValue(realUser);
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        callback(realUser);
      });
      
      const mockOnLogout = jest.fn();
      const mockProps = {
        onBack: jest.fn(),
        onLogout: mockOnLogout,
        onUpgradeSubscription: jest.fn(),
        onDeleteAccount: jest.fn(),
      };

      // Act
      render(
        <AuthProvider>
          <ProfileScreen {...mockProps} />
        </AuthProvider>
      );

      // 找到並點擊登出按鈕
      const logoutButton = await screen.findByText(/登出/i);
      fireEvent.press(logoutButton);

      // Assert - 🔥 這個測試可能會失敗如果登出功能有問題
      await waitFor(() => {
        expect(mockAuthServiceInstance.signOut).toHaveBeenCalled();
        expect(mockOnLogout).toHaveBeenCalled();
      });
    });

    it('should clear user state after successful logout', async () => {
      // Arrange
      const initialUser = {
        uid: 'user-to-logout',
        email: 'logout@example.com', 
        emailVerified: true,
      };
      
      // 初始狀態：用戶已登入
      mockAuthServiceInstance.getCurrentUser
        .mockReturnValueOnce(initialUser)  // 第一次調用返回用戶
        .mockReturnValueOnce(null);        // 登出後返回 null
      
      let authStateCallback: ((user: any) => void) | null = null;
      mockAuthServiceInstance.onAuthStateChanged.mockImplementation((callback) => {
        authStateCallback = callback;
        callback(initialUser); // 初始調用
      });
      
      mockAuthServiceInstance.signOut.mockImplementation(async () => {
        // 模擬登出後的狀態變化
        if (authStateCallback) {
          authStateCallback(null);
        }
      });
      
      const mockOnLogout = jest.fn();
      const mockProps = {
        onBack: jest.fn(),
        onLogout: mockOnLogout,
        onUpgradeSubscription: jest.fn(),
        onDeleteAccount: jest.fn(),
      };

      // Act
      render(
        <AuthProvider>
          <ProfileScreen {...mockProps} />
        </AuthProvider>
      );

      // 確認初始狀態顯示用戶郵件
      await waitFor(() => {
        expect(screen.getByText('logout@example.com')).toBeTruthy();
      });

      // 執行登出
      const logoutButton = await screen.findByText(/登出/i);
      fireEvent.press(logoutButton);

      // Assert - 登出後應該清除用戶狀態
      await waitFor(() => {
        expect(mockAuthServiceInstance.signOut).toHaveBeenCalled();
        // 登出後不應該再顯示用戶郵件
        expect(screen.queryByText('logout@example.com')).toBeNull();
      });
    });
  });
});
