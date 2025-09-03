/**
 * API 服務統一類型定義
 * 
 * 定義統一的 API 回應格式、錯誤處理、多語言支援等類型
 */

import { ChatMessage, ChatResponse, ImageAnalysisRequest, ImageAnalysisResponse } from './ai.types';
import { User, Place, Conversation } from './firestore.types';

// ====================
// 基礎 API 類型
// ====================

/**
 * 統一的 API 回應格式
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: APIMetadata;
}

/**
 * API 錯誤類型
 */
export class APIError extends Error {
  constructor(
    message: string,
    public readonly code: APIErrorCode,
    public readonly statusCode: number = 500,
    public readonly details?: any,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * API 錯誤代碼
 */
export type APIErrorCode =
  | 'validation_error'
  | 'authentication_failed'
  | 'authorization_failed'
  | 'not_found'
  | 'database_error'
  | 'ai_service_error'
  | 'tts_service_error'
  | 'network_error'
  | 'network_timeout'
  | 'rate_limit_exceeded'
  | 'service_unavailable'
  | 'unknown_error';

/**
 * API 元數據
 */
export interface APIMetadata {
  requestId: string;
  timestamp: Date;
  processingTime: number;
  version: string;
  language?: string;
}

// ====================
// 聊天 API 類型
// ====================

/**
 * 聊天訊息請求
 */
export interface ChatMessageRequest {
  userId: string;
  message: string;
  options?: ChatMessageOptions;
}

/**
 * 聊天訊息選項
 */
export interface ChatMessageOptions {
  language?: 'zh-TW' | 'en-US';
  conversationId?: string;
  useHistory?: boolean;
  systemPrompt?: string;
  temperature?: number;
}

/**
 * 聊天訊息回應
 */
export interface ChatMessageResponse {
  response: ChatResponse;
  conversationId: string;
  messageCount: number;
}

// ====================
// 圖片分析 API 類型
// ====================

/**
 * 圖片分析請求（擴展版）
 */
export interface ImageAnalysisAPIRequest extends ImageAnalysisRequest {
  includeRelatedPlaces?: boolean;
  searchRadius?: number; // 公尺
}

/**
 * 圖片分析回應（擴展版）
 */
export interface ImageAnalysisAPIResponse {
  analysis: ImageAnalysisResponse;
  relatedPlaces: Place[];
  conversationId?: string;
}

// ====================
// 用戶管理 API 類型
// ====================

/**
 * 用戶語言更新請求
 */
export interface UpdateUserLanguageRequest {
  userId: string;
  language: 'zh-TW' | 'en-US';
}

/**
 * 用戶偏好設定
 */
export interface UserPreferencesUpdate {
  preferredLanguage?: 'zh-TW' | 'en-US';
  enableNotifications?: boolean;
  enableLocationServices?: boolean;
  voiceSettings?: {
    speed: number;
    pitch: number;
    volume: number;
  };
}

// ====================
// 服務健康檢查類型
// ====================

/**
 * 服務健康狀態
 */
export interface ServiceHealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    firestore: ServiceStatus;
    ai: ServiceStatus;
    tts: ServiceStatus;
    storage?: ServiceStatus;
  };
  timestamp: Date;
  uptime: number;
}

/**
 * 個別服務狀態
 */
export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: Date;
  error?: string;
}

// ====================
// 多語言支援類型
// ====================

/**
 * 支援的語言
 */
export type SupportedLanguage = 'zh-TW' | 'en-US';

/**
 * 語言設定
 */
export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

/**
 * 多語言文字資源
 */
export interface LocalizedStrings {
  [key: string]: {
    [K in SupportedLanguage]: string;
  };
}

// ====================
// API 服務配置類型
// ====================

/**
 * API 服務配置
 */
export interface APIServiceConfig {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
  enableMetrics: boolean;
  defaultLanguage: SupportedLanguage;
  rateLimiting?: {
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
  };
}

/**
 * API 服務依賴
 */
export interface APIServiceDependencies {
  firestoreService: any; // 避免循環依賴
  aiService: any;
  ttsService: any;
  storageService?: any;
}

// ====================
// 批次操作類型
// ====================

/**
 * 批次請求
 */
export interface BatchRequest {
  requests: Array<{
    id: string;
    method: 'chat' | 'image_analysis' | 'user_update';
    data: any;
  }>;
}

/**
 * 批次回應
 */
export interface BatchResponse {
  results: Array<{
    id: string;
    success: boolean;
    data?: any;
    error?: APIError;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    processingTime: number;
  };
}

// ====================
// 統計和監控類型
// ====================

/**
 * API 使用統計
 */
export interface APIUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsByEndpoint: Record<string, number>;
  errorsByCode: Record<APIErrorCode, number>;
  requestsByLanguage: Record<SupportedLanguage, number>;
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * 效能指標
 */
export interface PerformanceMetrics {
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
  errorRate: number;
  availability: number;
}
