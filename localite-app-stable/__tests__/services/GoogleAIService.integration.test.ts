/**
 * Google AI Studio Service Integration Tests
 * 
 * 測試 Google AI Studio API 整合功能
 * 包含文字對話、圖片分析、流式回應、對話歷史等核心功能
 * 基於最新的 @google/genai SDK
 */

import { GoogleAIService } from '../../src/services/GoogleAIService';
import { 
  ChatMessage,
  ChatResponse,
  ImageAnalysisRequest,
  ImageAnalysisResponse,
  ConversationHistory,
  StreamingChatOptions,
  AIServiceError
} from '../../src/types/ai.types';

describe('GoogleAIService Integration Tests', () => {
  let aiService: GoogleAIService;
  
  beforeEach(() => {
    aiService = new GoogleAIService();
  });

  afterEach(async () => {
    // 清理測試對話
    await aiService.cleanup();
  });

  describe('Text Chat Conversations', () => {
    it('should handle basic text conversation', async () => {
      // Arrange
      const message: ChatMessage = {
        content: '你好，我是一個遊客，想了解台北101。',
        role: 'user',
        timestamp: new Date(),
      };

      // Act
      const response = await aiService.sendMessage(message);

      // Assert
      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.role).toBe('assistant');
      expect(response.timestamp).toBeInstanceOf(Date);
      expect(response.metadata?.model).toBeDefined();
      expect(response.metadata?.tokensUsed).toBeGreaterThan(0);
      
      // 確保回應是關於台北101的旅遊資訊
      expect(response.content.toLowerCase()).toMatch(/台北|101|觀光|景點/);
    });

    it('should maintain conversation context', async () => {
      // Arrange
      const message1: ChatMessage = {
        content: '我在台北車站，推薦附近的美食。',
        role: 'user',
        timestamp: new Date(),
      };

      const message2: ChatMessage = {
        content: '剛才推薦的第一個餐廳怎麼走？',
        role: 'user', 
        timestamp: new Date(),
      };

      // Act
      const response1 = await aiService.sendMessage(message1);
      const response2 = await aiService.sendMessage(message2);

      // Assert
      expect(response1.content).toMatch(/美食|餐廳|小吃/);
      expect(response2.content).toMatch(/路線|方向|怎麼走|交通/);
      
      // 檢查對話歷史
      const history = await aiService.getConversationHistory();
      expect(history.messages).toHaveLength(4); // 2 user + 2 assistant
      expect(history.messages[0].role).toBe('user');
      expect(history.messages[1].role).toBe('assistant');
      expect(history.messages[2].role).toBe('user');
      expect(history.messages[3].role).toBe('assistant');
    });

    it('should handle streaming responses', async () => {
      // Arrange
      const message: ChatMessage = {
        content: '請詳細介紹西門町的歷史和特色，以及推薦的景點活動。',
        role: 'user',
        timestamp: new Date(),
      };

      const streamChunks: string[] = [];
      const options: StreamingChatOptions = {
        onChunk: (chunk: string) => {
          streamChunks.push(chunk);
        },
        onComplete: (finalResponse: ChatResponse) => {
          expect(finalResponse.content).toBeDefined();
        },
        onError: (error: Error) => {
          throw error;
        }
      };

      // Act
      const finalResponse = await aiService.sendMessageStream(message, options);

      // Assert
      expect(streamChunks.length).toBeGreaterThan(0);
      expect(streamChunks.join('')).toBe(finalResponse.content);
      expect(finalResponse.content).toMatch(/西門町|歷史|景點|活動/);
      expect(finalResponse.metadata?.isStreaming).toBe(true);
    });
  });

  describe('Image Analysis (Photo Upload)', () => {
    it('should analyze uploaded photo and provide location information', async () => {
      // Arrange
      const mockImageBuffer = Buffer.from('fake-image-data');
      const analysisRequest: ImageAnalysisRequest = {
        image: {
          buffer: mockImageBuffer,
          mimeType: 'image/jpeg',
          filename: 'tourist-photo.jpg'
        },
        query: '這是什麼地方？請介紹這個景點。',
        context: {
          location: {
            latitude: 25.0338,
            longitude: 121.5645
          },
          timestamp: new Date(),
          userLanguage: 'zh-TW'
        }
      };

      // Act
      const response = await aiService.analyzeImage(analysisRequest);

      // Assert
      expect(response.analysis).toBeDefined();
      expect(typeof response.analysis).toBe('string');
      expect(response.analysis.length).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
      expect(response.landmarks).toBeDefined();
      expect(response.recommendations).toBeDefined();
      expect(response.metadata?.model).toBeDefined();

      // 檢查是否包含景點相關資訊
      expect(response.analysis).toMatch(/景點|地點|建築|觀光/);
      
      if (response.landmarks && response.landmarks.length > 0) {
        expect(response.landmarks[0].name).toBeDefined();
        expect(response.landmarks[0].confidence).toBeGreaterThan(0);
      }
    });

    it('should handle multiple images in sequence', async () => {
      // Arrange
      const images = [
        {
          buffer: Buffer.from('image1-data'),
          mimeType: 'image/jpeg',
          filename: 'photo1.jpg'
        },
        {
          buffer: Buffer.from('image2-data'),
          mimeType: 'image/png', 
          filename: 'photo2.png'
        }
      ];

      const results: ImageAnalysisResponse[] = [];

      // Act
      for (const image of images) {
        const request: ImageAnalysisRequest = {
          image,
          query: '這張照片裡有什麼？',
          context: {
            timestamp: new Date(),
            userLanguage: 'zh-TW'
          }
        };
        
        const response = await aiService.analyzeImage(request);
        results.push(response);
      }

      // Assert
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.analysis).toBeDefined();
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.metadata?.processingTime).toBeGreaterThan(0);
      });
    });

    it('should handle image analysis with conversation context', async () => {
      // Arrange - 先建立對話上下文
      const textMessage: ChatMessage = {
        content: '我現在在信義區，想找好玩的地方。',
        role: 'user',
        timestamp: new Date(),
      };
      
      await aiService.sendMessage(textMessage);

      // 然後上傳圖片分析
      const imageRequest: ImageAnalysisRequest = {
        image: {
          buffer: Buffer.from('taipei101-photo'),
          mimeType: 'image/jpeg',
          filename: 'my-photo.jpg'
        },
        query: '我拍到這個地方，這裡有什麼好玩的嗎？',
        context: {
          useConversationHistory: true,
          timestamp: new Date(),
          userLanguage: 'zh-TW'
        }
      };

      // Act
      const response = await aiService.analyzeImage(imageRequest);

      // Assert
      expect(response.analysis).toBeDefined();
      expect(response.analysis).toMatch(/信義區|附近|推薦/);
      
      // 檢查對話歷史是否包含圖片分析
      const history = await aiService.getConversationHistory();
      expect(history.messages.length).toBeGreaterThanOrEqual(3); // 至少包含文字+圖片+回應
    });
  });

  describe('Conversation History Management', () => {
    it('should track and retrieve conversation history', async () => {
      // Arrange
      const messages = [
        { content: '台北有什麼必去景點？', role: 'user' as const },
        { content: '淡水老街怎麼去？', role: 'user' as const },
        { content: '推薦夜市美食', role: 'user' as const }
      ];

      // Act
      for (const msg of messages) {
        await aiService.sendMessage({
          ...msg,
          timestamp: new Date()
        });
      }

      const history = await aiService.getConversationHistory();

      // Assert
      expect(history.messages.length).toBe(6); // 3 user + 3 assistant
      expect(history.totalMessages).toBe(6);
      expect(history.conversationId).toBeDefined();
      expect(history.startTime).toBeInstanceOf(Date);
      expect(history.lastUpdated).toBeInstanceOf(Date);

      // 檢查訊息順序
      expect(history.messages[0].role).toBe('user');
      expect(history.messages[1].role).toBe('assistant');
      expect(history.messages[2].role).toBe('user');
      expect(history.messages[3].role).toBe('assistant');
    });

    it('should support conversation history pagination', async () => {
      // Arrange - 建立長對話
      for (let i = 1; i <= 10; i++) {
        await aiService.sendMessage({
          content: `測試訊息 ${i}`,
          role: 'user',
          timestamp: new Date()
        });
      }

      // Act
      const page1 = await aiService.getConversationHistory({ limit: 6 });
      const page2 = await aiService.getConversationHistory({ 
        limit: 6,
        offset: 6
      });

      // Assert
      expect(page1.messages).toHaveLength(6);
      expect(page1.hasMore).toBe(true);
      
      // page2 應該包含剩餘的消息（總共20個消息，前6個已取，剩14個，再取6個，還剩8個）
      expect(page2.messages).toHaveLength(6);
      expect(page2.hasMore).toBe(true); // 還有剩餘消息
      
      // 確保沒有重複
      const allMessageIds = [...page1.messages, ...page2.messages]
        .map(m => m.id)
        .filter((id, index, arr) => arr.indexOf(id) === index);
      expect(allMessageIds).toHaveLength(12);
    });

    it('should clear conversation history', async () => {
      // Arrange
      await aiService.sendMessage({
        content: '測試訊息',
        role: 'user',
        timestamp: new Date()
      });

      let history = await aiService.getConversationHistory();
      expect(history.messages.length).toBeGreaterThan(0);

      // Act
      await aiService.clearHistory();

      // Assert
      history = await aiService.getConversationHistory();
      expect(history.messages).toHaveLength(0);
      expect(history.totalMessages).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      const invalidService = new GoogleAIService({
        apiKey: 'invalid-key',
        timeout: 100 // 很短的超時時間
      });

      const message: ChatMessage = {
        content: '測試網路錯誤',
        role: 'user',
        timestamp: new Date()
      };

      // Act & Assert
      await expect(
        invalidService.sendMessage(message)
      ).rejects.toThrow(AIServiceError);

      try {
        await invalidService.sendMessage(message);
      } catch (error) {
        expect(error).toBeInstanceOf(AIServiceError);
        expect((error as AIServiceError).code).toMatch(/auth|network|timeout/i);
      }
    });

    it('should handle invalid image formats', async () => {
      // Arrange
      const invalidImageRequest: ImageAnalysisRequest = {
        image: {
          buffer: Buffer.from('not-an-image'),
          mimeType: 'text/plain',
          filename: 'invalid.txt'
        },
        query: '這是什麼？',
        context: {
          timestamp: new Date(),
          userLanguage: 'zh-TW'
        }
      };

      // Act & Assert
      await expect(
        aiService.analyzeImage(invalidImageRequest)
      ).rejects.toThrow(AIServiceError);
    });

    it('should handle very long messages', async () => {
      // Arrange
      const longMessage: ChatMessage = {
        content: 'A'.repeat(10000), // 10KB 的訊息
        role: 'user',
        timestamp: new Date()
      };

      // Act
      const response = await aiService.sendMessage(longMessage);

      // Assert
      expect(response.content).toBeDefined();
      expect(response.metadata?.warnings).toBeDefined();
      expect(response.metadata?.warnings).toContain('long_input');
    });

    it('should handle rate limiting', async () => {
      // Arrange
      const messages: ChatMessage[] = Array.from({ length: 5 }, (_, i) => ({
        content: `快速訊息 ${i + 1}`,
        role: 'user',
        timestamp: new Date()
      }));

      // Act - 快速連續發送
      const promises = messages.map(msg => aiService.sendMessage(msg));
      const results = await Promise.allSettled(promises);

      // Assert
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      expect(successful).toBeGreaterThan(0);
      
      if (failed > 0) {
        const rejectedReasons = results
          .filter(r => r.status === 'rejected')
          .map(r => (r as PromiseRejectedResult).reason);
        
        rejectedReasons.forEach(reason => {
          expect(reason).toBeInstanceOf(AIServiceError);
          expect(reason.code).toMatch(/rate.limit|too.many.requests/i);
        });
      }
    });
  });

  describe('Advanced Features', () => {
    it('should support custom system prompts for tourism context', async () => {
      // Arrange
      const customService = new GoogleAIService({
        systemPrompt: '你是一個專業的台灣旅遊嚮導，專門協助遊客規劃行程和介紹景點。請用友善、詳細且實用的方式回答問題。'
      });

      const message: ChatMessage = {
        content: '我想去九份',
        role: 'user',
        timestamp: new Date()
      };

      // Act
      const response = await customService.sendMessage(message);

      // Assert
      expect(response.content).toBeDefined();
      expect(response.content).toMatch(/九份|旅遊|景點|交通|美食/);
      expect(response.metadata?.systemPromptUsed).toBe(true);
    });

    it('should support different response languages', async () => {
      // Arrange
      const englishMessage: ChatMessage = {
        content: 'Tell me about Taipei 101',
        role: 'user',
        timestamp: new Date()
      };

      // Act
      const response = await aiService.sendMessage(englishMessage, {
        language: 'en-US',
        responseStyle: 'informative'
      });

      // Assert
      expect(response.content).toBeDefined();
      expect(response.content).toMatch(/Taipei 101|tower|building|Taiwan/i);
      expect(response.metadata?.language).toBe('en-US');
    });

    it('should track token usage and costs', async () => {
      // Arrange
      const message: ChatMessage = {
        content: '台灣有哪些世界遺產？',
        role: 'user',
        timestamp: new Date()
      };

      // Act
      const response = await aiService.sendMessage(message);
      const stats = await aiService.getUsageStats();

      // Assert
      expect(response.metadata?.tokensUsed).toBeGreaterThan(0);
      expect(response.metadata?.estimatedCost).toBeGreaterThan(0);
      expect(stats.totalTokens).toBeGreaterThan(0);
      expect(stats.totalCost).toBeGreaterThan(0);
      expect(stats.requestCount).toBeGreaterThan(0);
    });
  });
});
