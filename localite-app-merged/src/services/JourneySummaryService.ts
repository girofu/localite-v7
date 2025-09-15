import { GoogleAIService } from './GoogleAIService';
import { FirestoreService } from './FirestoreService';
import { 
  JourneyRecord, 
  ConversationMessage, 
  JourneySummaryResult,
  JourneySummaryOptions,
  SavedJourneyRecord 
} from '../types/journey.types';
import { ChatMessage } from '../types/ai.types';
import { doc, addDoc, collection, Timestamp } from 'firebase/firestore';

/**
 * 旅程總結服務
 * 負責將對話記錄轉換為旅程總結，並儲存到 Firestore
 */
export class JourneySummaryService {
  constructor(
    private googleAI: GoogleAIService,
    private firestore: FirestoreService
  ) {}

  /**
   * 生成旅程總結
   */
  async generateJourneySummary(
    messages: ConversationMessage[],
    placeName: string,
    guideName: string,
    userId: string,
    options: JourneySummaryOptions = {}
  ): Promise<JourneyRecord> {
    // 驗證輸入
    if (!messages || messages.length === 0) {
      throw new Error('對話記錄不能為空');
    }

    try {
      // 構建AI總結請求
      const conversationText = this.buildConversationText(messages);
      const summaryPrompt = this.buildSummaryPrompt(conversationText, placeName, guideName, options);

      const aiMessage: ChatMessage = {
        content: summaryPrompt,
        role: 'user',
        timestamp: new Date()
      };

      // 調用Google AI服務生成總結
      const response = await this.googleAI.sendMessage(aiMessage, {
        language: (options.language as 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP') || 'zh-TW',
        responseStyle: 'informative'
      });

      // 解析AI回應
      const summaryData = this.parseAISummaryResponse(response.content);

      // 構建旅程記錄
      const journeyRecord: JourneyRecord = {
        title: summaryData.title || `${placeName}導覽之旅`,
        summary: summaryData.summary || '今天的導覽非常精彩！',
        highlights: summaryData.highlights || [],
        placeName,
        guideName,
        conversationCount: messages.length,
        generatedAt: new Date()
      };

      return journeyRecord;
    } catch (error: any) {
      throw new Error(`生成旅程總結失敗: ${error.message}`);
    }
  }

  /**
   * 儲存旅程記錄到 Firestore
   */
  async saveJourneyRecord(journeyRecord: JourneyRecord, userId: string): Promise<string> {
    try {
      // 準備儲存的資料
      const savedRecord: Omit<SavedJourneyRecord, 'id'> = {
        ...journeyRecord,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 調用擴展的 FirestoreService 方法
      return await this.firestore.saveJourneyRecord(savedRecord);
    } catch (error: any) {
      throw new Error(`儲存旅程記錄失敗: ${error.message}`);
    }
  }

  /**
   * 生成並儲存旅程記錄（一站式服務）
   */
  async generateAndSaveJourney(
    messages: ConversationMessage[],
    placeName: string,
    guideName: string,
    userId: string,
    options: JourneySummaryOptions = {}
  ): Promise<JourneySummaryResult> {
    // 生成總結
    const summary = await this.generateJourneySummary(
      messages,
      placeName,
      guideName,
      userId,
      options
    );

    // 儲存到資料庫
    const journeyId = await this.saveJourneyRecord(summary, userId);

    return {
      journeyId,
      summary
    };
  }

  /**
   * 構建對話文本
   */
  private buildConversationText(messages: ConversationMessage[]): string {
    return messages
      .filter(msg => msg.text && msg.text.trim())
      .map(msg => `${msg.from === 'ai' ? '導覽員' : '遊客'}: ${msg.text}`)
      .join('\n');
  }

  /**
   * 構建總結提示詞
   */
  private buildSummaryPrompt(
    conversationText: string,
    placeName: string,
    guideName: string,
    options: JourneySummaryOptions
  ): string {
    return `請總結這次導覽對話，生成一個旅程記錄。

地點：${placeName}
導覽員：${guideName}

對話內容：
${conversationText}

請以JSON格式回應，包含以下欄位：
{
  "title": "旅程標題（簡短有吸引力的標題）",
  "summary": "旅程總結（200-300字的詳細描述，包含學到的知識重點）",
  "highlights": ["重點1", "重點2", "重點3"] // 3-5個主要亮點
}

請用繁體中文回應，語調要友善且具有紀念價值。`;
  }

  /**
   * 解析AI總結回應
   */
  private parseAISummaryResponse(response: string): any {
    try {
      // 嘗試解析JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // 如果無法解析JSON，返回預設結構
      return {
        title: '精彩的導覽之旅',
        summary: response.substring(0, 300), // 取前300字作為摘要
        highlights: ['精彩對話', '深度學習', '難忘體驗']
      };
    } catch (error) {
      console.warn('解析AI回應失敗，使用預設格式:', error);
      return {
        title: '精彩的導覽之旅',
        summary: '今天的導覽非常精彩，學到了很多有趣的知識！',
        highlights: ['精彩對話', '深度學習', '難忘體驗']
      };
    }
  }
}
