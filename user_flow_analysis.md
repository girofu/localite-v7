# Localite App 用戶使用流程分析

## 📋 專案概述

Localite 是一款結合 AI 導覽員的地點導覽應用，專為博物館、美術館等場域設計，提供沉浸式語音導覽體驗。應用支援一般遊客和商戶兩種角色，提供即時語音導覽、互動問答、照片分析、旅程記錄生成等功能。

實際專案結構：

- **前端框架**: React Native + Expo
- **主要導航**: 自定義狀態管理導航系統
- **核心功能**: AI 聊天導覽、GPS 地圖定位、QR 掃描、照片辨識
- **數據結構**: 導覽員系統 (5 種角色)、場域數據、路線系統

## 🎯 主要用戶角色

1. **一般用戶（遊客）** - 使用 AI 導覽功能探索場域，獲得個人化的導覽體驗
2. **商戶用戶** - 管理自己的場域和導覽內容，提供專業的導覽服務

## 🔄 完整用戶使用流程圖

### 階段 1: 應用啟動與認證

```
┌─────────────────┐
│   啟動 App        │
│                 │
│ React Native +   │
│ Expo 初始化      │
└─────────────────┘
          │
          ▼
┌─────────────────┐
│   HomeScreen     │
│                 │
│ 品牌展示頁面     │
│ 登入狀態檢查     │
└─────────────────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐
│ LoginValidation │     │   DrawerNav      │
│ Modal           │     │                 │
│ 訪客/登入選擇    │     │ 側邊欄導航      │
│                 │     │ 個人檔案管理     │
└─────────────────┘     └─────────────────┘
          │                       ▲
          ▼                       │
┌─────────────────┐               │
│ GuideActivation │◄──────────────┘
│ Screen          │
│ 場域選擇入口     │
└─────────────────┘
```

**階段 1 詳細說明：**

- **App 啟動**: React Native + Expo 應用初始化載入
- **HomeScreen**: 品牌展示頁面，檢查用戶登入狀態
  - 已登入用戶：直接顯示"開始探索"按鈕
  - 未登入用戶：顯示登入驗證 modal，提供訪客模式選項
- **認證流程**:
  - **訪客模式**: 可直接進入導覽功能，但受限旅程記錄製作
  - **登入模式**: 支援 Email/Google/Apple 登入
  - **註冊模式**: 新用戶註冊流程
- **DrawerNavigation**: 側邊欄導航，提供個人檔案管理、設定等功能

### 階段 2: 場域選擇與進入

```
GuideActivationScreen
      │
      ▼
┌─────────────────┐     ┌─────────────────┐
│   MapScreen      │     │ QRCodeScanner   │
│                 │     │ Screen          │
│ GPS定位 + 地圖   │     │                 │
│ 距離篩選(500m)   │     │ 掃描QR碼直接    │
│ 卡片式展示       │     │ 進入場域        │
└─────────────────┘     └─────────────────┘
      │                           │
      └─────────────┬─────────────┘
                    │
                    ▼
            ┌─────────────────┐
            │ PlaceIntroScreen │
            │                 │
            │ 場域詳細資訊     │
            │ 確認進入導覽     │
            └─────────────────┘
```

**階段 2 詳細說明：**

- **GuideActivationScreen**: 場域選擇入口，提供兩種進入方式
  - GPS 地圖按鈕 → MapScreen
  - QR 掃描按鈕 → QRCodeScannerScreen
- **MapScreen**: GPS 定位地圖功能
  - 取得用戶位置權限
  - 顯示 500 公尺內的可導覽場域
  - 卡片式展示場域資訊（名稱、距離、圖片）
  - 支援 Marker 點擊和卡片點擊進入
- **QRCodeScannerScreen**: QR 掃描功能
  - 快速掃描場域 QR 碼
  - 直接進入指定場域（繞過地圖選擇）
- **PlaceIntroScreen**: 場域介紹頁面
  - 顯示場域詳細資訊和照片
  - 用戶確認後進入導覽員選擇

### 階段 3: 導覽準備與開始

