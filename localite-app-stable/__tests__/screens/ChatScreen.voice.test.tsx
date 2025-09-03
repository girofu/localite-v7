/**
 * ChatScreen Voice Control Integration Test
 * 
 * 測試 ChatScreen 的語音播放控制功能
 * Day 8-10: 語音播放控制
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import ChatScreen from '../../screens/ChatScreen';
import { GoogleTTSService } from '../../src/services/GoogleTTSService';
import { TTSRequest, TTSResponse } from '../../src/types/tts.types';
import { ChatResponse } from '../../src/types/chat.types';

// Mock dependencies
jest.mock('../../src/services/GoogleTTSService');
jest.mock('../../src/services/GoogleAIService');

const MockedGoogleTTSService = jest.mocked(GoogleTTSService);

describe('ChatScreen - Voice Control Integration', () => {
  let mockTTSService: jest.Mocked<GoogleTTSService>;
  const mockProps = {
    onClose: jest.fn(),
    guideId: 'kuron',
    placeId: 'place1',
    onNavigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockTTSService = {
      synthesizeText: jest.fn(),
      getAvailableVoices: jest.fn(),
      playAudio: jest.fn(),
      pauseAudio: jest.fn(),
      stopAudio: jest.fn(),
      cleanup: jest.fn(),
    } as any;

    MockedGoogleTTSService.mockImplementation(() => mockTTSService);
  });

  describe('🔴 RED Phase - Voice Control Tests', () => {
    it('should show voice play button for AI messages', async () => {
      const { getAllByTestId } = render(<ChatScreen {...mockProps} />);
      
      // Should have voice buttons for AI messages
      await waitFor(() => {
        const voiceButtons = getAllByTestId('voice-play-button');
        expect(voiceButtons.length).toBeGreaterThan(0);
      });
    });

    it('should synthesize and play AI message text when voice button is pressed', async () => {
      const mockTTSResponse: TTSResponse = {
        audioContent: Buffer.from('mock-audio-data'),
        audioBuffer: Buffer.from('mock-audio-data'),
        audioConfig: {
          audioEncoding: 'MP3',
          sampleRateHertz: 24000,
          effectsProfileId: ['telephony-class-application']
        },
        metadata: {
          audioFormat: 'MP3' as const,
          duration: 1000,
          size: 10240,
          textLength: 50,
          voiceUsed: {
            languageCode: 'zh-TW' as const,
            name: 'zh-TW-Standard-A',
            ssmlGender: 'FEMALE' as const
          },
          processingTime: 200,
          model: 'neural2',
          charactersProcessed: 50,
          billableCharacters: 50,
          estimatedCost: 0.001
        }
      };

      mockTTSService.synthesizeText.mockResolvedValueOnce(mockTTSResponse);
      mockTTSService.playAudio.mockResolvedValueOnce();

      const { getAllByTestId } = render(<ChatScreen {...mockProps} />);

      const voiceButtons = getAllByTestId('voice-play-button');
      const voiceButton = voiceButtons[1]; // Use second voice button for second AI message
      fireEvent.press(voiceButton);

      // Should call TTS service to synthesize text
      await waitFor(() => {
        expect(mockTTSService.synthesizeText).toHaveBeenCalledWith(
          '新芳春茶行測試描述', // Second AI message content
          expect.objectContaining({
            languageCode: 'zh-TW',
            voiceConfig: expect.objectContaining({
              languageCode: 'zh-TW',
              name: expect.stringContaining('zh-TW')
            })
          })
        );
      });

      // Should play the synthesized audio
      expect(mockTTSService.playAudio).toHaveBeenCalledWith(
        mockTTSResponse.audioBuffer
      );
    });

    it('should show pause button when voice is playing', async () => {
      mockTTSService.synthesizeText.mockResolvedValueOnce({
        audioContent: Buffer.from('audio'),
        audioBuffer: Buffer.from('audio'),
        audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 24000 },
        metadata: {
          audioFormat: 'MP3' as const,
          duration: 500,
          size: 5120,
          textLength: 20,
          voiceUsed: {
            languageCode: 'zh-TW' as const,
            name: 'zh-TW-Standard-A',
            ssmlGender: 'FEMALE' as const
          },
          processingTime: 100,
          model: 'neural2',
          charactersProcessed: 20,
          billableCharacters: 20,
          estimatedCost: 0.0005
        }
      });

      const { getAllByTestId } = render(<ChatScreen {...mockProps} />);

      const playButtons = getAllByTestId('voice-play-button');
      const playButton = playButtons[0];
      fireEvent.press(playButton);

      // Should show pause button when playing
      await waitFor(() => {
        expect(getAllByTestId('voice-pause-button')).toBeTruthy();
      });
    });

    it('should pause voice playback when pause button is pressed', async () => {
      mockTTSService.synthesizeText.mockResolvedValueOnce({
        audioContent: Buffer.from('audio'),
        audioBuffer: Buffer.from('audio'),
        audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 24000 },
        metadata: {
          audioFormat: 'MP3' as const,
          duration: 500,
          size: 5120,
          textLength: 20,
          voiceUsed: {
            languageCode: 'zh-TW' as const,
            name: 'zh-TW-Standard-A',
            ssmlGender: 'FEMALE' as const
          },
          processingTime: 100,
          model: 'neural2',
          charactersProcessed: 20,
          billableCharacters: 20,
          estimatedCost: 0.0005
        }
      });

      const { getAllByTestId, getByTestId } = render(<ChatScreen {...mockProps} />);

      // Start playing first voice button
      const voiceButtons = getAllByTestId('voice-play-button');
      const playButton = voiceButtons[0];
      fireEvent.press(playButton);

      await waitFor(() => {
        expect(getByTestId('voice-pause-button')).toBeTruthy();
      });

      // Pause playback
      const pauseButton = getByTestId('voice-pause-button');
      fireEvent.press(pauseButton);

      expect(mockTTSService.pauseAudio).toHaveBeenCalled();
    });

    it('should show loading state while synthesizing voice', async () => {
      // Mock slow TTS synthesis
      mockTTSService.synthesizeText.mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => resolve({
            audioContent: Buffer.from('audio'),
            audioBuffer: Buffer.from('audio'),
            audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 24000 },
            metadata: {
              audioFormat: 'MP3' as const,
              duration: 1000,
              size: 10240,
              textLength: 20,
              voiceUsed: {
                languageCode: 'zh-TW' as const,
                name: 'zh-TW-Standard-A',
                ssmlGender: 'FEMALE' as const
              },
              processingTime: 1000,
              model: 'neural2',
              charactersProcessed: 20,
              billableCharacters: 20,
              estimatedCost: 0.0005
            }
          }), 500);
        })
      );

      const { getAllByTestId, getByTestId } = render(<ChatScreen {...mockProps} />);

      const voiceButtons = getAllByTestId('voice-play-button');
      const playButton = voiceButtons[0];
      fireEvent.press(playButton);

      // Should show TTS loading state
      expect(getByTestId('voice-loading-indicator')).toBeTruthy();
    });

    it('should handle TTS synthesis errors gracefully', async () => {
      mockTTSService.synthesizeText.mockRejectedValueOnce(new Error('TTS synthesis failed'));

      const { getAllByTestId, getByTestId } = render(<ChatScreen {...mockProps} />);

      const voiceButtons = getAllByTestId('voice-play-button');
      const playButton = voiceButtons[0];
      fireEvent.press(playButton);

      // Should show error state - wait for TTS error to be handled
      await waitFor(() => {
        expect(getByTestId('voice-error-indicator')).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should allow voice control for both initial and AI response messages', async () => {
      // 模擬 AI 服務以返回一個回應
      const mockAIService = {
        sendMessage: jest.fn().mockResolvedValue({
          content: '這是一個測試回應',
          role: 'assistant',
          timestamp: new Date(),
          id: 'response-1'
        } as ChatResponse),
        cleanup: jest.fn()
      };

      jest.doMock('../../src/services/GoogleAIService', () => ({
        GoogleAIService: jest.fn(() => mockAIService)
      }));

      const { getAllByTestId, getByPlaceholderText } = render(<ChatScreen {...mockProps} />);
      
      // Initial voice buttons should exist
      let voiceButtons = getAllByTestId('voice-play-button');
      expect(voiceButtons.length).toBeGreaterThan(0);

      // Send a message to generate AI response
      const textInput = getByPlaceholderText('輸入你的訊息');
      fireEvent.changeText(textInput, 'Hello');
      fireEvent(textInput, 'submitEditing');

      // Check that voice functionality works for all AI messages
      const finalVoiceButtons = getAllByTestId('voice-play-button');
      expect(finalVoiceButtons.length).toBeGreaterThan(0);

      // Test that each voice button is functional
      finalVoiceButtons.forEach((button, index) => {
        expect(button).toBeTruthy();
      });
    });

    it('should initialize TTS service with correct voice configuration', () => {
      render(<ChatScreen {...mockProps} />);

      expect(MockedGoogleTTSService).toHaveBeenCalledWith(
        expect.objectContaining({
          enableCaching: true,
          cacheSize: 50,
          cacheTTL: 1800,
          enableLogging: true
        })
      );
    });

    it('should cleanup TTS service on unmount', () => {
      const { unmount } = render(<ChatScreen {...mockProps} />);
      unmount();

      expect(mockTTSService.cleanup).toHaveBeenCalled();
    });
  });

  describe('🟢 GREEN Phase - Advanced Voice Features', () => {
    it.skip('should support different voice types based on guide character', async () => {
      // TODO: Implement different voices for different guide characters
    });

    it.skip('should support voice speed control', async () => {
      // TODO: Implement playback speed control
    });
  });
});
