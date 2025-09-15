/**
 * Google Text-to-Speech 服務類型定義
 * 
 * 定義 TTS 語音合成、聲音管理、SSML 支援等相關資料結構
 * 基於 @google-cloud/text-to-speech SDK 的最新 API
 */

// ====================
// 基礎類型
// ====================

export type LanguageCode = 
  | 'zh-TW' | 'zh-CN' | 'en-US' | 'en-GB' | 'en-AU'
  | 'ja-JP' | 'ko-KR' | 'th-TH' | 'vi-VN' | 'ms-MY'
  | 'id-ID' | 'tl-PH' | 'hi-IN' | 'pt-BR' | 'es-ES'
  | 'fr-FR' | 'de-DE' | 'it-IT' | 'ru-RU' | 'ar-XA';

export type AudioEncoding = 'MP3' | 'WAV' | 'OGG_OPUS' | 'MULAW' | 'ALAW';

export type SSMLGender = 'MALE' | 'FEMALE' | 'NEUTRAL';

// ====================
// 語音和音頻配置
// ====================

export interface Voice {
  languageCode: LanguageCode;
  name: string;
  ssmlGender: SSMLGender;
  naturalSampleRateHertz?: number;
  networkEndpointsSupported?: boolean;
}

export interface AudioConfig {
  audioEncoding: AudioEncoding;
  speakingRate: number;     // 0.25 到 4.0
  pitch: number;            // -20.0 到 20.0 semitones
  volumeGainDb: number;     // -96.0 到 16.0 dB
  sampleRateHertz?: number;
  effectsProfileId?: string[];
}

// ====================
// TTS 請求和回應
// ====================

export interface TTSRequest {
  text: string;
  voice: Voice;
  audioConfig: AudioConfig;
  enableTimePointing?: boolean;
}

export interface SSMLRequest {
  ssml: string;
  voice: Voice;
  audioConfig: AudioConfig;
  enableTimePointing?: boolean;
}

export interface TTSResponse {
  audioContent: Buffer;
  audioBuffer: Buffer; // 別名，用於向後兼容，應該與 audioContent 相同
  audioConfig?: {
    audioEncoding: AudioEncoding;
    sampleRateHertz: number;
    effectsProfileId?: string[];
  };
  timepoints?: Array<{
    markName?: string;
    timeSeconds: number;
  }>;
  metadata?: {
    audioFormat: AudioEncoding;
    duration: number;          // 毫秒
    size: number;              // 位元組
    textLength: number;
    voiceUsed: Voice;
    processingTime: number;
    model?: string;            // 用於測試的模型名稱
    charactersProcessed?: number;
    billableCharacters?: number;
    estimatedCost?: number;
    isSSML?: boolean;
    isMultilingual?: boolean;
    isStreaming?: boolean;
    isLongAudio?: boolean;
    fromCache?: boolean;
    batchIndex?: number;
    profileUsed?: string;
    warnings?: string[];
  };
}

// ====================
// 流式和進階功能
// ====================

export interface StreamingTTSOptions {
  onAudioChunk: (chunk: Buffer) => void;
  onProgress: (progress: number) => void;  // 0-100
  onComplete: (response: TTSResponse) => void;
  onError: (error: Error) => void;
}

export interface BatchSynthesizeOptions {
  maxConcurrency?: number;
  preserveOrder?: boolean;
  enableCaching?: boolean;
}

// ====================
// 檔案管理
// ====================

