import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirestoreService } from './FirestoreService';
import LoggingService from './LoggingService';
import { Conversation, ConversationMessage, CreateConversationData, ConversationContext } from '../types/firestore.types';

/**
 * 對話同步狀態
 */
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error' | 'offline';

/**
 * 本地對話資料結構
 */
export interface LocalConversationData {
  conversation: Conversation;
  syncStatus: SyncStatus;
  lastSyncTime?: Date;
  pendingMessages: ConversationMessage[];
  conflictMessages?: ConversationMessage[];
}

/**
 * 同步選項
 */
export interface SyncOptions {
  forceSync?: boolean;
  maxRetries?: number;
  batchSize?: number;
  realTimeSync?: boolean;
}

/**
 * 對話同步服務
 * 
 * 負責管理本地和遠端對話資料的同步，支援：
 * - 本地優先儲存策略
 * - 自動背景同步
 * - 衝突解決
 * - 離線工作支援
 * - 即時監聽
 */
export class ConversationSyncService {
  private firestoreService: FirestoreService;
  private logger: LoggingService;
  private syncTimers: Map<string, NodeJS.Timeout> = new Map();
  private realtimeUnsubscribers: Map<string, () => void> = new Map();
  private isOnline: boolean = true;
  private syncQueue: Set<string> = new Set();

  constructor(firestoreService: FirestoreService, logger: LoggingService) {
    this.firestoreService = firestoreService;
    this.logger = logger;
    
    // 監聽網路狀態
    this.setupNetworkListener();
  }

