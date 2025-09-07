/**
 * 管理員系統類型定義 - React Web 版
 */

// 管理員角色定義
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  USER_MANAGER = 'user_manager',
  MERCHANT_MANAGER = 'merchant_manager',
  ANALYST = 'analyst',
  AUDITOR = 'auditor',
}

// Firebase Custom Claims 整合
export interface AdminClaims {
  role: AdminRole;
  permissions: string[];
  lastLogin: Date;
  mfaEnabled: boolean;
  admin: boolean;
}

// 管理員權限定義
export interface AdminPermissions {
  canViewUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewMerchants: boolean;
  canVerifyMerchants: boolean;
  canViewAnalytics: boolean;
  canManageSystem: boolean;
  canAuditLogs: boolean;
}

// 用戶數據類型
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
  isActive: boolean;
  createdAt: any;
  lastLogin?: any;
  profile?: {
    photoURL?: string;
    phoneNumber?: string;
  };
}

// 商家數據類型
export interface Merchant {
  uid: string;
  email: string;
  businessName: string;
  businessType: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: any;
  verifiedAt?: any;
  verifiedBy?: string;
  rejectedReason?: string;
  contactPhone?: string;
  businessAddress?: string;
  businessDescription?: string;
}

// 系統統計類型
export interface SystemStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    byRole: { [key: string]: number };
  };
  merchants: {
    total: number;
    verified: number;
    pending: number;
    byType: { [key: string]: number };
  };
  usage: {
    conversations: number;
    photos: number;
    apiCalls: number;
  };
  performance: {
    avgResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
}

// 稽核日誌
export interface AuditLog {
  id: string;
  adminId: string;
  action: AuditAction;
  targetUserId?: string;
  targetMerchantId?: string;
  changes: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// 稽核動作類型
export enum AuditAction {
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ROLE_CHANGED = 'user_role_changed',
  MERCHANT_VERIFIED = 'merchant_verified',
  MERCHANT_REJECTED = 'merchant_rejected',
  ADMIN_LOGIN = 'admin_login',
  ADMIN_LOGOUT = 'admin_logout',
  BULK_OPERATION = 'bulk_operation',
}

// API 回應類型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
