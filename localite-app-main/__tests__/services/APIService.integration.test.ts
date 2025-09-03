/**
 * API Service Integration Tests
 * 
 * 測試統一的 API 介面層整合功能
 * 包含前後端服務整合、錯誤處理、多語言支援等
 */

import { APIService } from '../../src/services/APIService';
import { FirestoreService } from '../../src/services/FirestoreService';
import { GoogleAIService } from '../../src/services/GoogleAIService';
import { GoogleTTSService } from '../../src/services/GoogleTTSService';
import { APIError, APIResponse } from '../../src/types/api.types';

// Mock 所有依賴服務
jest.mock('../../src/services/FirestoreService');
jest.mock('../../src/services/GoogleAIService');
jest.mock('../../src/services/GoogleTTSService');

describe('APIService Integration Tests', () => {
  let apiService: APIService;
  let mockFirestoreService: jest.Mocked<FirestoreService>;
  let mockGoogleAIService: jest.Mocked<GoogleAIService>;
  let mockGoogleTTSService: jest.Mocked<GoogleTTSService>;

  beforeEach(() => {
    // 重置所有 mocks
    jest.clearAllMocks();
    
    // 建立 mock 實例
    mockFirestoreService = new FirestoreService() as jest.Mocked<FirestoreService>;
    mockGoogleAIService = new GoogleAIService() as jest.Mocked<GoogleAIService>;
    mockGoogleTTSService = new GoogleTTSService() as jest.Mocked<GoogleTTSService>;
    
    // 建立 APIService 實例
    apiService = new APIService({
      firestoreService: mockFirestoreService,
      aiService: mockGoogleAIService,
      ttsService: mockGoogleTTSService,
    });
  });

  describe('Chat API Integration', () => {
    it('should integrate AI chat with conversation history storage', async () => {
      // Arrange
      const userId = 'user-123';
      const message = 'Tell me about Taipei 101';
      const language = 'zh-TW';

      const mockAIResponse = {
        content: '台北101是台灣最知名的地標之一...',
        role: 'assistant' as const,
        timestamp: new Date(),
        metadata: {
          model: 'gemini-1.5-flash',
          tokensUsed: 150,
          estimatedCost: 0.0015,
          processingTime: 200,
          conversationId: 'conv-123',
          language: 'zh-TW',
          systemPromptUsed: true
        }
      };

      const mockConversation = {
        id: 'conv-123',
        userId: 'user-123',
        type: 'ai_guide' as const,
        messages: [],
        context: { language: 'zh-TW' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: { totalMessages: 1 }
      };

      mockGoogleAIService.sendMessage.mockResolvedValue(mockAIResponse);
      mockFirestoreService.createConversation.mockResolvedValue(mockConversation);
      mockFirestoreService.addMessageToConversation.mockResolvedValue({
        ...mockConversation,
        messages: [
          { content: message, type: 'user', timestamp: new Date() },
          { content: mockAIResponse.content, type: 'ai', timestamp: mockAIResponse.timestamp }
        ]
      });

      // Act
      const result = await apiService.sendChatMessage(userId, message, { language });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('response');
      expect(result.data).toHaveProperty('conversationId');
      expect(result.data.response.content).toBe(mockAIResponse.content);
      expect(result.data.response.metadata?.language).toBe(language);

      // 驗證服務調用
      expect(mockGoogleAIService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ content: message }),
        expect.objectContaining({ language })
      );
      expect(mockFirestoreService.addMessageToConversation).toHaveBeenCalled();
    });

    it('should handle AI service errors gracefully', async () => {
      // Arrange
      const userId = 'user-123';
      const message = 'Test message';

      // 設置 Firestore mocks（即使不會被調用到）
      mockFirestoreService.createConversation.mockResolvedValue({
        id: 'conv-123',
        userId,
        type: 'ai_guide',
        messages: [],
        context: { language: 'zh-TW' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: { totalMessages: 0 }
      });

      mockGoogleAIService.sendMessage.mockRejectedValue(
        new Error('AI service unavailable')
      );

      // Act
      const result = await apiService.sendChatMessage(userId, message);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(APIError);
      expect(result.error?.code).toBe('ai_service_error');
      expect(result.error?.message).toContain('AI service unavailable');
    });
  });

  describe('Image Analysis API Integration', () => {
    it('should integrate image analysis with place recognition', async () => {
      // Arrange
      const userId = 'user-123';
      const imageBuffer = Buffer.from('fake-image-data');
      const query = '這是什麼地方？';

      const mockAnalysisResponse = {
        analysis: '這裡是台北101，台灣最著名的地標...',
        confidence: 0.92,
        landmarks: [
          {
            name: '台北101',
            confidence: 0.92,
            description: '台北市最著名的摩天大樓',
            location: { latitude: 25.0338, longitude: 121.5645 },
            wikiUrl: 'https://zh.wikipedia.org/wiki/台北101'
          }
        ],
        recommendations: [],
        metadata: {
          model: 'gemini-1.5-flash',
          processingTime: 300,
          imageSize: { width: 1920, height: 1080 },
          tokensUsed: 200,
          estimatedCost: 0.004
        }
      };

      const mockPlaces = [
        {
          id: 'place-101',
          name: '台北101',
          description: '台北市信義區的摩天大樓',
          location: {
            coordinates: { latitude: 25.0338, longitude: 121.5645 },
            address: '台北市信義區信義路五段7號',
            district: '信義區',
            city: '台北市',
            country: '台灣'
          },
          category: 'landmark' as const,
          tags: ['觀光', '購物', '餐飲'],
          merchantId: 'merchant-101',
          isPublic: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockGoogleAIService.analyzeImage.mockResolvedValue(mockAnalysisResponse);
      mockFirestoreService.searchPlaces.mockResolvedValue(mockPlaces);

      // Act
      const result = await apiService.analyzeImageWithPlaceInfo(userId, {
        image: { buffer: imageBuffer, mimeType: 'image/jpeg', filename: 'test.jpg' },
        query,
        context: { userLanguage: 'zh-TW', timestamp: new Date() }
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('analysis');
      expect(result.data).toHaveProperty('relatedPlaces');
      expect(result.data.analysis.analysis).toBe(mockAnalysisResponse.analysis);
      expect(result.data.relatedPlaces).toHaveLength(1);
      expect(result.data.relatedPlaces[0].name).toBe('台北101');

      // 驗證服務調用
      expect(mockGoogleAIService.analyzeImage).toHaveBeenCalledWith(
        expect.objectContaining({
          image: { buffer: imageBuffer, mimeType: 'image/jpeg', filename: 'test.jpg' },
          query
        })
      );
      expect(mockFirestoreService.searchPlaces).toHaveBeenCalled();
    });
  });

  describe('Multi-language Support', () => {
    it('should handle language switching in chat responses', async () => {
      // Arrange
      const userId = 'user-123';
      const message = 'Tell me about Taipei 101';
      const language = 'en-US';

      const mockEnglishResponse = {
        content: 'Taipei 101 is one of Taiwan\'s most famous landmarks...',
        role: 'assistant' as const,
        timestamp: new Date(),
        metadata: {
          model: 'gemini-1.5-flash',
          tokensUsed: 120,
          estimatedCost: 0.0012,
          processingTime: 180,
          conversationId: 'conv-123',
          language: 'en-US',
          systemPromptUsed: true
        }
      };

      mockGoogleAIService.sendMessage.mockResolvedValue(mockEnglishResponse);
      mockFirestoreService.createConversation.mockResolvedValue({
        id: 'conv-123',
        userId,
        type: 'ai_guide',
        messages: [],
        context: { language: 'en-US' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: { totalMessages: 1 }
      });
      mockFirestoreService.addMessageToConversation.mockResolvedValue({
        id: 'conv-123',
        userId,
        type: 'ai_guide',
        messages: [
          { content: message, type: 'user', timestamp: new Date() },
          { content: mockEnglishResponse.content, type: 'ai', timestamp: mockEnglishResponse.timestamp }
        ],
        context: { language: 'en-US' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: { totalMessages: 2 }
      });

      // Act
      const result = await apiService.sendChatMessage(userId, message, { language });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.response.metadata?.language).toBe('en-US');
      expect(result.data.response.content).toContain('Taiwan\'s most famous landmarks');

      // 驗證語言參數傳遞
      expect(mockGoogleAIService.sendMessage).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ language: 'en-US' })
      );
    });

    it('should update user language preference', async () => {
      // Arrange
      const userId = 'user-123';
      const newLanguage = 'en-US';

      mockFirestoreService.updateUserPreferences.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        displayName: 'Test User',
        preferredLanguage: 'en-US',
        isEmailVerified: true,
        role: 'tourist',
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalConversations: 0,
          totalPhotosUploaded: 0,
          placesVisited: 0
        }
      });

      // Act
      const result = await apiService.updateUserLanguage(userId, newLanguage);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.preferredLanguage).toBe(newLanguage);

      // 驗證服務調用
      expect(mockFirestoreService.updateUserPreferences).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ preferredLanguage: newLanguage })
      );
    });
  });

  describe('Error Handling', () => {
    it('should standardize error responses across services', async () => {
      // Arrange
      const userId = 'user-123';
      const message = 'Test message';

      // 模擬不同類型的錯誤
      const firestoreError = new Error('Firestore connection failed');
      firestoreError.name = 'FirestoreError';
      
      mockFirestoreService.createConversation.mockRejectedValue(firestoreError);

      // Act
      const result = await apiService.sendChatMessage(userId, message);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(APIError);
      expect(result.error?.code).toBe('database_error');
      expect(result.error?.message).toContain('Database operation failed');
      expect(result.error?.details).toHaveProperty('originalError');
    });

    it('should handle network timeout errors', async () => {
      // Arrange
      const userId = 'user-123';
      const message = 'Test message';

      // 設置 Firestore mocks（即使不會被調用到）
      mockFirestoreService.createConversation.mockResolvedValue({
        id: 'conv-123',
        userId,
        type: 'ai_guide',
        messages: [],
        context: { language: 'zh-TW' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: { totalMessages: 0 }
      });

      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      mockGoogleAIService.sendMessage.mockRejectedValue(timeoutError);

      // Act
      const result = await apiService.sendChatMessage(userId, message);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('network_timeout');
      expect(result.error?.retryable).toBe(true);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const userId = '';
      const message = '';

      // Act
      const result = await apiService.sendChatMessage(userId, message);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('validation_error');
      expect(result.error?.message).toContain('User ID and message are required');
    });
  });

  describe('Service Health Monitoring', () => {
    it('should check health status of all integrated services', async () => {
      // Arrange
      mockFirestoreService.getUserById = jest.fn().mockResolvedValue(null);
      mockGoogleAIService.sendMessage = jest.fn().mockResolvedValue({
        content: 'Health check OK',
        role: 'assistant',
        timestamp: new Date()
      });

      // Act
      const healthStatus = await apiService.getHealthStatus();

      // Assert
      expect(healthStatus.success).toBe(true);
      expect(healthStatus.data).toHaveProperty('services');
      expect(healthStatus.data.services).toHaveProperty('firestore');
      expect(healthStatus.data.services).toHaveProperty('ai');
      expect(healthStatus.data.services).toHaveProperty('tts');
      expect(healthStatus.data.overall).toBe('healthy');
    });
  });
});
