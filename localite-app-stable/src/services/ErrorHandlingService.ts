/**
 * Error Handling Service
 * 
 * 統一的錯誤處理機制
 * 包含錯誤分類、日誌記錄、用戶友好訊息、錯誤恢復建議等
 */

import { APIError, APIErrorCode, SupportedLanguage } from '../types/api.types';

// 錯誤統計介面
interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByOperation: Record<string, number>;
  lastError?: {
    timestamp: Date;
    error: string;
    operation: string;
  };
}

// 錯誤報告介面
interface ErrorReport {
  errorId: string;
  timestamp: Date;
  error: {
    message: string;
    name: string;
    stack?: string;
    code?: string;
  };
  context: Record<string, any>;
  userAgent?: string;
  url?: string;
}

// 斷路器狀態
interface CircuitBreakerState {
  failures: number;
  lastFailure?: Date;
  isOpen: boolean;
}

export class ErrorHandlingService {
  private errorStats: ErrorStats = {
    totalErrors: 0,
    errorsByType: {},
    errorsByOperation: {}
  };

  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private readonly maxFailures = 3;
  private readonly resetTimeout = 60000; // 1 分鐘

  // 敏感資料欄位（需要從錯誤報告中移除）
  private readonly sensitiveFields = [
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
    'cookie',
    'session'
  ];

  // 用戶友好的錯誤訊息
  private readonly userFriendlyMessages = {
    'zh-TW': {
      network_error: '網路連線發生問題，請檢查您的網路設定',
      network_timeout: '請求逾時，請稍後再試',
      authentication_failed: '身份驗證失敗，請重新登入',
      authorization_failed: '您沒有權限執行此操作',
      validation_error: '輸入的資料格式不正確',
      database_error: '資料庫連線發生問題，請稍後再試',
      ai_service_error: 'AI 服務暫時無法使用，請稍後再試',
      tts_service_error: '語音服務暫時無法使用',
      service_unavailable: '服務暫時無法使用，請稍後再試',
      rate_limit_exceeded: '請求過於頻繁，請稍後再試',
      not_found: '找不到請求的資源',
      unknown_error: '發生未知錯誤，請稍後再試'
    },
    'en-US': {
      network_error: 'Network connection problem, please check your network settings',
      network_timeout: 'Request timeout, please try again later',
      authentication_failed: 'Authentication failed, please log in again',
      authorization_failed: 'You do not have permission to perform this operation',
      validation_error: 'The input data format is incorrect',
      database_error: 'Database connection problem, please try again later',
      ai_service_error: 'AI service is temporarily unavailable, please try again later',
      tts_service_error: 'Voice service is temporarily unavailable',
      service_unavailable: 'Service is temporarily unavailable, please try again later',
      rate_limit_exceeded: 'Too many requests, please try again later',
      not_found: 'The requested resource was not found',
      unknown_error: 'An unknown error occurred, please try again later'
    }
  };

  // ====================
  // 錯誤處理
  // ====================

  handleError(error: any, operation: string, context?: any): APIError {
    // 如果已經是 APIError，直接返回
    if (error instanceof APIError) {
      this.updateErrorStats(error.code, operation);
      this.logError(error, { operation, ...context });
      return error;
    }

    // 分類錯誤
    const { code, statusCode, retryable } = this.classifyError(error, context);
    
    // 創建 APIError
    const apiError = new APIError(
      error.message || 'Unknown error occurred',
      code,
      statusCode,
      { originalError: error, operation, ...context },
      retryable
    );

    // 更新統計和日誌
    this.updateErrorStats(code, operation);
    this.logError(apiError, { operation, ...context });

    return apiError;
  }

  private classifyError(error: any, context?: any): {
    code: APIErrorCode;
    statusCode: number;
    retryable: boolean;
  } {
    // 根據錯誤名稱分類
    if (error.name === 'NetworkError' || error.message?.includes('network')) {
      return { code: 'network_error', statusCode: 503, retryable: true };
    }

    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return { code: 'network_timeout', statusCode: 408, retryable: true };
    }

    if (error.name === 'AuthenticationError' || error.message?.includes('auth')) {
      return { code: 'authentication_failed', statusCode: 401, retryable: false };
    }

    if (error.name === 'AuthorizationError' || error.message?.includes('permission')) {
      return { code: 'authorization_failed', statusCode: 403, retryable: false };
    }

    if (error.name === 'ValidationError' || context?.isValidationError) {
      return { code: 'validation_error', statusCode: 400, retryable: false };
    }

    if (error.name === 'FirestoreError' || error.message?.includes('database')) {
      return { code: 'database_error', statusCode: 503, retryable: true };
    }

    if (error.name === 'AIServiceError' || error.message?.includes('AI')) {
      return { code: 'ai_service_error', statusCode: 503, retryable: true };
    }