```
PlaceIntroScreen
       │
       ▼
┌─────────────────┐
│ GuideSelection  │
│ Screen          │
│ 選擇AI導覽員     │
│ 5種角色風格      │
│ (KURON/PURURU/  │
│  POPO/NIKKO/    │
│  小豬忠忠)       │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│   ChatScreen     │
│                 │
│ 初始化聊天介面   │
│ 載入場域數據     │
│ 顯示歡迎訊息     │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ 互動選項展示     │
│                 │
│ MiniCard:        │
│ 固定路線 vs      │
│ 自由探索         │
└─────────────────┘
```

**階段 3 詳細說明：**

- **GuideSelectionScreen**: AI 導覽員選擇
  - 提供 5 種不同風格的 AI 導覽員：
    - **KURON**: 急驚風，擅長指引
    - **PURURU**: 慢悠悠，擅長陪伴
    - **POPO**: 害羞聰明，擅長冷知識
    - **NIKKO**: 溫暖甜蜜，擅長鼓勵
    - **小豬忠忠**: 溫和有禮貌，忠寮限定
  - 部分場域有推薦導覽員
- **ChatScreen 初始化**: 聊天導覽介面
  - 載入選定的場域和導覽員數據
  - 顯示歡迎訊息和場域介紹
  - 準備訊息歷史和互動狀態
- **初始互動選項**: 通過 MiniCard 提供選擇
  - **固定路線**: 預設的導覽路線系統
  - **自由探索**: 用戶自主探索模式

### 階段 4: 沉浸式導覽體驗

```
ChatScreen 互動循環
        │
        ▼
┌─────────────────┐
│   文字對話       │
│                 │
│ AI 訊息 + 用戶   │
│ 回覆處理         │
└─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│   RouteCard      │     │   MiniCard       │
│                 │     │                 │
│ 路線選擇展示     │     │ 互動選項卡片     │
│ 3條固定路線      │     │ 固定/自由探索    │
└─────────────────┘     └─────────────────┘
        │                           │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────┐
        │ 多媒體功能       │
        │                 │
        │ 拍照/相簿選擇    │
        │ OCR辨識/相機    │
        └─────────────────┘
                      │
                      ▼
        ┌─────────────────┐
        │ 結束導覽選項     │
        │                 │
        │ 隨時可結束       │
        │ 3種選擇          │
        └─────────────────┘
```

**階段 4 詳細說明：**

- **ChatScreen 互動循環**: 核心聊天導覽體驗
  - AI 訊息展示（帶有導覽員頭像）
  - 用戶文字輸入和傳送
  - 即時對話處理和回覆
- **RouteCard 系統**: 路線選擇功能
  - 固定路線模式下顯示 3 條預設路線
  - 每條路線包含：茶葉文化、生活背景、歷史建築
  - 支援左右滑動瀏覽
  - 路線卡片包含圖片、描述、worksheet 路線點
- **MiniCard 系統**: 互動選項卡片
  - 初始選擇：固定路線 vs 自由探索
  - 支援多種互動選項的卡片式展示
- **多媒體功能整合**:
  - **拍照功能**: 開啟相機拍攝照片
  - **相簿選擇**: 從相簿選擇現有照片
  - **OCR 辨識**: 光學字元辨識功能
  - 支援圖片上傳和分析
- **結束導覽選項**: 隨時可結束的 3 種選擇
  - 生成旅程記錄（需要登入）
  - 繼續導覽（繼續當前對話）
  - 直接結束導覽

### 階段 5: 導覽結束與成果製作

```
結束導覽選項觸發
       │
       ▼
┌─────────────────┐     ┌─────────────────┐
│   ChatEnd       │     │ Journey         │
│   Screen        │────▶│ Validation      │
│                 │     │ Modal           │
│ 結束導覽選項     │     │ 登入狀態檢查     │
│ 3種選擇          │     └─────────────────┘
└─────────────────┘               │
          │                       │
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   LearningSheet  │     │   返回繼續      │
│   Screen         │     │   導覽          │
│                 │     │                 │
│ 生成旅程記錄     │     │ 繼續ChatScreen  │
│ 學習單製作       │     └─────────────────┘
└─────────────────┘
          │
          ▼
┌─────────────────┐
│ LearningSheets  │
│ List Screen     │
│                 │
│ 學習專區總覽     │
│ 查看所有記錄     │
└─────────────────┘
```

