import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConversationSyncService } from './ConversationSyncService';
import { FirestoreService } from './FirestoreService';
import LoggingService from './LoggingService';
import { ConversationMessage } from '../types/firestore.types';

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
  protected sessionId: string;
  protected currentPlace: any;
  protected currentGuide: any;
  protected messageHistory: any[];
  protected routeProgress: any;
  protected timestamp: number;

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

/**
 * 混合式導航會話 - 支援本地和遠端同步
 * 
 * 基於原有的 NavigationSession，整合 ConversationSyncService
 * 提供自動同步對話到 Firestore 的功能
 */
export class HybridNavigationSession extends NavigationSession {
  private syncService: ConversationSyncService | null = null;
  private isRemoteSyncEnabled: boolean = false;
  private userId: string | null = null;

  constructor(sessionId?: string, userId?: string | null) {
    super(sessionId);
    this.userId = userId ?? null;
  }

  /**
   * 啟用遠端同步功能
   */
  public async enableRemoteSync(
    firestoreService: FirestoreService, 
    loggingService: LoggingService,
    userId: string
  ): Promise<void> {
    try {
      this.userId = userId;
      this.syncService = new ConversationSyncService(firestoreService, loggingService);
      this.isRemoteSyncEnabled = true;

      // 初始化或取得遠端對話
      await this.initializeRemoteConversation();
      
      loggingService.info('Remote sync enabled for session', { 
        sessionId: this.sessionId,
        userId 
      });
    } catch (error) {
      loggingService.error('Failed to enable remote sync', {
        sessionId: this.sessionId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 停用遠端同步
   */
  public disableRemoteSync(): void {
    if (this.syncService) {
      this.syncService.cleanup();
      this.syncService = null;
    }
    this.isRemoteSyncEnabled = false;
    this.userId = null;
  }

  /**
   * 覆寫 addMessage 方法以支援遠端同步
   */
  override addMessage(message: any): void {
    // 呼叫原有方法
    super.addMessage(message);

    // 如果啟用遠端同步，同時同步到遠端
    if (this.isRemoteSyncEnabled && this.syncService && this.userId) {
      this.syncMessageToRemote(message);
    }
  }

  /**
   * 批量添加訊息（支援遠端同步）
   */
  public async addMessages(messages: any[]): Promise<void> {
    // 添加到本地
    messages.forEach(message => super.addMessage(message));

    // 同步到遠端
    if (this.isRemoteSyncEnabled && this.syncService && this.userId && messages.length > 0) {
      try {
        const conversationMessages = this.convertToConversationMessages(messages);
        await this.syncService.addMessages(this.sessionId, conversationMessages);
      } catch (error) {
        console.error('Failed to sync messages to remote:', error);
      }
    }
  }

  /**
   * 覆寫 save 方法以整合遠端保存
   */
  override async save(): Promise<void> {
    try {
      // 執行原有的本地保存
      await super.save();

      // 如果啟用遠端同步，觸發同步
      if (this.isRemoteSyncEnabled && this.syncService) {
        await this.syncService.syncConversation(this.sessionId);
      }
    } catch (error) {
      console.error('HybridNavigationSession save failed:', error);
      throw error;
    }
  }

  /**
   * 從遠端載入對話（如果存在）
   */
  public async loadFromRemote(): Promise<boolean> {
    if (!this.isRemoteSyncEnabled || !this.syncService) {
      return false;
    }

    try {
      const remoteConversation = await this.syncService.getConversation(this.sessionId);
      if (remoteConversation) {
        // 將遠端資料合併到本地會話
        this.mergeRemoteConversation(remoteConversation);
        return true;
      }
    } catch (error) {
      console.error('Failed to load from remote:', error);
    }

    return false;
  }

  /**
   * 取得同步狀態
   */
  public async getSyncStatus(): Promise<string> {
    if (!this.isRemoteSyncEnabled || !this.syncService) {
      return 'disabled';
    }

    try {
      return await this.syncService.getSyncStatus(this.sessionId);
    } catch (error) {
      return 'error';
    }
  }

  /**
   * 手動觸發完整同步
   */
  public async forceSync(): Promise<boolean> {
    if (!this.isRemoteSyncEnabled || !this.syncService) {
      return false;
    }

    try {
      return await this.syncService.syncConversation(this.sessionId, { forceSync: true });
    } catch (error) {
      console.error('Force sync failed:', error);
      return false;
    }
  }

  /**
   * 初始化遠端對話
   */
  private async initializeRemoteConversation(): Promise<void> {
    if (!this.syncService || !this.userId) return;

    try {
      await this.syncService.createOrGetConversation(this.sessionId, {
        userId: this.userId,
        type: 'ai_guide',
        context: {
          language: 'zh-TW',
          currentLocation: this.getCurrentLocation(),
          sessionData: {
            currentPlace: this.currentPlace,
            currentGuide: this.currentGuide
          }
        }
      }, {
        realTimeSync: true
      });
    } catch (error) {
      console.error('Failed to initialize remote conversation:', error);
      throw error;
    }
  }

  /**
   * 同步單個訊息到遠端
   */
  private async syncMessageToRemote(message: any): Promise<void> {
    if (!this.syncService || !this.userId) return;

    try {
      const conversationMessage = this.convertToConversationMessage(message);
      await this.syncService.addMessage(this.sessionId, conversationMessage);
    } catch (error) {
      console.error('Failed to sync message to remote:', error);
    }
  }

  /**
   * 轉換訊息格式為 ConversationMessage
   */
  private convertToConversationMessage(message: any): ConversationMessage {
    return {
      id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: this.determineMessageType(message),
      content: this.extractMessageContent(message),
      timestamp: new Date(message.timestamp || Date.now()),
      metadata: {
        ...message.metadata,
        originalFormat: 'navigation_session'
      }
    };
  }

  /**
   * 批量轉換訊息格式
   */
  private convertToConversationMessages(messages: any[]): ConversationMessage[] {
    return messages.map(message => this.convertToConversationMessage(message));
  }

  /**
   * 判斷訊息類型
   */
  private determineMessageType(message: any): 'user' | 'ai' | 'system' {
    if (message.from === 'user') return 'user';
    if (message.from === 'ai') return 'ai';
    return 'system';
  }

  /**
   * 提取訊息內容
   */
  private extractMessageContent(message: any): string {
    if (message.text) return message.text;
    if (message.image) return '[圖片]';
    if (message.miniCards) return '[選項卡片]';
    if (message.routeCards) return '[路線卡片]';
    return JSON.stringify(message);
  }

  /**
   * 合併遠端對話到本地會話
   */
  private mergeRemoteConversation(remoteConversation: any): void {
    // 簡化實作：替換本地訊息歷史
    // 實際應用中可能需要更複雜的合併邏輯
    this.messageHistory = remoteConversation.messages.map((msg: any) => ({
      id: msg.id,
      from: msg.type === 'user' ? 'user' : 'ai',
      text: msg.content,
      timestamp: msg.timestamp
    }));
    
    this.timestamp = remoteConversation.updatedAt.getTime();
  }

  /**
   * 取得當前位置（如果有的話）
   */
  private getCurrentLocation(): { latitude: number; longitude: number } | undefined {
    // 這裡可以整合位置服務
    // 暫時返回 undefined
    return undefined;
  }

  /**
   * 清理資源（覆寫）
   */
  public cleanup(): void {
    this.disableRemoteSync();
  }

  /**
   * 靜態方法：載入混合會話
   */
  static async loadHybrid(
    sessionId: string, 
    firestoreService?: FirestoreService,
    loggingService?: LoggingService,
    userId?: string
  ): Promise<HybridNavigationSession | null> {
    try {
      // 首先嘗試載入基本會話
      const baseSession = await NavigationSession.load(sessionId);
      if (!baseSession) return null;

      // 創建混合會話並複製資料
      const hybridSession = new HybridNavigationSession(sessionId, userId);
      Object.assign(hybridSession, baseSession);

      // 如果提供了遠端服務參數，啟用遠端同步
      if (firestoreService && loggingService && userId) {
        try {
          await hybridSession.enableRemoteSync(firestoreService, loggingService, userId);
          await hybridSession.loadFromRemote();
        } catch (error) {
          console.warn('Failed to enable remote sync, continuing with local-only session:', error);
        }
      }

      return hybridSession;
    } catch (error) {
      console.error('載入混合會話失敗:', error);
      return null;
    }
  }
}
