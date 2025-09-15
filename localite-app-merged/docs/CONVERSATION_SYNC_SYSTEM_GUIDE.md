# 🔄 對話自動同步系統 - 完整使用指南

## 📋 系統概覽

本系統為 ChatScreen 提供了完整的對話自動保存和同步功能，支援：

- **本地優先存儲**：所有對話首先保存到本地 AsyncStorage
- **自動遠端同步**：已登入用戶的對話自動同步到 Firestore
- **即時更新**：使用 Firestore onSnapshot 進行即時監聽
- **離線支援**：支援離線工作，連線時自動同步
- **衝突解決**：基於時間戳的智能衝突處理

## 🏗️ 系統架構

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ChatScreen    │◄──►│ HybridSession   │◄──►│ ConversationSync│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  AsyncStorage   │    │  AsyncStorage   │    │   Firestore     │
│   (UI State)    │    │  (Session)      │    │ (Remote Sync)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 核心組件

### 1. ConversationSyncService

- **職責**：管理本地和遠端對話資料同步
- **功能**：
  - 本地優先存儲策略
  - 自動背景同步
  - 衝突解決機制
  - 離線工作支援
  - 即時監聽

### 2. HybridNavigationSession

- **職責**：擴展原有 NavigationSession，整合遠端同步
- **功能**：
  - 兼容原有 NavigationSession API
  - 自動啟用遠端同步（登入用戶）
  - 批量訊息處理
  - 資源清理管理

### 3. 增強的 FirestoreService

- **新增功能**：
  - `createOrGetConversation`：原子性建立/取得對話
  - `addMessagesToConversation`：批量添加訊息
  - `subscribeToConversation`：即時監聽
  - `getUserRecentConversations`：取得用戶對話列表

## 💡 使用方式

### 在 ChatScreen 中使用

```tsx
// 1. 更新組件參數
function ChatScreen({
  // ... 其他參數
  currentUser, // 新增：當前用戶物件
  isLoggedIn, // 現有：登入狀態
}) {
  // 2. 會話會自動根據登入狀態選擇模式：
  // - 已登入：HybridNavigationSession（本地+遠端）
  // - 訪客：HybridNavigationSession（僅本地）
  // 3. 同步狀態會顯示在 Header 中
  // 狀態包括：已同步、待同步、同步中、離線、訪客等
}
```

### 服務使用範例

```typescript
// 建立同步服務
const firestoreService = new FirestoreService();
const loggingService = new LoggingService();
const syncService = new ConversationSyncService(
  firestoreService,
  loggingService
);

// 創建對話
const conversation = await syncService.createOrGetConversation("conv-123", {
  userId: "user-456",
  type: "ai_guide",
  context: { language: "zh-TW" },
});

// 添加訊息
await syncService.addMessage("conv-123", {
  type: "user",
  content: "你好，請介紹這個地方",
  timestamp: new Date(),
});

// 手動同步
await syncService.syncConversation("conv-123");

// 取得同步狀態
const status = await syncService.getSyncStatus("conv-123");
```

## 📊 同步狀態說明

| 狀態     | 含義       | 顯示顏色 |
| -------- | ---------- | -------- |
| synced   | 已同步     | 🟢 綠色  |
| pending  | 待同步     | 🟠 橙色  |
| syncing  | 同步中     | 🔵 藍色  |
| error    | 同步錯誤   | 🔴 紅色  |
| offline  | 離線       | ⚪ 灰色  |
| guest    | 訪客模式   | 🟤 棕色  |
| disabled | 功能未啟用 | -        |

## ⚙️ 配置選項

### SyncOptions

```typescript
interface SyncOptions {
  forceSync?: boolean; // 強制同步
  maxRetries?: number; // 最大重試次數
  batchSize?: number; // 批次大小（預設 50）
  realTimeSync?: boolean; // 即時同步（預設 true）
}
```

### 使用範例

```typescript
// 強制完整同步
await syncService.syncConversation("conv-123", {
  forceSync: true,
  batchSize: 100,
});

// 建立對話時啟用即時監聽
await syncService.createOrGetConversation("conv-123", conversationData, {
  realTimeSync: true,
});
```

