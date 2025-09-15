/**
 * 認證上下文 - 管理用戶認證狀態
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FirebaseAuthService, User } from '../services/FirebaseAuthService';
import { FirestoreService } from '../services/FirestoreService';
import { logger } from '../services/LoggingService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuestMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  shouldPromptLogin: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const authService = new FirebaseAuthService();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // 獲取當前用戶
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      logger.info('開始用戶登入流程', { email });
      
      // Step 1: Firebase Auth 登入 - 增加重試機制
      let authResult: any;
      try {
        authResult = await authService.signInWithEmail(email, password);
      } catch (authError: any) {
        // 特別處理 cancelled 錯誤
        if (authError.code === 'cancelled' || authError.code === 'auth/cancelled') {
          logger.warn('Firebase 登入被取消', { email, errorCode: authError.code });
          throw new Error('登入操作被中斷，請重新嘗試');
        }
        throw authError; // 重新拋出其他錯誤
      }
      
      // Step 2: 同步 Firestore 用戶資料 - 添加錯誤處理
      try {
        const firestoreService = new FirestoreService();
        const userProfile = await firestoreService.getUserById(authResult.user.uid);
        
        if (!userProfile) {
          // Step 3: 如果個人資料不存在，建立一個
          logger.info('用戶個人資料不存在，自動建立', { userId: authResult.user.uid });
          
          const createUserResult = await firestoreService.createUser({
            uid: authResult.user.uid,
            email: authResult.user.email || email,
            isEmailVerified: authResult.user.emailVerified,
            preferredLanguage: 'zh-TW',
          });

          if (!createUserResult.success) {
            logger.warn('建立用戶資料失敗，但繼續登入流程', { 
              userId: authResult.user.uid,
              error: createUserResult.error?.message 
            });
            // 不拋出錯誤，讓用戶仍能登入
          }
        }
      } catch (firestoreError) {
        // Firestore 錯誤不應阻止登入
        logger.warn('Firestore 操作失敗，但繼續登入流程', { 
          userId: authResult.user.uid,
          error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError)
        });
      }
      
      setUser(authResult.user);
      logger.logAuthEvent('login', 'success', { email, userId: authResult.user.uid });
      logger.info('用戶登入流程完成', { email, userId: authResult.user.uid });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.logAuthEvent('login', 'failed', { email, error: errorMessage });
      
      // 確保錯誤被正確記錄，但避免循環錯誤
      try {
        logger.logError(error as Error, 'AuthContext.signIn');
      } catch (loggingError) {
        // 如果日誌記錄也失敗，只在控制台輸出
        console.error('日誌記錄失敗:', loggingError);
      }
      
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      logger.info('開始用戶註冊流程', { email });
      
      // Step 1: Firebase Auth 註冊
      const result = await authService.signUpWithEmail(email, password);
      
      // Step 2: 🔥 新增：建立 Firestore 個人資料
      const firestoreService = new FirestoreService();
      const createUserResult = await firestoreService.createUser({
        uid: result.user.uid,
        email: result.user.email,
        isEmailVerified: result.user.emailVerified,
        preferredLanguage: 'zh-TW',
      });

      // Step 3: 檢查 Firestore 建立是否成功
      if (!createUserResult.success) {
        logger.logError(createUserResult.error as Error, 'AuthContext.signUp.createUser');
        throw new Error(`Failed to create user profile: ${createUserResult.error?.message}`);
      }
      
      setUser(result.user);
      logger.logAuthEvent('register', 'success', { email, userId: result.user.uid });
      logger.info('用戶註冊和個人資料建立完成', { email, userId: result.user.uid });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.logAuthEvent('register', 'failed', { email, error: errorMessage });
      logger.logError(error as Error, 'AuthContext.signUp');
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const currentUserId = user?.uid;
      
      await authService.signOut();
      setUser(null);
      setIsGuestMode(false);
      
      logger.logAuthEvent('logout', 'success', { userId: currentUserId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.logAuthEvent('logout', 'failed', { userId: user?.uid, error: errorMessage });
      logger.logError(error as Error, 'AuthContext.signOut');
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const enterGuestMode = (): void => {
    setIsGuestMode(true);
    setUser(null);
  };

  const exitGuestMode = (): void => {
    setIsGuestMode(false);
  };

  const shouldPromptLogin = (feature: string): boolean => {
    // 訪客模式下需要登入的功能
    const loginRequiredFeatures = [
      'create_journey_record',
      'save_personal_data',
      'share_journey',
      'view_badge_collection',
      'manage_profile'
    ];

    return isGuestMode && loginRequiredFeatures.includes(feature);
  };

  const value: AuthContextType = {
    user,
    loading,
    isGuestMode,
    signIn,
    signUp,
    signOut,
    enterGuestMode,
    exitGuestMode,
    shouldPromptLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
