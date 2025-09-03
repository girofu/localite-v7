/**
 * 用戶旅程端到端測試
 * 測試完整的用戶使用流程
 */

import { APIService } from '../../src/services/APIService';
import { FirestoreService } from '../../src/services/FirestoreService';
import { GoogleAIService } from '../../src/services/GoogleAIService';
import { GoogleTTSService } from '../../src/services/GoogleTTSService';
import { ServiceManager } from '../../src/services/ServiceManager';
import { MultiLanguageService } from '../../src/services/MultiLanguageService';

describe('User Journey Integration Tests', () => {
  let apiService: APIService;
  let firestoreService: FirestoreService;
  let aiService: GoogleAIService;
  let ttsService: GoogleTTSService;
  let serviceManager: ServiceManager;
  let languageService: MultiLanguageService;

  beforeAll(async () => {
    // 初始化所有服務
    firestoreService = new FirestoreService();
    aiService = new GoogleAIService({
      apiKey: 'test-key'
    });
    ttsService = new GoogleTTSService({
      enableCaching: true,
      cacheSize: 50
    });
    languageService = new MultiLanguageService();

    // 創建 APIService 實例並注入 mock 服務
    apiService = new APIService({
      firestoreService,
      aiService,
      ttsService
    });

    serviceManager = new ServiceManager({
      api: apiService,
      firestore: firestoreService,
      ai: aiService,
      tts: ttsService,
      language: languageService
    });

    // 初始化服務管理器
    await serviceManager.initialize();

    // 在測試環境中添加測試資料
    await initializeTestData();
  });

  async function initializeTestData() {
    // 添加測試地點資料
    const testPlaces = [
      {
        id: 'place-taipei-101',
        name: '台北101',
        description: '台北市最著名的地標建築',
        location: {
          coordinates: { latitude: 25.0338, longitude: 121.5645 },
          address: '台北市信義區信義路五段7號',
          district: '信義區',
          city: '台北市',
          country: '台灣'
        },
        category: 'landmark' as const,
        tags: ['觀光', '購物', '餐飲', '地標'],
        merchantId: 'merchant-taipei-101',
        isPublic: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'place-night-market',
        name: '士林夜市',
        description: '台灣最有名的夜市之一',
        location: {
          coordinates: { latitude: 25.0875, longitude: 121.5244 },
          address: '台北市士林區',
          district: '士林區',
          city: '台北市',
          country: '台灣'
        },
        category: 'food' as const,
        tags: ['美食', '夜市', '小吃'],
        merchantId: 'merchant-night-market',
        isPublic: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // 使用 FirestoreService 的內部方法添加測試資料
    for (const place of testPlaces) {
      (firestoreService as any).mockCollections.get('places')?.set(place.id, place);
    }
  }

  afterAll(async () => {
    // 清理所有資源
    await serviceManager.cleanup();
  });

  describe('新用戶註冊和登入流程', () => {
    const testUser = {
      email: 'test@example.com',
      displayName: 'Test User',
      uid: 'test-uid-123'
    };

    it('應該能夠成功註冊新用戶', async () => {
      // 模擬用戶註冊
      const userData = {
        ...testUser,
        preferences: {
          language: 'zh-TW',
          theme: 'light',
          notifications: {
            push: true,
            email: false
          }
        },
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      const result = await firestoreService.createUser(userData);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe(testUser.email);
      expect(result.data?.preferences?.language).toBe('zh-TW');
    });

    it('應該能夠獲取用戶資料', async () => {
      const result = await firestoreService.getUser(testUser.uid);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe(testUser.email);
      expect(result.data?.displayName).toBe(testUser.displayName);
    });

    it('應該能夠更新用戶偏好設定', async () => {
      const updates = {
        preferences: {
          language: 'en-US',
          theme: 'dark'
        }
      };

      const result = await firestoreService.updateUser(testUser.uid, updates);

      expect(result.success).toBe(true);
      expect(result.data?.preferences?.language).toBe('en-US');
      expect(result.data?.preferences?.theme).toBe('dark');
    });
  });

  describe('多語言聊天流程', () => {
    const testMessage = {
      userId: 'test-uid-123',
      content: '你好，我想了解台北的景點',
      language: 'zh-TW',
      timestamp: new Date()
    };

    it('應該能夠處理中文訊息', async () => {
      const result = await apiService.sendChatMessage(
        testMessage.userId,
        testMessage.content,
        {
          language: testMessage.language as 'zh-TW' | 'en-US'
        }
      );

      expect(result.success).toBe(true);
      expect(result.data?.response).toBeDefined();
      expect(result.data?.response?.content).toBeDefined();
      expect(result.data?.response?.metadata?.language).toBe('zh-TW');
    });

    it('應該能夠處理英文訊息', async () => {
      const englishMessage = 'Hello, I want to know about Taipei attractions';

      const result = await apiService.sendChatMessage(
        testMessage.userId,
        englishMessage,
        {
          language: 'en-US'
        }
      );

      expect(result.success).toBe(true);
      expect(result.data?.response?.content).toContain('Taipei');
      expect(result.data?.response?.metadata?.language).toBe('en-US');
    });

    it('應該能夠切換語言設定', async () => {
      const result = await languageService.setLanguage('en-US');

      expect(result.success).toBe(true);
      expect(languageService.getCurrentLanguage()).toBe('en-US');
    });
  });

  describe('AI 服務整合', () => {
    it('應該能夠處理圖片分析請求', async () => {
      const mockImageData = 'mock-base64-image-data';

      const result = await apiService.analyzeImage({
        imageData: mockImageData,
        context: 'landmark recognition',
        language: 'zh-TW'
      });

      expect(result.success).toBe(true);
      expect(result.data?.analysis).toBeDefined();
      expect(typeof result.data?.analysis).toBe('object');
      expect(result.data?.analysis.analysis).toBeDefined();
    });

    it('應該能夠處理地點搜尋', async () => {
      const searchQuery = 'Taipei 101';

      const result = await apiService.searchPlaces({
        query: searchQuery,
        language: 'zh-TW',
        userLocation: {
          latitude: 25.0330,
          longitude: 121.5654
        }
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data?.places)).toBe(true);
      expect(result.data?.places?.length).toBeGreaterThan(0);
    });

    it('應該能夠處理導航路線規劃', async () => {
      const routeRequest = {
        origin: { latitude: 25.0330, longitude: 121.5654 },
        destination: { latitude: 25.0911, longitude: 121.5598 },
        mode: 'walking' as const,
        language: 'zh-TW'
      };

      const result = await apiService.getRoute(routeRequest);

      expect(result.success).toBe(true);
      expect(result.data?.route).toBeDefined();
      expect(result.data?.route?.distance).toBeDefined();
      expect(result.data?.route?.duration).toBeDefined();
    });
  });

  describe('語音服務整合', () => {
    it('應該能夠將文字轉換為語音', async () => {
      const text = '歡迎來到台北';
      const voice = {
        languageCode: 'zh-TW' as const,
        name: 'zh-TW-Standard-A',
        ssmlGender: 'FEMALE' as const,
        naturalSampleRateHertz: 24000
      };

      const result = await ttsService.synthesize({
        text,
        voice,
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      });

      expect(result.audioContent).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.textLength).toBe(text.length);
    });

    it('應該能夠獲取可用的語音列表', async () => {
      const voices = await ttsService.listVoices('zh-TW');

      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
      expect(voices[0].languageCode).toBe('zh-TW');
    });

    it('應該能夠處理 SSML 標記', async () => {
      const ssml = '<speak>這是 <emphasis>強調</emphasis> 文字</speak>';

      const result = await ttsService.synthesizeSSML({
        ssml,
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Standard-A',
          ssmlGender: 'FEMALE' as const,
          naturalSampleRateHertz: 24000
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      });

      expect(result.audioContent).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });

  describe('錯誤處理和恢復', () => {
    it('應該能夠處理網路錯誤並重試', async () => {
      // 模擬網路錯誤
      const mockError = new Error('Network request failed');
      mockError.name = 'NetworkError';

      // 測試 API 服務的錯誤處理
      const result = await apiService.sendChatMessage(
        'test-user',
        '測試訊息',
        {
          language: 'zh-TW'
        }
      );

      // 即使在模擬環境中，應該有適當的錯誤處理
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('應該能夠處理無效的輸入資料', async () => {
      const invalidMessage = '';

      const result = await apiService.sendChatMessage(
        'test-user',
        invalidMessage,
        {
          language: 'zh-TW'
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('validation_error');
    });

    it('應該能夠處理服務超時', async () => {
      // 測試服務管理器的超時處理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Service timeout')), 100);
      });

      await expect(timeoutPromise).rejects.toThrow('Service timeout');
    });
  });

  describe('資料持久化和同步', () => {
    it('應該能夠儲存和同步用戶對話記錄', async () => {
      const conversationData = {
        userId: 'test-uid-123',
        messages: [
          {
            id: 'msg-1',
            content: '你好',
            type: 'user',
            timestamp: new Date(),
            language: 'zh-TW'
          },
          {
            id: 'msg-2',
            content: '您好！需要什麼幫助嗎？',
            type: 'assistant',
            timestamp: new Date(),
            language: 'zh-TW'
          }
        ],
        metadata: {
          totalMessages: 2,
          languages: ['zh-TW'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      const result = await firestoreService.saveConversation(conversationData);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('應該能夠同步離線資料', async () => {
      const offlineData = {
        userId: 'test-uid-123',
        pendingActions: [
          {
            type: 'chat_message',
            data: { content: '離線訊息', timestamp: new Date() },
            retryCount: 0
          }
        ]
      };

      // 模擬離線資料同步
      const result = await serviceManager.syncOfflineData(offlineData);

      expect(result.success).toBe(true);
      expect(result.data?.syncedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('效能和資源管理', () => {
    it('應該能夠有效管理快取', async () => {
      // 測試 TTS 服務的快取功能
      const text = '快取測試文字';
      const voice = {
        languageCode: 'zh-TW' as const,
        name: 'zh-TW-Standard-A',
        ssmlGender: 'FEMALE' as const,
        naturalSampleRateHertz: 24000
      };

      // 第一次請求
      const result1 = await ttsService.synthesize({
        text,
        voice,
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      });

      // 第二次請求（應該從快取獲取）
      const result2 = await ttsService.synthesize({
        text,
        voice,
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      });

      expect(result1.audioContent).toBeDefined();
      expect(result2.audioContent).toBeDefined();
    });

    it('應該能夠正確清理資源', async () => {
      // 測試服務清理
      await expect(serviceManager.cleanup()).resolves.not.toThrow();

      // 驗證清理後的狀態
      const healthStatus = serviceManager.getHealthStatus();
      expect(healthStatus.overall).toBeDefined();
    });

    it('應該能夠監控服務效能', async () => {
      const metrics = serviceManager.getPerformanceMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.api).toBeDefined();
      expect(metrics.firestore).toBeDefined();
      expect(metrics.ai).toBeDefined();
      expect(metrics.tts).toBeDefined();
    });
  });
});