export interface AudioFileMetadata {
  filePath: string;
  size: number;
  format: AudioEncoding;
  duration: number;
  createdAt: Date;
  lastAccessed: Date;
  checksum?: string;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

// ====================
// 使用統計
// ====================

export interface UsageStats {
  totalRequests: number;
  totalCharacters: number;
  totalAudioDuration: number;   // 毫秒
  averageProcessingTime: number;
  cacheHitRate: number;
  errorRate: number;
  languageBreakdown: Record<LanguageCode, number>;
  voiceUsage: Record<string, number>;
  encodingUsage: Record<AudioEncoding, number>;
  periodStart: Date;
  periodEnd: Date;
}

// ====================
// 配置類型
// ====================

export interface TTSServiceConfig {
  projectId?: string;
  keyFilename?: string;
  credentials?: object;
  timeout?: number;
  retryAttempts?: number;
  enableCaching?: boolean;
  cacheSize?: number;
  cacheTTL?: number;       // 秒
  tempDirectory?: string;
  enableLogging?: boolean;
}

export interface VoiceProfile {
  name: string;
  preferredLanguages: LanguageCode[];
  defaultSettings: {
    speakingRate: number;
    pitch: number;
    volumeGainDb: number;
  };
  voicePreferences: Record<LanguageCode, {
    gender: SSMLGender;
    quality: 'Wavenet' | 'Standard' | 'Neural2';
  }>;
  description?: string;
}

// ====================
// 錯誤處理
// ====================

export class TTSServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly retryCount?: number,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'TTSServiceError';
  }
}

export interface ErrorContext {
  requestId?: string;
  voice?: Voice;
  textLength?: number;
  timestamp: Date;
  operation: 'synthesize' | 'list_voices' | 'streaming' | 'batch' | 'ssml' | 'playAudio' | 'stopAudio' | 'pauseAudio' | 'resumeAudio';
  retryAttempt?: number;
}

// ====================
// SSML 支援類型
// ====================

export interface SSMLElement {
  tag: string;
  attributes?: Record<string, string>;
  content: string | SSMLElement[];
}

export interface SSMLValidationResult {
  isValid: boolean;
  errors: Array<{
    line: number;
    column: number;
    message: string;
  }>;
  warnings: string[];
}

// ====================
// 聲音品質和特性
// ====================

export interface VoiceCharacteristics {
  name: string;
  languageCode: LanguageCode;
  ssmlGender: SSMLGender;
  quality: 'Standard' | 'Wavenet' | 'Neural2';
  naturalness: number;      // 1-10 評分
  expressiveness: number;   // 1-10 評分
  sampleRateHertz: number;
  supportedFeatures: string[];
  description?: string;
}

export interface VoiceRecommendation {
  voice: Voice;
  score: number;            // 0-100 推薦分數
  reason: string;
  characteristics: VoiceCharacteristics;
}

// ====================
// 多語言和本地化
// ====================

export interface LocalizedVoiceInfo {
  [key: string]: {
    displayName: string;
    description: string;
    region: string;
    characteristics: string[];
  };
}

export interface MultilingualRequest {
  segments: Array<{
    text: string;
    languageCode: LanguageCode;
    voice?: Partial<Voice>;
  }>;
  globalAudioConfig: AudioConfig;
  crossFadeMs?: number;     // 段落間淡化時間
}

// ====================
// 效能監控
// ====================

export interface PerformanceMetrics {
  requestLatency: number;
  audioGenerationTime: number;
  networkTime: number;
  cachePerformance: {
    hitRate: number;
    averageLookupTime: number;
  };
  memoryUsage: number;
  cpuUsage: number;
  timestamp: Date;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  uptime: number;           // 秒
  errorRate: number;
  averageLatency: number;
  availableVoices: number;
  cacheStatus: 'active' | 'disabled' | 'error';
}

// ====================
// 進階功能類型
// ====================

export interface AudioEffects {
  telephonyConversion?: boolean;
  profile?: 'wearable-class-device' | 'handset-class-device' | 'headphone-class-device' | 
            'small-bluetooth-speaker-class-device' | 'medium-bluetooth-speaker-class-device' |
            'large-home-entertainment-class-device' | 'large-automotive-class-device';
}

export interface CustomVoiceConfig {
  modelPath?: string;
  voiceName?: string;
  speakerEmbedding?: Float32Array;
  customization?: Record<string, any>;
}

// 所有類型已在定義時導出
