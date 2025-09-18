/**
 * 🧪 整合測試：用戶驗證狀態管理
 * 
 * 測試待認證/已認證狀態的完整流程
 */

import { FirebaseAuthService } from '../../src/services/FirebaseAuthService';

describe('🧪 用戶驗證狀態整合測試', () => {
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

  it('should create user in pending verification state', async () => {
    const testEmail = `verification-state-${Date.now()}@example.com`;
    const testPassword = 'VerificationTest123!';

    console.log('🔵 測試：創建待認證狀態用戶');
    
    // Step 1: 註冊新用戶
    const signUpResult = await authService.signUpWithEmail(testEmail, testPassword);
    
    // 驗證用戶狀態
    expect(signUpResult.user.emailVerified).toBe(false); // 新用戶應該未驗證
    expect(signUpResult.verificationEmailSent).toBe(true); // 應該發送驗證email
    
    console.log('✅ 新用戶創建成功，狀態:', {
      emailVerified: signUpResult.user.emailVerified,
      verificationEmailSent: signUpResult.verificationEmailSent
    });
  });

  it('should maintain user session for pending verification', async () => {
    const testEmail = `pending-session-${Date.now()}@example.com`;
    const testPassword = 'PendingTest123!';

    console.log('🔵 測試：待認證用戶會話保持');
    
    // 註冊用戶
    const signUpResult = await authService.signUpWithEmail(testEmail, testPassword);
    
    // 檢查當前用戶
    const currentUser = authService.getCurrentUser();
    expect(currentUser).not.toBeNull();
    expect(currentUser?.email).toBe(testEmail);
    expect(currentUser?.emailVerified).toBe(false);
    
    console.log('✅ 待認證用戶會話正確保持:', {
      hasUser: !!currentUser,
      emailVerified: currentUser?.emailVerified
    });
  });

  it('should provide email verification methods', async () => {
    const testEmail = `verification-methods-${Date.now()}@example.com`;
    const testPassword = 'MethodsTest123!';

    console.log('🔵 測試：email驗證方法可用性');
    
    // 註冊用戶
    await authService.signUpWithEmail(testEmail, testPassword);
    
    // 測試驗證相關方法
    expect(authService.sendEmailVerification).toBeDefined();
    expect(authService.checkEmailVerificationStatus).toBeDefined();
    expect(authService.reloadUser).toBeDefined();
    
    // 測試方法執行
    const resendResult = await authService.sendEmailVerification();
    expect(resendResult.success).toBe(true);
    
    const statusResult = await authService.checkEmailVerificationStatus();
    expect(statusResult.isVerified).toBe(false);
    expect(statusResult.email).toBe(testEmail);
    
    console.log('✅ 所有驗證方法正常運作');
  });

  it('should handle verification state transitions', async () => {
    const testEmail = `state-transition-${Date.now()}@example.com`;
    const testPassword = 'TransitionTest123!';

    console.log('🔵 測試：驗證狀態轉換');
    
    // 註冊用戶
    const signUpResult = await authService.signUpWithEmail(testEmail, testPassword);
    
    // 初始狀態應該是未驗證
    expect(signUpResult.user.emailVerified).toBe(false);
    
    // 重新載入用戶資料
    const reloadedUser = await authService.reloadUser();
    expect(reloadedUser).not.toBeNull();
    expect(reloadedUser?.email).toBe(testEmail);
    
    console.log('✅ 狀態轉換邏輯正常運作');
  });

  console.log('🎉 用戶驗證狀態管理測試完成！');
});
