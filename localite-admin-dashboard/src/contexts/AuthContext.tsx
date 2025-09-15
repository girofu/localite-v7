/**
 * 認證上下文 - 管理員系統
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { AdminRole, AdminPermissions } from '../types/admin.types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminRole: AdminRole | null;
  permissions: AdminPermissions | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAdminRole: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);

  const checkAdminRole = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('🔍 檢查管理員權限，UID:', user.uid);
      
      // 改為查詢 Firestore admins collection
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      console.log('📄 管理員文檔存在:', adminDoc.exists());
      
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        console.log('📊 管理員資料:', adminData);
        
        const isAdminUser = adminData.isAdmin === true;
        const role = adminData.role as AdminRole;
        
        console.log('✅ 管理員狀態:', isAdminUser);
        console.log('✅ 管理員角色:', role);

        setIsAdmin(isAdminUser);
        setAdminRole(role);

        if (isAdminUser && role) {
          // 根據角色設定權限
          const rolePermissions = mapRoleToPermissions(role);
          setPermissions(rolePermissions);
          console.log('✅ 權限設置完成:', rolePermissions);
          return true;
        }
      } else {
        console.log('❌ 找不到管理員文檔！');
        console.log('🔍 查詢路徑: admins/' + user.uid);
      }

      setIsAdmin(false);
      setAdminRole(null);
      setPermissions(null);
      return false;
    } catch (error) {
      console.error('❌ 檢查管理員角色失敗:', error);
      console.error('❌ 錯誤詳細:', error instanceof Error ? error.message : String(error));
      setIsAdmin(false);
      setAdminRole(null);
      setPermissions(null);
      return false;
    }
  }, [user]);

  const mapRoleToPermissions = (role: AdminRole): AdminPermissions => {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
        return {
          canViewUsers: true,
          canEditUsers: true,
          canDeleteUsers: true,
          canViewMerchants: true,
          canVerifyMerchants: true,
          canViewAnalytics: true,
          canManageSystem: true,
          canAuditLogs: true,
        };
      case AdminRole.USER_MANAGER:
        return {
          canViewUsers: true,
          canEditUsers: true,
          canDeleteUsers: false,
          canViewMerchants: false,
          canVerifyMerchants: false,
          canViewAnalytics: false,
          canManageSystem: false,
          canAuditLogs: false,
        };
      case AdminRole.MERCHANT_MANAGER:
        return {
          canViewUsers: false,
          canEditUsers: false,
          canDeleteUsers: false,
          canViewMerchants: true,
          canVerifyMerchants: true,
          canViewAnalytics: false,
          canManageSystem: false,
          canAuditLogs: false,
        };
      case AdminRole.ANALYST:
        return {
          canViewUsers: true,
          canEditUsers: false,
          canDeleteUsers: false,
          canViewMerchants: true,
          canVerifyMerchants: false,
          canViewAnalytics: true,
          canManageSystem: false,
          canAuditLogs: false,
        };
      case AdminRole.AUDITOR:
        return {
          canViewUsers: true,
          canEditUsers: false,
          canDeleteUsers: false,
          canViewMerchants: true,
          canVerifyMerchants: false,
          canViewAnalytics: true,
          canManageSystem: false,
          canAuditLogs: true,
        };
      default:
        return {
          canViewUsers: false,
          canEditUsers: false,
          canDeleteUsers: false,
          canViewMerchants: false,
          canVerifyMerchants: false,
          canViewAnalytics: false,
          canManageSystem: false,
          canAuditLogs: false,
        };
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
      setIsAdmin(false);
      setAdminRole(null);
      setPermissions(null);
    } catch (error) {
      console.error('登出失敗:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await checkAdminRole();
      } else {
        setIsAdmin(false);
        setAdminRole(null);
        setPermissions(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [checkAdminRole]);

  const value = {
    user,
    loading,
    isAdmin,
    adminRole,
    permissions,
    signIn,
    signOut: signOutUser,
    checkAdminRole
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