**階段 5 詳細說明：**

- **ChatEndScreen**: 結束導覽選項頁面
  - 從 ChatScreen 結束按鈕觸發
  - 提供 3 種選擇：
    - **生成旅程記錄**: 製作個人化學習單
    - **繼續導覽**: 返回 ChatScreen 繼續對話
    - **直接結束**: 結束整個導覽流程
- **JourneyValidationModal**: 登入狀態檢查
  - 在生成旅程記錄時檢查用戶登入狀態
  - 未登入用戶會被引導至登入流程
  - 登入後可繼續製作旅程記錄
- **LearningSheetScreen**: 旅程記錄製作
  - 生成包含導覽內容的個人化學習單
  - 整合場域資訊、對話記錄、互動內容
  - 支援照片上傳和個人化內容
- **LearningSheetsListScreen**: 學習專區
  - 查看所有已生成的旅程記錄
  - 管理個人學習專區內容

### 階段 6: 成果分享與徽章系統

```
旅程記錄生成完成
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│   BadgeScreen    │     │ LearningSheets  │
│                 │     │ List Screen      │
│ 查看獲得徽章     │     │ 分享學習記錄     │
│ 成就展示         │     │ 管理學習專區     │
└─────────────────┘     └─────────────────┘
        │                           │
        └─────────────┬─────────────┘
                      │
                      ▼
              ┌─────────────────┐
              │ DrawerNavigation│
              │                 │
              │ 主要導航選項     │
              │ 繼續探索入口     │
              └─────────────────┘
                      │
                      ▼
              ┌─────────────────┐
              │ 繼續探索選擇     │
              │                 │
              │ 返回主要功能     │
              │ 或結束使用       │
              └─────────────────┘
```

**階段 6 詳細說明：**

- **BadgeScreen**: 徽章成就系統
  - 完成導覽後獲得對應徽章
  - 展示個人成就和收集的徽章
  - 視覺化成就系統和進度追蹤
- **LearningSheetsListScreen**: 學習專區分享
  - 查看所有已生成的旅程記錄
  - 管理個人學習內容和成就
  - 作為分享和檢視成果的主要介面
- **DrawerNavigation**: 側邊欄導航系統
  - **旅程記錄**: 查看所有學習單
  - **學習專區**: 管理學習內容
  - **我的徽章**: 查看成就徽章
  - **關於 Localite AI**: 應用資訊
  - **語言設定**: 多語言支援
  - **語音設定**: TTS 開關
- **繼續探索流程**: 多重返回選項
  - 從 DrawerNavigation 返回 GuideActivationScreen
  - 重新選擇場域和導覽員
  - 或完全結束應用使用

### 階段 7: 用戶管理與設定

```
登入用戶專屬功能
          │
          ▼
    ┌─────────────┐
    │ ProfileScreen │
    │             │
    │ 個人檔案管理  │
    │ 訂閱升級      │
    │ 帳號設定      │
    └─────────────┘
          │
          ▼
    ┌─────────────┐
    │ DrawerNav    │
    │ Settings     │
    │             │
    │ 應用設定管理  │
    │ 偏好設定      │
    └─────────────┘
          │
          ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 旅程記錄管理 │ │ 徽章成就    │ │ 學習專區    │
│             │ │             │ │             │
│ 查看/管理所有 │ │ 成就展示    │ │ 學習內容    │
│ 學習單        │ │ 進度追蹤    │ │ 管理        │
└─────────────┘ └─────────────┘ └─────────────┘
          │             │             │
          └───────┬─────┴───────┬─────┘
                  │             │
                  ▼             ▼
            ┌─────────────┐
            │ 商戶功能    │
            │ (規劃中)    │
            │             │
            │ 場域管理     │
            │ 統計數據     │
            └─────────────┘
```

**階段 7 詳細說明：**

- **ProfileScreen**: 用戶個人檔案管理
  - 個人資料設定和修改
  - 訂閱升級功能（開發中）
  - 帳號刪除功能（開發中）
  - 用戶偏好設定
- **DrawerNavigation 設定**: 應用偏好設定
  - **語言設定**: 中文/英文/日文切換
  - **語音設定**: TTS 語音開關
  - **主題設定**: 應用外觀偏好
