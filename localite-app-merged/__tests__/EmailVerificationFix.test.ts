/**
 * Email 驗證修復測試 - 確保使用 Firestore isEmailVerified 作為權威來源
 */

import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { FirestoreService } from '../src/services/FirestoreService';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock services
jest.mock('../src/services/FirestoreService');
jest.mock('../src/services/LoggingService', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const MockedFirestoreService = FirestoreService as jest.MockedClass<typeof FirestoreService>;

describe('Email Verification Fix - Firestore as Authority', () => {
  let mockFirestoreInstance: jest.Mocked<FirestoreService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFirestoreInstance = new MockedFirestoreService() as jest.Mocked<FirestoreService>;
    MockedFirestoreService.mockImplementation(() => mockFirestoreInstance);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should use Firestore isEmailVerified as authority source', async () => {
    // 模擬用戶資料：Firebase Auth 顯示已驗證，但 Firestore 顯示未驗證
    const mockUser = {
      uid: 'rV4AVCq6x8gREEZQjV0TNUDlO8l2',
      email: 'cwfu02@gmail.com',
      emailVerified: true, // Firebase Auth 顯示已驗證
    };

    // Firestore 資料顯示未驗證
    const mockFirestoreUser = {
      uid: 'rV4AVCq6x8gREEZQjV0TNUDlO8l2',
      email: 'cwfu02@gmail.com',
      isEmailVerified: false, // Firestore 顯示未驗證
      id: 'rV4AVCq6x8gREEZQjV0TNUDlO8l2',
      preferredLanguage: 'zh-TW',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFirestoreInstance.getUserById.mockResolvedValue(mockFirestoreUser as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // 等待 auth state 初始化
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 檢查是否使用 Firestore 的 isEmailVerified 作為權威來源
    expect(mockFirestoreInstance.getUserById).toHaveBeenCalledWith(mockUser.uid);
    
    // 驗證狀態應該基於 Firestore 的 isEmailVerified (false)，而不是 Firebase Auth 的 emailVerified (true)
    expect(result.current.verificationState).toBe('pending_verification');
  });

  it('should show verified when Firestore isEmailVerified is true', async () => {
    const mockUser = {
      uid: 'test-user-verified',
      email: 'verified@test.com',
      emailVerified: false, // Firebase Auth 顯示未驗證
    };

    // Firestore 資料顯示已驗證
    const mockFirestoreUser = {
      uid: 'test-user-verified',
      email: 'verified@test.com',
      isEmailVerified: true, // Firestore 顯示已驗證
      id: 'test-user-verified',
      preferredLanguage: 'zh-TW',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFirestoreInstance.getUserById.mockResolvedValue(mockFirestoreUser as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 驗證狀態應該基於 Firestore 的 isEmailVerified (true)
    expect(result.current.verificationState).toBe('verified');
  });

  it('should fallback to pending_verification when Firestore query fails', async () => {
    const mockUser = {
      uid: 'test-user-error',
      email: 'error@test.com',
      emailVerified: true,
    };

    // 模擬 Firestore 查詢失敗
    mockFirestoreInstance.getUserById.mockRejectedValue(new Error('Firestore query failed'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 查詢失敗時應該回退到待驗證狀態
    expect(result.current.verificationState).toBe('pending_verification');
  });
});
