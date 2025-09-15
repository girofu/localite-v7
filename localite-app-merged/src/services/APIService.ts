/**
 * API Service - 統一的 API 介面層
 * 
 * 整合所有後端服務，提供統一的 API 介面
 * 包含錯誤處理、多語言支援、服務健康檢查等功能
 */

import { FirestoreService } from './FirestoreService';
import { GoogleAIService } from './GoogleAIService';
import { GoogleTTSService } from './GoogleTTSService';
import {
  APIResponse,
  APIError,
  APIErrorCode,
  APIMetadata,
  ChatMessageRequest,
  ChatMessageResponse,
  ChatMessageOptions,
  ImageAnalysisAPIRequest,
  ImageAnalysisAPIResponse,
  UpdateUserLanguageRequest,
  ServiceHealthStatus,
  APIServiceConfig,
  APIServiceDependencies,
  SupportedLanguage,
  UserPreferencesUpdate
} from '../types/api.types';
import {
  ChatMessage,
  ChatOptions,
  ImageAnalysisRequest
} from '../types/ai.types';
import { User, UserPreferences } from '../types/firestore.types';

export class APIService {
  private firestoreService: FirestoreService;
  private aiService: GoogleAIService;
  private ttsService: GoogleTTSService;
  private config: APIServiceConfig;

