/**
 * TDD Red Phase: 混合認證UI系統測試
 * 目標：保留舊系統UI設計 + 整合新系統認證功能
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { HybridLoginScreen } from '../../src/screens/auth/HybridLoginScreen';
import { useAuth } from '../../src/contexts/AuthContext';

// Mock dependencies
jest.mock('../../src/contexts/AuthContext');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockAlert = Alert.alert as jest.Mock;

describe('🔴 Red Phase: HybridLoginScreen TDD Tests', () => {
  const defaultProps = {
    navigation: {
      goBack: jest.fn(),
      navigate: jest.fn(),
    },
    onClose: jest.fn(),
    onGoogleLogin: jest.fn(),
    onAppleLogin: jest.fn(),
    returnToChat: false,
  };

  const defaultAuthContext = {
    user: null,
    loading: false,
    isGuestMode: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    enterGuestMode: jest.fn(),
    exitGuestMode: jest.fn(),
    shouldPromptLogin: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(defaultAuthContext);
  });

  describe('🎨 UI Visual Requirements', () => {
    it('should render with old system beautiful UI elements', () => {
      render(<HybridLoginScreen {...defaultProps} />);

      // 測試舊系統的視覺元素
      expect(screen.getByTestId('linear-gradient-container')).toBeTruthy();
      expect(screen.getByTestId('logo-container')).toBeTruthy();
      expect(screen.getByText('探索在地文化 即時列印美好')).toBeTruthy();
      expect(screen.getByText('歡迎回來!')).toBeTruthy();
      expect(screen.getByText('輸入你的資訊登入Localite.ai')).toBeTruthy();
    });

    it('should display social login buttons from old system', () => {
      render(<HybridLoginScreen {...defaultProps} />);

      expect(screen.getByTestId('google-login-button')).toBeTruthy();
      expect(screen.getByTestId('apple-login-button')).toBeTruthy();
      expect(screen.getByText('用 Google 登入')).toBeTruthy();
      expect(screen.getByText('用 Apple 登入')).toBeTruthy();
    });

    it('should have proper gradient background styling', () => {
      render(<HybridLoginScreen {...defaultProps} />);
      
      const gradientContainer = screen.getByTestId('linear-gradient-container');
      expect(gradientContainer.props.colors).toEqual(['#1E1E1E', '#434343']);
    });
  });

  describe('⚡ New System Authentication Functionality', () => {
    it('should integrate with useAuth hook correctly', () => {
      render(<HybridLoginScreen {...defaultProps} />);
      
      // 驗證 useAuth hook 被調用
      expect(mockUseAuth).toHaveBeenCalled();
    });

    it('should show loading indicator when authentication is in progress', async () => {
      const mockSignIn = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      mockUseAuth.mockReturnValue({
        ...defaultAuthContext,
        signIn: mockSignIn,
      });

      render(<HybridLoginScreen {...defaultProps} />);

      // 填入登入資料
      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      // 點擊登入按鈕
      const loginButton = screen.getByTestId('login-button');
      fireEvent.press(loginButton);

      // 應該顯示 loading 指示器
      expect(screen.getByTestId('login-loading-indicator')).toBeTruthy();
      expect(screen.queryByText('登入')).toBeNull();

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should handle authentication errors properly', async () => {
      const mockSignIn = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
      mockUseAuth.mockReturnValue({
        ...defaultAuthContext,
        signIn: mockSignIn,
      });

      render(<HybridLoginScreen {...defaultProps} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          '登入失敗',
          'Invalid credentials'
        );
      });
    });

    it('should validate input fields before authentication', async () => {
      render(<HybridLoginScreen {...defaultProps} />);

      // 只填入 email，密碼留空
      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.press(screen.getByTestId('login-button'));

      expect(mockAlert).toHaveBeenCalledWith('錯誤', '請輸入 Email 和密碼');
    });

    it('should disable button during loading state', async () => {
      const mockSignIn = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      mockUseAuth.mockReturnValue({
        ...defaultAuthContext,
        signIn: mockSignIn,
      });

      render(<HybridLoginScreen {...defaultProps} />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      const loginButton = screen.getByTestId('login-button');
      fireEvent.press(loginButton);

      // 按鈕應該被禁用
      expect(loginButton.props.disabled).toBe(true);
    });
  });

  describe('🔗 Navigation Integration', () => {
    it('should handle back navigation correctly', () => {
      const mockGoBack = jest.fn();
      render(<HybridLoginScreen {...{ ...defaultProps, navigation: { ...defaultProps.navigation, goBack: mockGoBack } }} />);

      fireEvent.press(screen.getByTestId('back-button'));
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should navigate to register screen', () => {
      const mockNavigate = jest.fn();
      render(<HybridLoginScreen {...{ ...defaultProps, navigation: { ...defaultProps.navigation, navigate: mockNavigate } }} />);

      fireEvent.press(screen.getByTestId('register-link'));
      expect(mockNavigate).toHaveBeenCalledWith('Register');
    });

    it('should handle returnToChat navigation flow', () => {
      const mockOnClose = jest.fn();
      render(<HybridLoginScreen {...{ ...defaultProps, onClose: mockOnClose, returnToChat: true }} />);

      fireEvent.press(screen.getByTestId('back-button'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('🔲 Social Login Integration', () => {
    it('should trigger Google login when Google button pressed', () => {
      const mockOnGoogleLogin = jest.fn();
      render(<HybridLoginScreen {...{ ...defaultProps, onGoogleLogin: mockOnGoogleLogin }} />);

      fireEvent.press(screen.getByTestId('google-login-button'));
      expect(mockOnGoogleLogin).toHaveBeenCalled();
    });

    it('should trigger Apple login when Apple button pressed', () => {
      const mockOnAppleLogin = jest.fn();
      render(<HybridLoginScreen {...{ ...defaultProps, onAppleLogin: mockOnAppleLogin }} />);

      fireEvent.press(screen.getByTestId('apple-login-button'));
      expect(mockOnAppleLogin).toHaveBeenCalled();
    });
  });

  describe('📱 Responsive Design', () => {
    it('should handle keyboard avoiding view properly', () => {
      render(<HybridLoginScreen {...defaultProps} />);
      
      expect(screen.getByTestId('keyboard-avoiding-view')).toBeTruthy();
    });

    it('should have proper safe area handling', () => {
      render(<HybridLoginScreen {...defaultProps} />);
      
      expect(screen.getByTestId('safe-area-view')).toBeTruthy();
    });
  });
});

describe('🔴 Red Phase: HybridRegisterScreen TDD Tests', () => {
  // Similar test structure for register screen
  it('should be implemented with same hybrid approach', () => {
    // This test will fail until we implement HybridRegisterScreen
    expect(() => {
      require('../../src/screens/auth/HybridRegisterScreen');
    }).not.toThrow();
  });
});
