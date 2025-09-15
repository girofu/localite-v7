/**
 * Firestore 資料庫類型定義
 * 
 * 定義所有 Firestore 集合的資料結構
 * 包含用戶、商戶、景點、對話等核心資料模型
 */

// ====================
// 基礎類型
// ====================

export interface Timestamp {
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address {
  address?: string;
  coordinates: Location;
  district?: string;
  city?: string;
  country?: string;
}

// ====================
// 用戶相關類型
// ====================

export interface UserPreferences {
  language: 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP';
  theme?: 'light' | 'dark' | 'system';
  notifications: {
    push: boolean;
    email: boolean;
    aiRecommendations: boolean;
  };
  aiSettings: {
    voiceEnabled: boolean;
    responseLength: 'short' | 'medium' | 'long';
    personality: 'professional' | 'friendly' | 'humorous';
  };
}

export interface User extends Timestamp {
  id: string; // 對應 Firebase Auth UID
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  preferredLanguage: string;
  isEmailVerified: boolean;
  role: 'tourist' | 'admin';
  preferences?: UserPreferences;
  stats?: {
    totalConversations: number;
    totalPhotosUploaded: number;
    placesVisited: number;
  };
}

export interface CreateUserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
  isEmailVerified?: boolean;
}

// ====================
// 商戶相關類型
// ====================

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string | {
    street: string;
    city: string;
    country: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  website?: string;
}

export interface VerificationInfo {
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationNotes?: string;
}

export interface Merchant extends Timestamp {
  id: string; // 對應 Firebase Auth UID
  email: string;
  businessName: string;
  businessDescription?: string;
  contactInfo: ContactInfo;
  businessType: 'restaurant' | 'hotel' | 'attraction' | 'tour_operator' | 'retail' | 'other';
  role: 'merchant';
  isVerified: boolean;
  verificationInfo?: VerificationInfo;
  stats?: {
    totalPlaces: number;
    totalViews: number;
    averageRating: number;
  };
}

export interface CreateMerchantData {
  uid: string;
  email: string;
  businessName: string;
  businessDescription?: string;
  contactInfo?: Partial<ContactInfo>;
  businessType: Merchant['businessType'];
  isVerified?: boolean;
}

// ====================
// 景點相關類型
// ====================

export interface Place extends Timestamp {
  id: string;
  name: string;
  description?: string;
  location: Address;
  category: 'restaurant' | 'attraction' | 'hotel' | 'shopping' | 'landmark' | 'entertainment' | 'transport' | 'food' | 'other';
  tags: string[];
  images?: string[];
  merchantId?: string; // 關聯到商戶
  rating?: {
    average: number;
    count: number;
  };
  isPublic: boolean;
  isActive: boolean;
  metadata?: {
    source?: string;
    lastVerified?: Date;
    aiGenerated?: boolean;
  };
}

export interface CreatePlaceData {
  name: string;
  description?: string;
  location?: Partial<Address>;
  category: Place['category'];
  tags?: string[];
  images?: string[];
  merchantId?: string;
  isPublic?: boolean;
  isActive?: boolean;
}

export interface PlaceSearchParams {
  city?: string;
  district?: string;
  category?: Place['category'];
  tags?: string[];
  radius?: number; // 搜尋半徑 (公尺)
  center?: Location; // 中心點座標
  limit?: number;
}

// ====================
// 對話相關類型
// ====================

export interface ConversationMessage {
  id?: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    aiModel?: string;
    processingTime?: number;
    confidence?: number;
  };
}

export interface ConversationContext {
  currentLocation?: Location;
  language: string;
  interests?: string[];
  sessionData?: Record<string, any>;
}

export interface Conversation extends Timestamp {
  id: string;
  userId: string;
  type: 'ai_guide' | 'customer_service' | 'place_inquiry';
  messages: ConversationMessage[];
  context: ConversationContext;
  isActive: boolean;
  endedAt?: Date;
  stats?: {
    totalMessages: number;
    duration?: number; // 對話時長 (秒)
  };
}

export interface CreateConversationData {
  userId: string;
  type: Conversation['type'];
  context?: Partial<ConversationContext>;
  isActive?: boolean;
}

// ====================
// 照片上傳相關類型
// ====================

export interface PhotoMetadata {
  filename: string;
  size: number; // bytes
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface PhotoAnalysisResult {
  detectedPlaces?: string[];
  confidence?: number;
  description?: string;
  aiGenerated?: boolean;
}

export interface PhotoUpload extends Timestamp {
  id: string;
  userId: string;
  originalUrl: string;
  thumbnailUrl?: string;
  metadata: PhotoMetadata;
  location?: Location;
  tags: string[];
  analysisResult?: PhotoAnalysisResult;
  uploadedAt: Date;
  isPublic: boolean;
}

export interface CreatePhotoUploadData {
  userId: string;
  originalUrl: string;
  thumbnailUrl?: string;
  metadata: PhotoMetadata;
  location?: Location;
  tags?: string[];
  analysisResult?: PhotoAnalysisResult;
  isPublic?: boolean;
}

// ====================
// 查詢參數類型
// ====================

export interface PaginationParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface SearchFilters {
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  isPublic?: boolean;
}
