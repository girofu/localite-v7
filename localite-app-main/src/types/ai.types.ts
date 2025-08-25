/**
 * Google AI Studio 服務類型定義
 * 
 * 定義 AI 對話、圖片分析、對話歷史等相關資料結構
 * 基於 @google/genai SDK 的最新 API
 */

// ====================
// 基礎類型
// ====================

export interface Location {
  latitude: number;
  longitude: number;
}

export interface ImageBuffer {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

// ====================
// 聊天對話類型
// ====================

export interface ChatMessage {
  id?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    estimatedCost?: number;
    processingTime?: number;
    isStreaming?: boolean;
    systemPromptUsed?: boolean;
    language?: string;
    warnings?: string[];
  };
}

export interface ChatResponse {
  content: string;
  role: 'assistant';
  timestamp: Date;
  metadata?: {
    model: string;
    tokensUsed: number;
    estimatedCost: number;
    processingTime: number;
    isStreaming?: boolean;
    systemPromptUsed?: boolean;
    language?: string;
    warnings?: string[];
    conversationId?: string;
  };
}

export interface StreamingChatOptions {
  onChunk: (chunk: string) => void;
  onComplete: (finalResponse: ChatResponse) => void;
  onError: (error: Error) => void;
}

export interface ChatOptions {
  language?: 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP';
  responseStyle?: 'brief' | 'detailed' | 'informative' | 'casual';
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

// ====================
// 圖片分析類型
// ====================

export interface ImageAnalysisRequest {
  image: ImageBuffer;
  query: string;
  context?: {
    location?: Location;
    timestamp: Date;
    userLanguage: 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP';
    useConversationHistory?: boolean;
    additionalContext?: string;
  };
}

export interface LandmarkDetection {
  name: string;
  confidence: number;
  description?: string;
  location?: Location;
  wikiUrl?: string;
}

export interface TravelRecommendation {
  type: 'restaurant' | 'attraction' | 'activity' | 'transportation';
  name: string;
  description: string;
  rating?: number;
  distance?: string;
  estimatedCost?: string;
  openingHours?: string;
}

export interface ImageAnalysisResponse {
  analysis: string;
  confidence: number;
  landmarks?: LandmarkDetection[];
  recommendations?: TravelRecommendation[];
  detectedObjects?: string[];
  colors?: string[];
  mood?: string;
  metadata?: {
    model: string;
    processingTime: number;
    imageSize: { width: number; height: number };
    tokensUsed: number;
    estimatedCost: number;
  };
}

// ====================
// 對話歷史類型
// ====================

export interface ConversationHistory {
  conversationId: string;
  messages: ChatMessage[];
  totalMessages: number;
  startTime: Date;
  lastUpdated: Date;
  hasMore?: boolean;
  metadata?: {
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
    topicsDiscussed: string[];
  };
}

export interface HistoryQuery {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  includeImages?: boolean;
  searchTerm?: string;
}

// ====================
// 使用統計類型
// ====================

export interface UsageStats {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  averageTokensPerRequest: number;
  averageResponseTime: number;
  errorRate: number;
  periodStart: Date;
  periodEnd: Date;
  breakdown: {
    textRequests: number;
    imageRequests: number;
    streamingRequests: number;
    modelUsage: Record<string, number>;
  };
}

// ====================
// 配置類型
// ====================

export interface AIServiceConfig {
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retryAttempts?: number;
  rateLimitDelay?: number;
  enableLogging?: boolean;
}

export interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  candidateCount?: number;
  responseMimeType?: string;
}

// ====================
// 錯誤處理類型
// ====================

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export interface ErrorContext {
  requestId?: string;
  model?: string;
  timestamp: Date;
  inputTokens?: number;
  operation: 'chat' | 'image_analysis' | 'streaming';
  retryAttempt?: number;
}

// ====================
// 內容安全類型
// ====================

export interface SafetyRating {
  category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 
           'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT';
  probability: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH';
  blocked?: boolean;
}

export interface ContentSafety {
  ratings: SafetyRating[];
  blocked: boolean;
  reason?: string;
}

// ====================
// 工具和函數調用類型
// ====================

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
  result?: any;
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// ====================
// 快取和性能類型
// ====================

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum number of cached items
  keyGenerator?: (input: any) => string;
}

export interface PerformanceMetrics {
  latency: number;
  throughput: number;
  cacheHitRate: number;
  errorRate: number;
  timestamp: Date;
}

// ====================
// 多語言支持類型
// ====================

export type SupportedLanguage = 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR';

export interface LanguageConfig {
  primary: SupportedLanguage;
  fallback?: SupportedLanguage;
  autoDetect?: boolean;
  translationEnabled?: boolean;
}

export interface LocalizedContent {
  [key: string]: {
    [language in SupportedLanguage]?: string;
  };
}

// ====================
// 導出所有類型
// ====================

export type {
  // 基礎類型
  Location,
  ImageBuffer,
  
  // 聊天相關
  ChatMessage,
  ChatResponse,
  StreamingChatOptions,
  ChatOptions,
  
  // 圖片分析相關
  ImageAnalysisRequest,
  LandmarkDetection,
  TravelRecommendation,
  ImageAnalysisResponse,
  
  // 對話歷史相關
  ConversationHistory,
  HistoryQuery,
  UsageStats,
  
  // 配置相關
  AIServiceConfig,
  GenerationConfig,
  ErrorContext,
  
  // 安全相關
  SafetyRating,
  ContentSafety,
  
  // 工具相關
  ToolCall,
  FunctionDeclaration,
  
  // 性能相關
  CacheConfig,
  PerformanceMetrics,
  
  // 多語言相關
  SupportedLanguage,
  LanguageConfig,
  LocalizedContent,
};

export { AIServiceError };
