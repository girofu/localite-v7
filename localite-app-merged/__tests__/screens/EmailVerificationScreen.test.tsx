/**
 * 🔴 RED PHASE: EmailVerificationScreen TDD Tests
 * 
 * 測試 email 驗證待確認畫面的功能
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EmailVerificationScreen from '../../src/screens/auth/EmailVerificationScreen';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock useAuth context
const mockSendEmailVerification = jest.fn();
const mockCheckEmailVerificationStatus = jest.fn();
const mockReloadUser = jest.fn();
const mockSignOut = jest.fn();

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    sendEmailVerification: mockSendEmailVerification,
    checkEmailVerificationStatus: mockCheckEmailVerificationStatus, 
    reloadUser: mockReloadUser,
    signOut: mockSignOut,
    user: { email: 'test@example.com', emailVerified: false }
  })
}));

const defaultProps = {
  email: 'test@example.com',
  onClose: jest.fn(),
  onVerificationComplete: jest.fn(),
};

describe('🔴 Red Phase: EmailVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UI 元素渲染', () => {
    it('should render email verification screen with correct email', () => {
      render(<EmailVerificationScreen {...defaultProps} />);
      
      // 🔥 這些元素還不存在
      expect(screen.getByText('請確認您的信箱')).toBeTruthy();
      expect(screen.getByText(/test@example.com/)).toBeTruthy();
      expect(screen.getByText('重新發送')).toBeTruthy();
      expect(screen.getByText('我已確認')).toBeTruthy();
    });

    it('should display verification instructions', () => {
      render(<EmailVerificationScreen {...defaultProps} />);
      
      // 🔥 這些說明文字還不存在
      expect(screen.getByText(/我們已經發送驗證信/)).toBeTruthy();
      expect(screen.getByText(/請點擊信中的連結/)).toBeTruthy();
    });

    it('should show back/close button', () => {
      render(<EmailVerificationScreen {...defaultProps} />);
      
      // 🔥 返回按鈕還不存在
      expect(screen.getByTestId('back-button')).toBeTruthy();
    });
  });

  describe('重新發送驗證 email', () => {
    it('should call sendEmailVerification when resend button pressed', async () => {
      mockSendEmailVerification.mockResolvedValue({ success: true });
      
      render(<EmailVerificationScreen {...defaultProps} />);
      
      fireEvent.press(screen.getByText('重新發送'));
      
      // 🔥 方法還沒實作
      expect(mockSendEmailVerification).toHaveBeenCalled();
    });

    it('should show success message when resend succeeds', async () => {
      mockSendEmailVerification.mockResolvedValue({ success: true });
      
      render(<EmailVerificationScreen {...defaultProps} />);
      
      fireEvent.press(screen.getByText('重新發送'));
      
      await waitFor(() => {
        // 🔥 成功訊息還沒實作
        expect(Alert.alert).toHaveBeenCalledWith('發送成功', '驗證信已重新發送，請檢查您的信箱');
      });
    });

    it('should show error message when resend fails', async () => {
      mockSendEmailVerification.mockResolvedValue({ 
        success: false, 
        error: { message: '發送失敗', code: 'send-error' } 
      });
      
      render(<EmailVerificationScreen {...defaultProps} />);
      
      fireEvent.press(screen.getByText('重新發送'));
      
      await waitFor(() => {
        // 🔥 錯誤處理還沒實作
        expect(Alert.alert).toHaveBeenCalledWith('發送失敗', '發送失敗');
      });
    });

    it('should disable resend button while sending', async () => {
      mockSendEmailVerification.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      render(<EmailVerificationScreen {...defaultProps} />);
      
      const resendButton = screen.getByText('重新發送');
      fireEvent.press(resendButton);
      
      // 🔥 loading 狀態還沒實作
      expect(resendButton.props.style).toContainEqual(expect.objectContaining({
        opacity: 0.5
      }));
    });
  });

  describe('檢查驗證狀態', () => {
    it('should call checkEmailVerificationStatus when check button pressed', async () => {
      mockCheckEmailVerificationStatus.mockResolvedValue({ isVerified: false, email: 'test@example.com' });
      
      render(<EmailVerificationScreen {...defaultProps} />);
      
      fireEvent.press(screen.getByText('我已確認'));
      
      // 🔥 檢查方法還沒實作
      expect(mockCheckEmailVerificationStatus).toHaveBeenCalled();
    });

    it('should call onVerificationComplete when email is verified', async () => {
      mockCheckEmailVerificationStatus.mockResolvedValue({ isVerified: true, email: 'test@example.com' });
      mockReloadUser.mockResolvedValue({ email: 'test@example.com', emailVerified: true });
      
      render(<EmailVerificationScreen {...defaultProps} />);
      
      fireEvent.press(screen.getByText('我已確認'));
      
      await waitFor(() => {
        // 🔥 驗證完成回調還沒實作
        expect(defaultProps.onVerificationComplete).toHaveBeenCalled();
      });
    });

    it('should show message when email is not yet verified', async () => {
      mockCheckEmailVerificationStatus.mockResolvedValue({ isVerified: false, email: 'test@example.com' });
      
      render(<EmailVerificationScreen {...defaultProps} />);
      
      fireEvent.press(screen.getByText('我已確認'));
      
      await waitFor(() => {
        // 🔥 未驗證訊息還沒實作
        expect(Alert.alert).toHaveBeenCalledWith('尚未驗證', '您的信箱尚未驗證，請點擊信中的連結後再試');
      });
    });

    it('should handle verification check errors gracefully', async () => {
      mockCheckEmailVerificationStatus.mockRejectedValue(new Error('Network error'));
      
      render(<EmailVerificationScreen {...defaultProps} />);
      
      fireEvent.press(screen.getByText('我已確認'));
      
      await waitFor(() => {
        // 🔥 錯誤處理還沒實作
        expect(Alert.alert).toHaveBeenCalledWith('檢查失敗', '無法檢查驗證狀態，請稍後再試');
      });
    });
  });

  describe('導航和關閉', () => {
    it('should call onClose when back button pressed', () => {
      render(<EmailVerificationScreen {...defaultProps} />);
      
      fireEvent.press(screen.getByTestId('back-button'));
      
      // 🔥 關閉功能還沒實作
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should provide option to sign out', () => {
      render(<EmailVerificationScreen {...defaultProps} />);
      
      // 🔥 登出選項還不存在
      const signOutButton = screen.getByText('使用其他帳號');
      fireEvent.press(signOutButton);
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('可訪問性和用戶體驗', () => {
    it('should have proper accessibility labels', () => {
      render(<EmailVerificationScreen {...defaultProps} />);
      
      // 🔥 可訪問性標籤還沒添加
      expect(screen.getByLabelText('重新發送驗證信')).toBeTruthy();
      expect(screen.getByLabelText('確認信箱已驗證')).toBeTruthy();
    });

    it('should disable buttons during loading states', async () => {
      mockSendEmailVerification.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      render(<EmailVerificationScreen {...defaultProps} />);
      
      const resendButton = screen.getByText('重新發送');
      const checkButton = screen.getByText('我已確認');
      
      fireEvent.press(resendButton);
      
      // 🔥 按鈕禁用狀態還沒實作
      expect(resendButton.props.disabled).toBe(true);
      expect(checkButton.props.disabled).toBe(true);
    });
  });
});
