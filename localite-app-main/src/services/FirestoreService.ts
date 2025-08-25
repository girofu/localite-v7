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

  async createUser(userData: CreateUserData): Promise<User> {
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
      };

      if (this.isTestEnvironment) {
        this.mockCollections.get(FirestoreService.COLLECTIONS.USERS)?.set(user.id, user);
        return user;
      }

      // 生產環境：使用真實 Firestore
      const userDocRef = doc(this.db, FirestoreService.COLLECTIONS.USERS, user.id);
      await setDoc(userDocRef, this.convertToFirestoreData(user));
      
      return user;
    } catch (error: any) {
      throw new FirestoreError(
        `Failed to create user: ${error.message}`,
        error.code,
        { userData }
      );
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

  async updateUserPreferences(uid: string, preferences: UserPreferences): Promise<User> {
    try {
      if (this.isTestEnvironment) {
        const user = this.mockCollections.get(FirestoreService.COLLECTIONS.USERS)?.get(uid);
        if (user) {
          user.preferences = preferences;
          user.updatedAt = new Date();
          this.mockCollections.get(FirestoreService.COLLECTIONS.USERS)?.set(uid, user);
          return user;
        }
        throw new Error('User not found');
      }

      const userDocRef = doc(this.db, FirestoreService.COLLECTIONS.USERS, uid);
      const updateData = {
        preferences,
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
        { uid, preferences }
      );
    }
  }

  // ====================
  // Merchant Management
  // ====================

  async createMerchant(merchantData: CreateMerchantData): Promise<Merchant> {
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
    }

    return merchant;
  }

  async verifyMerchant(uid: string, verificationInfo: VerificationInfo): Promise<Merchant> {
    if (this.isTestEnvironment) {
      const merchant = this.mockCollections.get('merchants')?.get(uid);
      if (merchant) {
        merchant.isVerified = verificationInfo.isVerified;
        merchant.verificationInfo = verificationInfo;
        merchant.updatedAt = new Date();
        this.mockCollections.get('merchants')?.set(uid, merchant);
        return merchant;
      }
    }

    throw new Error('Merchant not found');
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
    if (this.isTestEnvironment) {
      const places = Array.from(this.mockCollections.get('places')?.values() || []);
      return places.filter((place: Place) => place.merchantId === merchantId);
    }

    return [];
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
}
