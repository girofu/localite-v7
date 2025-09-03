/**
 * Firestore Database Service Integration Tests
 * 
 * 測試 Firestore 資料庫結構和 CRUD 操作
 * 包含用戶、商戶、景點、對話等核心資料模型
 */

import { FirestoreService } from '../../src/services/FirestoreService';
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
  CreateConversationData 
} from '../../src/types/firestore.types';

describe('FirestoreService Integration Tests', () => {
  let firestoreService: FirestoreService;

  beforeEach(() => {
    firestoreService = new FirestoreService();
  });

  afterEach(async () => {
    // 清理測試資料
    await firestoreService.cleanup();
  });

  describe('User Management', () => {
    it('should create user with complete profile data', async () => {
      // Arrange
      const userData: CreateUserData = {
        uid: 'test-user-uid',
        email: 'test@localite.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        preferredLanguage: 'zh-TW',
        isEmailVerified: true,
      };

      // Act
      const result = await firestoreService.createUser(userData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(userData.uid);
      expect(result.data.email).toBe(userData.email);
      expect(result.data.displayName).toBe(userData.displayName);
      expect(result.data.preferredLanguage).toBe('zh-TW');
      expect(result.data.createdAt).toBeInstanceOf(Date);
      expect(result.data.updatedAt).toBeInstanceOf(Date);
      expect(result.data.role).toBe('tourist');
    });

    it('should get user by uid', async () => {
      // Arrange
      const userData: CreateUserData = {
        uid: 'existing-user-uid',
        email: 'existing@localite.com',
        displayName: 'Existing User',
      };
      await firestoreService.createUser(userData);

      // Act
      const user = await firestoreService.getUserById('existing-user-uid');

      // Assert
      expect(user).not.toBeNull();
      expect(user?.id).toBe('existing-user-uid');
      expect(user?.email).toBe('existing@localite.com');
    });

    it('should update user preferences', async () => {
      // Arrange
      const userData: CreateUserData = {
        uid: 'user-to-update',
        email: 'update@localite.com',
        displayName: 'User To Update',
        preferredLanguage: 'zh-TW', // 設置初始語言
      };
      await firestoreService.createUser(userData);

      const preferences: UserPreferences = {
        language: 'en-US',
        theme: 'dark',
        notifications: {
          push: true,
          email: false,
          aiRecommendations: true,
        },
        aiSettings: {
          voiceEnabled: true,
          responseLength: 'medium',
          personality: 'friendly',
        },
      };

      // Act
      const updatedUser = await firestoreService.updateUserPreferences(
        'user-to-update',
        { preferences }
      );

      // Assert
      expect(updatedUser?.preferences?.language).toBe('en-US');
      expect(updatedUser?.preferences?.theme).toBe('dark');
      expect(updatedUser?.preferences?.notifications?.push).toBe(true);
      expect(updatedUser?.preferences?.aiSettings?.voiceEnabled).toBe(true);
    });
  });

  describe('Merchant Management', () => {
    it('should create merchant with business information', async () => {
      // Arrange
      const merchantData: CreateMerchantData = {
        uid: 'merchant-uid',
        email: 'merchant@business.com',
        businessName: 'Amazing Tours Ltd',
        contactInfo: {
          phone: '+886-2-1234-5678',
          address: '台北市信義區信義路五段7號',
          website: 'https://amazingtours.com',
        },
        businessType: 'tour_operator',
        isVerified: false,
      };

      // Act
      const result = await firestoreService.createMerchant(merchantData);

      // Assert
      expect(result.id).toBe(merchantData.uid);
      expect(result.businessName).toBe('Amazing Tours Ltd');
      expect(result.contactInfo.phone).toBe('+886-2-1234-5678');
      expect(result.businessType).toBe('tour_operator');
      expect(result.isVerified).toBe(false);
      expect(result.role).toBe('merchant');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should verify merchant status', async () => {
      // Arrange
      const merchantData: CreateMerchantData = {
        uid: 'merchant-to-verify',
        email: 'verify@business.com',
        businessName: 'Verify Me Tours',
        businessType: 'restaurant',
      };
      await firestoreService.createMerchant(merchantData);

      // Act
      const verifiedMerchant = await firestoreService.verifyMerchant(
        'merchant-to-verify',
        {
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: 'admin-user-id',
          verificationNotes: 'Documents verified successfully',
        }
      );

      // Assert
      expect(verifiedMerchant).toBe(true);
    });
  });

  describe('Place Management', () => {
    it('should create place with location and content data', async () => {
      // Arrange
      const placeData: CreatePlaceData = {
        name: '台北101',
        description: '台北最著名的摩天大樓',
        location: {
          address: '台北市信義區信義路五段7號',
          coordinates: {
            latitude: 25.0338,
            longitude: 121.5645,
          },
          district: '信義區',
          city: '台北市',
        },
        category: 'landmark',
        tags: ['觀光', '購物', '餐飲'],
        merchantId: 'merchant-owner-id',
        isPublic: true,
      };

      // Act
      const result = await firestoreService.createPlace(placeData);

      // Assert
      expect(result.name).toBe('台北101');
      expect(result.location.coordinates.latitude).toBe(25.0338);
      expect(result.category).toBe('landmark');
      expect(result.tags).toContain('觀光');
      expect(result.merchantId).toBe('merchant-owner-id');
      expect(result.isPublic).toBe(true);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should search places by location and category', async () => {
      // Arrange
      await firestoreService.createPlace({
        name: '西門町',
        location: { 
          coordinates: { latitude: 25.0421, longitude: 121.5068 },
          district: '萬華區',
          city: '台北市',
        },
        category: 'shopping',
        isPublic: true,
      });

      await firestoreService.createPlace({
        name: '士林夜市',
        location: { 
          coordinates: { latitude: 25.0879, longitude: 121.5244 },
          district: '士林區', 
          city: '台北市',
        },
        category: 'food',
        isPublic: true,
      });

      // Act
      const places = await firestoreService.searchPlaces({
        city: '台北市',
        category: 'shopping',
        radius: 10000, // 10km
        center: { latitude: 25.0421, longitude: 121.5068 },
      });

      // Assert
      expect(places).toHaveLength(1);
      expect(places[0].name).toBe('西門町');
      expect(places[0].category).toBe('shopping');
    });
  });

  describe('Conversation Management', () => {
    it('should create and manage AI conversation', async () => {
      // Arrange
      const conversationData: CreateConversationData = {
        userId: 'tourist-user-id',
        type: 'ai_guide',
        context: {
          currentLocation: {
            latitude: 25.0338,
            longitude: 121.5645,
          },
          language: 'zh-TW',
          interests: ['文化', '美食'],
        },
        isActive: true,
      };

      // Act
      const conversation = await firestoreService.createConversation(conversationData);

      // Assert
      expect(conversation.userId).toBe('tourist-user-id');
      expect(conversation.type).toBe('ai_guide');
      expect(conversation.context.language).toBe('zh-TW');
      expect(conversation.messages).toEqual([]);
      expect(conversation.isActive).toBe(true);
      expect(conversation.createdAt).toBeInstanceOf(Date);
    });

    it('should add messages to conversation', async () => {
      // Arrange
      const conversation = await firestoreService.createConversation({
        userId: 'user-id',
        type: 'ai_guide',
        isActive: true,
      });

      // Act
      const updatedConversation = await firestoreService.addMessageToConversation(
        conversation.id,
        {
          type: 'user',
          content: '請推薦附近的美食',
          timestamp: new Date(),
        }
      );

      await firestoreService.addMessageToConversation(
        conversation.id,
        {
          type: 'ai',
          content: '我推薦您附近的小籠包店，距離您只有 200 公尺...',
          timestamp: new Date(),
        }
      );

      const finalConversation = await firestoreService.getConversationById(conversation.id);

      // Assert
      expect(finalConversation?.messages).toHaveLength(2);
      expect(finalConversation?.messages[0].type).toBe('user');
      expect(finalConversation?.messages[1].type).toBe('ai');
      expect(finalConversation?.messages[0].content).toContain('美食');
    });
  });

  describe('Photo Upload Management', () => {
    it('should record photo upload with metadata', async () => {
      // Arrange
      const photoData = {
        userId: 'photographer-user-id',
        originalUrl: 'https://storage.googleapis.com/bucket/original.jpg',
        thumbnailUrl: 'https://storage.googleapis.com/bucket/thumb.jpg',
        metadata: {
          filename: 'taipei101.jpg',
          size: 2048576, // 2MB
          mimeType: 'image/jpeg',
          dimensions: { width: 1920, height: 1080 },
        },
        location: {
          latitude: 25.0338,
          longitude: 121.5645,
        },
        tags: ['台北101', '建築', '夜景'],
        analysisResult: {
          detectedPlaces: ['台北101'],
          confidence: 0.95,
          description: '台北101大樓的夜景照片',
        },
      };

      // Act
      const result = await firestoreService.createPhotoUpload(photoData);

      // Assert
      expect(result.userId).toBe('photographer-user-id');
      expect(result.metadata.filename).toBe('taipei101.jpg');
      expect(result.location?.latitude).toBe(25.0338);
      expect(result.tags).toContain('台北101');
      expect(result.analysisResult?.confidence).toBe(0.95);
      expect(result.uploadedAt).toBeInstanceOf(Date);
    });
  });

  describe('Data Relationships and Integrity', () => {
    it('should maintain referential integrity between users and conversations', async () => {
      // Arrange
      const user = await firestoreService.createUser({
        uid: 'user-with-conversations',
        email: 'user@test.com',
        displayName: 'Test User',
      });

      // Act
      const conversation = await firestoreService.createConversation({
        userId: user.id,
        type: 'ai_guide',
        isActive: true,
      });

      const userConversations = await firestoreService.getUserConversations(user.id);

      // Assert
      expect(userConversations).toHaveLength(1);
      expect(userConversations[0].id).toBe(conversation.id);
      expect(userConversations[0].userId).toBe(user.id);
    });

    it('should maintain relationship between merchants and their places', async () => {
      // Arrange
      const merchant = await firestoreService.createMerchant({
        uid: 'merchant-with-places',
        email: 'merchant@test.com',
        businessName: 'Test Business',
        businessType: 'restaurant',
      });

      // Act
      await firestoreService.createPlace({
        name: 'Merchant Restaurant',
        merchantId: merchant.id,
        category: 'restaurant',
        isPublic: true,
      });

      const merchantPlaces = await firestoreService.getMerchantPlaces(merchant.id);

      // Assert
      expect(merchantPlaces).toHaveLength(1);
      expect(merchantPlaces[0].merchantId).toBe(merchant.id);
      expect(merchantPlaces[0].name).toBe('Merchant Restaurant');
    });
  });
});
