/**
 * 日誌服務 - 整合到遠程日誌管理系統
 */

import { Alert } from 'react-native';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  service: string;
  metadata?: Record<string, any>;
}

interface LoggingConfig {
  enabled: boolean;
  remoteUrl: string;
  service: string;
  batchSize: number;
  flushInterval: number;
}

class LoggingService {
  private config: LoggingConfig = {
    enabled: true,
    // 條件式啟用遠程日誌：檢查環境變數或開發模式
    remoteUrl: this.getRemoteLogUrl(),
    service: 'localite-app',
    batchSize: 20,
    flushInterval: 10000
  };

  /**
   * 取得遠程日誌 URL（條件式啟用）
   */
  private getRemoteLogUrl(): string | undefined {
    // 如果明確禁用遠程日誌，返回 undefined
    if (process.env.EXPO_PUBLIC_DISABLE_REMOTE_LOGS === 'true') {
      return undefined;
    }
    
    // 開發環境才啟用遠程日誌
    if (__DEV__) {
      return 'http://172.20.10.3:5001/api/logs';
    }
    
    // 生產環境可以配置遠程日誌服務
    return process.env.EXPO_PUBLIC_REMOTE_LOG_URL;
  }

  private logBuffer: LogEntry[] = [];
  private flushTimer?: any;

  constructor(config?: Partial<LoggingConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    if (this.config.enabled) {
      this.startFlushTimer();
      
      // 延遲初始化日誌，避免阻塞啟動
      setTimeout(() => {
        this.info('LoggingService 已初始化', { 
          config: { ...this.config, remoteUrl: this.config.remoteUrl ? '[已配置]' : '[未配置]' },
          platform: 'react-native',
          timestamp: Date.now()
        });
        
        // 如果配置了遠程URL，測試連接（但不阻塞啟動）
        if (this.config.remoteUrl) {
          this.testConnection().catch(error => {
            // 靜默處理連接測試錯誤，不影響應用啟動
            console.log('日誌服務器連接測試失敗，將使用本地日誌模式');
          });
        }
      }, 1000); // 延遲1秒初始化
    }
  }

