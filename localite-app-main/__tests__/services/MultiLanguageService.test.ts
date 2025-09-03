/**
 * Multi-Language Service Tests
 * 
 * 測試多語言切換功能
 */

import { MultiLanguageService } from '../../src/services/MultiLanguageService';
import { SupportedLanguage } from '../../src/types/api.types';

describe('MultiLanguageService Tests', () => {
  let multiLanguageService: MultiLanguageService;

  beforeEach(() => {
    multiLanguageService = new MultiLanguageService();
  });

  describe('Language Detection', () => {
    it('should detect language from user input', () => {
      // Arrange
      const chineseText = '你好，請告訴我台北101的資訊';
      const englishText = 'Hello, tell me about Taipei 101';

      // Act
      const chineseDetected = multiLanguageService.detectLanguage(chineseText);
      const englishDetected = multiLanguageService.detectLanguage(englishText);

      // Assert
      expect(chineseDetected).toBe('zh-TW');
      expect(englishDetected).toBe('en-US');
    });

    it('should fallback to default language for ambiguous text', () => {
      // Arrange
      const ambiguousText = '123 456';

      // Act
      const detected = multiLanguageService.detectLanguage(ambiguousText);

      // Assert
      expect(detected).toBe('zh-TW'); // 預設語言
    });
  });

  describe('Language Switching', () => {
    it('should switch language context', () => {
      // Arrange
      const newLanguage: SupportedLanguage = 'en-US';

      // Act
      multiLanguageService.setCurrentLanguage(newLanguage);
      const currentLanguage = multiLanguageService.getCurrentLanguage();

      // Assert
      expect(currentLanguage).toBe(newLanguage);
    });

    it('should provide language-specific system prompts', () => {
      // Arrange & Act
      const chinesePrompt = multiLanguageService.getSystemPrompt('zh-TW');
      const englishPrompt = multiLanguageService.getSystemPrompt('en-US');

      // Assert
      expect(chinesePrompt).toContain('台灣旅遊助手');
      expect(englishPrompt).toContain('Taiwan travel assistant');
    });
  });

  describe('Text Translation', () => {
    it('should translate common UI text', () => {
      // Arrange
      const keys = ['welcome', 'search', 'loading'];

      // Act
      const chineseTexts = keys.map(key => 
        multiLanguageService.getText(key, 'zh-TW')
      );
      const englishTexts = keys.map(key => 
        multiLanguageService.getText(key, 'en-US')
      );

      // Assert
      expect(chineseTexts).toEqual(['歡迎', '搜尋', '載入中']);
      expect(englishTexts).toEqual(['Welcome', 'Search', 'Loading']);
    });

    it('should fallback to key when translation not found', () => {
      // Arrange
      const unknownKey = 'unknown_key';

      // Act
      const result = multiLanguageService.getText(unknownKey, 'zh-TW');

      // Assert
      expect(result).toBe(unknownKey);
    });
  });

  describe('Language Configuration', () => {
    it('should provide supported languages list', () => {
      // Act
      const supportedLanguages = multiLanguageService.getSupportedLanguages();

      // Assert
      expect(supportedLanguages).toHaveLength(2);
      expect(supportedLanguages).toContainEqual({
        code: 'zh-TW',
        name: 'Traditional Chinese',
        nativeName: '繁體中文',
        flag: '🇹🇼',
        rtl: false
      });
      expect(supportedLanguages).toContainEqual({
        code: 'en-US',
        name: 'English (US)',
        nativeName: 'English',
        flag: '🇺🇸',
        rtl: false
      });
    });

    it('should validate language codes', () => {
      // Act
      const validLanguage = multiLanguageService.isValidLanguage('zh-TW');
      const invalidLanguage = multiLanguageService.isValidLanguage('invalid-lang' as SupportedLanguage);

      // Assert
      expect(validLanguage).toBe(true);
      expect(invalidLanguage).toBe(false);
    });
  });

  describe('Integration with AI Service', () => {
    it('should format AI prompts with language context', () => {
      // Arrange
      const userMessage = 'Tell me about Taipei 101';
      const language: SupportedLanguage = 'en-US';

      // Act
      const formattedPrompt = multiLanguageService.formatAIPrompt(userMessage, language);

      // Assert
      expect(formattedPrompt).toContain('Please respond in English');
      expect(formattedPrompt).toContain(userMessage);
    });

    it('should handle Chinese language prompts', () => {
      // Arrange
      const userMessage = '告訴我關於台北101的資訊';
      const language: SupportedLanguage = 'zh-TW';

      // Act
      const formattedPrompt = multiLanguageService.formatAIPrompt(userMessage, language);

      // Assert
      expect(formattedPrompt).toContain('請用繁體中文回答');
      expect(formattedPrompt).toContain(userMessage);
    });
  });
});