- **登入用戶專屬功能**:
  - **旅程記錄管理**: 查看和管理所有學習單
  - **徽章成就系統**: 個人成就和進度追蹤
  - **學習專區**: 學習內容的集中管理
- **商戶功能 (規劃中)**: 預留的商戶管理介面
  - 場域內容管理
  - 遊客統計數據
  - 導覽內容編輯

## ⚠️ 當前實現狀態與發現的問題

### ✅ 已實現的功能

1. **完整的認證流程**

   - HomeScreen 登入狀態檢查 ✅
   - LoginValidationModal 訪客/登入選擇 ✅
   - Email/Google/Apple 登入支援 ✅

2. **雙重場域進入方式**

   - GPS 地圖定位 (500m 距離篩選) ✅
   - QR 掃描快速進入 ✅
   - PlaceIntroScreen 統一介紹體驗 ✅

3. **AI 導覽員系統**

   - 5 種個性化導覽員角色 ✅
   - ChatScreen 聊天介面 ✅
   - RouteCard/MiniCard 互動系統 ✅

4. **多媒體功能整合**

   - 拍照和相簿選擇 ✅
   - OCR 光學辨識 ✅
   - 圖片上傳處理 ✅

5. **導覽結束流程**

   - ChatEndScreen 3 種結束選項 ✅
   - JourneyValidationModal 登入檢查 ✅
   - LearningSheetScreen 旅程記錄 ✅

6. **用戶管理系統**
   - DrawerNavigation 側邊欄 ✅
   - ProfileScreen 個人檔案 ✅
   - BadgeScreen 徽章系統 ✅

### ⚠️ 發現的流程問題

#### 問題 1: TTS 語音功能的缺失

```
❌ 當前狀態:
• TTS 功能被註釋掉 (expo-speech)
• ChatScreen 中只有文字對話，缺乏語音導覽
• 影響沉浸式體驗的完整性
```

#### 問題 2: 導覽流程的中斷點

```
❌ 當前狀態:
• 從 ChatScreen 返回時會重置狀態
• 選擇場域後重新進入會重置之前的選擇
• 用戶在流程中斷後需要重新開始
```

#### 問題 3: 學習單生成的登入依賴

```
❌ 當前狀態:
• 旅程記錄生成完全依賴登入狀態
• 訪客模式無法製作個人化學習單
• 造成用戶體驗的不連貫
```

#### 問題 4: 商戶管理功能缺位

```
❌ 當前狀態:
• 完全沒有商戶管理介面
• 場域數據是靜態的 JSON 文件
• 缺乏動態內容管理和統計功能
```

#### 問題 5: 路線系統的完整性

```
❌ 當前狀態:
• RouteCard 只有展示功能，沒有實際導覽邏輯
• 固定路線與自由探索的差異不明顯
• 缺乏實際的導覽路徑指引
```

#### 問題 6: 數據持久化問題

```
❌ 當前狀態:
• 沒有本地數據持久化
• 每次重新啟動應用狀態會重置
• 聊天記錄和用戶選擇不會保存
```

## 🔧 具體的改進建議

### 高優先級修正 (立即實施)

#### 1. 恢復 TTS 語音功能

```typescript
// 在 ChatScreen.tsx 中取消註釋並修改 TTS 功能
// 1. 添加必要的 import
import * as Speech from "expo-speech";

// 2. 在訊息發送後自動播放語音
useEffect(() => {
  if (isTyping && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.from === "ai") {
      Speech.speak(lastMessage.text, {
        language: "zh-TW",
        pitch: 1.0,
        rate: 0.8,
      });
    }
  }
}, [isTyping, messages]);

// 3. 在 DrawerNavigation 中添加語音設定開關
// 使用現有的 voiceEnabled 狀態控制 TTS 功能
```

#### 2. 實現狀態持久化

```typescript
// 使用 AsyncStorage 保存用戶狀態
import AsyncStorage from "@react-native-async-storage/async-storage";

// 保存導覽狀態
const saveNavigationState = async (state: any) => {
  try {
    await AsyncStorage.setItem("navigationState", JSON.stringify(state));
  } catch (error) {
    console.error("保存狀態失敗:", error);
  }
};

// 恢復導覽狀態
const restoreNavigationState = async () => {
  try {
    const savedState = await AsyncStorage.getItem("navigationState");
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error("恢復狀態失敗:", error);
    return null;
  }
};
```

