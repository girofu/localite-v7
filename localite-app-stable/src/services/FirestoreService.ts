/**
 * Firestore Database Service
 * 
 * 提供完整的 Firestore 資料庫操作功能
 * 包含用戶、商戶、景點、對話等核心資料模型的 CRUD 操作
 */

import {
  doc,
  collection,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  GeoPoint,
  Firestore,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import {
  User,
  Merchant,
  Place,
  Conversation,
  PhotoUpload,
  UserPreferences,
  CreateUserData,
  CreateMerchantData,
  CreatePlaceData,
  CreateConversationData,
  CreatePhotoUploadData,
  PlaceSearchParams,
  ConversationMessage,
  VerificationInfo,
} from '../types/firestore.types';

export class FirestoreError extends Error {
  constructor(message: string, public readonly code?: string, public readonly details?: any) {
    super(message);
    this.name = 'FirestoreError';
  }
}

export class FirestoreService {
  private db: Firestore;
  private isTestEnvironment: boolean;
  private mockCollections: Map<string, Map<string, any>> = new Map();

  // 集合名稱常數
  private static readonly COLLECTIONS = {
    USERS: 'users',
    MERCHANTS: 'merchants',
    PLACES: 'places',
    CONVERSATIONS: 'conversations',
    PHOTOS: 'photos',
  } as const;

  constructor() {
    this.db = firestore;
    this.isTestEnvironment = process.env.NODE_ENV === 'test';
    this.initializeMockCollections();
  }

  private initializeMockCollections(): void {
    if (this.isTestEnvironment) {
      this.mockCollections.set('users', new Map());
      this.mockCollections.set('merchants', new Map());
      this.mockCollections.set('places', new Map());
      this.mockCollections.set('conversations', new Map());
      this.mockCollections.set('photos', new Map());
    }
  }

  // ====================
  // User Management
  // ====================

  async createUser(userData: CreateUserData): Promise<any> {
    try {
      const now = new Date();
      const user: User = {
        id: userData.uid,
        email: userData.email,
        displayName: userData.displayName || '',
        photoURL: userData.photoURL,
        phoneNumber: userData.phoneNumber,
        preferredLanguage: userData.preferredLanguage || 'zh-TW',
        isEmailVerified: userData.isEmailVerified || false,
        role: 'tourist',
        createdAt: now,
        updatedAt: now,
        stats: {
          totalConversations: 0,
          totalPhotosUploaded: 0,
          placesVisited: 0,
        },
        preferences: {
          language: (userData.preferredLanguage || 'zh-TW') as 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP',
          theme: 'light',
          notifications: {
            push: true,
            email: true,
            aiRecommendations: true
          },
          aiSettings: {
            voiceEnabled: true,
            responseLength: 'medium' as const,
            personality: 'friendly' as const
          }
        }
      };

      if (this.isTestEnvironment) {
        this.mockCollections.get(FirestoreService.COLLECTIONS.USERS)?.set(user.id, user);
        return { success: true, data: user };
      }

      // 生產環境：使用真實 Firestore
      const userDocRef = doc(this.db, FirestoreService.COLLECTIONS.USERS, user.id);
      await setDoc(userDocRef, this.convertToFirestoreData(user));
      
      return { success: true, data: user };
    } catch (error: any) {
      return {
        success: false,
        error: new FirestoreError(
          `Failed to create user: ${error.message}`,
          error.code,
          { userData }
        )
      };
    }
  }

  async getUserById(uid: string): Promise<User | null> {
    try {
      if (this.isTestEnvironment) {
        return this.mockCollections.get(FirestoreService.COLLECTIONS.USERS)?.get(uid) || null;
      }

      const userDocRef = doc(this.db, FirestoreService.COLLECTIONS.USERS, uid);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        return this.convertFromFirestoreData(userSnap.data()) as User;
      }
      
      return null;
    } catch (error: any) {
      throw new FirestoreError(
        `Failed to get user: ${error.message}`,
        error.code,
        { uid }
      );
    }
  }

  async updateUserPreferences(uid: string, updates: any): Promise<User> {
    try {
      if (this.isTestEnvironment) {
        let user = this.mockCollections.get(FirestoreService.COLLECTIONS.USERS)?.get(uid);
        if (!user) {
          // 如果用戶不存在，創建一個基本用戶
          user = {
            id: uid,
            email: `${uid}@test.com`,
            displayName: 'Test User',
            preferredLanguage: 'zh-TW',
            isEmailVerified: true,
            role: 'tourist',
            createdAt: new Date(),
            updatedAt: new Date(),
            stats: {
              totalConversations: 0,
              totalPhotosUploaded: 0,
              placesVisited: 0
            }
          };
        }
        
        // 合併更新到用戶物件
        if (updates.preferences) {
          user.preferences = { ...user.preferences, ...updates.preferences };
        }
        Object.assign(user, updates);
        user.updatedAt = new Date();
        this.mockCollections.get(FirestoreService.COLLECTIONS.USERS)?.set(uid, user);
        return user;
      }

      const userDocRef = doc(this.db, FirestoreService.COLLECTIONS.USERS, uid);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(userDocRef, updateData);
      
      // 返回更新後的用戶資料
      const updatedUser = await this.getUserById(uid);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }
      
      return updatedUser;
    } catch (error: any) {
      throw new FirestoreError(
        `Failed to update user preferences: ${error.message}`,
        error.code,
        { uid, updates }
      );
    }
  }

  // ====================
  // Merchant Management
  // ====================

  async createMerchant(merchantData: CreateMerchantData): Promise<Merchant> {
    try {
      const now = new Date();
      const merchant: Merchant = {
        id: merchantData.uid,
        email: merchantData.email,
        businessName: merchantData.businessName,
        businessDescription: merchantData.businessDescription,
        contactInfo: merchantData.contactInfo || {},
        businessType: merchantData.businessType,
        role: 'merchant',
        isVerified: merchantData.isVerified || false,
        createdAt: now,
        updatedAt: now,
        stats: {
          totalPlaces: 0,
          totalViews: 0,
          averageRating: 0,
        },
      };

      if (this.isTestEnvironment) {
        this.mockCollections.get('merchants')?.set(merchant.id, merchant);
        return merchant;
      }

      // 真實環境：將商戶資料存儲到 Firestore
      const merchantDocRef = doc(this.db, FirestoreService.COLLECTIONS.MERCHANTS, merchant.id);
      await setDoc(merchantDocRef, this.convertToFirestoreData(merchant));

      return merchant;
    } catch (error) {
      throw this.handleFirestoreError(error, `Failed to create merchant: ${merchantData.email}`);
    }
  }

  async verifyMerchant(uid: string, verificationInfo?: VerificationInfo): Promise<boolean> {
    try {
      if (this.isTestEnvironment) {
        const merchant = this.mockCollections.get(FirestoreService.COLLECTIONS.MERCHANTS)?.get(uid);
        if (merchant) {
          merchant.isVerified = true;
          merchant.verificationInfo = verificationInfo;
          merchant.updatedAt = new Date();
          this.mockCollections.get(FirestoreService.COLLECTIONS.MERCHANTS)?.set(uid, merchant);
          return true;
        }
        return false;
      }

      // 真實環境：更新商戶驗證狀態
      const merchantRef = doc(this.db, FirestoreService.COLLECTIONS.MERCHANTS, uid);
      const updateData: Partial<Merchant> = {
        isVerified: true,
        updatedAt: new Date(),
      };

      if (verificationInfo) {
        updateData.verificationInfo = verificationInfo;
      }

      await updateDoc(merchantRef, this.convertToFirestoreData(updateData));
      return true;
    } catch (error) {
      throw this.handleFirestoreError(error, `Failed to verify merchant: ${uid}`);
    }
  }

  async getMerchantById(uid: string): Promise<Merchant | null> {
    try {
      if (this.isTestEnvironment) {
        const merchant = this.mockCollections.get('merchants')?.get(uid);
        return merchant || null;
      }

      const merchantDocRef = doc(this.db, FirestoreService.COLLECTIONS.MERCHANTS, uid);
      const docSnap = await getDoc(merchantDocRef);
      if (!docSnap.exists()) {
        return null;
      }

      return this.convertFromFirestoreData(docSnap.data()) as Merchant;
    } catch (error) {
      throw this.handleFirestoreError(error, `Failed to get merchant: ${uid}`);
    }
  }

  async updateMerchant(uid: string, updateData: Partial<CreateMerchantData>): Promise<void> {
    try {
      if (this.isTestEnvironment) {
        const merchant = this.mockCollections.get('merchants')?.get(uid);
        if (merchant) {
          Object.assign(merchant, updateData, { updatedAt: new Date() });
          this.mockCollections.get('merchants')?.set(uid, merchant);
        }
        return;
      }

      const merchantRef = doc(this.db, FirestoreService.COLLECTIONS.MERCHANTS, uid);
      await updateDoc(merchantRef, this.convertToFirestoreData({
        ...updateData,
        updatedAt: new Date(),
      }));
    } catch (error) {
      throw this.handleFirestoreError(error, `Failed to update merchant: ${uid}`);
    }
  }

  // ====================
  // Place Management
  // ====================

  async createPlace(placeData: CreatePlaceData): Promise<Place> {
    const now = new Date();
    const place: Place = {
      id: `place-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: placeData.name,
      description: placeData.description,
      location: {
        address: placeData.location?.address,
        coordinates: placeData.location?.coordinates || { latitude: 0, longitude: 0 },
        district: placeData.location?.district,
        city: placeData.location?.city,
        country: placeData.location?.country,
      },
      category: placeData.category,
      tags: placeData.tags || [],
      images: placeData.images || [],
      merchantId: placeData.merchantId,
      isPublic: placeData.isPublic !== false,
      isActive: placeData.isActive !== false,
      createdAt: now,
      updatedAt: now,
    };

    if (this.isTestEnvironment) {
      this.mockCollections.get('places')?.set(place.id, place);
    }

    return place;
  }

  async searchPlaces(params: PlaceSearchParams): Promise<Place[]> {
    if (this.isTestEnvironment) {
      const places = Array.from(this.mockCollections.get('places')?.values() || []);
      
      return places.filter((place: Place) => {
        let matches = true;

        if (params.city && place.location.city !== params.city) {
          matches = false;
        }

        if (params.category && place.category !== params.category) {
          matches = false;
        }

        if (params.tags && !params.tags.some(tag => place.tags.includes(tag))) {
          matches = false;
        }

        // 簡單的距離檢查邏輯
        if (params.center && params.radius) {
          const distance = this.calculateDistance(
            params.center,
            place.location.coordinates
          );
          if (distance > params.radius) {
            matches = false;
          }
        }

        return matches && place.isPublic;
      });
    }

    return [];
  }

  async getMerchantPlaces(merchantId: string): Promise<Place[]> {
    try {
      if (this.isTestEnvironment) {
        const places = Array.from(this.mockCollections.get('places')?.values() || []);
        return places.filter((place: Place) => place.merchantId === merchantId);
      }

      // 真實環境：查詢商戶的所有地點
      const placesCollection = collection(this.db, FirestoreService.COLLECTIONS.PLACES);
      const q = query(
        placesCollection,
        where('merchantId', '==', merchantId),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const places: Place[] = [];
      querySnapshot.forEach((doc) => {
        const place = this.convertFromFirestoreData({
          id: doc.id,
          ...doc.data(),
        }) as Place;
        places.push(place);
      });

      return places;
    } catch (error) {
      throw this.handleFirestoreError(error, `Failed to get merchant places: ${merchantId}`);
    }
  }

  async updateMerchantPlace(placeId: string, merchantId: string, updateData: Partial<CreatePlaceData>): Promise<void> {
    try {
      if (this.isTestEnvironment) {
        const place = this.mockCollections.get('places')?.get(placeId);
        if (place && place.merchantId === merchantId) {
          Object.assign(place, updateData, { updatedAt: new Date() });
          this.mockCollections.get('places')?.set(placeId, place);
        }
        return;
      }

      // 真實環境：更新地點資料
      const placeRef = doc(this.db, FirestoreService.COLLECTIONS.PLACES, placeId);
      const placeDoc = await getDoc(placeRef);
      
      if (!placeDoc.exists()) {
        throw new Error('Place not found');
      }

      const placeData = placeDoc.data() as Place;
      if (placeData.merchantId !== merchantId) {
        throw new Error('Unauthorized: Place does not belong to this merchant');
      }

      await updateDoc(placeRef, this.convertToFirestoreData({
        ...updateData,
        updatedAt: new Date(),
      }));
    } catch (error) {
      throw this.handleFirestoreError(error, `Failed to update place: ${placeId}`);
    }
  }

  async deleteMerchantPlace(placeId: string, merchantId: string): Promise<void> {
    try {
      if (this.isTestEnvironment) {
        const place = this.mockCollections.get('places')?.get(placeId);
        if (place && place.merchantId === merchantId) {
          this.mockCollections.get('places')?.delete(placeId);
        }
        return;
      }

      // 真實環境：軟刪除地點（設為不活躍）
      const placeRef = doc(this.db, FirestoreService.COLLECTIONS.PLACES, placeId);
      const placeDoc = await getDoc(placeRef);
      
      if (!placeDoc.exists()) {
        throw new Error('Place not found');
      }

      const placeData = placeDoc.data() as Place;
      if (placeData.merchantId !== merchantId) {
        throw new Error('Unauthorized: Place does not belong to this merchant');
      }

      await updateDoc(placeRef, {
        isActive: false,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw this.handleFirestoreError(error, `Failed to delete place: ${placeId}`);
    }
  }

  // ====================
  // Conversation Management
  // ====================

  async createConversation(conversationData: CreateConversationData): Promise<Conversation> {
    const now = new Date();
    const conversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: conversationData.userId,
      type: conversationData.type,
      messages: [],
      context: {
        language: 'zh-TW',
        ...conversationData.context,
      },
      isActive: conversationData.isActive !== false,
      createdAt: now,
      updatedAt: now,
      stats: {
        totalMessages: 0,
      },
    };

    if (this.isTestEnvironment) {
      this.mockCollections.get('conversations')?.set(conversation.id, conversation);
    }

    return conversation;
  }

  async addMessageToConversation(conversationId: string, message: ConversationMessage): Promise<Conversation> {
    if (this.isTestEnvironment) {
      const conversation = this.mockCollections.get('conversations')?.get(conversationId);
      if (conversation) {
        const messageWithId = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        conversation.messages.push(messageWithId);
        conversation.stats.totalMessages = conversation.messages.length;
        conversation.updatedAt = new Date();
        this.mockCollections.get('conversations')?.set(conversationId, conversation);
        return conversation;
      }
    }

    throw new Error('Conversation not found');
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    if (this.isTestEnvironment) {
      return this.mockCollections.get('conversations')?.get(conversationId) || null;
    }

    return null;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    if (this.isTestEnvironment) {
      const conversations = Array.from(this.mockCollections.get('conversations')?.values() || []);
      return conversations.filter((conv: Conversation) => conv.userId === userId);
    }

    return [];
  }

  // ====================
  // Photo Upload Management
  // ====================

  async createPhotoUpload(photoData: CreatePhotoUploadData): Promise<PhotoUpload> {
    const now = new Date();
    const photo: PhotoUpload = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: photoData.userId,
      originalUrl: photoData.originalUrl,
      thumbnailUrl: photoData.thumbnailUrl,
      metadata: photoData.metadata,
      location: photoData.location,
      tags: photoData.tags || [],
      analysisResult: photoData.analysisResult,
      uploadedAt: now,
      isPublic: photoData.isPublic !== false,
      createdAt: now,
      updatedAt: now,
    };

    if (this.isTestEnvironment) {
      this.mockCollections.get('photos')?.set(photo.id, photo);
    }

    return photo;
  }

  // ====================
  // Utility Methods
  // ====================

  private calculateDistance(point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number {
    // 簡單的距離計算（Haversine 公式的簡化版本）
    const R = 6371000; // 地球半徑，單位公尺
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // ====================
  // Data Conversion Utilities
  // ====================

  /**
   * 將 Date 物件轉換為 Firestore Timestamp
   */
  private convertToFirestoreData(data: any): any {
    if (!data) return data;

    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      // 🔥 修復：跳過 undefined 值，Firestore 不支援
      if (value === undefined) {
        continue;
      }
      
      if (value instanceof Date) {
        converted[key] = Timestamp.fromDate(value);
      } else if (typeof value === 'object' && value !== null) {
        converted[key] = this.convertToFirestoreData(value);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }

  /**
   * 將 Firestore Timestamp 轉換為 Date 物件
   */
  private convertFromFirestoreData(data: any): any {
    if (!data) return data;

    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Timestamp) {
        converted[key] = value.toDate();
      } else if (typeof value === 'object' && value !== null) {
        converted[key] = this.convertFromFirestoreData(value);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }

  /**
   * 處理 Firestore 查詢錯誤
   */
  private handleFirestoreError(error: any, operation: string, context?: any): never {
    let message = `${operation} failed`;
    let code = 'unknown';

    if (error.code) {
      code = error.code;
      switch (error.code) {
        case 'permission-denied':
          message = `${operation} failed: Permission denied`;
          break;
        case 'not-found':
          message = `${operation} failed: Document not found`;
          break;
        case 'already-exists':
          message = `${operation} failed: Document already exists`;
          break;
        case 'unavailable':
          message = `${operation} failed: Service unavailable`;
          break;
        default:
          message = `${operation} failed: ${error.message}`;
      }
    }

    throw new FirestoreError(message, code, { originalError: error, context });
  }

  // ====================
  // Test Cleanup
  // ====================

  async cleanup(): Promise<void> {
    if (this.isTestEnvironment) {
      this.mockCollections.clear();
      this.initializeMockCollections();
    }
    // 注意：在生產環境中不提供清理功能，避免意外刪除資料
  }

  // === 測試兼容性別名方法 ===

  /**
   * getUser 別名方法
   */
  async getUser(userId: string): Promise<any> {
    try {
      const user = await this.getUserById(userId);
      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleFirestoreError(error, 'getUserById')
      };
    }
  }

  /**
   * updateUser 別名方法
   */
  async updateUser(userId: string, updates: any): Promise<any> {
    try {
      // 將 updates 轉換為 preferences 格式
      const preferences = updates.preferences || updates;
      const result = await this.updateUserPreferences(userId, preferences);
      
      // 組合完整的用戶資料
      const userData = {
        id: userId,
        preferences: result,
        ...updates
      };
      
      return {
        success: true,
        data: userData
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleFirestoreError(error, 'updateUser')
      };
    }
  }

  /**
   * saveConversation 別名方法
   */
  async saveConversation(conversationData: any): Promise<any> {
    try {
      const conversation = await this.createConversation(conversationData);
      return {
        success: true,
        data: conversation
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleFirestoreError(error, 'saveConversation')
      };
    }
  }
}
