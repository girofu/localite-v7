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
    console.log('🔍 開始查詢商家資料，UID:', userId);
    try {
      const merchantDoc = await getDoc(doc(db, 'merchants', userId));
      console.log('📄 商家文檔存在:', merchantDoc.exists());
      
      if (merchantDoc.exists()) {
        const rawData = merchantDoc.data();
        console.log('📊 原始商家資料:', rawData);
        
        const merchantData = {
          uid: merchantDoc.id,
          ...rawData
        } as MerchantProfile;
        
        console.log('✅ 處理後的商家資料:', merchantData);
        console.log('✅ 商家狀態:', merchantData.status);
        
        setMerchant(merchantData);
        setIsMerchant(true);
        console.log('✅ 已設置 isMerchant = true');
        return merchantData;
      } else {
        console.log('❌ 找不到商家文檔！');
        console.log('🔍 查詢路徑: merchants/' + userId);
        setMerchant(null);
        setIsMerchant(false);
        return null;
      }
    } catch (error) {
      console.error('❌ 載入商家資料失敗:', error);
      console.error('❌ 錯誤詳細:', error instanceof Error ? error.message : String(error));
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
