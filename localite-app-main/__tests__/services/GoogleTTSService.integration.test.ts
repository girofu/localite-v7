/**
 * Google Text-to-Speech Service Integration Tests
 * 
 * 測試 Google Cloud Text-to-Speech API 整合功能
 * 包含語音合成、聲音列表、SSML 支援、多語言等核心功能
 * 基於最新的 @google-cloud/text-to-speech SDK
 */

import { GoogleTTSService } from '../../src/services/GoogleTTSService';
import { 
  TTSRequest,
  TTSResponse,
  Voice,
  AudioConfig,
  SSMLRequest,
  StreamingTTSOptions,
  TTSServiceError,
  LanguageCode,
  AudioEncoding
} from '../../src/types/tts.types';

describe('GoogleTTSService Integration Tests', () => {
  let ttsService: GoogleTTSService;
  
  beforeEach(async () => {
    ttsService = new GoogleTTSService();
    // 確保快取是空的
    await ttsService.cleanup();
  });

  afterEach(async () => {
    // 清理測試音頻檔案
    await ttsService.cleanup();
  });

  describe('Basic Speech Synthesis', () => {
    it('should synthesize speech from Chinese text', async () => {
      // Arrange
      const request: TTSRequest = {
        text: '歡迎來到台北！這裡有很多美食和景點等著您探索。',
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Wavenet-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      // Act
      const response = await ttsService.synthesizeSpeech(request);

      // Assert
      expect(response.audioContent).toBeDefined();
      expect(response.audioContent.length).toBeGreaterThan(0);
      expect(response.metadata?.audioFormat).toBe('MP3');
      expect(response.metadata?.duration).toBeGreaterThan(0);
      expect(response.metadata?.size).toBeGreaterThan(0);
      expect(response.metadata?.voiceUsed.languageCode).toBe('zh-TW');
      expect(response.metadata?.textLength).toBe(request.text.length);
    });

    it('should synthesize speech from English text', async () => {
      // Arrange
      const request: TTSRequest = {
        text: 'Welcome to Taipei! There are many delicious foods and attractions waiting for you to explore.',
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Wavenet-D',
          ssmlGender: 'MALE'
        },
        audioConfig: {
          audioEncoding: 'WAV',
          speakingRate: 0.9,
          pitch: -2.0,
          volumeGainDb: 2.0
        }
      };

      // Act
      const response = await ttsService.synthesizeSpeech(request);

      // Assert
      expect(response.audioContent).toBeDefined();
      expect(response.audioContent.length).toBeGreaterThan(0);
      expect(response.metadata?.audioFormat).toBe('WAV');
      expect(response.metadata?.voiceUsed.languageCode).toBe('en-US');
      expect(response.metadata?.voiceUsed.ssmlGender).toBe('MALE');
    });

    it('should handle different audio configurations', async () => {
      // Arrange
      const configurations = [
        { encoding: 'MP3' as AudioEncoding, rate: 0.8, pitch: -1.0 },
        { encoding: 'WAV' as AudioEncoding, rate: 1.2, pitch: 1.0 },
        { encoding: 'OGG_OPUS' as AudioEncoding, rate: 1.0, pitch: 0.0 }
      ];

      // Act & Assert
      for (const config of configurations) {
        const request: TTSRequest = {
          text: '測試不同的音頻配置參數。',
          voice: {
            languageCode: 'zh-TW',
            name: 'zh-TW-Standard-B',
            ssmlGender: 'MALE'
          },
          audioConfig: {
            audioEncoding: config.encoding,
            speakingRate: config.rate,
            pitch: config.pitch,
            volumeGainDb: 0.0
          }
        };

        const response = await ttsService.synthesizeSpeech(request);
        
        expect(response.audioContent).toBeDefined();
        expect(response.metadata?.audioFormat).toBe(config.encoding);
        expect(response.metadata?.voiceUsed.ssmlGender).toBe('MALE');
      }
    });
  });

  describe('Voice Management', () => {
    it('should list available voices for Chinese', async () => {
      // Act
      const voices = await ttsService.listVoices('zh-TW');

      // Assert
      expect(voices).toBeDefined();
      expect(voices.length).toBeGreaterThan(0);
      
      voices.forEach(voice => {
        expect(voice.languageCode).toBe('zh-TW');
        expect(voice.name).toBeDefined();
        expect(voice.ssmlGender).toMatch(/MALE|FEMALE|NEUTRAL/);
        expect(voice.naturalSampleRateHertz).toBeGreaterThan(0);
      });

      // 確保有 WaveNet 和 Standard 聲音
      const wavenetVoices = voices.filter(v => v.name.includes('Wavenet'));
      const standardVoices = voices.filter(v => v.name.includes('Standard'));
      expect(wavenetVoices.length).toBeGreaterThan(0);
      expect(standardVoices.length).toBeGreaterThan(0);
    });

    it('should list all available voices', async () => {
      // Act
      const allVoices = await ttsService.listVoices();

      // Assert
      expect(allVoices).toBeDefined();
      expect(allVoices.length).toBeGreaterThan(10); // 預期有很多語言

      // 檢查是否包含中文和英文
      const chineseVoices = allVoices.filter(v => v.languageCode.includes('zh'));
      const englishVoices = allVoices.filter(v => v.languageCode.includes('en'));
      
      expect(chineseVoices.length).toBeGreaterThan(0);
      expect(englishVoices.length).toBeGreaterThan(0);

      // 檢查語音品質分級
      const wavenetCount = allVoices.filter(v => v.name.includes('Wavenet')).length;
      const standardCount = allVoices.filter(v => v.name.includes('Standard')).length;
      
      expect(wavenetCount).toBeGreaterThan(0);
      expect(standardCount).toBeGreaterThan(0);
    });

    it('should find best voice for language and gender', async () => {
      // Act
      const femaleVoice = await ttsService.findBestVoice('zh-TW', 'FEMALE');
      const maleVoice = await ttsService.findBestVoice('en-US', 'MALE');

      // Assert
      expect(femaleVoice).toBeDefined();
      expect(femaleVoice.languageCode).toBe('zh-TW');
      expect(femaleVoice.ssmlGender).toBe('FEMALE');
      expect(femaleVoice.name).toContain('Wavenet'); // 應該優先選擇高品質聲音

      expect(maleVoice).toBeDefined();
      expect(maleVoice.languageCode).toBe('en-US');
      expect(maleVoice.ssmlGender).toBe('MALE');
    });
  });

  describe('SSML Support', () => {
    it('should handle SSML markup for enhanced speech', async () => {
      // Arrange
      const ssmlRequest: SSMLRequest = {
        ssml: `
          <speak>
            <p>
              歡迎來到 <emphasis level="strong">台北101</emphasis>！
            </p>
            <p>
              請注意，<break time="500ms"/>觀景台開放時間為
              <prosody rate="slow" pitch="low">上午九點到晚上十點</prosody>。
            </p>
            <p>
              謝謝！<break time="1s"/>祝您旅途愉快！
            </p>
          </speak>
        `,
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Wavenet-C',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      // Act
      const response = await ttsService.synthesizeSSML(ssmlRequest);

      // Assert
      expect(response.audioContent).toBeDefined();
      expect(response.audioContent.length).toBeGreaterThan(0);
      expect(response.metadata?.isSSML).toBe(true);
      expect(response.metadata?.voiceUsed.languageCode).toBe('zh-TW');
      expect(response.metadata?.duration).toBeGreaterThan(3000); // 應該包含暫停時間
    });

    it('should handle multilingual SSML content', async () => {
      // Arrange
      const multilingualSSML: SSMLRequest = {
        ssml: `
          <speak>
            <p lang="zh-TW">歡迎來到台灣！</p>
            <break time="1s"/>
            <p lang="en-US">Welcome to Taiwan!</p>
            <break time="1s"/>
            <p lang="ja-JP">台湾へようこそ！</p>
          </speak>
        `,
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Wavenet-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      // Act
      const response = await ttsService.synthesizeSSML(multilingualSSML);

      // Assert
      expect(response.audioContent).toBeDefined();
      expect(response.metadata?.isSSML).toBe(true);
      expect(response.metadata?.isMultilingual).toBe(true);
    });

    it('should validate SSML markup', async () => {
      // Arrange
      const invalidSSMLRequest: SSMLRequest = {
        ssml: '<speak><invalid-tag>測試</invalid-tag></speak>',
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Standard-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      // Act & Assert
      await expect(
        ttsService.synthesizeSSML(invalidSSMLRequest)
      ).rejects.toThrow(TTSServiceError);

      try {
        await ttsService.synthesizeSSML(invalidSSMLRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(TTSServiceError);
        expect((error as TTSServiceError).code).toBe('invalid_ssml');
      }
    });
  });

  describe('Streaming and Long Audio', () => {
    it('should handle streaming synthesis for real-time output', async () => {
      // Arrange
      const request: TTSRequest = {
        text: '這是一段比較長的文字，用來測試流式語音合成功能。我們會將這段文字分成多個部分來處理，並且即時回傳音頻資料給用戶。這樣可以減少等待時間，提供更好的用戶體驗。',
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Wavenet-B',
          ssmlGender: 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      const chunks: Buffer[] = [];
      const options: StreamingTTSOptions = {
        onAudioChunk: (chunk: Buffer) => {
          chunks.push(chunk);
        },
        onProgress: (progress: number) => {
          expect(progress).toBeGreaterThanOrEqual(0);
          expect(progress).toBeLessThanOrEqual(100);
        },
        onComplete: (response: TTSResponse) => {
          expect(response.audioContent).toBeDefined();
        },
        onError: (error: Error) => {
          throw error;
        }
      };

      // Act
      const finalResponse = await ttsService.streamingSynthesize(request, options);

      // Assert
      expect(chunks.length).toBeGreaterThan(1); // 應該有多個音頻塊
      expect(finalResponse.audioContent).toBeDefined();
      expect(finalResponse.metadata?.isStreaming).toBe(true);
      
      // 合併的音頻塊應該等於最終回應
      const combinedAudio = Buffer.concat(chunks);
      expect(combinedAudio.length).toBe(finalResponse.audioContent.length);
    });

    it('should synthesize long audio content efficiently', async () => {
      // Arrange
      const longText = Array(10).fill('這是一段長文字測試。').join(' ') + 
        '台北市有許多著名的景點，包括台北101、中正紀念堂、故宮博物院等等。' +
        '每個地方都有其獨特的歷史背景和文化價值，非常值得遊客前往參觀。';

      const request: TTSRequest = {
        text: longText,
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Wavenet-C',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      // Act
      const startTime = Date.now();
      const response = await ttsService.synthesizeLongAudio(request);
      const processingTime = Date.now() - startTime;

      // Assert
      expect(response.audioContent).toBeDefined();
      expect(response.audioContent.length).toBeGreaterThan(0);
      expect(response.metadata?.isLongAudio).toBe(true);
      expect(response.metadata?.textLength).toBe(longText.length);
      expect(response.metadata?.duration).toBeGreaterThan(10000); // 超過 10 秒
      expect(processingTime).toBeLessThan(30000); // 應該在 30 秒內完成
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid language codes gracefully', async () => {
      // Arrange
      const invalidRequest: TTSRequest = {
        text: '測試無效語言代碼',
        voice: {
          languageCode: 'invalid-language' as LanguageCode,
          name: 'invalid-voice',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      // Act & Assert
      await expect(
        ttsService.synthesizeSpeech(invalidRequest)
      ).rejects.toThrow(TTSServiceError);

      try {
        await ttsService.synthesizeSpeech(invalidRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(TTSServiceError);
        expect((error as TTSServiceError).code).toBe('invalid_voice');
      }
    });

    it('should handle empty text input', async () => {
      // Arrange
      const emptyRequest: TTSRequest = {
        text: '',
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Standard-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      // Act & Assert
      await expect(
        ttsService.synthesizeSpeech(emptyRequest)
      ).rejects.toThrow(TTSServiceError);

      try {
        await ttsService.synthesizeSpeech(emptyRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(TTSServiceError);
        expect((error as TTSServiceError).code).toBe('empty_text');
      }
    });

    it('should handle extreme audio configuration values', async () => {
      // Arrange
      const extremeRequest: TTSRequest = {
        text: '測試極端參數值',
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Standard-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.25, // 極慢
          pitch: -20.0,       // 極低音
          volumeGainDb: 16.0  // 極大音量
        }
      };

      // Act
      const response = await ttsService.synthesizeSpeech(extremeRequest);

      // Assert
      expect(response.audioContent).toBeDefined();
      expect(response.metadata?.voiceUsed.languageCode).toBe('zh-TW');
      expect(response.metadata?.warnings).toBeDefined();
      expect(response.metadata?.warnings).toContain('extreme_parameters');
    });

    it('should handle network timeouts and retries', async () => {
      // Arrange
      const slowService = new GoogleTTSService({
        timeout: 100, // 很短的超時時間
        retryAttempts: 2
      });

      const request: TTSRequest = {
        text: '測試網路超時和重試機制',
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Standard-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      // Act & Assert
      await expect(
        slowService.synthesizeSpeech(request)
      ).rejects.toThrow(TTSServiceError);

      try {
        await slowService.synthesizeSpeech(request);
      } catch (error) {
        expect(error).toBeInstanceOf(TTSServiceError);
        expect((error as TTSServiceError).code).toMatch(/timeout|network/);
        expect((error as TTSServiceError).retryCount).toBe(2);
      }
    });
  });

  describe('File Management and Caching', () => {
    it('should save audio to file and retrieve metadata', async () => {
      // Arrange
      const request: TTSRequest = {
        text: '測試音頻檔案儲存功能',
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Wavenet-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      // Act
      const response = await ttsService.synthesizeSpeech(request);
      const filePath = await ttsService.saveToFile(response, 'test-output');

      // Assert
      expect(filePath).toBeDefined();
      expect(filePath).toMatch(/\.mp3$/);
      
      const fileMetadata = await ttsService.getAudioFileMetadata(filePath);
      expect(fileMetadata.size).toBeGreaterThan(0);
      expect(fileMetadata.format).toBe('MP3');
      expect(fileMetadata.duration).toBeGreaterThan(0);
      expect(fileMetadata.createdAt).toBeInstanceOf(Date);
    });

    it('should support cache functionality', async () => {
      // Arrange
      const request: TTSRequest = {
        text: '測試快取基本功能',
        voice: {
          languageCode: 'zh-TW',
          name: 'zh-TW-Standard-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      // Act
      const response = await ttsService.synthesizeSpeech(request);
      const cacheStats = await ttsService.getCacheStats();

      // Assert
      expect(response.audioContent).toBeDefined();
      expect(cacheStats.totalEntries).toBeGreaterThanOrEqual(0);
      expect(cacheStats.totalSize).toBeGreaterThanOrEqual(0);
    });

    it('should clean up temporary files and cache', async () => {
      // Arrange
      const requests = Array.from({ length: 3 }, (_, i) => ({
        text: `測試檔案清理 ${i + 1}`,
        voice: {
          languageCode: 'zh-TW' as LanguageCode,
          name: 'zh-TW-Standard-A',
          ssmlGender: 'FEMALE' as const
        },
        audioConfig: {
          audioEncoding: 'MP3' as AudioEncoding,
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      }));

      // Act
      const responses = await Promise.all(
        requests.map(req => ttsService.synthesizeSpeech(req))
      );
      
      const filePaths = await Promise.all(
        responses.map((res, i) => ttsService.saveToFile(res, `cleanup-test-${i}`))
      );

      // 檢查檔案存在
      filePaths.forEach(async (filePath) => {
        const metadata = await ttsService.getAudioFileMetadata(filePath);
        expect(metadata.size).toBeGreaterThan(0);
      });

      // 執行清理
      await ttsService.cleanup();

      // Assert
      // 檢查檔案是否被清理（在實際環境中，這可能會保留一些檔案用於快取）
      const cacheStats = await ttsService.getCacheStats();
      expect(cacheStats.totalEntries).toBe(0);
      expect(cacheStats.totalSize).toBe(0);
    });
  });

  describe('Advanced Features and Integration', () => {
    it('should support batch processing of multiple texts', async () => {
      // Arrange
      const batchRequests: TTSRequest[] = [
        {
          text: '第一段語音內容',
          voice: { languageCode: 'zh-TW', name: 'zh-TW-Standard-A', ssmlGender: 'FEMALE' },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0, pitch: 0.0, volumeGainDb: 0.0 }
        },
        {
          text: '第二段語音內容',
          voice: { languageCode: 'zh-TW', name: 'zh-TW-Standard-B', ssmlGender: 'MALE' },
          audioConfig: { audioEncoding: 'WAV', speakingRate: 1.1, pitch: 1.0, volumeGainDb: 0.0 }
        },
        {
          text: 'Third piece of audio content in English',
          voice: { languageCode: 'en-US', name: 'en-US-Standard-C', ssmlGender: 'FEMALE' },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9, pitch: -1.0, volumeGainDb: 0.0 }
        }
      ];

      // Act
      const batchResponses = await ttsService.batchSynthesize(batchRequests);

      // Assert
      expect(batchResponses).toHaveLength(3);
      batchResponses.forEach((response, index) => {
        expect(response.audioContent).toBeDefined();
        expect(response.audioContent.length).toBeGreaterThan(0);
        expect(response.metadata?.batchIndex).toBe(index);
        expect(response.metadata?.voiceUsed.languageCode).toBe(batchRequests[index].voice.languageCode);
      });
    });

    it('should provide detailed usage statistics', async () => {
      // Arrange
      const requests = [
        '這是第一個統計測試',
        '這是第二個統計測試，內容稍長一些',
        'This is an English test for usage statistics'
      ];

      // Act
      for (const text of requests) {
        await ttsService.synthesizeSpeech({
          text,
          voice: { languageCode: 'zh-TW', name: 'zh-TW-Standard-A', ssmlGender: 'FEMALE' },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0, pitch: 0.0, volumeGainDb: 0.0 }
        });
      }

      const stats = await ttsService.getUsageStats();

      // Assert
      expect(stats.totalRequests).toBe(3);
      expect(stats.totalCharacters).toBeGreaterThan(0);
      expect(stats.totalAudioDuration).toBeGreaterThan(0);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(stats.languageBreakdown['zh-TW']).toBeGreaterThan(0);
      expect(stats.voiceUsage['zh-TW-Standard-A']).toBe(3);
    });

    it('should support custom voice profiles and settings', async () => {
      // Arrange
      const customProfile = {
        name: 'tourist-guide-voice',
        preferredLanguages: ['zh-TW', 'en-US'],
        defaultSettings: {
          speakingRate: 0.9,
          pitch: 0.0,
          volumeGainDb: 2.0
        },
        voicePreferences: {
          'zh-TW': { gender: 'FEMALE', quality: 'Wavenet' },
          'en-US': { gender: 'MALE', quality: 'Standard' }
        }
      };

      // Act
      await ttsService.createVoiceProfile(customProfile);
      
      const profileResponse = await ttsService.synthesizeWithProfile(
        '歡迎使用客製化語音導覽服務！',
        'tourist-guide-voice',
        'zh-TW'
      );

      // Assert
      expect(profileResponse.audioContent).toBeDefined();
      expect(profileResponse.metadata?.profileUsed).toBe('tourist-guide-voice');
      expect(profileResponse.metadata?.voiceUsed.ssmlGender).toBe('FEMALE');
      expect(profileResponse.metadata?.voiceUsed.name).toContain('Wavenet');
    });
  });
});
