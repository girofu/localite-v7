/**
 * Expo Speech TTS Service
 *
 * 使用 expo-speech 實現真實的文字轉語音功能
 */

import * as Speech from 'expo-speech';

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
  volume?: number;
}

export interface SpeechState {
  isSpeaking: boolean;
  currentText: string | null;
  voices: Speech.Voice[];
}

export class ExpoSpeechService {
  private state: SpeechState = {
    isSpeaking: false,
    currentText: null,
    voices: [],
  };

  private listeners: ((state: SpeechState) => void)[] = [];

  constructor() {
    this.initializeVoices();
  }

  /**
   * 訂閱狀態變化
   */
  subscribe(listener: (state: SpeechState) => void): () => void {
    this.listeners.push(listener);

    // 返回取消訂閱函數
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有監聽器狀態變化
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  /**
   * 初始化語音列表
   */
  private async initializeVoices(): void {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      this.state.voices = voices;
      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to get available voices:', error);
    }
  }

  /**
   * 說話
   */
  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // 停止當前語音
    if (this.state.isSpeaking) {
      await this.stop();
    }

    this.state.currentText = text;
    this.state.isSpeaking = true;
    this.notifyListeners();

    try {
      const speechOptions: Speech.SpeechOptions = {
        language: options.language || 'zh-TW',
        pitch: options.pitch || 1.0,
        rate: options.rate || 1.0,
        voice: options.voice,
        volume: options.volume || 1.0,
        onStart: () => {
          this.state.isSpeaking = true;
          this.notifyListeners();
        },
        onDone: () => {
          this.state.isSpeaking = false;
          this.state.currentText = null;
          this.notifyListeners();
        },
        onError: (error) => {
          console.error('Speech error:', error);
          this.state.isSpeaking = false;
          this.state.currentText = null;
          this.notifyListeners();
        },
        onStopped: () => {
          this.state.isSpeaking = false;
          this.state.currentText = null;
          this.notifyListeners();
        },
      };

      await Speech.speak(text, speechOptions);
    } catch (error) {
      this.state.isSpeaking = false;
      this.state.currentText = null;
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * 停止語音
   */
  async stop(): Promise<void> {
    try {
      await Speech.stop();
      this.state.isSpeaking = false;
      this.state.currentText = null;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to stop speech:', error);
      throw error;
    }
  }

  /**
   * 暫停語音
   */
  async pause(): Promise<void> {
    try {
      await Speech.pause();
    } catch (error) {
      console.error('Failed to pause speech:', error);
      throw error;
    }
  }

  /**
   * 繼續語音
   */
  async resume(): Promise<void> {
    try {
      await Speech.resume();
    } catch (error) {
      console.error('Failed to resume speech:', error);
      throw error;
    }
  }

  /**
   * 檢查是否正在說話
   */
  isSpeaking(): boolean {
    return this.state.isSpeaking;
  }

  /**
   * 獲取當前語音文字
   */
  getCurrentText(): string | null {
    return this.state.currentText;
  }

  /**
   * 獲取可用語音列表
   */
  getAvailableVoices(): Speech.Voice[] {
    return [...this.state.voices];
  }

  /**
   * 根據語言和性別查找最佳語音
   */
  findBestVoice(language: string, gender?: 'MALE' | 'FEMALE'): Speech.Voice | null {
    const filteredVoices = this.state.voices.filter(voice => {
      if (voice.language !== language) return false;
      if (gender && voice.quality !== gender) return false;
      return true;
    });

    // 優先選擇高品質語音
    const highQualityVoices = filteredVoices.filter(voice => voice.quality === 'Enhanced' || voice.quality === 'Default');
    if (highQualityVoices.length > 0) {
      return highQualityVoices[0];
    }

    return filteredVoices.length > 0 ? filteredVoices[0] : null;
  }

  /**
   * 獲取服務狀態
   */
  getState(): SpeechState {
    return { ...this.state };
  }

  /**
   * 獲取支援的語言列表
   */
  getSupportedLanguages(): string[] {
    const languages = new Set(this.state.voices.map(voice => voice.language));
    return Array.from(languages);
  }

  /**
   * 測試語音功能
   */
  async testSpeech(text: string = '您好，這是語音測試'): Promise<void> {
    await this.speak(text, {
      language: 'zh-TW',
      rate: 0.8,
      pitch: 1.0,
    });
  }
}
