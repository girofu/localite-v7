/**
 * AuthContext 整合測試 - TDD 紅色階段
 * 
 * 測試核心認證流程：
 * 1. 註冊後自動建立 Firestore 個人資料 ← 重點測試
 * 2. 登入後同步完整用戶資料
 * 3. 錯誤處理和狀態管理
 */

import React, { ReactNode } from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import { FirebaseAuthService } from '../../src/services/FirebaseAuthService';
import { FirestoreService } from '../../src/services/FirestoreService';
import { View, Text, TouchableOpacity } from 'react-native';
import { User } from '../../src/types/firestore.types';

// Mock 服務
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
const mockFirestoreService = FirestoreService as jest.MockedClass<typeof FirestoreService>;

// 測試組件 - 用來觸發 AuthContext 方法
interface TestComponentProps {
  onReady?: (methods: { signUp: any; signIn: any }) => void;
}

const TestComponent = ({ onReady }: TestComponentProps) => {
  const { user, loading, signUp, signIn } = useAuth();

  React.useEffect(() => {
    if (onReady) {
      onReady({ signUp, signIn });
    }
  }, [signUp, signIn, onReady]);

  return (
    <View testID="auth-test-component">
      <Text testID="user-state">
        {loading ? 'loading' : user ? `user-${user.uid}` : 'no-user'}
      </Text>
      <TouchableOpacity testID="sign-up-button" onPress={() => signUp('test@example.com', 'password123')}>
        <Text>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="sign-in-button" onPress={() => signIn('test@example.com', 'password123')}>
        <Text>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('AuthContext Integration Tests', () => {
  let mockAuthServiceInstance: jest.Mocked<FirebaseAuthService>;
  let mockFirestoreServiceInstance: jest.Mocked<FirestoreService>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock FirebaseAuthService 實例
    mockAuthServiceInstance = {
      signUpWithEmail: jest.fn(),
      signInWithEmail: jest.fn(),
      signOut: jest.fn(),
      getCurrentUser: jest.fn(),
      onAuthStateChanged: jest.fn(),
    } as any;

    // Mock FirestoreService 實例
    mockFirestoreServiceInstance = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
    } as any;

    // 設置 mock constructor 返回值
    mockFirebaseAuthService.mockImplementation(() => mockAuthServiceInstance);
    mockFirestoreService.mockImplementation(() => mockFirestoreServiceInstance);
  });

  describe('🔴 RED: 註冊流程 - 應該自動建立 Firestore 個人資料', () => {
    it('should create Firestore user profile after successful Firebase Auth registration', async () => {
      // Arrange
      const testEmail = 'newuser@example.com';
      const testPassword = 'password123';
      const mockAuthUser = {
        uid: 'new-user-123',
        email: testEmail,
        emailVerified: false,
      };

      // Mock Firebase Auth 註冊成功
      mockAuthServiceInstance.signUpWithEmail.mockResolvedValue({
        user: mockAuthUser,
      });

      // Mock Firestore createUser 成功
      mockFirestoreServiceInstance.createUser.mockResolvedValue({
        success: true,
        data: {
          id: mockAuthUser.uid,
          email: mockAuthUser.email,
          displayName: '',
          preferredLanguage: 'zh-TW',
          isEmailVerified: false,
          role: 'tourist',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      let capturedMethods: any;
      
      // Act
      render(
        <AuthProvider>
          <TestComponent onReady={(methods) => { capturedMethods = methods; }} />
        </AuthProvider>
      );

      // 等待組件渲染完成
      await waitFor(() => {
        expect(capturedMethods).toBeDefined();
      });

      // 執行註冊
      await act(async () => {
        await capturedMethods.signUp(testEmail, testPassword);
      });

      // Assert
      // 1. 應該呼叫 Firebase Auth 註冊
      expect(mockAuthServiceInstance.signUpWithEmail).toHaveBeenCalledWith(testEmail, testPassword);

      // 2. 🔥 關鍵測試：應該自動呼叫 Firestore createUser
      expect(mockFirestoreServiceInstance.createUser).toHaveBeenCalledWith({
        uid: mockAuthUser.uid,
        email: mockAuthUser.email,
        isEmailVerified: mockAuthUser.emailVerified,
        preferredLanguage: 'zh-TW',
      });

      // 3. 應該呼叫 createUser 一次
      expect(mockFirestoreServiceInstance.createUser).toHaveBeenCalledTimes(1);
    });

    it('should handle Firestore createUser failure gracefully', async () => {
      // Arrange
      const testEmail = 'test@example.com';
      const testPassword = 'password123';
      const mockAuthUser = {
        uid: 'user-123',
        email: testEmail,
        emailVerified: false,
      };

      // Mock Firebase Auth 註冊成功
      mockAuthServiceInstance.signUpWithEmail.mockResolvedValue({
        user: mockAuthUser,
      });

      // Mock Firestore createUser 失敗
      mockFirestoreServiceInstance.createUser.mockResolvedValue({
        success: false,
        error: new Error('Firestore connection failed'),
      });

      let capturedMethods: any;

      // Act & Assert
      render(
        <AuthProvider>
          <TestComponent onReady={(methods) => { capturedMethods = methods; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(capturedMethods).toBeDefined();
      });

      // 註冊應該要拋出錯誤，因為 Firestore 個人資料建立失敗
      await expect(act(async () => {
        await capturedMethods.signUp(testEmail, testPassword);
      })).rejects.toThrow();

      // 驗證還是有嘗試建立 Firestore 個人資料
      expect(mockFirestoreServiceInstance.createUser).toHaveBeenCalled();
    });
  });

  describe('🔴 RED: 登入流程 - 應該同步完整用戶資料', () => {
    it('should load complete user profile from Firestore after successful login', async () => {
      // Arrange
      const testEmail = 'existing@example.com';
      const testPassword = 'password123';
      const mockAuthUser = {
        uid: 'existing-user-123',
        email: testEmail,
        emailVerified: true,
      };

      const mockUserProfile: User = {
        id: mockAuthUser.uid,
        email: mockAuthUser.email,
        displayName: 'Test User',
        preferredLanguage: 'zh-TW',
        isEmailVerified: true,
        role: 'tourist',
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          language: 'zh-TW',
          theme: 'dark',
          notifications: {
            push: true,
            email: true,
            aiRecommendations: true,
          },
          aiSettings: {
            voiceEnabled: true,
            responseLength: 'medium',
            personality: 'friendly',
          },
        },
      };

      // Mock Firebase Auth 登入成功
      mockAuthServiceInstance.signInWithEmail.mockResolvedValue({
        user: mockAuthUser,
      });

      // Mock Firestore 用戶資料存在
      mockFirestoreServiceInstance.getUserById.mockResolvedValue(mockUserProfile);

      let capturedMethods: any;

      // Act
      render(
        <AuthProvider>
          <TestComponent onReady={(methods) => { capturedMethods = methods; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(capturedMethods).toBeDefined();
      });

      await act(async () => {
        await capturedMethods.signIn(testEmail, testPassword);
      });

      // Assert
      // 1. 應該呼叫 Firebase Auth 登入
      expect(mockAuthServiceInstance.signInWithEmail).toHaveBeenCalledWith(testEmail, testPassword);

      // 2. 🔥 關鍵測試：應該自動載入 Firestore 用戶資料
      expect(mockFirestoreServiceInstance.getUserById).toHaveBeenCalledWith(mockAuthUser.uid);
    });

    it('should create missing user profile if not exists in Firestore', async () => {
      // Arrange - 用戶在 Firebase Auth 存在，但 Firestore 沒有個人資料
      const testEmail = 'migrated@example.com';
      const testPassword = 'password123';
      const mockAuthUser = {
        uid: 'migrated-user-123',
        email: testEmail,
        emailVerified: true,
      };

      // Mock Firebase Auth 登入成功
      mockAuthServiceInstance.signInWithEmail.mockResolvedValue({
        user: mockAuthUser,
      });

      // Mock Firestore 用戶資料不存在
      mockFirestoreServiceInstance.getUserById.mockResolvedValue(null);
      mockFirestoreServiceInstance.createUser.mockResolvedValue({
        success: true,
        data: { id: mockAuthUser.uid, email: mockAuthUser.email },
      });

      let capturedMethods: any;

      // Act
      render(
        <AuthProvider>
          <TestComponent onReady={(methods) => { capturedMethods = methods; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(capturedMethods).toBeDefined();
      });

      await act(async () => {
        await capturedMethods.signIn(testEmail, testPassword);
      });

      // Assert
      // 1. 應該檢查 Firestore 用戶資料
      expect(mockFirestoreServiceInstance.getUserById).toHaveBeenCalledWith(mockAuthUser.uid);

      // 2. 🔥 關鍵測試：發現資料不存在時，應該自動建立
      expect(mockFirestoreServiceInstance.createUser).toHaveBeenCalledWith({
        uid: mockAuthUser.uid,
        email: mockAuthUser.email,
        isEmailVerified: mockAuthUser.emailVerified,
        preferredLanguage: 'zh-TW',
      });
    });
  });
});