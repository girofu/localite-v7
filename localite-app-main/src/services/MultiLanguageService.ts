/**
 * Multi-Language Service
 * 
 * 提供多語言支援功能
 * 包含語言檢測、切換、翻譯、AI 提示格式化等
 */

import { SupportedLanguage, LanguageConfig, LocalizedStrings } from '../types/api.types';

export class MultiLanguageService {
  private currentLanguage: SupportedLanguage = 'zh-TW';
  
  // 支援的語言配置
  private readonly supportedLanguages: LanguageConfig[] = [
    {
      code: 'zh-TW',
      name: 'Traditional Chinese',
      nativeName: '繁體中文',
      flag: '🇹🇼',
      rtl: false
    },
    {
      code: 'en-US',
      name: 'English (US)',
      nativeName: 'English',
      flag: '🇺🇸',
      rtl: false
    }
  ];

  // 本地化文字資源
  private readonly localizedStrings: LocalizedStrings = {
    welcome: {
      'zh-TW': '歡迎',
      'en-US': 'Welcome'
    },
    search: {
      'zh-TW': '搜尋',
      'en-US': 'Search'
    },
    loading: {
      'zh-TW': '載入中',
      'en-US': 'Loading'
    },
    error: {
      'zh-TW': '錯誤',
      'en-US': 'Error'
    },
    retry: {
      'zh-TW': '重試',
      'en-US': 'Retry'
    },
    cancel: {
      'zh-TW': '取消',
      'en-US': 'Cancel'
    },
    confirm: {
      'zh-TW': '確認',
      'en-US': 'Confirm'
    },
    save: {
      'zh-TW': '儲存',
      'en-US': 'Save'
    }
  };

  // 系統提示詞模板
  private readonly systemPrompts = {
    'zh-TW': '你是一個專業的台灣旅遊助手，專門協助遊客探索台灣的景點、美食和文化。請提供準確、實用且友善的旅遊建議，並用繁體中文回答。',
    'en-US': 'You are a professional Taiwan travel assistant, specializing in helping tourists explore Taiwan\'s attractions, cuisine, and culture. Please provide accurate, practical, and friendly travel advice in English.'
  };

  // ====================
  // 語言檢測
  // ====================

  detectLanguage(text: string): SupportedLanguage {
    // 簡單的語言檢測邏輯
    const chineseRegex = /[\u4e00-\u9fff]/g;
    const englishRegex = /[a-zA-Z]/g;

    const chineseMatches = text.match(chineseRegex);
    const englishMatches = text.match(englishRegex);
    
    const chineseCount = chineseMatches ? chineseMatches.length : 0;
    const englishCount = englishMatches ? englishMatches.length : 0;

    // 如果有中文字符，判定為中文
    if (chineseCount > 0) {
      return 'zh-TW';
    }
    
    // 如果有英文字符且沒有中文字符，判定為英文
    if (englishCount > 0) {
      return 'en-US';
    }

    // 預設返回繁體中文
    return 'zh-TW';
  }

  // ====================
  // 語言切換
  // ====================

  setCurrentLanguage(language: SupportedLanguage): void {
    if (this.isValidLanguage(language)) {
      this.currentLanguage = language;
    }
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  isValidLanguage(language: SupportedLanguage): boolean {
    return this.supportedLanguages.some(lang => lang.code === language);
  }

  getSupportedLanguages(): LanguageConfig[] {
    return [...this.supportedLanguages];
  }

  // ====================
  // 系統提示詞
  // ====================

  getSystemPrompt(language: SupportedLanguage): string {
    return this.systemPrompts[language] || this.systemPrompts['zh-TW'];
  }

  // ====================
  // 文字翻譯
  // ====================

  getText(key: string, language: SupportedLanguage): string {
    const translations = this.localizedStrings[key];
    if (translations && translations[language]) {
      return translations[language];
    }
    
    // 如果找不到翻譯，返回 key 本身
    return key;
  }

  // 批次獲取多個文字
  getTexts(keys: string[], language: SupportedLanguage): Record<string, string> {
    const result: Record<string, string> = {};
    keys.forEach(key => {
      result[key] = this.getText(key, language);
    });
    return result;
  }

  // ====================
  // AI 整合
  // ====================

  formatAIPrompt(userMessage: string, language: SupportedLanguage): string {
    const systemPrompt = this.getSystemPrompt(language);
    
    // 根據語言添加特定的回應指示
    const languageInstruction = language === 'zh-TW' 
      ? '請用繁體中文回答。' 
      : 'Please respond in English.';

    return `${systemPrompt}\n\n${languageInstruction}\n\n用戶問題：${userMessage}`;
  }

  // 格式化錯誤訊息
  formatErrorMessage(error: string, language: SupportedLanguage): string {
    const errorLabel = this.getText('error', language);
    return `${errorLabel}: ${error}`;
  }

  // ====================
  // 語言偏好持久化
  // ====================

  saveLanguagePreference(language: SupportedLanguage): void {
    try {
      // 在實際應用中，這裡會保存到 AsyncStorage 或其他持久化存儲
      // 目前只更新內存中的設定
      this.setCurrentLanguage(language);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  }

  loadLanguagePreference(): SupportedLanguage {
    try {
      // 在實際應用中，這裡會從 AsyncStorage 或其他存儲讀取
      // 目前返回預設語言
      return this.currentLanguage;
    } catch (error) {
      console.warn('Failed to load language preference:', error);
      return 'zh-TW';
    }
  }

  // ====================
  // 工具方法
  // ====================

  // 獲取語言的顯示名稱
  getLanguageDisplayName(language: SupportedLanguage, displayLanguage?: SupportedLanguage): string {
    const targetLanguage = displayLanguage || this.currentLanguage;
    const languageConfig = this.supportedLanguages.find(lang => lang.code === language);
    
    if (!languageConfig) {
      return language;
    }

    // 如果顯示語言與目標語言相同，使用原生名稱
    if (targetLanguage === language) {
      return languageConfig.nativeName;
    }

    // 否則使用英文名稱（可以擴展為更多語言的翻譯）
    return languageConfig.name;
  }

  // 檢查是否為 RTL 語言
  isRTL(language?: SupportedLanguage): boolean {
    const lang = language || this.currentLanguage;
    const languageConfig = this.supportedLanguages.find(l => l.code === lang);
    return languageConfig?.rtl || false;
  }

  // 獲取語言的旗幟表情符號
  getLanguageFlag(language: SupportedLanguage): string {
    const languageConfig = this.supportedLanguages.find(lang => lang.code === language);
    return languageConfig?.flag || '🌐';
  }

  // === 測試兼容性別名方法 ===

  /**
   * setLanguage 別名方法 (測試中使用)
   */
  async setLanguage(language: SupportedLanguage): Promise<any> {
    try {
      this.setCurrentLanguage(language);
      await this.saveLanguagePreference(language);
      return {
        success: true,
        data: { language }
      };
    } catch (error) {
      return {
        success: false,
        error
      };
    }
  }
}