    if (error.name === 'TTSServiceError' || error.message?.includes('TTS')) {
      return { code: 'tts_service_error', statusCode: 503, retryable: true };
    }

    if (error.message?.includes('rate limit')) {
      return { code: 'rate_limit_exceeded', statusCode: 429, retryable: true };
    }

    if (error.message?.includes('not found')) {
      return { code: 'not_found', statusCode: 404, retryable: false };
    }

    // 預設為未知錯誤
    return { code: 'unknown_error', statusCode: 500, retryable: false };
  }

  // ====================
  // 錯誤日誌
  // ====================

  logError(error: Error, context?: any): void {
    const logData = {
      timestamp: new Date().toISOString(),
      message: error.message,
      name: error.name,
      stack: error.stack,
      context: this.sanitizeContext(context)
    };

    console.error('Error occurred:', logData);

    // 在實際應用中，這裡可以發送到錯誤追蹤服務
    // 例如 Sentry、Bugsnag 等
  }

  private sanitizeContext(context: any): any {
    if (!context || typeof context !== 'object') {
      return context;
    }

    const sanitized = { ...context };
    
    // 完全移除敏感資料欄位
    this.sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }

  // ====================
  // 錯誤統計
  // ====================

  private updateErrorStats(errorCode: string, operation: string): void {
    this.errorStats.totalErrors++;
    this.errorStats.errorsByType[errorCode] = (this.errorStats.errorsByType[errorCode] || 0) + 1;
    this.errorStats.errorsByOperation[operation] = (this.errorStats.errorsByOperation[operation] || 0) + 1;
    
    this.errorStats.lastError = {
      timestamp: new Date(),
      error: errorCode,
      operation
    };
  }

  getErrorStats(): ErrorStats {
    return { ...this.errorStats };
  }

  // ====================
  // 用戶友好訊息
  // ====================

  getUserFriendlyMessage(error: APIError, language: SupportedLanguage = 'zh-TW'): string {
    const messages = this.userFriendlyMessages[language];
    return messages[error.code] || messages.unknown_error;
  }

  getRecoverySuggestion(error: APIError): string {
    if (error.retryable) {
      if (error.code === 'network_error' || error.code === 'network_timeout') {
        return 'Please check your network connection and retry the operation.';
      }
      if (error.code === 'rate_limit_exceeded') {
        return 'Please wait a moment before trying to retry.';
      }
      return 'This error is temporary. Please retry the operation.';
    }

    if (error.code === 'authentication_failed') {
      return 'Please log in again to continue.';
    }

    if (error.code === 'validation_error') {
      return 'Please check your input and try again.';
    }

    return 'Please contact support if this problem persists.';
  }

  // ====================
  // 錯誤報告
  // ====================

  createErrorReport(error: Error, context?: any): ErrorReport {
    return {
      errorId: this.generateErrorId(),
      timestamp: new Date(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: (error as any).code
      },
      context: this.sanitizeContext(context),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  // ====================
  // 斷路器模式
  // ====================

  recordFailure(service: string, error: Error): void {
    const state = this.circuitBreakers.get(service) || {
      failures: 0,
      isOpen: false
    };

    state.failures++;
    state.lastFailure = new Date();

    if (state.failures >= this.maxFailures) {
      state.isOpen = true;
    }

    this.circuitBreakers.set(service, state);
  }

  recordSuccess(service: string): void {
    const state = this.circuitBreakers.get(service);
    if (state) {
      state.failures = 0;
      state.isOpen = false;
      state.lastFailure = undefined;
      this.circuitBreakers.set(service, state);
    }
  }

  isCircuitOpen(service: string): boolean {
    const state = this.circuitBreakers.get(service);
    if (!state || !state.isOpen) {
      return false;
    }

    // 檢查是否應該重置斷路器
    if (state.lastFailure && 
        Date.now() - state.lastFailure.getTime() > this.resetTimeout) {
      state.isOpen = false;
      state.failures = 0;
      this.circuitBreakers.set(service, state);
      return false;
    }

    return true;
  }

  // ====================
  // React 錯誤邊界支援
  // ====================

  handleComponentError(error: Error, errorInfo: any): boolean {
    try {
      const context = {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      };

      this.logError(error, context);
      this.updateErrorStats('component_error', 'render');

      return true;
    } catch (handlingError) {
      console.error('Failed to handle component error:', handlingError);
      return false;
    }
  }

  // ====================
  // 清理和重置
  // ====================

  clearStats(): void {
    this.errorStats = {
      totalErrors: 0,
      errorsByType: {},
      errorsByOperation: {}
    };
  }

  resetCircuitBreakers(): void {
    this.circuitBreakers.clear();
  }
}
