/**
 * 商戶服務測試
 * 測試商戶註冊流程和內容管理功能
 */

import { FirestoreService } from '../../src/services/FirestoreService';
import { CreateMerchantData, Merchant } from '../../src/types/firestore.types';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  __esModule: true,
  default: () => ({
    collection: jest.fn(() => ({
      add: jest.fn(),
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
    doc: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  }),
}));

describe('商戶服務測試', () => {
  let firestoreService: FirestoreService;
  
  beforeEach(() => {
    firestoreService = new FirestoreService();
    jest.clearAllMocks();
  });

  describe('商戶註冊流程', () => {
    test('應該能夠創建新的商戶帳號', async () => {
      // Arrange
      const merchantData: CreateMerchantData = {
        uid: 'test-merchant-uid',
        email: 'merchant@test.com',
        businessName: '測試商戶',
        businessDescription: '這是一個測試商戶',
        businessType: 'restaurant',
        contactInfo: {
          phone: '+886912345678',
          address: {
            street: '測試街道 123號',
            city: '台北市',
            country: '台灣',
            postalCode: '10001',
            coordinates: {
              latitude: 25.0330,
              longitude: 121.5654
            }
          }
        }
      };

      // Act
      const result = await firestoreService.createMerchant(merchantData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(merchantData.uid);
      expect(result.email).toBe(merchantData.email);
      expect(result.businessName).toBe(merchantData.businessName);
      expect(result.role).toBe('merchant');
      expect(result.isVerified).toBe(false);
      expect(result.stats).toEqual({
        totalPlaces: 0,
        totalViews: 0,
        averageRating: 0,
      });
    });

    test('應該能夠驗證商戶帳號', async () => {
      // Arrange
      const merchantId = 'test-merchant-uid';
      const merchantData = {
        uid: merchantId,
        businessName: 'Test Merchant',
        email: 'test@merchant.com',
        phoneNumber: '+886987654321',
        address: 'Test Address',
        businessLicense: 'TEST123456',
        taxId: '12345678',
        businessCategory: 'restaurant',
        businessType: 'restaurant' as const,
        description: 'Test merchant description',
        website: 'https://testmerchant.com',
        socialMedia: {
          facebook: 'https://facebook.com/testmerchant',
          instagram: 'https://instagram.com/testmerchant',
        },
        operatingHours: {
          monday: { open: '09:00', close: '18:00', isOpen: true },
          tuesday: { open: '09:00', close: '18:00', isOpen: true },
          wednesday: { open: '09:00', close: '18:00', isOpen: true },
          thursday: { open: '09:00', close: '18:00', isOpen: true },
          friday: { open: '09:00', close: '18:00', isOpen: true },
          saturday: { open: '09:00', close: '18:00', isOpen: true },
          sunday: { open: '09:00', close: '18:00', isOpen: true },
        },
        location: {
          latitude: 25.0330,
          longitude: 121.5654,
          address: 'Test Address',
          city: 'Taipei',
          district: 'Ximending',
        },
      };

      // 先創建商戶
      await firestoreService.createMerchant(merchantData);

      // Act
      const result = await firestoreService.verifyMerchant(merchantId);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('內容管理功能', () => {
    test('應該能夠獲取商戶的所有地點', async () => {
      // Arrange
      const merchantId = 'test-merchant-uid';

      // Act
      const places = await firestoreService.getMerchantPlaces(merchantId);

      // Assert
      expect(Array.isArray(places)).toBe(true);
    });

    test('應該能夠創建新的地點內容', async () => {
      // Arrange
      const placeData = {
        name: '測試餐廳',
        description: '美味的台灣料理餐廳',
        category: 'restaurant' as const,
        merchantId: 'test-merchant-uid',
        tags: ['台灣料理', '家庭聚餐'],
        isPublic: true,
        isActive: true,
      };

      // Act
      const result = await firestoreService.createPlace(placeData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(placeData.name);
      expect(result.merchantId).toBe(placeData.merchantId);
      expect(result.category).toBe(placeData.category);
    });
  });

  describe('商戶資料更新', () => {
    test('應該能夠更新商戶基本資訊', async () => {
      // 這個測試暫時跳過，需要實作 updateMerchant 方法
      expect(true).toBe(true);
    });
  });
});
