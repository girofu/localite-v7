/**
 * 認證上下文 - 管理用戶認證狀態
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FirebaseAuthService, User } from '../services/FirebaseAuthService';

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
      const result = await authService.signInWithEmail(email, password);
      setUser(result.user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const result = await authService.signUpWithEmail(email, password);
      setUser(result.user);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setIsGuestMode(false);
    } catch (error) {
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
