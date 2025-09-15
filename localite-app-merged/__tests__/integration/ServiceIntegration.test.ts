/**
 * Service Integration Tests
 * 
 * 測試所有服務的整合功能
 * 包含 API 服務、多語言支援、錯誤處理等
 */

import { ServiceManager } from '../../src/services/ServiceManager';
import { APIService } from '../../src/services/APIService';
import { MultiLanguageService } from '../../src/services/MultiLanguageService';
import { ErrorHandlingService } from '../../src/services/ErrorHandlingService';

describe('Service Integration Tests', () => {
  let serviceManager: ServiceManager;

  beforeEach(() => {
    serviceManager = ServiceManager.getInstance();
  });

  afterEach(() => {
    ServiceManager.resetInstance();
  });

  describe('Service Manager', () => {
    it('should provide singleton instance', () => {
      // Act
      const instance1 = ServiceManager.getInstance();
      const instance2 = ServiceManager.getInstance();

      // Assert
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(ServiceManager);
    });

    it('should initialize all services', () => {
      // Assert
      expect(serviceManager.apiService).toBeInstanceOf(APIService);
      expect(serviceManager.multiLanguageService).toBeInstanceOf(MultiLanguageService);
      expect(serviceManager.errorHandlingService).toBeInstanceOf(ErrorHandlingService);
    });
  });

  describe('Multi-Language Chat Integration', () => {
    it('should handle chat message with language detection and translation', async () => {
      // Arrange
      const userId = 'test-user-123';
      const chineseMessage = '你好，請告訴我台北101的資訊';

      // Act
      const detectedLanguage = serviceManager.multiLanguageService.detectLanguage(chineseMessage);
      const response = await serviceManager.apiService.sendChatMessage(userId, chineseMessage, {
        language: detectedLanguage
      });

      // Assert
      expect(detectedLanguage).toBe('zh-TW');
      expect(response.success).toBe(true);
      expect(response.data?.response).toBeDefined();
    });

    it('should switch language and provide localized responses', async () => {
      // Arrange
      const userId = 'test-user-123';
      
      // Act
      await serviceManager.apiService.updateUserLanguage(userId, 'en-US');
      const localizedWelcome = serviceManager.multiLanguageService.getText('welcome', 'en-US');
      
      // Assert
      expect(localizedWelcome).toBe('Welcome');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle and classify errors consistently across services', async () => {
      // Arrange
      const userId = '';
      const message = '';

      // Act
      const response = await serviceManager.apiService.sendChatMessage(userId, message);

      // Assert
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('validation_error');
      expect(response.error?.retryable).toBe(false);
    });

    it('should provide recovery suggestions for errors', async () => {
      // Arrange
      const userId = '';
      const message = '';

      // Act
      const response = await serviceManager.apiService.sendChatMessage(userId, message);
      const suggestion = serviceManager.errorHandlingService.getRecoverySuggestion(response.error!);

      // Assert
      expect(suggestion).toContain('check your input');
    });
  });

  describe('Cross-Service Communication', () => {
    it('should maintain consistent language settings across services', async () => {
      // Arrange
      const userId = 'test-user-123';
      const newLanguage = 'en-US';

      // Act
      await serviceManager.apiService.updateUserLanguage(userId, newLanguage);
      serviceManager.multiLanguageService.setCurrentLanguage(newLanguage);
      const localizedText = serviceManager.multiLanguageService.getText('search', newLanguage);

      // Assert
      expect(localizedText).toBe('Search');
    });
  });

  describe('Performance and Health', () => {
    it('should check service health', async () => {
      // Act
      const health = await serviceManager.checkHealth();

      // Assert
      expect(health.overall).toBe('healthy');
      expect(health.services).toHaveProperty('apiService');
      expect(health.services).toHaveProperty('multiLanguageService');
      expect(health.services).toHaveProperty('errorHandlingService');
    });

    it('should handle service cleanup', async () => {
      // Act & Assert
      await expect(serviceManager.cleanup()).resolves.not.toThrow();
    });
  });
});
