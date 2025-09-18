/**
 * 🔥 深度連結處理器
 * 處理應用的深度連結，特別是郵件驗證連結
 */

import * as Linking from 'expo-linking';
import { logger } from './LoggingService';

export interface DeepLinkHandlerOptions {
  onEmailVerificationLink?: (url: string) => Promise<void>;
  onOtherLink?: (url: string) => Promise<void>;
}

export class DeepLinkHandler {
  private options: DeepLinkHandlerOptions;
  private linkingSubscription: any = null;

  constructor(options: DeepLinkHandlerOptions) {
    this.options = options;
  }

  /**
   * 初始化深度連結監聽器
   */
  initialize(): void {
    // 處理應用啟動時的深度連結
    this.handleInitialURL();
    
    // 監聽應用運行時的深度連結
    this.linkingSubscription = Linking.addEventListener('url', this.handleURL);
  }

  /**
   * 清理監聽器
   */
  cleanup(): void {
    if (this.linkingSubscription) {
      this.linkingSubscription.remove();
      this.linkingSubscription = null;
    }
  }

  /**
   * 處理應用啟動時的初始 URL
   */
  private async handleInitialURL(): Promise<void> {
    try {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        logger.info('處理初始深度連結', { url: initialURL });
        await this.processURL(initialURL);
      }
    } catch (error) {
      logger.logError(error as Error, 'DeepLinkHandler.handleInitialURL');
    }
  }

  /**
   * 處理深度連結 URL 事件
   */
  private handleURL = async (event: { url: string }): Promise<void> => {
    try {
      logger.info('收到深度連結', { url: event.url });
      await this.processURL(event.url);
    } catch (error) {
      logger.logError(error as Error, 'DeepLinkHandler.handleURL');
    }
  };

  /**
   * 處理和路由 URL
   */
  private async processURL(url: string): Promise<void> {
    try {
      // 檢查是否為 Firebase 驗證連結
      if (this.isFirebaseVerificationLink(url)) {
        logger.info('檢測到 Firebase 驗證連結', { url });
        
        if (this.options.onEmailVerificationLink) {
          await this.options.onEmailVerificationLink(url);
        } else {
          logger.warn('未設置郵件驗證連結處理器');
        }
        return;
      }

      // 處理其他深度連結
      if (this.options.onOtherLink) {
        await this.options.onOtherLink(url);
      } else {
        logger.info('收到未處理的深度連結', { url });
      }

    } catch (error) {
      logger.logError(error as Error, 'DeepLinkHandler.processURL');
    }
  }

  /**
   * 檢查是否為 Firebase 驗證連結
   */
  private isFirebaseVerificationLink(url: string): boolean {
    // Firebase 驗證連結通常包含 __/auth/action 路徑和 mode=verifyEmail 參數
    return url.includes('__/auth/action') && 
           (url.includes('mode=verifyEmail') || url.includes('mode%3DverifyEmail'));
  }

  /**
   * 靜態方法：直接處理 URL
   */
  static async handleVerificationLink(url: string, handler: (url: string) => Promise<void>): Promise<void> {
    try {
      logger.info('直接處理驗證連結', { url });
      await handler(url);
    } catch (error) {
      logger.logError(error as Error, 'DeepLinkHandler.handleVerificationLink');
    }
  }
}