#### 3. 優化訪客模式體驗

```typescript
// 允許訪客模式製作基本學習單
const createGuestJourneyRecord = async () => {
  const basicRecord = {
    id: Date.now().toString(),
    type: "guest",
    placeId: selectedPlaceId,
    guideId: selectedGuide,
    messages: messages,
    createdAt: new Date().toISOString(),
    // 限制功能：無法分享、無法持久保存
  };
  // 本地儲存，應用重啟後清除
  return basicRecord;
};
```

### 中優先級修正 (近期實施)

#### 1. 完善路線系統

```typescript
// 實現實際的導覽邏輯
interface RouteNavigation {
  currentStep: number;
  totalSteps: number;
  currentLocation: LocationData;
  nextWaypoint: Waypoint;
  instructions: string;
  progress: number;
}

// 根據選擇的路線動態生成導覽內容
const generateRouteContent = (routeId: string, placeData: Place) => {
  const routeTemplates = {
    "tea-culture": {
      steps: ["認識茶葉歷史", "參觀製茶流程", "了解茶文化"],
      waypoints: placeData.teaCulturePoints || [],
    },
    // ... 其他路線
  };
  return routeTemplates[routeId];
};
```

#### 2. 增強學習單功能

```typescript
// 學習單生成系統
interface LearningSheetGenerator {
  // 基本學習單（訪客可用）
  generateBasicSheet(messages: Message[], place: Place): LearningSheet;

  // 高級學習單（登入用戶）
  generateAdvancedSheet(
    messages: Message[],
    place: Place,
    userPhotos: string[],
    achievements: Badge[]
  ): LearningSheet;

  // 分享功能
  shareSheet(
    sheet: LearningSheet,
    platform: "wechat" | "line" | "email"
  ): Promise<void>;
}
```

#### 3. 實現導覽進度保存

```typescript
// 導覽會話管理
class NavigationSession {
  private sessionId: string;
  private currentPlace: Place;
  private currentGuide: Guide;
  private messageHistory: Message[];
  private routeProgress: RouteProgress;

  // 保存進度
  async saveProgress(): Promise<void> {
    const progressData = {
      sessionId: this.sessionId,
      place: this.currentPlace,
      guide: this.currentGuide,
      messages: this.messageHistory,
      routeProgress: this.routeProgress,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      `session_${this.sessionId}`,
      JSON.stringify(progressData)
    );
  }

  // 恢復進度
  static async restoreSession(
    sessionId: string
  ): Promise<NavigationSession | null> {
    try {
      const data = await AsyncStorage.getItem(`session_${sessionId}`);
      if (data) {
        const progressData = JSON.parse(data);
        const session = new NavigationSession();
        Object.assign(session, progressData);
        return session;
      }
    } catch (error) {
      console.error("恢復會話失敗:", error);
    }
    return null;
  }
}
```

### 低優先級修正 (長期規劃)

#### 1. 商戶管理系統

```typescript
// 商戶管理介面架構
interface MerchantDashboard {
  // 場域管理
  venueManagement: {
    createVenue(): void;
    editVenue(venueId: string): void;
    publishVenue(venueId: string): void;
  };

  // 統計數據
  analytics: {
    visitorStats(): VisitorAnalytics;
    engagementMetrics(): EngagementData;
    revenueReports(): RevenueReport;
  };

  // 內容管理
  contentManagement: {
    uploadMedia(): void;
    createGuideContent(): void;
    manageRoutes(): void;
  };
}
```

#### 2. 增強地圖功能

```typescript
// 離線地圖支援
interface OfflineMapSupport {
  downloadMapRegion(region: Region): Promise<void>;
  cacheVenueData(venueId: string): Promise<void>;
  preloadRouteData(routeId: string): Promise<void>;
}

// 增強定位功能
interface EnhancedLocation {
  getPreciseLocation(): Promise<PreciseLocation>;
  trackUserMovement(): Observable<LocationUpdate>;
  calculateOptimalRoute(start: Location, end: Location): Route;
}
```

