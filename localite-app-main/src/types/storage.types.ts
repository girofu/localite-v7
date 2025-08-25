/**
 * Firebase Storage 服務類型定義
 * 
 * 定義檔案上傳、處理、管理相關的資料結構
 * 包含圖片處理、存取控制、進度追蹤等功能
 */

// ====================
// 基礎類型
// ====================

export interface FileSize {
  width: number;
  height: number;
}

export interface FileMetadata {
  name: string;
  contentType: string;
  size: number;
  md5Hash: string;
  timeCreated: Date;
  timeUpdated: Date;
  downloadUrl?: string;
  isPublic: boolean;
  customMetadata?: Record<string, string>;
}

// ====================
// 上傳相關類型
// ====================

export interface UploadFileData {
  file: Blob | File;
  filename: string;
  userId: string;
  folder: string;
  isPublic?: boolean;
  metadata?: {
    contentType?: string;
    customMetadata?: Record<string, string>;
  };
}

export interface ImageProcessingOptions {
  // 壓縮設定
  compressionQuality?: number; // 0.1 - 1.0
  maxWidth?: number;
  maxHeight?: number;

  // 縮圖設定
  generateThumbnail?: boolean;
  thumbnailSize?: FileSize;
  thumbnailSizes?: FileSize[]; // 多尺寸縮圖

  // 格式轉換
  outputFormat?: 'jpeg' | 'png' | 'webp';
  preserveExif?: boolean;

  // 品質優化
  progressive?: boolean; // 漸進式 JPEG
  optimizeFor?: 'size' | 'quality' | 'balanced';
}

export interface ProcessingResults {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions?: FileSize;
  thumbnailGenerated: boolean;
  thumbnailsGenerated?: number;
  processingTime: number;
}

export interface UploadResult {
  filePath: string;
  originalUrl: string;
  thumbnailUrl?: string;
  thumbnailUrls?: string[];
  metadata: FileMetadata;
  processingResults: ProcessingResults;
}

// ====================
// 檔案列表和查詢
// ====================

export interface ListFilesOptions {
  limit?: number;
  startAfter?: string; // 分頁 token
  orderBy?: 'timeCreated' | 'timeUpdated' | 'name' | 'size';
  orderDirection?: 'asc' | 'desc';
  folder?: string;
  contentType?: string;
}

export interface ListFilesResult {
  files: FileMetadata[];
  hasMore: boolean;
  nextPageToken?: string;
  totalCount?: number;
}

// ====================
// 存取控制
// ====================

export interface SignedUrlOptions {
  action: 'read' | 'write' | 'delete';
  expirationTime: Date;
  contentType?: string;
  responseDisposition?: string; // 控制檔案下載方式
}

export interface AccessControlRule {
  userId?: string;
  role?: 'owner' | 'editor' | 'viewer';
  isPublic: boolean;
  expirationTime?: Date;
}

// ====================
// 刪除操作
// ====================

export interface DeleteResult {
  success: boolean;
  deletedFiles: string[];
  errors?: string[];
}

// ====================
// 錯誤處理
// ====================

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// ====================
// 進度追蹤
// ====================

export type ProgressCallback = (progress: number) => void;

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
  state: 'running' | 'paused' | 'success' | 'error' | 'canceled';
}

// ====================
// 批次操作
// ====================

export interface BatchUploadData {
  files: UploadFileData[];
  processingOptions?: ImageProcessingOptions;
  maxConcurrency?: number;
}

export interface BatchUploadResult {
  results: (UploadResult | StorageError)[];
  successCount: number;
  errorCount: number;
  totalProcessingTime: number;
}

// ====================
// 配置和設定
// ====================

export interface StorageConfig {
  maxFileSize: number; // bytes
  allowedMimeTypes: string[];
  defaultFolder: string;
  autoOptimization: boolean;
  cdnEnabled: boolean;
  compressionDefaults: ImageProcessingOptions;
}

// ====================
// 統計和監控
// ====================

export interface StorageUsageStats {
  totalFiles: number;
  totalSize: number;
  byContentType: Record<string, { count: number; size: number }>;
  byFolder: Record<string, { count: number; size: number }>;
  uploadTrends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}