  /**
   * 記錄 debug 級別日誌
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  /**
   * 記錄 info 級別日誌
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  /**
   * 記錄 warn 級別日誌
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
    console.warn(`[${this.config.service}] ${message}`, metadata);
  }

  /**
   * 記錄 error 級別日誌
   */
  error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata);
    console.error(`[${this.config.service}] ${message}`, metadata);
  }

  /**
   * 記錄應用錯誤和崩潰
   */
  logError(error: Error, context?: string, metadata?: Record<string, any>): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      ...metadata
    };

    this.error('應用程式錯誤', errorInfo);
  }

  /**
   * 記錄用戶操作
   */
  logUserAction(action: string, screen: string, metadata?: Record<string, any>): void {
    this.info(`用戶操作: ${action}`, {
      screen,
      action,
      timestamp: Date.now(),
      ...metadata
    });
  }

  /**
   * 記錄認證相關事件
   */
  logAuthEvent(event: 'login' | 'register' | 'logout', result: 'success' | 'failed', metadata?: Record<string, any>): void {
    const level: LogLevel = result === 'failed' ? 'error' : 'info';
    this.log(level, `認證事件: ${event} - ${result}`, {
      event,
      result,
      timestamp: Date.now(),
      ...metadata
    });
  }

  /**
   * 記錄性能指標
   */
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    const level: LogLevel = duration > 3000 ? 'warn' : 'info';
    this.log(level, `性能監控: ${operation}`, {
      operation,
      duration,
      timestamp: Date.now(),
      ...metadata
    });
  }

  /**
   * 通用日誌方法
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const logEntry: LogEntry = {
      level,
      message,
      service: this.config.service,
      metadata: {
        timestamp: Date.now(),
        platform: 'react-native',
        ...metadata
      }
    };

    // 添加到緩衝區
    this.logBuffer.push(logEntry);

    // 立即發送高優先級日誌
    if (level === 'error') {
      this.flushLogs();
    } else if (this.logBuffer.length >= this.config.batchSize) {
      this.flushLogs();
    }
  }

  /**
   * 刷新日誌緩衝區
   */
  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await this.sendLogs(logsToSend);
    } catch (error) {
      // 如果發送失敗，將日誌重新加入緩衝區
      this.logBuffer.unshift(...logsToSend);
      console.warn('Failed to send logs to remote server:', error);
    }
  }

  /**
   * 發送日誌到遠程服務器
   */
  private async sendLogs(logs: LogEntry[]): Promise<void> {
    // 如果沒有配置遠程URL，跳過發送
    if (!this.config.remoteUrl) {
      return;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超時
      
      for (const log of logs) {
        try {
          const response = await fetch(this.config.remoteUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(log),
            signal: controller.signal,
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          // 如果是 abort 錯誤（超時），跳出循環
          if (error.name === 'AbortError') {
            throw new Error('Request timeout');
          }
          throw error;
        }
      }
      
      clearTimeout(timeoutId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send logs: ${errorMessage}`);
    }
  }

  /**
   * 啟動定時刷新
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.config.flushInterval);
  }

  /**
   * 停止服務
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushLogs(); // 最後一次刷新
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 測試網路連接
   */
  public async testConnection(): Promise<boolean> {
    // 如果沒有配置遠程URL，跳過連接測試
    if (!this.config.remoteUrl) {
      this.info('遠程日誌已禁用，跳過網路連接測試');
      return true;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超時
      
      const healthUrl = this.config.remoteUrl.replace('/api/logs', '/api/health');
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      this.info('網路連接測試成功', { healthCheck: result });
      return true;
    } catch (error) {
      let errorMessage: string;
      
      if (error.name === 'AbortError') {
        errorMessage = '連接超時';
      } else if (error instanceof TypeError && error.message.includes('Network request failed')) {
        errorMessage = '網路連接失敗，服務器可能未運行';
      } else {
        errorMessage = error instanceof Error ? error.message : String(error);
      }
      
      // 使用 console.log 而不是 this.error，避免循環記錄錯誤
      console.log(`[${this.config.service}] 日誌服務器連接測試: ${errorMessage}`);
      return false;
    }
  }
}

// 創建全域日誌實例
export const logger = new LoggingService();

// 全域錯誤處理
export const setupGlobalErrorHandler = () => {
  // React Native 全域錯誤處理
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    try {
      // 安全的錯誤記錄，避免循環錯誤
      console.error('[Global Error Handler]', error.message, { isFatal });
      
      // 只記錄關鍵錯誤到遠程服務，避免網路問題導致的循環錯誤
      if (isFatal || !error.message.includes('Network request')) {
        logger.logError(error, 'Global Error Handler', {
          isFatal,
          timestamp: Date.now(),
        });
      }
    } catch (loggingError) {
      // 日誌記錄失敗時，只使用控制台輸出
      console.error('[Global Error Handler] Logging failed:', loggingError);
    }

    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });

  // 正確的 Promise rejection 處理器
  const handleUnhandledRejection = (event: any) => {
    const reason = event.reason || event;
    
    // 特別處理 Firebase cancelled 錯誤，避免噪音
    if (reason?.code === 'cancelled' || reason?.message?.includes('cancelled')) {
      console.log('[Unhandled Rejection] Firebase operation cancelled:', reason?.message || 'Unknown');
      return;
    }
    
    // 避免網路錯誤的重複記錄
    if (reason?.message?.includes('Network request') || 
        reason?.message?.includes('timeout') ||
        reason?.message?.includes('172.20.10.3:5001')) {
      console.log('[Unhandled Rejection] Network error:', reason?.message || 'Unknown');
      return;
    }

    try {
      console.error('[Unhandled Promise Rejection]', reason?.message || 'Unknown', {
        stack: reason?.stack,
        code: reason?.code
      });
      
      // 記錄到遠程服務（安全處理）
      logger.error('Unhandled Promise Rejection', {
        reason: reason?.toString() || 'Unknown',
        stack: reason?.stack,
        code: reason?.code,
        type: 'unhandled_promise_rejection'
      });
    } catch (loggingError) {
      console.error('[Unhandled Rejection Handler] Logging failed:', loggingError);
    }
  };

  // 監聽 unhandled promise rejections
  if (typeof addEventListener !== 'undefined') {
    addEventListener('unhandledrejection', handleUnhandledRejection);
  } else if (typeof process !== 'undefined' && process.on) {
    process.on('unhandledRejection', handleUnhandledRejection);
  }
};

export default LoggingService;