#### 3. 社群功能整合

```typescript
// 用戶社群功能
interface SocialFeatures {
  // 學習單分享
  shareJourney(journeyId: string): Promise<ShareResult>;

  // 用戶評價
  rateVenue(venueId: string, rating: number, review: string): Promise<void>;

  // 社群排行榜
  getLeaderboards(type: "visits" | "badges" | "reviews"): LeaderboardData;
}
```

## 📊 具體實施建議

### 🚨 高優先級 (立即實施 - 影響用戶體驗)

1. **恢復 TTS 語音功能**

   - 取消註釋 ChatScreen 中的 TTS 代碼
   - 添加語音設定開關到 DrawerNavigation
   - 實現語音播放進度控制

2. **實現數據持久化**

   - 添加 AsyncStorage 依賴
   - 保存用戶選擇和聊天記錄
   - 實現會話恢復功能

3. **優化訪客模式**
   - 允許訪客製作基本學習單
   - 限制功能清晰標示（無法分享、臨時保存）
   - 簡化登入引導流程

### ⚡ 中優先級 (近期實施 - 增強功能)

1. **完善路線導覽系統**

   - 實現 RouteCard 的實際導覽邏輯
   - 添加 GPS 導航和路線指引
   - 區分固定路線與自由探索的差異

2. **增強學習單功能**

   - 實現學習單分享功能
   - 添加照片上傳和編輯
   - 優化學習單生成流程

3. **改進用戶界面**
   - 優化 DrawerNavigation 的動畫效果
   - 改善地圖界面的用戶體驗
   - 統一應用內的視覺設計

### 🎯 低優先級 (長期規劃 - 擴展功能)

1. **商戶管理系統開發**

   - 設計完整的商戶管理介面
   - 實現動態場域內容管理
   - 添加統計數據儀表板

2. **進階功能開發**

   - 實現離線地圖和內容快取
   - 添加多語言支援
   - 開發社群功能和排行榜

3. **效能與架構優化**
   - 實現 PWA 支援
   - 優化應用啟動速度
   - 添加錯誤處理和崩潰恢復

## 🎯 結論與建議

### 專案現狀評估

Localite App 的專案架構和核心功能已經相當完整，實現了：

- ✅ React Native + Expo 的現代化技術架構
- ✅ 完整的用戶認證和訪客模式
- ✅ 雙重場域進入方式（GPS + QR 掃描）
- ✅ 5 種個性化 AI 導覽員角色
- ✅ 互動式聊天和多媒體功能
- ✅ 學習單生成和徽章系統

### 關鍵發現

1. **已實現的功能相當完善** - 核心用戶流程已完整實現
2. **TTS 語音功能缺失** - 影響沉浸式體驗的重要功能
3. **數據持久化問題** - 用戶體驗中斷的關鍵因素
4. **商戶管理功能缺位** - B2B 商業模式的關鍵缺失

### 實施建議

**立即執行（1-2 週）：**

1. 恢復 TTS 語音功能 - 提升用戶沉浸體驗
2. 實現數據持久化 - 解決用戶流程中斷問題
3. 優化訪客模式 - 降低使用門檻

**近期實施（1-2 個月）：**

1. 完善路線導覽邏輯 - 實現真正的導覽功能
2. 增強學習單功能 - 添加分享和個人化
3. 優化用戶介面 - 提升整體體驗品質

**長期規劃（3-6 個月）：**

1. 開發商戶管理系統 - 開啟 B2B 商業模式
2. 添加進階功能 - 離線支援、多語言、社群功能
3. 效能優化 - PWA 支援和架構改進

### 成功關鍵因素

1. **用戶體驗優先** - 特別是訪客模式的完整性和 TTS 功能的恢復
2. **技術實現扎實** - 保持當前的良好架構基礎
3. **商業模式清晰** - 及早實現商戶管理功能以開啟收入來源
4. **迭代優化策略** - 按照優先級逐步完善功能

---

_分析更新時間: 2024 年 12 月_
_分析者: AI 助理_
_專案版本: localite-app-stable v7_
_更新依據: 實際代碼結構分析_