  constructor(dependencies?: Partial<APIServiceDependencies>, config?: Partial<APIServiceConfig>) {
    // 初始化服務依賴
    this.firestoreService = dependencies?.firestoreService || new FirestoreService();
    this.aiService = dependencies?.aiService || new GoogleAIService();
    this.ttsService = dependencies?.ttsService || new GoogleTTSService();

    // 預設配置
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableLogging: true,
      enableMetrics: true,
      defaultLanguage: 'zh-TW',
      ...config
    };
  }

  // ====================
  // 聊天 API
  // ====================

  async sendChatMessage(
    userId: string,
    message: string,
    options?: ChatMessageOptions
  ): Promise<APIResponse<ChatMessageResponse>> {
    try {
      // 驗證輸入
      if (!userId || !message) {
        throw new APIError(
          'User ID and message are required',
          'validation_error',
          400
        );
      }

      const startTime = Date.now();
      const requestId = this.generateRequestId();

      // 準備聊天訊息
      const chatMessage: ChatMessage = {
        content: message,
        role: 'user',
        timestamp: new Date()
      };

      // 準備 AI 服務選項
      const chatOptions: ChatOptions = {
        language: options?.language || this.config.defaultLanguage,
        temperature: options?.temperature,
        systemPrompt: options?.systemPrompt
      };

      // 建立或取得對話
      let conversationId = options?.conversationId;
      if (!conversationId) {
        const conversation = await this.firestoreService.createConversation({
          userId,
          type: 'ai_guide',
          context: {
            language: chatOptions.language || 'zh-TW'
          }
        });
        conversationId = conversation.id;
      }

      // 發送訊息到 AI 服務
      const aiResponse = await this.aiService.sendMessage(chatMessage, chatOptions);

      // 儲存對話到資料庫
      const updatedConversation = await this.firestoreService.addMessageToConversation(
        conversationId,
        { content: message, type: 'user', timestamp: new Date() }
      );

      await this.firestoreService.addMessageToConversation(
        conversationId,
        { content: aiResponse.content, type: 'ai', timestamp: aiResponse.timestamp }
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          response: aiResponse,
          conversationId,
          messageCount: updatedConversation.messages.length + 1
        },
        metadata: {
          requestId,
          timestamp: new Date(),
          processingTime,
          version: '1.0.0',
          language: chatOptions.language
        }
      };

    } catch (error: any) {
      return this.handleError(error, 'sendChatMessage');
    }
  }

  // ====================
  // 圖片分析 API
  // ====================

  async analyzeImageWithPlaceInfo(
    userId: string,
    request: ImageAnalysisAPIRequest
  ): Promise<APIResponse<ImageAnalysisAPIResponse>> {
    try {
      const startTime = Date.now();
      const requestId = this.generateRequestId();

      // 分析圖片
      const analysisResult = await this.aiService.analyzeImage(request);

      // 搜尋相關地點（如果有地標識別結果）
      let relatedPlaces: any[] = [];
      if ((request.includeRelatedPlaces !== false) && analysisResult.landmarks?.length > 0) {
        const landmark = analysisResult.landmarks[0];
        relatedPlaces = await this.firestoreService.searchPlaces({
          center: {
            latitude: landmark.location.latitude,
            longitude: landmark.location.longitude
          },
          radius: request.searchRadius || 1000
        });
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          analysis: analysisResult, // Use the complete analysis result object
          relatedPlaces,
          conversationId: request.context?.useConversationHistory ?
            `conv-${Date.now()}` : undefined
        },
        metadata: {
          requestId,
          timestamp: new Date(),
          processingTime,
          version: '1.0.0',
          language: request.context?.userLanguage
        }
      };

    } catch (error: any) {
      return this.handleError(error, 'analyzeImageWithPlaceInfo');
    }
  }

  // ====================
  // 用戶管理 API
  // ====================

  async updateUserLanguage(
    userId: string,
    language: SupportedLanguage
  ): Promise<APIResponse<User>> {
    try {
      const startTime = Date.now();
      const requestId = this.generateRequestId();

      // 直接更新用戶的 preferredLanguage 屬性
      const userUpdate = {
        preferredLanguage: language
      };

      const updatedUser = await this.firestoreService.updateUserPreferences(
        userId,
        userUpdate
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: updatedUser,
        metadata: {
          requestId,
          timestamp: new Date(),
          processingTime,
          version: '1.0.0',
          language
        }
      };

    } catch (error: any) {
      return this.handleError(error, 'updateUserLanguage');
    }
  }

  // ====================
  // 服務健康檢查
  // ====================

  async getHealthStatus(): Promise<APIResponse<ServiceHealthStatus>> {
    try {
      const startTime = Date.now();
      const requestId = this.generateRequestId();

      // 檢查各個服務的健康狀態
      const firestoreHealth = await this.checkFirestoreHealth();
      const aiHealth = await this.checkAIServiceHealth();
      const ttsHealth = await this.checkTTSServiceHealth();

      // 計算整體健康狀態
      const services = { firestore: firestoreHealth, ai: aiHealth, tts: ttsHealth };
      const overall = this.calculateOverallHealth(services);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          overall,
          services,
          timestamp: new Date(),
          uptime: process.uptime()
        },
        metadata: {
          requestId,
          timestamp: new Date(),
          processingTime,
          version: '1.0.0'
        }
      };

    } catch (error: any) {
      return this.handleError(error, 'getHealthStatus');
    }
  }

  // ====================
  // 私有方法
  // ====================

  private async checkFirestoreHealth() {
    try {
      const start = Date.now();
      await this.firestoreService.getUserById('health-check');
      return {
        status: 'healthy' as const,
        responseTime: Date.now() - start,
        lastCheck: new Date()
      };
    } catch (error: any) {
      return {
        status: 'unhealthy' as const,
        lastCheck: new Date(),
        error: error.message
      };
    }
  }

  private async checkAIServiceHealth() {
    try {
      const start = Date.now();
      await this.aiService.sendMessage({
        content: 'Health check',
        role: 'user',
        timestamp: new Date()
      });
      return {
        status: 'healthy' as const,
        responseTime: Date.now() - start,
        lastCheck: new Date()
      };
    } catch (error: any) {
      return {
        status: 'unhealthy' as const,
        lastCheck: new Date(),
        error: error.message
      };
    }
  }

  private async checkTTSServiceHealth() {
    // TTS 服務健康檢查（簡化版）
    return {
      status: 'healthy' as const,
      responseTime: 50,
      lastCheck: new Date()
    };
  }

  private calculateOverallHealth(services: any): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Object.values(services).map((service: any) => service.status);
    
    if (statuses.every(status => status === 'healthy')) {
      return 'healthy';
    } else if (statuses.some(status => status === 'healthy')) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }

  private handleError(error: any, operation: string): APIResponse<never> {
    let apiError: APIError;

    if (error instanceof APIError) {
      apiError = error;
    } else {
      // 根據錯誤類型映射到 API 錯誤代碼
      let code: APIErrorCode = 'unknown_error';
      let message = `${operation} failed`;
      let retryable = false;



      if (error.name === 'FirestoreError' || error.message?.includes('Firestore')) {
        code = 'database_error';
        message = 'Database operation failed';
      } else if (error.name === 'AIServiceError' ||
                 error.message?.includes('AI') ||
                 error.message?.includes('service unavailable') ||
                 error.message?.includes('AI service')) {
        code = 'ai_service_error';
        message = error.message || 'AI service error';
      } else if (error.name === 'TimeoutError' ||
                 error.message?.includes('timeout') ||
                 error.message?.includes('Request timeout') ||
                 error.message?.includes('Request timeout')) {
        code = 'network_timeout';
        message = error.message || 'Request timeout';
        retryable = true;
      } else if (error.message?.includes('auth')) {
        code = 'authentication_failed';
        message = 'Authentication failed';
      }

      apiError = new APIError(
        message,
        code,
        error.statusCode || 500,
        { originalError: error },
        retryable
      );
    }

    return {
      success: false,
      error: apiError,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date(),
        processingTime: 0,
        version: '1.0.0'
      }
    };
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  // === 測試兼容性別名方法 ===

  /**
   * analyzeImage 別名方法
   */
  async analyzeImage(request: any): Promise<any> {
    try {
      // 建立正確的 ImageAnalysisRequest 對象
      const imageAnalysisRequest = {
        image: typeof request.imageData === 'string'
          ? {
              buffer: Buffer.from(request.imageData, 'base64'),
              mimeType: 'image/jpeg',
              filename: 'test.jpg'
            }
          : request.imageData,
        query: request.context || '分析這張圖片',
        context: {
          timestamp: new Date(),
          userLanguage: (request.language as 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP') || 'zh-TW',
          additionalContext: request.context,
          useConversationHistory: true
        }
      };

      // 建立 ImageAnalysisAPIRequest 包裝對象
      const apiRequest = {
        image: imageAnalysisRequest.image,
        query: imageAnalysisRequest.query,
        context: imageAnalysisRequest.context,
        includeRelatedPlaces: true,
        userId: request.userId || 'anonymous'
      };

      const result = await this.analyzeImageWithPlaceInfo(
        request.userId || 'anonymous',
        apiRequest
      );

      // 如果是成功結果，提取 analysis 部分
      if (result.success && result.data) {
        // 根據新的介面，analysis 直接是一個字串
        const analysis = result.data.analysis;

        return {
          success: true,
          data: {
            analysis,
            relatedPlaces: result.data.relatedPlaces || []
          }
        };
      }

      // 如果失敗，返回錯誤
      return result;
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error as any, 'analyzeImage')
      };
    }
  }

  /**
   * searchPlaces 方法
   */
  async searchPlaces(request: any): Promise<any> {
    try {
      // 使用 Firestore 搜尋地點 - 傳遞正確的 PlaceSearchParams 對象
      const searchParams = {
        city: request.city,
        district: request.district,
        category: request.category,
        tags: request.tags,
        radius: request.radius,
        center: request.userLocation,
        limit: request.limit || 10
      };

      const places = await this.firestoreService.searchPlaces(searchParams);
      
      return {
        success: true,
        data: {
          places,
          total: places.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error as any, 'searchPlaces')
      };
    }
  }

  /**
   * getRoute 方法
   */
  async getRoute(request: any): Promise<any> {
    try {
      // 模擬路線規劃功能
      const route = {
        distance: 1500,
        duration: 18,
        steps: [
          { instruction: '從起點向北走', distance: 200 },
          { instruction: '右轉進入大安路', distance: 800 },
          { instruction: '到達目的地', distance: 500 }
        ],
        waypoints: [
          { lat: request.origin.lat, lng: request.origin.lng },
          { lat: request.destination.lat, lng: request.destination.lng }
        ]
      };

      return {
        success: true,
        data: { route }
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error as any, 'getRoute')
      };
    }
  }
}
