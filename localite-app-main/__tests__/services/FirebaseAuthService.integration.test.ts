/**
 * Firebase Authentication Service Integration Tests
 * 
 * 此測試驗證 Firebase Authentication 服務整合
 * 使用真實的 Firebase 測試專案進行整合測試
 */

import { FirebaseAuthService } from '../../src/services/FirebaseAuthService';

describe('FirebaseAuthService Integration Tests', () => {
  let authService: FirebaseAuthService;

  beforeEach(() => {
    authService = new FirebaseAuthService();
  });

  afterEach(async () => {
    // 清理測試用戶
    if (authService.getCurrentUser()) {
      await authService.signOut();
    }
  });

  describe('User Registration', () => {
    it('should create user with email and password', async () => {
      // Arrange
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';

      // Act
      const result = await authService.signUpWithEmail(testEmail, testPassword);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(testEmail);
      expect(result.user.uid).toBeDefined();
      expect(typeof result.user.uid).toBe('string');
      expect(result.user.emailVerified).toBe(false);
    });

    it('should throw error when email format is invalid', async () => {
      // Arrange
      const invalidEmail = 'invalid-email';
      const password = 'TestPassword123!';

      // Act & Assert
      await expect(
        authService.signUpWithEmail(invalidEmail, password)
      ).rejects.toThrow('Invalid email format');
    });

    it('should throw error when password is too weak', async () => {
      // Arrange
      const email = `test-${Date.now()}@example.com`;
      const weakPassword = '123';

      // Act & Assert
      await expect(
        authService.signUpWithEmail(email, weakPassword)
      ).rejects.toThrow('Password is too weak');
    });
  });

  describe('User Sign In', () => {
    const testEmail = 'test-user@localite.test';
    const testPassword = 'TestPassword123!';

    beforeEach(async () => {
      // 建立測試用戶
      try {
        await authService.signUpWithEmail(testEmail, testPassword);
      } catch (error) {
        // 用戶可能已存在，忽略錯誤
      }
      await authService.signOut();
    });

    it('should sign in with valid credentials', async () => {
      // Act
      const result = await authService.signInWithEmail(testEmail, testPassword);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(testEmail);
      expect(result.user.uid).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      // Arrange
      const wrongPassword = 'WrongPassword123!';

      // Act & Assert
      await expect(
        authService.signInWithEmail(testEmail, wrongPassword)
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Google Sign In', () => {
    it('should initiate Google sign in flow', async () => {
      // Act
      const result = await authService.signInWithGoogle();

      // Assert
      // Google sign in 在測試環境中會返回 mock 結果
      expect(result).toHaveProperty('cancelled');
      if (!result.cancelled) {
        expect(result).toHaveProperty('user');
        expect(result.user.email).toContain('@');
      }
    });
  });

  describe('User State Management', () => {
    it('should return null when no user is signed in', () => {
      // Act
      const currentUser = authService.getCurrentUser();

      // Assert
      expect(currentUser).toBeNull();
    });

    it('should return user info when user is signed in', async () => {
      // Arrange
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      await authService.signUpWithEmail(testEmail, testPassword);

      // Act
      const currentUser = authService.getCurrentUser();

      // Assert
      expect(currentUser).not.toBeNull();
      expect(currentUser?.email).toBe(testEmail);
    });

    it('should sign out user successfully', async () => {
      // Arrange
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      await authService.signUpWithEmail(testEmail, testPassword);

      // Act
      await authService.signOut();

      // Assert
      const currentUser = authService.getCurrentUser();
      expect(currentUser).toBeNull();
    });
  });

  describe('Authentication State Listener', () => {
    it('should notify when authentication state changes', async () => {
      // Arrange
      const mockCallback = jest.fn();
      authService.onAuthStateChanged(mockCallback);

      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';

      // Act
      await authService.signUpWithEmail(testEmail, testPassword);
      
      // Wait for callback to be called
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert
      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          email: testEmail,
          uid: expect.any(String)
        })
      );
    });
  });
});
