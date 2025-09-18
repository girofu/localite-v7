/**
 * 🧪 整合測試：完整的 Email 驗證註冊流程
 * 
 * 驗證從註冊到 email 驗證完成的整個流程
 */

import { FirebaseAuthService } from '../../src/services/FirebaseAuthService';

describe('🧪 Email 驗證註冊流程整合測試', () => {
  let authService: FirebaseAuthService;
  
  beforeEach(() => {
    authService = new FirebaseAuthService();
  });

  afterEach(async () => {
    try {
      if (authService.getCurrentUser()) {
        await authService.signOut();
      }
    } catch (error) {
      // 忽略清理錯誤
    }
  });

  it('should complete full email verification registration flow', async () => {
    const testEmail = `integration-test-${Date.now()}@example.com`;
    const testPassword = 'IntegrationTest123!';

    // Step 1: 註冊新用戶
    console.log('🔵 步驟 1: 註冊新用戶');
    const signUpResult = await authService.signUpWithEmail(testEmail, testPassword);
    
    // 驗證註冊結果
    expect(signUpResult.user).toBeDefined();
    expect(signUpResult.user.email).toBe(testEmail);
    expect(signUpResult.user.emailVerified).toBe(false); // 新註冊用戶應該未驗證
    expect(signUpResult.verificationEmailSent).toBe(true); // 應該自動發送驗證 email
    
    console.log('✅ 註冊成功，用戶狀態:', {
      uid: signUpResult.user.uid,
      email: signUpResult.user.email,
      emailVerified: signUpResult.user.emailVerified,
      verificationEmailSent: signUpResult.verificationEmailSent
    });

    // Step 2: 檢查驗證狀態
    console.log('🔵 步驟 2: 檢查 email 驗證狀態');
    const verificationStatus = await authService.checkEmailVerificationStatus();
    
    expect(verificationStatus.isVerified).toBe(false);
    expect(verificationStatus.email).toBe(testEmail);
    
    console.log('✅ 驗證狀態確認:', verificationStatus);

    // Step 3: 重新發送驗證 email
    console.log('🔵 步驟 3: 重新發送驗證 email');
    const resendResult = await authService.sendEmailVerification({
      languageCode: 'zh-TW'
    });
    
    expect(resendResult.success).toBe(true);
    console.log('✅ 重新發送驗證 email 成功');

    // Step 4: 重新載入用戶資料
    console.log('🔵 步驟 4: 重新載入用戶資料');
    const reloadedUser = await authService.reloadUser();
    
    expect(reloadedUser).toBeDefined();
    expect(reloadedUser?.email).toBe(testEmail);
    console.log('✅ 用戶資料重新載入成功');

    console.log('🎉 完整 email 驗證流程測試通過！');
  });

  it('should handle registration without affecting existing auth flow', async () => {
    // 測試現有認證流程不受影響
    const testEmail = `existing-flow-${Date.now()}@example.com`;
    const testPassword = 'ExistingFlow123!';

    const result = await authService.signUpWithEmail(testEmail, testPassword);
    
    // 即使有 email 驗證功能，基本註冊還是應該成功
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    
    // 基本認證方法應該依然可用
    const currentUser = authService.getCurrentUser();
    expect(currentUser).toBeDefined();
    expect(currentUser?.email).toBe(testEmail);

    console.log('✅ 現有認證流程保持完整');
  });

  it('should provide all required email verification methods', () => {
    // 確認所有新方法都已正確定義
    expect(authService.sendEmailVerification).toBeDefined();
    expect(typeof authService.sendEmailVerification).toBe('function');
    
    expect(authService.checkEmailVerificationStatus).toBeDefined();
    expect(typeof authService.checkEmailVerificationStatus).toBe('function');
    
    expect(authService.reloadUser).toBeDefined();
    expect(typeof authService.reloadUser).toBe('function');

    console.log('✅ 所有 email 驗證方法都已正確定義');
  });
});
