/**
 * 管理員服務 - React Web 版
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getCountFromServer,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User, Merchant, SystemStats, AuditLog, AuditAction, AdminRole } from '../types/admin.types';

export class AdminService {
  private static instance: AdminService;

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // ====================
  // 用戶管理
  // ====================

  /**
   * 獲取用戶列表
   */
  async getUsers(searchText?: string, roleFilter?: string): Promise<User[]> {
    try {
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

      if (roleFilter && roleFilter !== 'all') {
        q = query(q, where('role', '==', roleFilter));
      }

      const querySnapshot = await getDocs(q);
      let users = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));

      // 如果有搜索文本，進行客戶端過濾
      if (searchText) {
        const search = searchText.toLowerCase();
        users = users.filter(user => 
          user.email?.toLowerCase().includes(search) ||
          user.displayName?.toLowerCase().includes(search)
        );
      }

      return users;
    } catch (error) {
      console.error('獲取用戶列表失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶詳情
   */
  async getUser(uid: string): Promise<User | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          uid: docSnap.id,
          ...docSnap.data()
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('獲取用戶詳情失敗:', error);
      throw error;
    }
  }

  /**
   * 更新用戶
   */
  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('更新用戶失敗:', error);
      throw error;
    }
  }

  /**
   * 更新用戶角色
   */
  async updateUserRole(uid: string, newRole: AdminRole): Promise<void> {
    try {
      await this.updateUser(uid, { role: newRole });
      
      // 記錄稽核日誌
      await this.createAuditLog({
        adminId: 'current_admin', // 應該從當前登入的管理員獲取
        action: AuditAction.USER_ROLE_CHANGED,
        targetUserId: uid,
        changes: { newRole }
      });
    } catch (error) {
      console.error('更新用戶角色失敗:', error);
      throw error;
    }
  }

  // ====================
  // 商家管理
  // ====================

  /**
   * 獲取商家列表
   */
  async getMerchants(statusFilter?: string): Promise<Merchant[]> {
    try {
      let q = query(collection(db, 'merchants'), orderBy('createdAt', 'desc'));

      if (statusFilter && statusFilter !== 'all') {
        q = query(q, where('status', '==', statusFilter));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as Merchant));
    } catch (error) {
      console.error('獲取商家列表失敗:', error);
      throw error;
    }
  }

  /**
   * 驗證商家
   */
  async verifyMerchant(uid: string, verifiedBy: string): Promise<void> {
    try {
      const docRef = doc(db, 'merchants', uid);
      await updateDoc(docRef, {
        status: 'verified',
        verifiedAt: Timestamp.now(),
        verifiedBy: verifiedBy,
        updatedAt: Timestamp.now()
      });

      // 記錄稽核日誌
      await this.createAuditLog({
        adminId: verifiedBy,
        action: AuditAction.MERCHANT_VERIFIED,
        targetMerchantId: uid,
        changes: { status: 'verified' }
      });
    } catch (error) {
      console.error('驗證商家失敗:', error);
      throw error;
    }
  }

  /**
   * 駁回商家
   */
  async rejectMerchant(uid: string, reason: string, rejectedBy: string): Promise<void> {
    try {
      const docRef = doc(db, 'merchants', uid);
      await updateDoc(docRef, {
        status: 'rejected',
        rejectedReason: reason,
        rejectedAt: Timestamp.now(),
        rejectedBy: rejectedBy,
        updatedAt: Timestamp.now()
      });

      // 記錄稽核日誌
      await this.createAuditLog({
        adminId: rejectedBy,
        action: AuditAction.MERCHANT_REJECTED,
        targetMerchantId: uid,
        changes: { status: 'rejected', reason }
      });
    } catch (error) {
      console.error('駁回商家失敗:', error);
      throw error;
    }
  }

  // ====================
  // 系統統計
  // ====================

  /**
   * 獲取系統統計
   */
  async getSystemStats(): Promise<SystemStats> {
    try {
      // 用戶統計
      const usersSnapshot = await getCountFromServer(collection(db, 'users'));
      const activeUsersSnapshot = await getCountFromServer(
        query(collection(db, 'users'), where('isActive', '==', true))
      );

      // 商家統計
      const merchantsSnapshot = await getCountFromServer(collection(db, 'merchants'));
      const verifiedMerchantsSnapshot = await getCountFromServer(
        query(collection(db, 'merchants'), where('status', '==', 'verified'))
      );
      const pendingMerchantsSnapshot = await getCountFromServer(
        query(collection(db, 'merchants'), where('status', '==', 'pending'))
      );

      // 模擬其他數據（在真實環境中應該從實際數據源獲取）
      return {
        users: {
          total: usersSnapshot.data().count,
          active: activeUsersSnapshot.data().count,
          newToday: Math.floor(Math.random() * 50), // 模擬數據
          byRole: {
            tourist: Math.floor(usersSnapshot.data().count * 0.85),
            merchant: Math.floor(usersSnapshot.data().count * 0.10),
            admin: Math.floor(usersSnapshot.data().count * 0.05)
          }
        },
        merchants: {
          total: merchantsSnapshot.data().count,
          verified: verifiedMerchantsSnapshot.data().count,
          pending: pendingMerchantsSnapshot.data().count,
          byType: {
            restaurant: Math.floor(merchantsSnapshot.data().count * 0.4),
            retail: Math.floor(merchantsSnapshot.data().count * 0.35),
            service: Math.floor(merchantsSnapshot.data().count * 0.25)
          }
        },
        usage: {
          conversations: Math.floor(Math.random() * 10000),
          photos: Math.floor(Math.random() * 5000),
          apiCalls: Math.floor(Math.random() * 50000)
        },
        performance: {
          avgResponseTime: Math.floor(Math.random() * 500) + 100,
          cacheHitRate: Math.random() * 20 + 80,
          errorRate: Math.random() * 2
        }
      };
    } catch (error) {
      console.error('獲取系統統計失敗:', error);
      throw error;
    }
  }

  // ====================
  // 稽核日誌
  // ====================

  /**
   * 創建稽核日誌
   */
  async createAuditLog(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditLogRef = collection(db, 'audit_logs');
      const docRef = doc(auditLogRef);
      
      await updateDoc(docRef, {
        id: docRef.id,
        ...logData,
        timestamp: Timestamp.now(),
        ipAddress: '127.0.0.1', // 在真實環境中應該獲取實際 IP
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('創建稽核日誌失敗:', error);
      // 稽核日誌失敗不應該影響主要操作
    }
  }

  /**
   * 獲取稽核日誌
   */
  async getAuditLogs(limitCount: number = 50): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, 'audit_logs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AuditLog));
    } catch (error) {
      console.error('獲取稽核日誌失敗:', error);
      throw error;
    }
  }
}
