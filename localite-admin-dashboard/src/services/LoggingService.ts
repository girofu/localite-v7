/**
 * 管理員後台日誌服務
 * 負責將所有日誌統一發送到日誌管理系統
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

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

class AdminLoggingService {
  private config: LoggingConfig = {
    enabled: true,
    remoteUrl: 'http://localhost:5001/api/logs',
    service: 'admin-dashboard',
    batchSize: 10,
    flushInterval: 5000
  };

  private logBuffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config?: Partial<LoggingConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    if (this.config.enabled) {
      this.startFlushTimer();
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
   * 記錄應用錯誤
   */
  logError(error: Error, context?: string, metadata?: Record<string, any>): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      ...metadata
    };

    this.error('管理員後台錯誤', errorInfo);
  }

  /**
   * 記錄管理員操作
   */
  logAdminAction(action: string, adminId: string, metadata?: Record<string, any>): void {
    this.info(`管理員操作: ${action}`, {
      adminId,
      action,
      timestamp: Date.now(),
      ...metadata
    });
  }

  /**
   * 記錄認證相關事件
   */
  logAuthEvent(event: 'login' | 'logout', result: 'success' | 'failed', metadata?: Record<string, any>): void {
    const level: LogLevel = result === 'failed' ? 'error' : 'info';
    this.log(level, `管理員認證事件: ${event} - ${result}`, {
      event,
      result,
      timestamp: Date.now(),
      ...metadata
    });
  }

  /**
   * 記錄用戶管理操作
   */
  logUserManagement(action: string, targetUserId: string, adminId: string, metadata?: Record<string, any>): void {
    this.info(`用戶管理操作: ${action}`, {
      action,
      targetUserId,
      adminId,
      timestamp: Date.now(),
      ...metadata
    });
  }

  /**
   * 記錄商家管理操作
   */
  logMerchantManagement(action: string, merchantId: string, adminId: string, metadata?: Record<string, any>): void {
    this.info(`商家管理操作: ${action}`, {
      action,
      merchantId,
      adminId,
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
        platform: 'web',
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
    try {
      for (const log of logs) {
        await fetch(this.config.remoteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(log),
        });
      }
    } catch (error) {
      throw new Error(`Failed to send logs: ${error}`);
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
}

// 創建全域日誌實例
export const adminLogger = new AdminLoggingService();

export default AdminLoggingService;
