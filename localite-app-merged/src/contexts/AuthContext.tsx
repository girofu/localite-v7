/**
 * 認證上下文 - 管理用戶認證狀態
 */

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { FirebaseAuthService, User } from '../services/FirebaseAuthService';
import { FirestoreService } from '../services/FirestoreService';
import { logger } from '../services/LoggingService';
import { useBadgeService } from '../hooks/useBadgeService';
import { Badge, BadgeTriggerType, BadgeTriggerMetadata } from '../types/badge.types';

// 🟢 Green：用戶驗證狀態類型
export type UserVerificationState = 'verified' | 'pending_verification' | 'guest' | 'none';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuestMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsEmailVerification: boolean; email: string }>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  shouldPromptLogin: (feature: string) => boolean;
  
  // 🟢 Green：Email 驗證功能  
  sendEmailVerification: (options?: any) => Promise<{ success: boolean; error?: { message: string; code: string } }>;
  checkEmailVerificationStatus: () => Promise<{ isVerified: boolean; email: string }>;
  reloadUser: () => Promise<User | null>;
  // 🔥 新增：處理驗證連結
  handleEmailVerificationLink: (url: string) => Promise<{ success: boolean; error?: string }>;
  
  // 🟢 Green：用戶驗證狀態和權限管理
  verificationState: UserVerificationState;
  canAccessFeature: (feature: string) => boolean;
  
  // 徽章系統
  userBadges: Badge[];
  badgeLoading: boolean;
  badgeError: string | null;
  checkBadgeConditions: (triggerType: BadgeTriggerType, metadata?: BadgeTriggerMetadata) => Promise<Badge[]>;
  hasUserBadge: (badgeId: string) => boolean;
  getUserBadgeIds: () => string[];
  clearBadgeError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  // 🟢 Green：用戶驗證狀態管理
  const [verificationState, setVerificationState] = useState<UserVerificationState>('none');
  // 🔥 恢復：控制是否接受自動恢復的認證狀態，防止自動登入
  const [allowAutoRestore, setAllowAutoRestore] = useState<boolean>(false);
  const authService = useMemo(() => new FirebaseAuthService(), []);

  // 整合徽章服務
  const {
    userBadges,
    loading: badgeLoading,
    error: badgeError,
    checkBadgeConditions,
    hasUserBadge,
    getUserBadgeIds,
    clearError: clearBadgeError,
  } = useBadgeService(user?.uid);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      // 🔥 修復：只有在允許自動恢復或沒有用戶（登出情況）時才更新狀態
      if (!user || allowAutoRestore) {
        setUser(user);
        
        // 🟢 Green：根據用戶狀態設置驗證狀態，以 Firestore 為準
        if (user) {
          try {
            // 🔥 關鍵修復：查詢 Firestore 的 isEmailVerified 狀態
            const firestoreService = new FirestoreService();
            const firestoreUserData = await firestoreService.getUserById(user.uid);
            
            if (firestoreUserData && firestoreUserData.isEmailVerified === true) {
              setVerificationState('verified');
              logger.info('用戶驗證狀態：已驗證', { 
                userId: user.uid, 
                email: user.email,
                firestoreVerified: true,
                firebaseVerified: user.emailVerified 
              });
            } else {
              setVerificationState('pending_verification');
              logger.warn('用戶驗證狀態：未驗證', { 
                userId: user.uid, 
                email: user.email,
                firestoreVerified: firestoreUserData?.isEmailVerified || false,
                firebaseVerified: user.emailVerified 
              });
            }
          } catch (error) {
            // Firestore 查詢失敗，回退到待驗證狀態
            logger.error('查詢 Firestore 驗證狀態失敗，回退到待驗證狀態', {
              userId: user.uid,
              error: error instanceof Error ? error.message : String(error)
            });
            setVerificationState('pending_verification');
          }
        } else {
          setVerificationState('none');
        }
      }
      
      setLoading(false);
    });

    // 🔥 移除自動登入邏輯：不再自動檢查和恢復已登入用戶
    // const currentUser = authService.getCurrentUser();
    // if (currentUser) {
    //   setUser(currentUser);
    //   
    //   // 🟢 Green：設置初始驗證狀態
    //   if (currentUser.emailVerified) {
    //     setVerificationState('verified');
    //   } else {
    //     setVerificationState('pending_verification');
    //   }
    // }
    
    setLoading(false);

    return unsubscribe;
  }, [authService, allowAutoRestore]);


  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      // 🔥 登入時啟用自動恢復功能
      setAllowAutoRestore(true);
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
      
      // 🟢 Green：檢查 Firestore 的 isEmailVerified 狀態（權威來源）
      let finalVerificationState: 'verified' | 'pending_verification' = 'pending_verification';
      let firestoreUserData: any = null;
      
      try {
        const firestoreService = new FirestoreService();
        firestoreUserData = await firestoreService.getUserById(authResult.user.uid);
        
        if (firestoreUserData) {
          // 🔥 關鍵：以 Firestore 的 isEmailVerified 為準
          const isFirestoreVerified = firestoreUserData.isEmailVerified === true;
          finalVerificationState = isFirestoreVerified ? 'verified' : 'pending_verification';
          
          if (isFirestoreVerified) {
            logger.info('用戶登入：已驗證帳號', { 
              userId: authResult.user.uid, 
              email,
              firestoreVerified: true,
              firebaseVerified: authResult.user.emailVerified
            });
          } else {
            logger.warn('用戶登入：未驗證帳號，功能將受限', { 
              userId: authResult.user.uid, 
              email,
              firestoreVerified: false,
              firebaseVerified: authResult.user.emailVerified
            });
            
            // 🔥 關鍵：為現有未驗證用戶強制發送驗證 email
            try {
              const verificationResult = await authService.sendEmailVerification({
                languageCode: 'zh-TW'
              });
              if (verificationResult.success) {
                logger.info('為現有未驗證用戶重新發送驗證 email', {
                  userId: authResult.user.uid,
                  email
                });
              }
            } catch (emailError) {
              logger.warn('無法為現有用戶發送驗證 email', {
                userId: authResult.user.uid,
                error: emailError instanceof Error ? emailError.message : String(emailError)
              });
            }
          }
        } else {
          // Firestore 沒有用戶資料，回退到 Firebase Auth 狀態
          logger.warn('Firestore 找不到用戶資料，使用 Firebase Auth 狀態', {
            userId: authResult.user.uid,
            email
          });
          finalVerificationState = authResult.user.emailVerified ? 'verified' : 'pending_verification';
        }
      } catch (firestoreError) {
        // Firestore 錯誤不應阻止登入，但要記錄
        logger.warn('Firestore 用戶資料查詢失敗，使用 Firebase Auth 狀態', {
          userId: authResult.user.uid,
          email,
          error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError)
        });
        finalVerificationState = authResult.user.emailVerified ? 'verified' : 'pending_verification';
      }
      
      // 設置用戶和驗證狀態
      setUser(authResult.user);
      setVerificationState(finalVerificationState);
        
      logger.logAuthEvent('login', 'success', { 
        email, 
        userId: authResult.user.uid,
        verificationState: finalVerificationState,
        firestoreVerified: firestoreUserData?.isEmailVerified,
        firebaseVerified: authResult.user.emailVerified
      });
      
      // 檢查首次登入徽章
      try {
        const newBadges = await checkBadgeConditions('first_login');
        if (newBadges.length > 0) {
          logger.info('用戶獲得新徽章', { 
            userId: authResult.user.uid, 
            badgeIds: newBadges.map(b => b.id),
            badgeNames: newBadges.map(b => b.name)
          });
        }
      } catch (badgeError) {
        // 徽章錯誤不應阻止登入流程
        logger.warn('徽章檢查失敗，但不影響登入', { 
          userId: authResult.user.uid,
          error: badgeError instanceof Error ? badgeError.message : String(badgeError)
        });
      }
      
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

  const signUp = async (email: string, password: string): Promise<{ needsEmailVerification: boolean; email: string }> => {
    try {
      setLoading(true);
      // 🔥 註冊時啟用自動恢復功能
      setAllowAutoRestore(true);
      logger.info('開始用戶註冊流程', { email });
      
      // Step 1: Firebase Auth 註冊 (現在會自動發送驗證 email)
      const result = await authService.signUpWithEmail(email, password);
      
      // Step 2: 建立 Firestore 個人資料
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
      
      // 🟢 Green：檢查 email 是否已驗證
      const needsEmailVerification = !result.user.emailVerified;
      
      if (needsEmailVerification) {
        // 🟢 Green：設置待認證狀態，但保存用戶資料以便後續驗證
        setUser(result.user); // 設置用戶資料
        setVerificationState('pending_verification'); // 設置為待認證狀態
        
        logger.info('註冊成功，等待 email 驗證', { 
          email, 
          userId: result.user.uid,
          verificationEmailSent: result.verificationEmailSent 
        });
        
        // 記錄註冊成功但未驗證
        logger.logAuthEvent('register', 'success', { 
          email, 
          userId: result.user.uid, 
          status: 'pending_verification',
          verificationEmailSent: result.verificationEmailSent 
        });
        
        return { needsEmailVerification: true, email: result.user.email };
      } else {
        // Email 已驗證，正常登入流程
        setUser(result.user);
        setVerificationState('verified'); // 🟢 Green：設置為已驗證狀態
        logger.logAuthEvent('register', 'success', { email, userId: result.user.uid });
        
        // 檢查首次註冊徽章
        try {
          const newBadges = await checkBadgeConditions('first_login');
          if (newBadges.length > 0) {
            logger.info('新用戶獲得註冊徽章', { 
              userId: result.user.uid, 
              badgeIds: newBadges.map(b => b.id),
              badgeNames: newBadges.map(b => b.name)
            });
          }
        } catch (badgeError) {
          logger.warn('徽章檢查失敗，但不影響註冊', { 
            userId: result.user.uid,
            error: badgeError instanceof Error ? badgeError.message : String(badgeError)
          });
        }
        
        return { needsEmailVerification: false, email: result.user.email };
      }
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
      // 🟢 Green：重置驗證狀態
      setVerificationState('none');
      // 🔥 登出時禁用自動恢復功能
      setAllowAutoRestore(false);
      
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
    // 🟢 Green：設置訪客驗證狀態
    setVerificationState('guest');
  };

  const exitGuestMode = (): void => {
    setIsGuestMode(false);
    // 🟢 Green：退出訪客模式後重置狀態
    setVerificationState('none');
  };

  // 🟢 Green：Email 驗證相關方法
  const sendEmailVerification = async (options?: any) => {
    try {
      return await authService.sendEmailVerification(options);
    } catch (error: any) {
      logger.logError(error, 'AuthContext.sendEmailVerification');
      throw error;
    }
  };

  // 🟢 Green：功能權限檢查
  const canAccessFeature = (feature: string): boolean => {
    // 基本功能，未驗證用戶也可使用
    const basicFeatures = [
      'view_places',
      'view_guides',
      'browse_content',
      'view_news'
    ];

    // 訪客模式檢查
    if (isGuestMode) {
      return basicFeatures.includes(feature);
    }

    // 未登入用戶只能使用基本功能
    if (!user) {
      return basicFeatures.includes(feature);
    }

    // 已登入但未驗證的用戶
    if (verificationState === 'pending_verification') {
      return basicFeatures.includes(feature);
    }

    // 已驗證用戶可以使用所有功能
    if (verificationState === 'verified') {
      return true;
    }

    // 預設拒絕
    return false;
  };

  const checkEmailVerificationStatus = async () => {
    try {
      return await authService.checkEmailVerificationStatus();
    } catch (error: any) {
      logger.logError(error, 'AuthContext.checkEmailVerificationStatus');
      throw error;
    }
  };

  // 🔥 新增：處理郵件驗證連結
  const handleEmailVerificationLink = async (url: string) => {
    try {
      logger.info('處理驗證連結', { url });
      
      // 🔥 處理驗證連結時啟用自動恢復功能
      setAllowAutoRestore(true);
      
      const result = await authService.handleEmailVerificationLink(url);
      
      if (result.success) {
        // 驗證成功，重新載入用戶狀態
        const updatedUser = await authService.reloadUser();
        if (updatedUser) {
          setUser(updatedUser);
          setVerificationState('verified');
          
          logger.info('驗證連結處理成功，用戶狀態已更新', {
            userId: updatedUser.uid,
            email: updatedUser.email
          });

          // 獲得首次登入徽章
          try {
            const newBadges = await checkBadgeConditions('first_login');
            if (newBadges.length > 0) {
              logger.info('用戶驗證後獲得首次登入徽章', { 
                userId: updatedUser.uid, 
                badgeIds: newBadges.map(b => b.id)
              });
            }
          } catch (badgeError) {
            logger.warn('徽章檢查失敗', { 
              userId: updatedUser.uid,
              error: badgeError instanceof Error ? badgeError.message : String(badgeError)
            });
          }
        }
        return { success: true };
      } else {
        logger.warn('驗證連結處理失敗', { error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      logger.logError(error, 'AuthContext.handleEmailVerificationLink');
      throw error;
    }
  };

  const reloadUser = async () => {
    try {
      const updatedUser = await authService.reloadUser();
      if (updatedUser) {
        // 🟢 Green：檢查 email 驗證狀態變化
        const wasUnverified = user && !user.emailVerified;
        const nowVerified = updatedUser.emailVerified;
        
        if (wasUnverified && nowVerified) {
          logger.info('用戶 email 驗證成功，完成登入流程', { 
            userId: updatedUser.uid, 
            email: updatedUser.email 
          });
          
          // 🟢 Green：同步更新 Firestore 的 isEmailVerified 狀態
          try {
            const firestoreService = new FirestoreService();
            const updateResult = await firestoreService.updateUser(updatedUser.uid, {
              isEmailVerified: true,
              emailVerifiedAt: new Date()
            });
            
            if (!updateResult.success) {
              logger.warn('Firestore email驗證狀態更新失敗', {
                userId: updatedUser.uid,
                error: updateResult.error?.message
              });
            } else {
              logger.info('Firestore email驗證狀態已同步更新', {
                userId: updatedUser.uid
              });
            }
          } catch (firestoreError) {
            logger.warn('Firestore 更新失敗，但不影響驗證流程', {
              userId: updatedUser.uid,
              error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError)
            });
          }
          
          // 🟢 Green：更新驗證狀態
          setVerificationState('verified');
          
          // 完成登入流程，觸發首次登入徽章檢查
          try {
            const newBadges = await checkBadgeConditions('first_login');
            if (newBadges.length > 0) {
              logger.info('用戶驗證後獲得首次登入徽章', { 
                userId: updatedUser.uid, 
                badgeIds: newBadges.map(b => b.id),
                badgeNames: newBadges.map(b => b.name)
              });
            }
          } catch (badgeError) {
            logger.warn('首次登入徽章檢查失敗', { 
              userId: updatedUser.uid,
              error: badgeError instanceof Error ? badgeError.message : String(badgeError)
            });
          }
        }
        
        // 🟢 Green：根據 Firestore 狀態設置驗證狀態，而不是 Firebase Auth
        try {
          const firestoreService = new FirestoreService();
          const firestoreUserData = await firestoreService.getUserById(updatedUser.uid);
          
          if (firestoreUserData && firestoreUserData.isEmailVerified === true) {
            setVerificationState('verified');
            logger.info('reloadUser: 用戶驗證狀態 - 已驗證', { 
              userId: updatedUser.uid,
              firestoreVerified: true,
              firebaseVerified: updatedUser.emailVerified 
            });
          } else {
            setVerificationState('pending_verification');
            logger.warn('reloadUser: 用戶驗證狀態 - 未驗證', { 
              userId: updatedUser.uid,
              firestoreVerified: firestoreUserData?.isEmailVerified || false,
              firebaseVerified: updatedUser.emailVerified 
            });
          }
        } catch (firestoreError) {
          // Firestore 查詢失敗，回退到待驗證狀態
          logger.error('reloadUser: Firestore 查詢失敗，回退到待驗證狀態', {
            userId: updatedUser.uid,
            error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError)
          });
          setVerificationState('pending_verification');
        }
        
        setUser(updatedUser);
        return updatedUser;
      }
      return null;
    } catch (error: any) {
      logger.logError(error, 'AuthContext.reloadUser');
      throw error;
    }
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

  // 🔥 新增：監聽應用狀態變化，自動檢查 email 驗證狀態
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // 當應用從 background 回到 foreground 時，檢查驗證狀態
      if (nextAppState === 'active' && user && verificationState === 'pending_verification') {
        logger.info('應用重新激活，檢查 email 驗證狀態變化', { 
          userId: user.uid,
          currentVerificationState: verificationState 
        });
        
        try {
          // 使用 authService 檢查最新狀態並同步到 Firestore
          const updatedUser = await authService.reloadUser();
          if (updatedUser) {
            // 檢查 email 驗證狀態變化
            const wasUnverified = user && !user.emailVerified;
            const nowVerified = updatedUser.emailVerified;
            
            if (wasUnverified && nowVerified) {
              logger.info('應用激活時檢測到 email 驗證成功', { 
                userId: updatedUser.uid, 
                email: updatedUser.email 
              });
              
              // 同步更新 Firestore 的 isEmailVerified 狀態
              try {
                const firestoreService = new FirestoreService();
                const updateResult = await firestoreService.updateUser(updatedUser.uid, {
                  isEmailVerified: true,
                  emailVerifiedAt: new Date()
                });
                
                if (updateResult.success) {
                  logger.info('應用激活時 Firestore email 驗證狀態已同步更新', {
                    userId: updatedUser.uid
                  });
                  
                  // 更新本地狀態
                  setVerificationState('verified');
                  setUser(updatedUser);
                  
                  // 獲得首次登入徽章
                  try {
                    const newBadges = await checkBadgeConditions('first_login');
                    if (newBadges.length > 0) {
                      logger.info('應用激活時用戶獲得首次登入徽章', { 
                        userId: updatedUser.uid, 
                        badgeIds: newBadges.map(b => b.id)
                      });
                    }
                  } catch (badgeError) {
                    logger.warn('徽章檢查失敗', { 
                      userId: updatedUser.uid,
                      error: badgeError instanceof Error ? badgeError.message : String(badgeError)
                    });
                  }
                } else {
                  logger.warn('應用激活時 Firestore 更新失敗', {
                    userId: updatedUser.uid,
                    error: updateResult.error?.message
                  });
                }
              } catch (firestoreError) {
                logger.warn('應用激活時 Firestore 同步失敗', {
                  userId: updatedUser.uid,
                  error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError)
                });
              }
            }
          }
        } catch (error) {
          logger.warn('應用激活時檢查驗證狀態失敗', {
            userId: user.uid,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [user, verificationState, checkBadgeConditions, authService]); // 依賴相關狀態和函數

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
    
    // 🟢 Green：Email 驗證功能
    sendEmailVerification,
    checkEmailVerificationStatus,
    reloadUser,
    // 🔥 新增：處理驗證連結
    handleEmailVerificationLink,
    
    // 🟢 Green：用戶驗證狀態和權限管理
    verificationState,
    canAccessFeature,
    
    // 徽章系統
    userBadges,
    badgeLoading,
    badgeError,
    checkBadgeConditions,
    hasUserBadge,
    getUserBadgeIds,
    clearBadgeError,
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
