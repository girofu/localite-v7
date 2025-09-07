/**
 * 商家認證上下文
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { MerchantProfile } from '../types/merchant.types';

interface AuthContextType {
  user: User | null;
  merchant: MerchantProfile | null;
  loading: boolean;
  isMerchant: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMerchantData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMerchant, setIsMerchant] = useState(false);

  const loadMerchantData = async (userId: string) => {
    try {
      const merchantDoc = await getDoc(doc(db, 'merchants', userId));
      if (merchantDoc.exists()) {
        const merchantData = {
          uid: merchantDoc.id,
          ...merchantDoc.data()
        } as MerchantProfile;
        
        setMerchant(merchantData);
        setIsMerchant(true);
        return merchantData;
      } else {
        setMerchant(null);
        setIsMerchant(false);
        return null;
      }
    } catch (error) {
      console.error('載入商家資料失敗:', error);
      setMerchant(null);
      setIsMerchant(false);
      return null;
    }
  };

  const refreshMerchantData = async () => {
    if (user) {
      await loadMerchantData(user.uid);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('登入失敗:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setMerchant(null);
      setIsMerchant(false);
    } catch (error) {
      console.error('登出失敗:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await loadMerchantData(user.uid);
      } else {
        setMerchant(null);
        setIsMerchant(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    merchant,
    loading,
    isMerchant,
    signIn,
    signOut: signOutUser,
    refreshMerchantData
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
    throw new Error('useAuth 必須在 AuthProvider 內使用');
  }
  return context;
};
