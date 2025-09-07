/**
 * 認證上下文 - 管理員系統
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  const checkAdminRole = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const idTokenResult = await user.getIdTokenResult();
      const claims = idTokenResult.claims;

      const isAdminUser = claims.admin === true;
      const role = claims.role as AdminRole;

      setIsAdmin(isAdminUser);
      setAdminRole(role);

      if (isAdminUser && role) {
        // 根據角色設定權限
        const rolePermissions = mapRoleToPermissions(role);
        setPermissions(rolePermissions);
        return true;
      }

      return false;
    } catch (error) {
      console.error('檢查管理員角色失敗:', error);
      return false;
    }
  };

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
  }, []);

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
