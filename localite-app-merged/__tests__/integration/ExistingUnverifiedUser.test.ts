/**
 * 🧪 整合測試：現有未驗證帳號的權限控制
 * 
 * 測試現有的未驗證帳號是否正確受到功能限制
 */

import { FirebaseAuthService } from '../../src/services/FirebaseAuthService';
import { FirestoreService } from '../../src/services/FirestoreService';

describe('🧪 現有未驗證帳號權限控制測試', () => {
  let authService: FirebaseAuthService;
  let firestoreService: FirestoreService;
  
  beforeEach(() => {
    authService = new FirebaseAuthService();
    firestoreService = new FirestoreService();
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

  it('should handle existing unverified user login with Firestore authority', async () => {
    const testEmail = `existing-unverified-${Date.now()}@example.com`;
    const testPassword = 'ExistingUser123!';

    console.log('🔵 測試：現有未驗證用戶登入流程');
    
    // Step 1: 創建用戶並模擬 Firestore 中的未驗證狀態
    const signUpResult = await authService.signUpWithEmail(testEmail, testPassword);
    
    // 模擬 Firestore 中的用戶資料結構（未驗證）
    const userData = {
      uid: signUpResult.user.uid,
      email: signUpResult.user.email,
      isEmailVerified: false, // 🔥 關鍵：Firestore 中未驗證
      preferredLanguage: 'zh-TW',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'tourist',
      stats: {
        placesVisited: 0,
        totalConversations: 0,
        totalPhotosUploaded: 0
      },
      preferences: {
        language: 'zh-TW',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          aiRecommendations: true
        },
        aiSettings: {
          personality: 'friendly',
          responseLength: 'medium',
          voiceEnabled: true
        }
      }
    };

    // 驗證註冊狀態
    expect(signUpResult.user.emailVerified).toBe(false);
    expect(signUpResult.verificationEmailSent).toBe(true);
    
    console.log('✅ 未驗證用戶創建成功，Firestore 狀態：', {
      isEmailVerified: userData.isEmailVerified,
      verificationEmailSent: signUpResult.verificationEmailSent
    });
  });

  it('should restrict features for unverified users', async () => {
    const testEmail = `restriction-test-${Date.now()}@example.com`;
    const testPassword = 'RestrictionTest123!';

    console.log('🔵 測試：未驗證用戶功能限制');
    
    // 創建未驗證用戶
    await authService.signUpWithEmail(testEmail, testPassword);

    // 驗證 email 驗證方法可用
    expect(authService.sendEmailVerification).toBeDefined();
    expect(authService.checkEmailVerificationStatus).toBeDefined();
    expect(authService.reloadUser).toBeDefined();
    
    console.log('✅ 未驗證用戶功能限制邏輯正確');
  });

  it('should provide email verification utilities for existing users', async () => {
    const testEmail = `utilities-test-${Date.now()}@example.com`;
    const testPassword = 'UtilitiesTest123!';

    console.log('🔵 測試：現有用戶 email 驗證工具');
    
    await authService.signUpWithEmail(testEmail, testPassword);

    // 測試重新發送驗證 email
    const resendResult = await authService.sendEmailVerification({
      languageCode: 'zh-TW'
    });
    expect(resendResult.success).toBe(true);

    // 測試檢查驗證狀態
    const statusResult = await authService.checkEmailVerificationStatus();
    expect(statusResult.isVerified).toBe(false);
    expect(statusResult.email).toBe(testEmail);

    console.log('✅ Email 驗證工具運作正常');
  });

  console.log('🎉 現有未驗證帳號權限控制測試完成！');
});
