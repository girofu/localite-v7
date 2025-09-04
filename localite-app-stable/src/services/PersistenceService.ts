import AsyncStorage from '@react-native-async-storage/async-storage';

// 數據持久化服務
export class PersistenceService {
  private static readonly VOICE_ENABLED_KEY = '@voice_enabled';
  private static readonly NAVIGATION_STATE_KEY = '@navigation_state';
  private static readonly USER_PREFERENCES_KEY = '@user_preferences';

  // 語音設定
  static async getVoiceEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(this.VOICE_ENABLED_KEY);
      return value !== null ? JSON.parse(value) : true;
    } catch (error) {
      console.error('獲取語音設定失敗:', error);
      return true;
    }
  }

  static async setVoiceEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(this.VOICE_ENABLED_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('保存語音設定失敗:', error);
    }
  }

  // 導航狀態
  static async getNavigationState(): Promise<any> {
    try {
      const value = await AsyncStorage.getItem(this.NAVIGATION_STATE_KEY);
      return value !== null ? JSON.parse(value) : null;
    } catch (error) {
      console.error('獲取導航狀態失敗:', error);
      return null;
    }
  }

  static async setNavigationState(state: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.NAVIGATION_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('保存導航狀態失敗:', error);
    }
  }

  // 用戶偏好設定
  static async getUserPreferences(): Promise<any> {
    try {
      const value = await AsyncStorage.getItem(this.USER_PREFERENCES_KEY);
      return value !== null ? JSON.parse(value) : {
        language: 'zh-TW',
        voiceEnabled: true,
        theme: 'dark'
      };
    } catch (error) {
      console.error('獲取用戶偏好失敗:', error);
      return {
        language: 'zh-TW',
        voiceEnabled: true,
        theme: 'dark'
      };
    }
  }

  static async setUserPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('保存用戶偏好失敗:', error);
    }
  }

  // 清除所有數據
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.VOICE_ENABLED_KEY,
        this.NAVIGATION_STATE_KEY,
        this.USER_PREFERENCES_KEY
      ]);
    } catch (error) {
      console.error('清除數據失敗:', error);
    }
  }
}

// 導航會話管理
export class NavigationSession {
  private sessionId: string;
  private currentPlace: any;
  private currentGuide: any;
  private messageHistory: any[];
  private routeProgress: any;
  private timestamp: number;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || Date.now().toString();
    this.messageHistory = [];
    this.timestamp = Date.now();
  }

  // 保存會話
  async save(): Promise<void> {
    try {
      const sessionData = {
        sessionId: this.sessionId,
        currentPlace: this.currentPlace,
        currentGuide: this.currentGuide,
        messageHistory: this.messageHistory,
        routeProgress: this.routeProgress,
        timestamp: this.timestamp,
      };
      await AsyncStorage.setItem(`@session_${this.sessionId}`, JSON.stringify(sessionData));
    } catch (error) {
      console.error('保存會話失敗:', error);
    }
  }

  // 恢復會話
  static async load(sessionId: string): Promise<NavigationSession | null> {
    try {
      const data = await AsyncStorage.getItem(`@session_${sessionId}`);
      if (data) {
        const sessionData = JSON.parse(data);
        const session = new NavigationSession(sessionData.sessionId);
        Object.assign(session, sessionData);
        return session;
      }
    } catch (error) {
      console.error('載入會話失敗:', error);
    }
    return null;
  }

  // 獲取所有會話
  static async getAllSessions(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith('@session_')).map(key => key.replace('@session_', ''));
    } catch (error) {
      console.error('獲取會話列表失敗:', error);
      return [];
    }
  }

  // 刪除會話
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`@session_${sessionId}`);
    } catch (error) {
      console.error('刪除會話失敗:', error);
    }
  }

  // 設定當前場域
  setCurrentPlace(place: any): void {
    this.currentPlace = place;
    this.timestamp = Date.now();
  }

  // 設定當前導覽員
  setCurrentGuide(guide: any): void {
    this.currentGuide = guide;
    this.timestamp = Date.now();
  }

  // 添加訊息
  addMessage(message: any): void {
    this.messageHistory.push(message);
    this.timestamp = Date.now();
  }

  // 更新路線進度
  updateRouteProgress(progress: any): void {
    this.routeProgress = progress;
    this.timestamp = Date.now();
  }

  // 獲取會話資訊
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      currentPlace: this.currentPlace,
      currentGuide: this.currentGuide,
      messageCount: this.messageHistory.length,
      timestamp: this.timestamp,
    };
  }
}
