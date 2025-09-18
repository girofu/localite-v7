/**
 * ChatScreen Photo Analysis Integration Test
 * 
 * 測試 ChatScreen 的照片分析與 AI 整合功能
 * Day 8-10: 照片分析與問答整合
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import ChatScreen from '../../screens/ChatScreen';

// Define PermissionStatus enum locally to avoid ES module issues
enum PermissionStatus {
  UNDETERMINED = 'undetermined',
  GRANTED = 'granted',
  DENIED = 'denied',
}
import { GoogleAIService } from '../../src/services/GoogleAIService';
import { ImageAnalysisRequest, ImageAnalysisResponse } from '../../src/types/ai.types';
import * as ImagePicker from 'expo-image-picker';

// Mock dependencies
jest.mock('../../src/services/GoogleAIService');

// Mock expo-image-picker with required properties
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchCameraAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{
      uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z',
      width: 800,
      height: 600,
      type: 'image',
      fileName: 'test-photo.jpg',
    }]
  })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{
      uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z',
      width: 800,
      height: 600,
      fileSize: 1024000,
      type: 'image',
      fileName: 'library-photo.jpg',
    }]
  })),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock fetch for image processing
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock assets to avoid path resolution issues
jest.mock('../../data/guide', () => ({
  GUIDES: [
    { id: 'kuron', name: 'KURON', image: 'mock-image', description: 'test' },
  ]
}));

jest.mock('../../data/places', () => ({
  PLACES: [
    { id: 'shinfang', name: '新芳春茶行', image: 'mock-image', description: 'test' },
  ]
}));

const MockedGoogleAIService = jest.mocked(GoogleAIService);
// Note: ImagePicker is now mocked inline above, so we use the mocked module directly
const MockedImagePicker = jest.mocked(ImagePicker);

describe('ChatScreen - Photo Analysis Integration', () => {
  let mockAIService: jest.Mocked<GoogleAIService>;
  const mockProps = {
    onClose: jest.fn(),
    guideId: 'kuron',
    placeId: 'place1',
    onNavigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fetch response for image processing
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: 'https://example.com/image',
      redirected: false,
      arrayBuffer: jest.fn(),
      json: jest.fn(),
      text: jest.fn(),
      clone: jest.fn().mockReturnThis(),
      headers: new Headers(),
    } as unknown as Response);

    mockAIService = {
      sendMessage: jest.fn(),
      analyzeImage: jest.fn(),
      cleanup: jest.fn(),
    } as any;

    MockedGoogleAIService.mockImplementation(() => mockAIService);
  });

  describe('🔴 RED Phase - Photo Analysis Tests', () => {
    it('should handle iOS limited photo library permission', async () => {
      // Mock limited permission
      MockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({
        status: PermissionStatus.GRANTED,
        granted: true,
        expires: 'never',
        canAskAgain: true,
        accessPrivileges: 'limited'
      });

      MockedImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{
          uri: 'test-limited-photo.jpg',
          width: 800,
          height: 600,
          fileSize: 512000,
          type: 'image/jpeg',
          fileName: 'limited-photo.jpg'
        }]
      } as any);

      const { getByTestId } = render(<ChatScreen {...mockProps} />);

      fireEvent.press(getByTestId('add-options-button'));
      fireEvent.press(getByTestId('library-option'));

      await waitFor(() => {
        expect(MockedImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
        });
      });
    });

    it('should show appropriate error message for denied permission', async () => {
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      MockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({
        status: PermissionStatus.DENIED,
        granted: false,
        expires: 'never',
        canAskAgain: false,
      });

      const { getByTestId } = render(<ChatScreen {...mockProps} />);

      fireEvent.press(getByTestId('add-options-button'));
      fireEvent.press(getByTestId('library-option'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          expect.stringContaining('請前往設定 > 隱私與安全性 > 照片')
        );
      });

      mockAlert.mockRestore();
    });

    it('should handle ImagePicker launch errors gracefully', async () => {
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      MockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({
        status: PermissionStatus.GRANTED,
        granted: true,
        expires: 'never',
        canAskAgain: true,
      });

      MockedImagePicker.launchImageLibraryAsync.mockRejectedValueOnce(
        new Error('Permission denied by user')
      );

      const { getByTestId } = render(<ChatScreen {...mockProps} />);

      fireEvent.press(getByTestId('add-options-button'));
      fireEvent.press(getByTestId('library-option'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          expect.stringContaining('選擇照片失敗')
        );
      });

      mockAlert.mockRestore();
    });
  });

  describe('🔴 RED Phase - Photo Analysis Tests', () => {
    it.skip('should handle photo capture and send for AI analysis', async () => {
      // Mock camera result
      const mockImageResult = {
        canceled: false,
        assets: [{
          uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z',
          width: 1920,
          height: 1080,
          fileSize: 1024000,
          type: 'image/jpeg',
          fileName: 'test-photo.jpg'
        }]
      };

      MockedImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({
        status: PermissionStatus.GRANTED,
        granted: true,
        expires: 'never',
        canAskAgain: true
      });

      MockedImagePicker.launchCameraAsync.mockResolvedValueOnce(mockImageResult as any);

      // Mock AI analysis response
      const mockAnalysisResponse: ImageAnalysisResponse = {
        analysis: '這是台北101大樓的照片，是台灣最著名的地標建築之一。',
        confidence: 0.95,
        landmarks: [{
          name: '台北101',
          confidence: 0.95,
          description: '台灣最高的摩天大樓'
        }],
        recommendations: [{
          type: 'attraction',
          name: '觀景台',
          description: '可以上89樓觀景台欣賞台北市景',
          rating: 4.5
        }],
        metadata: {
          model: 'gemini-1.5-flash',
          processingTime: 300,
          imageSize: { width: 1920, height: 1080 },
          tokensUsed: 150,
          estimatedCost: 0.003
        }
      };

      mockAIService.analyzeImage.mockResolvedValueOnce(mockAnalysisResponse);

      // Render component
      render(<ChatScreen {...mockProps} />);

      // Open camera options
      const addButton = screen.getByTestId('add-options-button');
      fireEvent.press(addButton);

      // Select camera option
      const cameraOption = screen.getByTestId('camera-option');
      fireEvent.press(cameraOption);

      // Wait for camera to be called
      await waitFor(() => {
        expect(MockedImagePicker.launchCameraAsync).toHaveBeenCalled();
      });

      // Wait for AI analysis to be called
      await waitFor(() => {
        expect(mockAIService.analyzeImage).toHaveBeenCalledWith(
          expect.objectContaining({
            image: expect.objectContaining({
              buffer: expect.any(Buffer),
              mimeType: 'image/jpeg',
              filename: expect.stringContaining('.jpg')
            }),
            query: expect.stringContaining('分析這張照片')
          })
        );
      });

      // Verify AI analysis result is displayed
      await waitFor(() => {
        const analysisResults = screen.getAllByTestId('ai-analysis-result');
        expect(analysisResults.length).toBeGreaterThan(0);
      });
    });

    it.skip('should handle photo library selection', async () => {
      // Mock library result
      const mockImageResult = {
        canceled: false,
        assets: [{
          uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z',
          width: 1080,
          height: 1920,
          fileSize: 512000,
          type: 'image/jpeg',
          fileName: 'library-photo.jpg'
        }]
      };

      MockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({
        status: PermissionStatus.GRANTED,
        granted: true,
        expires: 'never',
        canAskAgain: true
      });

      MockedImagePicker.launchImageLibraryAsync.mockResolvedValueOnce(mockImageResult as any);
      mockAIService.analyzeImage.mockResolvedValueOnce({
        analysis: '這張照片顯示了新芳春茶行的歷史建築。',
        confidence: 0.88,
        metadata: {
          model: 'gemini-1.5-flash',
          processingTime: 250,
          imageSize: { width: 1080, height: 1920 },
          tokensUsed: 120,
          estimatedCost: 0.0024
        }
      });

      const { getByTestId } = render(<ChatScreen {...mockProps} />);

      // Open options and select library
      fireEvent.press(getByTestId('add-options-button'));
      fireEvent.press(getByTestId('library-option'));

      await waitFor(() => {
        expect(MockedImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockAIService.analyzeImage).toHaveBeenCalled();
      });
    });

    it.skip('should show loading state during photo analysis', async () => {
      // Mock slow analysis
      mockAIService.analyzeImage.mockImplementation(() =>
        new Promise(resolve => {
          setTimeout(() => resolve({
            analysis: 'Analysis complete',
            confidence: 0.9,
            metadata: {
              model: 'gemini-1.5-flash',
              processingTime: 1000,
              imageSize: { width: 1920, height: 1080 },
              tokensUsed: 100,
              estimatedCost: 0.002
            }
          }), 1000);
        })
      );

      MockedImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({
        status: PermissionStatus.GRANTED,
        granted: true,
        expires: 'never',
        canAskAgain: true
      });

      MockedImagePicker.launchCameraAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{
          uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z',
          type: 'image/jpeg',
          fileName: 'test-photo.jpg'
        }]
      } as any);

      const { getByTestId } = render(<ChatScreen {...mockProps} />);

      fireEvent.press(getByTestId('add-options-button'));
      fireEvent.press(getByTestId('camera-option'));

      // Should show photo analysis loading
      await waitFor(() => {
        expect(getByTestId('photo-analysis-loading')).toBeTruthy();
      });
    });

    it.skip('should handle photo analysis errors', async () => {
      mockAIService.analyzeImage.mockRejectedValueOnce(new Error('Analysis failed'));

      MockedImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({
        status: PermissionStatus.GRANTED,
        granted: true,
        expires: 'never',
        canAskAgain: true
      });

      MockedImagePicker.launchCameraAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{
          uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z',
          type: 'image/jpeg',
          fileName: 'test-photo.jpg'
        }]
      } as any);

      const { getByTestId } = render(<ChatScreen {...mockProps} />);

      fireEvent.press(getByTestId('add-options-button'));
      fireEvent.press(getByTestId('camera-option'));

      await waitFor(() => {
        expect(getByTestId('photo-analysis-error')).toBeTruthy();
      });
    });

    it.skip('should allow follow-up questions about the analyzed photo', async () => {
      // First, simulate successful photo analysis
      const analysisResponse: ImageAnalysisResponse = {
        analysis: '這是大稻埕的歷史建築',
        confidence: 0.9,
        metadata: {
          model: 'gemini-1.5-flash',
          processingTime: 200,
          imageSize: { width: 1920, height: 1080 },
          tokensUsed: 80,
          estimatedCost: 0.0016
        }
      };

      mockAIService.analyzeImage.mockResolvedValueOnce(analysisResponse);
      mockAIService.sendMessage.mockResolvedValueOnce({
        content: '這棟建築建於日治時期，具有典型的巴洛克建築風格...',
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          model: 'gemini-1.5-flash',
          tokensUsed: 60,
          estimatedCost: 0.0006,
          processingTime: 150
        }
      });

      // Mock photo result
      MockedImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({
        status: PermissionStatus.GRANTED,
        granted: true,
        expires: 'never',
        canAskAgain: true
      });

      MockedImagePicker.launchCameraAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'building.jpg', type: 'image/jpeg' }]
      } as any);

      const { getByTestId, getByPlaceholderText } = render(<ChatScreen {...mockProps} />);

      // Take photo and analyze
      fireEvent.press(getByTestId('add-options-button'));
      fireEvent.press(getByTestId('camera-option'));

      await waitFor(() => {
        const analysisResults = screen.getAllByTestId('ai-analysis-result');
        expect(analysisResults.length).toBeGreaterThan(0);
      });

      // Ask follow-up question
      const textInput = getByPlaceholderText('輸入你的訊息');
      fireEvent.changeText(textInput, '這棟建築有什麼歷史背景？');
      fireEvent(textInput, 'submitEditing');

      // Should include photo context in follow-up
      await waitFor(() => {
        expect(mockAIService.sendMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            content: '這棟建築有什麼歷史背景？',
            role: 'user'
          }),
          expect.objectContaining({
            useConversationHistory: true
          })
        );
      });
    });
  });
});
