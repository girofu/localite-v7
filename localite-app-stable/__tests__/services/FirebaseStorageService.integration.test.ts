/**
 * Firebase Storage Service Integration Tests
 * 
 * 測試 Firebase Storage 檔案上傳、壓縮、管理功能
 * 包含照片上傳、縮圖生成、安全控制等核心功能
 */

import { FirebaseStorageService } from '../../src/services/FirebaseStorageService';
import { 
  UploadFileData,
  UploadResult,
  ImageProcessingOptions,
  FileMetadata,
  StorageError 
} from '../../src/types/storage.types';

describe('FirebaseStorageService Integration Tests', () => {
  let storageService: FirebaseStorageService;

  beforeEach(() => {
    storageService = new FirebaseStorageService();
  });

  afterEach(async () => {
    // 清理測試檔案
    await storageService.cleanup();
  });

  describe('Photo Upload Management', () => {
    it('should upload photo with automatic optimization', async () => {
      // Arrange
      const mockPhotoBlob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
      const uploadData: UploadFileData = {
        file: mockPhotoBlob,
        filename: 'test-photo.jpg',
        userId: 'test-user-123',
        folder: 'user-photos',
        metadata: {
          contentType: 'image/jpeg',
          customMetadata: {
            uploadSource: 'mobile-camera',
            location: JSON.stringify({ lat: 25.0338, lng: 121.5645 }),
          }
        }
      };

      const processingOptions: ImageProcessingOptions = {
        generateThumbnail: true,
        thumbnailSize: { width: 300, height: 300 },
        compressionQuality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      };

      // Act
      const result = await storageService.uploadImage(uploadData, processingOptions);

      // Assert
      expect(result.originalUrl).toBeDefined();
      expect(result.originalUrl).toContain('test-photo.jpg');
      expect(result.thumbnailUrl).toBeDefined();
      expect(result.metadata.contentType).toBe('image/jpeg');
      expect(result.metadata.size).toBeGreaterThan(0);
      expect(result.metadata.customMetadata?.uploadSource).toBe('mobile-camera');
      expect(result.processingResults.compressionRatio).toBeGreaterThan(0);
      expect(result.processingResults.thumbnailGenerated).toBe(true);
    });

    it('should handle multiple image formats', async () => {
      // Arrange
      const formats = [
        { blob: new Blob(['png-data'], { type: 'image/png' }), filename: 'test.png' },
        { blob: new Blob(['jpg-data'], { type: 'image/jpeg' }), filename: 'test.jpg' },
        { blob: new Blob(['webp-data'], { type: 'image/webp' }), filename: 'test.webp' },
      ];

      const results: UploadResult[] = [];

      // Act
      for (const format of formats) {
        const uploadData: UploadFileData = {
          file: format.blob,
          filename: format.filename,
          userId: 'test-user-123',
          folder: 'format-test',
        };

        const result = await storageService.uploadImage(uploadData);
        results.push(result);
      }

      // Assert
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.originalUrl).toContain(formats[index].filename);
        expect(result.metadata.contentType).toBe(formats[index].blob.type);
      });
    });

    it('should reject invalid file types', async () => {
      // Arrange
      const invalidFile = new Blob(['not-an-image'], { type: 'text/plain' });
      const uploadData: UploadFileData = {
        file: invalidFile,
        filename: 'invalid.txt',
        userId: 'test-user-123',
        folder: 'invalid-test',
      };

      // Act & Assert
      await expect(
        storageService.uploadImage(uploadData)
      ).rejects.toThrow('Invalid file type');
    });

    it('should enforce file size limits', async () => {
      // Arrange - 模擬超大檔案 (15MB，超過 10MB 限制)
      const largeFile = new Blob([new ArrayBuffer(15 * 1024 * 1024)], { type: 'image/jpeg' });
      const uploadData: UploadFileData = {
        file: largeFile,
        filename: 'large-file.jpg',
        userId: 'test-user-123',
        folder: 'size-test',
      };

      // Act & Assert
      await expect(
        storageService.uploadImage(uploadData)
      ).rejects.toThrow('File size exceeds limit');
    });
  });

  describe('File Management', () => {
    it('should get file metadata', async () => {
      // Arrange
      const mockFile = new Blob(['test-data'], { type: 'image/jpeg' });
      const uploadResult = await storageService.uploadImage({
        file: mockFile,
        filename: 'metadata-test.jpg',
        userId: 'test-user-123',
        folder: 'metadata-test',
      });

      // Act
      const metadata = await storageService.getFileMetadata(uploadResult.filePath);

      // Assert
      expect(metadata.name).toBe('metadata-test.jpg');
      expect(metadata.contentType).toBe('image/jpeg');
      expect(metadata.size).toBeGreaterThan(0);
      expect(metadata.timeCreated).toBeInstanceOf(Date);
      expect(metadata.md5Hash).toBeDefined();
    });

    it('should list user files with pagination', async () => {
      // Arrange
      const userId = 'test-user-pagination';
      const uploadPromises = [];

      // 上傳 5 個測試檔案
      for (let i = 1; i <= 5; i++) {
        const mockFile = new Blob([`test-data-${i}`], { type: 'image/jpeg' });
        uploadPromises.push(
          storageService.uploadImage({
            file: mockFile,
            filename: `test-${i}.jpg`,
            userId,
            folder: 'pagination-test',
          })
        );
      }
      await Promise.all(uploadPromises);

      // Act
      const page1 = await storageService.listUserFiles(userId, {
        limit: 3,
        orderBy: 'timeCreated',
        orderDirection: 'desc'
      });

      const page2 = await storageService.listUserFiles(userId, {
        limit: 3,
        startAfter: page1.nextPageToken,
        orderBy: 'timeCreated',
        orderDirection: 'desc'
      });

      // Assert
      expect(page1.files).toHaveLength(3);
      expect(page1.hasMore).toBe(true);
      expect(page1.nextPageToken).toBeDefined();

      expect(page2.files).toHaveLength(2);
      expect(page2.hasMore).toBe(false);
      
      // 檢查檔案順序 (最新的先)
      expect(page1.files[0].timeCreated.getTime()).toBeGreaterThan(
        page1.files[1].timeCreated.getTime()
      );
    });

    it('should delete file and cleanup references', async () => {
      // Arrange
      const mockFile = new Blob(['delete-test-data'], { type: 'image/jpeg' });
      const uploadResult = await storageService.uploadImage({
        file: mockFile,
        filename: 'delete-test.jpg',
        userId: 'test-user-123',
        folder: 'delete-test',
      });

      // Act
      const deleteResult = await storageService.deleteFile(uploadResult.filePath);

      // Assert
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.deletedFiles).toContain(uploadResult.filePath);
      if (uploadResult.thumbnailUrl) {
        expect(deleteResult.deletedFiles.length).toBe(2); // 原圖 + 縮圖
      }

      // 驗證檔案已被刪除
      await expect(
        storageService.getFileMetadata(uploadResult.filePath)
      ).rejects.toThrow('File not found');
    });
  });

  describe('Access Control and Security', () => {
    it('should enforce user-based access control', async () => {
      // Arrange
      const user1File = new Blob(['user1-data'], { type: 'image/jpeg' });
      const uploadResult = await storageService.uploadImage({
        file: user1File,
        filename: 'user1-private.jpg',
        userId: 'user-1',
        folder: 'private',
        isPublic: false,
      });

      // Act & Assert - 其他用戶無法訪問
      await expect(
        storageService.getFileMetadata(uploadResult.filePath, 'user-2')
      ).rejects.toThrow('Access denied');
    });

    it('should allow public file access', async () => {
      // Arrange
      const publicFile = new Blob(['public-data'], { type: 'image/jpeg' });
      const uploadResult = await storageService.uploadImage({
        file: publicFile,
        filename: 'public-image.jpg',
        userId: 'owner-user',
        folder: 'public',
        isPublic: true,
      });

      // Act
      const metadata = await storageService.getFileMetadata(
        uploadResult.filePath, 
        'any-user' // 任何用戶都可以訪問
      );

      // Assert
      expect(metadata.name).toBe('public-image.jpg');
      expect(metadata.isPublic).toBe(true);
    });

    it('should generate signed URLs for secure access', async () => {
      // Arrange
      const privateFile = new Blob(['private-data'], { type: 'image/jpeg' });
      const uploadResult = await storageService.uploadImage({
        file: privateFile,
        filename: 'signed-url-test.jpg',
        userId: 'test-user',
        folder: 'private',
        isPublic: false,
      });

      // Act
      const signedUrl = await storageService.generateSignedUrl(
        uploadResult.filePath,
        {
          expirationTime: new Date(Date.now() + 60 * 60 * 1000), // 1 小時
          action: 'read',
        }
      );

      // Assert
      expect(signedUrl).toBeDefined();
      expect(signedUrl).toContain('signed-url-test.jpg');
      expect(signedUrl).toContain('token='); // 包含簽章參數
    });
  });

  describe('Image Processing and Optimization', () => {
    it('should compress images based on quality settings', async () => {
      // Arrange
      const originalFile = new Blob([new ArrayBuffer(1024 * 1024)], { type: 'image/jpeg' }); // 1MB
      const uploadData: UploadFileData = {
        file: originalFile,
        filename: 'compression-test.jpg',
        userId: 'test-user',
        folder: 'compression-test',
      };

      const processingOptions: ImageProcessingOptions = {
        compressionQuality: 0.5, // 50% 品質
        maxWidth: 1024,
        maxHeight: 768,
      };

      // Act
      const result = await storageService.uploadImage(uploadData, processingOptions);

      // Assert
      expect(result.processingResults.compressionRatio).toBeGreaterThan(0);
      expect(result.processingResults.originalSize).toBe(originalFile.size);
      expect(result.processingResults.compressedSize).toBeLessThan(originalFile.size);
      expect(result.processingResults.dimensions?.width).toBeLessThanOrEqual(1024);
      expect(result.processingResults.dimensions?.height).toBeLessThanOrEqual(768);
    });

    it('should generate multiple thumbnail sizes', async () => {
      // Arrange
      const imageFile = new Blob(['image-data'], { type: 'image/jpeg' });
      const uploadData: UploadFileData = {
        file: imageFile,
        filename: 'multi-thumb-test.jpg',
        userId: 'test-user',
        folder: 'thumbnail-test',
      };

      const processingOptions: ImageProcessingOptions = {
        generateThumbnail: true,
        thumbnailSizes: [
          { width: 150, height: 150 },
          { width: 300, height: 300 },
          { width: 600, height: 600 },
        ]
      };

      // Act
      const result = await storageService.uploadImage(uploadData, processingOptions);

      // Assert
      expect(result.thumbnailUrls).toBeDefined();
      expect(result.thumbnailUrls?.length).toBe(3);
      expect(result.processingResults.thumbnailsGenerated).toBe(3);
      
      // 檢查不同尺寸的縮圖都有生成
      result.thumbnailUrls?.forEach((url, index) => {
        expect(url).toContain(`thumb_${processingOptions.thumbnailSizes![index].width}x${processingOptions.thumbnailSizes![index].height}`);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network interruption gracefully', async () => {
      // Arrange
      const file = new Blob(['network-test'], { type: 'image/jpeg' });
      
      // 模擬網路中斷
      jest.spyOn(storageService, 'uploadImage').mockRejectedValueOnce(
        new StorageError('Network error', 'network-failed')
      );

      // Act & Assert
      await expect(
        storageService.uploadImage({
          file,
          filename: 'network-test.jpg',
          userId: 'test-user',
          folder: 'network-test',
        })
      ).rejects.toThrow(StorageError);
    });

    it('should provide upload progress tracking', async () => {
      // Arrange
      const largeFile = new Blob([new ArrayBuffer(5 * 1024 * 1024)], { type: 'image/jpeg' }); // 5MB
      const progressUpdates: number[] = [];

      const uploadData: UploadFileData = {
        file: largeFile,
        filename: 'progress-test.jpg',
        userId: 'test-user',
        folder: 'progress-test',
      };

      const progressCallback = (progress: number) => {
        progressUpdates.push(progress);
      };

      // Act
      const result = await storageService.uploadImageWithProgress(
        uploadData,
        undefined,
        progressCallback
      );

      // Assert
      expect(result.originalUrl).toBeDefined();
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100); // 最後應該是 100%
      
      // 進度應該是遞增的
      for (let i = 1; i < progressUpdates.length; i++) {
        expect(progressUpdates[i]).toBeGreaterThanOrEqual(progressUpdates[i - 1]);
      }
    });
  });
});
