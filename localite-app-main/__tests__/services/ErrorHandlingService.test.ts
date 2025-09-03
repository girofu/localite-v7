/**
 * Error Handling Service Tests
 * 
 * 測試統一錯誤處理機制
 */

import { ErrorHandlingService } from '../../src/services/ErrorHandlingService';
import { APIError } from '../../src/types/api.types';

describe('ErrorHandlingService Tests', () => {
  let errorHandlingService: ErrorHandlingService;

  beforeEach(() => {
    errorHandlingService = new ErrorHandlingService();
  });

  describe('Error Classification', () => {
    it('should classify network errors', () => {
      // Arrange
      const networkError = new Error('Network request failed');
      networkError.name = 'NetworkError';

      // Act
      const apiError = errorHandlingService.handleError(networkError, 'test-operation');

      // Assert
      expect(apiError).toBeInstanceOf(APIError);
      expect(apiError.code).toBe('network_error');
      expect(apiError.retryable).toBe(true);
    });

    it('should classify authentication errors', () => {
      // Arrange
      const authError = new Error('Authentication failed');
      authError.name = 'AuthenticationError';

      // Act
      const apiError = errorHandlingService.handleError(authError, 'test-operation');

      // Assert
      expect(apiError.code).toBe('authentication_failed');
      expect(apiError.retryable).toBe(false);
    });

    it('should classify validation errors', () => {
      // Arrange
      const validationError = new Error('Invalid input data');

      // Act
      const apiError = errorHandlingService.handleError(validationError, 'test-operation', {
        isValidationError: true
      });

      // Assert
      expect(apiError.code).toBe('validation_error');
      expect(apiError.statusCode).toBe(400);
    });

    it('should classify timeout errors', () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      // Act
      const apiError = errorHandlingService.handleError(timeoutError, 'test-operation');

      // Assert
      expect(apiError.code).toBe('network_timeout');
      expect(apiError.retryable).toBe(true);
    });
  });

  describe('Error Logging', () => {
    it('should log errors with context', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      const context = { userId: 'user-123', operation: 'test' };

      // Act
      errorHandlingService.logError(error, context);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          message: 'Test error',
          context
        })
      );

      consoleSpy.mockRestore();
    });

    it('should track error statistics', () => {
      // Arrange
      const error1 = new Error('Network error');
      const error2 = new Error('Validation error');

      // Act
      errorHandlingService.handleError(error1, 'operation1');
      errorHandlingService.handleError(error2, 'operation2');
      const stats = errorHandlingService.getErrorStats();

      // Assert
      expect(stats.totalErrors).toBe(2);
      expect(stats.errorsByType).toHaveProperty('unknown_error');
    });
  });

  describe('Error Recovery', () => {
    it('should provide retry suggestions for retryable errors', () => {
      // Arrange
      const networkError = new Error('Connection failed');
      networkError.name = 'NetworkError';

      // Act
      const apiError = errorHandlingService.handleError(networkError, 'test-operation');
      const suggestion = errorHandlingService.getRecoverySuggestion(apiError);

      // Assert
      expect(suggestion).toContain('retry');
      expect(suggestion).toContain('network');
    });

    it('should provide user-friendly messages', () => {
      // Arrange
      const error = new APIError('Database connection failed', 'database_error');

      // Act
      const userMessage = errorHandlingService.getUserFriendlyMessage(error, 'zh-TW');

      // Assert
      expect(userMessage).toContain('資料庫');
      expect(userMessage).toContain('連線');
    });

    it('should provide English user messages', () => {
      // Arrange
      const error = new APIError('AI service unavailable', 'ai_service_error');

      // Act
      const userMessage = errorHandlingService.getUserFriendlyMessage(error, 'en-US');

      // Assert
      expect(userMessage).toContain('AI service');
      expect(userMessage).toContain('unavailable');
    });
  });

  describe('Error Reporting', () => {
    it('should format error reports', () => {
      // Arrange
      const error = new Error('Test error');
      const context = {
        userId: 'user-123',
        operation: 'sendMessage',
        timestamp: new Date(),
        userAgent: 'test-agent'
      };

      // Act
      const report = errorHandlingService.createErrorReport(error, context);

      // Assert
      expect(report).toHaveProperty('errorId');
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('error');
      expect(report).toHaveProperty('context');
      expect(report.error.message).toBe('Test error');
      expect(report.context.userId).toBe('user-123');
    });

    it('should sanitize sensitive data in reports', () => {
      // Arrange
      const error = new Error('Database error');
      const context = {
        password: 'secret123',
        apiKey: 'key-abc123',
        userId: 'user-123'
      };

      // Act
      const report = errorHandlingService.createErrorReport(error, context);

      // Assert
      expect(report.context).not.toHaveProperty('password');
      expect(report.context).not.toHaveProperty('apiKey');
      expect(report.context).toHaveProperty('userId');
    });
  });

  describe('Circuit Breaker', () => {
    it('should track consecutive failures', () => {
      // Arrange
      const service = 'ai-service';
      const error = new Error('Service unavailable');

      // Act
      for (let i = 0; i < 3; i++) {
        errorHandlingService.recordFailure(service, error);
      }
      const isCircuitOpen = errorHandlingService.isCircuitOpen(service);

      // Assert
      expect(isCircuitOpen).toBe(true);
    });

    it('should reset circuit after successful operation', () => {
      // Arrange
      const service = 'ai-service';
      const error = new Error('Service unavailable');

      // Act
      errorHandlingService.recordFailure(service, error);
      errorHandlingService.recordFailure(service, error);
      errorHandlingService.recordSuccess(service);
      const isCircuitOpen = errorHandlingService.isCircuitOpen(service);

      // Assert
      expect(isCircuitOpen).toBe(false);
    });
  });

  describe('Error Boundaries', () => {
    it('should handle React component errors', () => {
      // Arrange
      const componentError = new Error('Component render failed');
      const errorInfo = {
        componentStack: 'at Component (Component.tsx:10:5)'
      };

      // Act
      const handled = errorHandlingService.handleComponentError(componentError, errorInfo);

      // Assert
      expect(handled).toBe(true);
      expect(errorHandlingService.getErrorStats().totalErrors).toBe(1);
    });
  });
});