## 🔧 故障排除

### 常見問題

1. **同步狀態顯示錯誤**

   ```typescript
   // 檢查同步狀態
   const status = await hybridSession.getSyncStatus();
   console.log("同步狀態:", status);
   ```

2. **訊息未同步到遠端**

   ```typescript
   // 手動觸發同步
   const success = await hybridSession.forceSync();
   if (!success) {
     console.log("同步失敗，請檢查網路連線");
   }
   ```

3. **本地資料遺失**
   ```typescript
   // 從遠端恢復資料
   const loaded = await hybridSession.loadFromRemote();
   if (loaded) {
     console.log("已從遠端恢復對話資料");
   }
   ```

### 偵錯模式

```typescript
// 啟用詳細日誌
const loggingService = new LoggingService();
loggingService.setLevel("debug");

// 監聽同步事件
const syncService = new ConversationSyncService(
  firestoreService,
  loggingService
);
```

## 📱 使用者體驗

### 訪客模式

- 對話僅保存在本地
- Header 顯示 "訪客" 狀態
- 跳出應用後對話可能遺失
- 建議引導用戶註冊登入

### 登入用戶

- 對話自動同步到雲端
- 跨裝置存取對話紀錄
- Header 顯示即時同步狀態
- 離線時自動暫存，上線後同步

## 🛠️ 進階配置

### 自訂同步策略

```typescript
class CustomSyncService extends ConversationSyncService {
  // 覆寫同步邏輯
  protected async shouldSync(localData: LocalConversationData): boolean {
    // 自訂同步條件
    return localData.pendingMessages.length > 10;
  }

  // 自訂衝突解決
  protected async handleConflict(
    local: ConversationMessage,
    remote: ConversationMessage
  ) {
    // 自訂衝突處理邏輯
    return local.timestamp > remote.timestamp ? local : remote;
  }
}
```

### 效能優化

```typescript
// 調整批次大小
const syncOptions: SyncOptions = {
  batchSize: 20, // 減少批次大小以提升回應速度
  maxRetries: 3, // 減少重試次數
};

// 延遲同步
const syncService = new ConversationSyncService(
  firestoreService,
  loggingService
);
// 同步服務會自動延遲 2 秒後批次處理訊息
```

## 🔒 隱私與安全

### 資料加密

- Firestore 提供傳輸中和靜態加密
- 本地 AsyncStorage 資料未加密
- 敏感資訊應避免儲存在對話中

### 存取控制

- 用戶只能存取自己的對話
- Firestore 安全規則限制資料存取
- 服務端驗證用戶身份

### 資料保留

- 本地資料：應用卸載時清除
- 遠端資料：依據隱私政策保留
- 用戶可要求刪除個人資料

## 📈 監控與分析

### 關鍵指標

- 同步成功率
- 同步延遲時間
- 離線使用頻率
- 衝突發生率

### 日誌記錄

```typescript
// 系統會自動記錄以下事件：
// - 對話建立/載入
// - 訊息同步成功/失敗
// - 網路連線變化
// - 衝突解決結果
```

## 🔮 未來擴展

### 計畫功能

- [ ] 多裝置即時同步
- [ ] 對話備份與匯出
- [ ] 進階搜尋功能
- [ ] 對話標記與分類
- [ ] 同步效能監控面板

### 技術債務

- [ ] 單元測試覆蓋率提升
- [ ] 錯誤恢復機制優化
- [ ] 大量資料處理優化
- [ ] 網路狀態檢測改善

---

## 🤝 貢獻指南

如需修改或擴展此系統，請參考：

1. **程式碼結構**：遵循現有的服務分層架構
2. **錯誤處理**：使用統一的錯誤處理機制
3. **測試**：為新功能添加相應測試
4. **文檔**：更新相關使用文檔

## 📞 技術支援

遇到問題時，請提供：

- 錯誤訊息和堆疊追蹤
- 重現步驟
- 用戶登入狀態
- 網路連線狀況
- 裝置和系統資訊

---

_最後更新：2024 年 12 月_

