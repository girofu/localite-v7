/**
 * API Service Simple Tests
 * 
 * 簡化版的 API 服務測試，專注於核心功能
 */

import { APIService } from '../../src/services/APIService';
import { APIError } from '../../src/types/api.types';

describe('APIService Simple Tests', () => {
  let apiService: APIService;

  beforeEach(() => {
    // 建立 APIService 實例，使用預設的 mock 服務
    apiService = new APIService();
  });

  describe('Basic Functionality', () => {
    it('should be instantiated successfully', () => {
      expect(apiService).toBeDefined();
      expect(apiService).toBeInstanceOf(APIService);
    });

    it('should handle validation errors in sendChatMessage', async () => {
      // Arrange
      const userId = '';
      const message = '';

      // Act
      const result = await apiService.sendChatMessage(userId, message);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(APIError);
      expect(result.error?.code).toBe('validation_error');
      expect(result.error?.message).toContain('User ID and message are required');
    });

    it('should handle valid chat message request', async () => {
      // Arrange
      const userId = 'user-123';
      const message = 'Hello, tell me about Taipei 101';

      // Act
      const result = await apiService.sendChatMessage(userId, message);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('response');
      expect(result.data).toHaveProperty('conversationId');
      expect(result.data.response.content).toBeDefined();
      expect(result.data.response.role).toBe('assistant');
      expect(result.metadata).toHaveProperty('requestId');
      expect(result.metadata).toHaveProperty('timestamp');
      expect(result.metadata).toHaveProperty('processingTime');
    });

    it('should handle language options in chat message', async () => {
      // Arrange
      const userId = 'user-123';
      const message = 'Tell me about Taipei 101';
      const language = 'en-US';

      // Act
      const result = await apiService.sendChatMessage(userId, message, { language });

      // Assert
      expect(result.success).toBe(true);
      expect(result.metadata?.language).toBe(language);
      expect(result.data.response.content).toContain('Taiwan\'s most famous landmarks');
    });

    it('should handle user language update', async () => {
      // Arrange
      const userId = 'user-123';
      const newLanguage = 'en-US';

      // Act
      const result = await apiService.updateUserLanguage(userId, newLanguage);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('preferredLanguage');
      expect(result.data.preferredLanguage).toBe(newLanguage);
    });

    it('should provide health status', async () => {
      // Act
      const result = await apiService.getHealthStatus();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('overall');
      expect(result.data).toHaveProperty('services');
      expect(result.data.services).toHaveProperty('firestore');
      expect(result.data.services).toHaveProperty('ai');
      expect(result.data.services).toHaveProperty('tts');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.data.overall);
    });
  });

  describe('Error Handling', () => {
    it('should standardize error responses', async () => {
      // Arrange - 使用無效的用戶 ID 來觸發錯誤
      const userId = '';
      const message = 'test';

      // Act
      const result = await apiService.sendChatMessage(userId, message);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(APIError);
      expect(result.error?.code).toBe('validation_error');
      expect(result.metadata).toHaveProperty('requestId');
      expect(result.metadata).toHaveProperty('timestamp');
    });

    it('should generate unique request IDs', async () => {
      // Arrange
      const userId = 'user-123';
      const message = 'test message';

      // Act
      const result1 = await apiService.sendChatMessage(userId, message);
      const result2 = await apiService.sendChatMessage(userId, message);

      // Assert
      expect(result1.metadata?.requestId).toBeDefined();
      expect(result2.metadata?.requestId).toBeDefined();
      expect(result1.metadata?.requestId).not.toBe(result2.metadata?.requestId);
    });
  });

  describe('Configuration', () => {
    it('should use custom configuration', () => {
      // Arrange
      const customConfig = {
        timeout: 10000,
        defaultLanguage: 'en-US' as const,
        enableLogging: false
      };

      // Act
      const customApiService = new APIService(undefined, customConfig);

      // Assert
      expect(customApiService).toBeDefined();
      // 配置是私有的，我們只能通過行為來驗證
    });

    it('should handle custom dependencies', () => {
      // Arrange
      const mockFirestoreService = {
        createConversation: jest.fn(),
        addMessageToConversation: jest.fn(),
        updateUserPreferences: jest.fn(),
        getUserById: jest.fn()
      };

      const mockAIService = {
        sendMessage: jest.fn(),
        analyzeImage: jest.fn()
      };

      const mockTTSService = {};

      const dependencies = {
        firestoreService: mockFirestoreService,
        aiService: mockAIService,
        ttsService: mockTTSService
      };

      // Act
      const customApiService = new APIService(dependencies);

      // Assert
      expect(customApiService).toBeDefined();
    });
  });
});