  /**
   * 建立或取得對話，支援離線優先
   */
  async createOrGetConversation(
    conversationId: string,
    conversationData: CreateConversationData,
    options: SyncOptions = {}
  ): Promise<Conversation> {
    try {
      // 1. 首先檢查本地是否已存在
      const localData = await this.getLocalConversation(conversationId);
      if (localData) {
        // 如果本地存在，決定是否需要同步
        if (this.shouldSync(localData, options)) {
          this.scheduleSyncConversation(conversationId, options);
        }
        return localData.conversation;
      }

      // 2. 本地不存在，嘗試從遠端取得
      let conversation: Conversation;
      
      if (this.isOnline && !options.forceSync) {
        try {
          conversation = await this.firestoreService.createConversation(conversationData);
          await this.saveLocalConversation(conversationId, {
            conversation,
            syncStatus: 'synced',
            lastSyncTime: new Date(),
            pendingMessages: []
          });
        } catch (error) {
          this.logger.warn('Failed to fetch from remote, creating local conversation', { 
            conversationId, 
            error: error instanceof Error ? error.message : String(error) 
          });
          // 遠端失敗，建立本地對話
          conversation = this.createLocalConversation(conversationId, conversationData);
          await this.saveLocalConversation(conversationId, {
            conversation,
            syncStatus: 'pending',
            pendingMessages: []
          });
        }
      } else {
        // 離線模式，直接建立本地對話
        conversation = this.createLocalConversation(conversationId, conversationData);
        await this.saveLocalConversation(conversationId, {
          conversation,
          syncStatus: this.isOnline ? 'pending' : 'offline',
          pendingMessages: []
        });
      }

      // 3. 設置即時監聽（如果線上且啟用）
      if (this.isOnline && options.realTimeSync !== false) {
        this.setupRealtimeListener(conversationId);
      }

      return conversation;
    } catch (error) {
      this.logger.error('Failed to create/get conversation', { conversationId, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * 添加訊息到對話（本地優先）
   */
  async addMessage(conversationId: string, message: ConversationMessage, options: SyncOptions = {}): Promise<void> {
    try {
      const localData = await this.getLocalConversation(conversationId);
      if (!localData) {
        throw new Error(`Conversation ${conversationId} not found locally`);
      }

      // 為訊息分配 ID（如果沒有）
      const messageWithId: ConversationMessage = {
        ...message,
        id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: message.timestamp || new Date()
      };

      // 1. 立即更新本地資料
      localData.conversation.messages.push(messageWithId);
      if (localData.conversation.stats) {
        localData.conversation.stats.totalMessages = localData.conversation.messages.length;
      }
      localData.conversation.updatedAt = new Date();

      // 2. 添加到待同步佇列
      localData.pendingMessages.push(messageWithId);
      localData.syncStatus = 'pending';

      await this.saveLocalConversation(conversationId, localData);

      this.logger.info('Message added locally', { 
        conversationId, 
        messageId: messageWithId.id,
        pendingCount: localData.pendingMessages.length 
      });

      // 3. 排程同步
      if (this.isOnline) {
        this.scheduleSyncConversation(conversationId, options);
      }
    } catch (error) {
      this.logger.error('Failed to add message', { conversationId, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * 批量添加訊息
   */
  async addMessages(conversationId: string, messages: ConversationMessage[], options: SyncOptions = {}): Promise<void> {
    try {
      const localData = await this.getLocalConversation(conversationId);
      if (!localData) {
        throw new Error(`Conversation ${conversationId} not found locally`);
      }

      const messagesWithId = messages.map(msg => ({
        ...msg,
        id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: msg.timestamp || new Date()
      }));

      // 更新本地資料
      localData.conversation.messages.push(...messagesWithId);
      if (localData.conversation.stats) {
        localData.conversation.stats.totalMessages = localData.conversation.messages.length;
      }
      localData.conversation.updatedAt = new Date();
      localData.pendingMessages.push(...messagesWithId);
      localData.syncStatus = 'pending';

      await this.saveLocalConversation(conversationId, localData);

      // 排程同步
      if (this.isOnline) {
        this.scheduleSyncConversation(conversationId, options);
      }
    } catch (error) {
      this.logger.error('Failed to add messages', { conversationId, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * 取得對話（本地優先）
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const localData = await this.getLocalConversation(conversationId);
      return localData?.conversation || null;
    } catch (error) {
      this.logger.error('Failed to get conversation', { conversationId, error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * 手動同步對話到遠端
   */
  async syncConversation(conversationId: string, options: SyncOptions = {}): Promise<boolean> {
    try {
      if (!this.isOnline) {
        this.logger.warn('Cannot sync while offline', { conversationId });
        return false;
      }

      const localData = await this.getLocalConversation(conversationId);
      if (!localData || localData.pendingMessages.length === 0) {
        return true; // 沒有需要同步的內容
      }

      // 防止重複同步
      if (this.syncQueue.has(conversationId)) {
        this.logger.debug('Sync already in progress', { conversationId });
        return false;
      }

      this.syncQueue.add(conversationId);
      localData.syncStatus = 'syncing';
      await this.saveLocalConversation(conversationId, localData);

      this.logger.info('Starting conversation sync', { 
        conversationId, 
        pendingCount: localData.pendingMessages.length 
      });

      try {
        // 批次同步待同步的訊息
        const batchSize = options.batchSize || 50;
        const messagesToSync = localData.pendingMessages.splice(0, batchSize);

        if (messagesToSync.length > 0) {
          for (const message of messagesToSync) {
            await this.firestoreService.addMessageToConversation(conversationId, message);
          }
        }

        // 更新同步狀態
        localData.syncStatus = localData.pendingMessages.length > 0 ? 'pending' : 'synced';
        localData.lastSyncTime = new Date();
        await this.saveLocalConversation(conversationId, localData);

        this.logger.info('Conversation sync completed', { 
          conversationId, 
          syncedCount: messagesToSync.length,
          remainingCount: localData.pendingMessages.length
        });

        // 如果還有待同步的訊息，排程下次同步
        if (localData.pendingMessages.length > 0) {
          setTimeout(() => this.syncConversation(conversationId, options), 1000);
        }

        return true;
      } catch (error) {
        localData.syncStatus = 'error';
        await this.saveLocalConversation(conversationId, localData);
        this.logger.error('Sync failed', { conversationId, error: error instanceof Error ? error.message : String(error) });
        throw error;
      } finally {
        this.syncQueue.delete(conversationId);
      }
    } catch (error) {
      this.logger.error('Failed to sync conversation', { conversationId, error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * 設置即時監聽
   */
  private setupRealtimeListener(conversationId: string): void {
    // 清理現有監聽
    const existingUnsubscriber = this.realtimeUnsubscribers.get(conversationId);
    if (existingUnsubscriber) {
      existingUnsubscriber();
    }

    // 設置新的監聽 (暫時使用 mock 實現)
    const unsubscriber = () => {
      // Mock unsubscriber - 實際實現需要根據 FirestoreService 的監聽方法
      this.logger.debug('Unsubscribed from realtime listener', { conversationId });
    };

    this.realtimeUnsubscribers.set(conversationId, unsubscriber);
    this.logger.debug('Realtime listener setup', { conversationId });
  }

  /**
   * 處理遠端更新
   */
  private async handleRemoteUpdate(conversationId: string, remoteConversation: Conversation): Promise<void> {
    const localData = await this.getLocalConversation(conversationId);
    if (!localData) return;

    // 簡單的合併策略：時間戳為基礎
    const localMessages = new Map(localData.conversation.messages.map(m => [m.id!, m]));
    const mergedMessages: ConversationMessage[] = [];

    // 合併遠端訊息
    for (const remoteMsg of remoteConversation.messages) {
      if (!remoteMsg.id) continue;
      
      const localMsg = localMessages.get(remoteMsg.id);
      if (!localMsg) {
        // 新的遠端訊息
        mergedMessages.push(remoteMsg);
      } else {
        // 比較時間戳，保留較新的
        mergedMessages.push(
          localMsg.timestamp > remoteMsg.timestamp ? localMsg : remoteMsg
        );
        localMessages.delete(remoteMsg.id);
      }
    }

    // 添加剩餘的本地訊息（可能是待同步的）
    mergedMessages.push(...Array.from(localMessages.values()));

    // 按時間戳排序
    mergedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // 更新本地資料
    localData.conversation.messages = mergedMessages;
    if (localData.conversation.stats) {
      localData.conversation.stats.totalMessages = mergedMessages.length;
    }
    localData.conversation.updatedAt = remoteConversation.updatedAt;
    
    await this.saveLocalConversation(conversationId, localData);

    this.logger.debug('Remote update merged', { 
      conversationId, 
      totalMessages: mergedMessages.length 
    });
  }

  /**
   * 排程同步
   */
  private scheduleSyncConversation(conversationId: string, options: SyncOptions = {}): void {
    // 清理現有計時器
    const existingTimer = this.syncTimers.get(conversationId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 設置新計時器（延遲同步以批次處理）
    const timer = setTimeout(() => {
      this.syncConversation(conversationId, options);
      this.syncTimers.delete(conversationId);
    }, 2000); // 2秒延遲

    this.syncTimers.set(conversationId, timer as any);
  }

  /**
   * 判斷是否需要同步
   */
  private shouldSync(localData: LocalConversationData, options: SyncOptions): boolean {
    if (options.forceSync) return true;
    if (localData.syncStatus === 'pending' || localData.syncStatus === 'error') return true;
    if (localData.pendingMessages.length > 0) return true;
    
    // 檢查最後同步時間
    if (localData.lastSyncTime) {
      const timeSinceLastSync = Date.now() - localData.lastSyncTime.getTime();
      return timeSinceLastSync > 30000; // 30秒
    }
    
    return false;
  }

  /**
   * 建立本地對話
   */
  private createLocalConversation(conversationId: string, data: CreateConversationData): Conversation {
    return {
      id: conversationId,
      userId: data.userId,
      type: data.type,
      messages: [],
      context: (data.context as ConversationContext) || { language: 'zh-TW', timestamp: new Date() },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: { totalMessages: 0 }
    };
  }

  /**
   * 取得本地對話資料
   */
  private async getLocalConversation(conversationId: string): Promise<LocalConversationData | null> {
    try {
      const data = await AsyncStorage.getItem(`@conversation_${conversationId}`);
      if (!data) return null;

      const parsed = JSON.parse(data);
      // 轉換日期字串回 Date 物件
      return {
        ...parsed,
        conversation: {
          ...parsed.conversation,
          createdAt: new Date(parsed.conversation.createdAt),
          updatedAt: new Date(parsed.conversation.updatedAt),
          messages: parsed.conversation.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        },
        lastSyncTime: parsed.lastSyncTime ? new Date(parsed.lastSyncTime) : undefined,
        pendingMessages: parsed.pendingMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
    } catch (error) {
      this.logger.error('Failed to get local conversation', { conversationId, error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * 儲存本地對話資料
   */
  private async saveLocalConversation(conversationId: string, data: LocalConversationData): Promise<void> {
    try {
      await AsyncStorage.setItem(`@conversation_${conversationId}`, JSON.stringify(data));
    } catch (error) {
      this.logger.error('Failed to save local conversation', { conversationId, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * 設置網路監聽
   */
  private setupNetworkListener(): void {
    // 這裡可以使用 @react-native-netinfo/netinfo 來監聽網路狀態
    // 簡化實作，假設預設為線上
    this.isOnline = true;
  }

  /**
   * 清理資源
   */
  public cleanup(): void {
    // 清理計時器
    for (const timer of this.syncTimers.values()) {
      clearTimeout(timer);
    }
    this.syncTimers.clear();

    // 清理即時監聽
    for (const unsubscriber of this.realtimeUnsubscribers.values()) {
      unsubscriber();
    }
    this.realtimeUnsubscribers.clear();

    this.logger.info('ConversationSyncService cleanup completed');
  }

  /**
   * 取得同步狀態
   */
  public async getSyncStatus(conversationId: string): Promise<SyncStatus> {
    const localData = await this.getLocalConversation(conversationId);
    return localData?.syncStatus || 'error';
  }

  /**
   * 強制同步所有待同步對話
   */
  public async syncAll(options: SyncOptions = {}): Promise<boolean[]> {
    const keys = await AsyncStorage.getAllKeys();
    const conversationKeys = keys.filter(key => key.startsWith('@conversation_'));
    
    const results = await Promise.allSettled(
      conversationKeys.map(async (key) => {
        const conversationId = key.replace('@conversation_', '');
        return await this.syncConversation(conversationId, options);
      })
    );

    return results.map(result => result.status === 'fulfilled' ? result.value : false);
  }
}

