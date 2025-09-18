# Localite App 整合工作計劃

基於 CHANGELOG.md v1.0.3 和 v1.0.2 的更新內容，以下是從 `localite-app/` 整合到 `localite-app-merged/` 的詳細工作計劃。

## 📋 概述

根據 CHANGELOG.md，主要的新功能包括：
- 地點介紹卡片系統
- Firestore 服務整合
- 新聞系統重構
- 圖示資源更新
- 徽章圖片擴充

## 🔧 需要整合的組件

### 1. PlaceIntroCard 元件
**狀態**: 完全缺失
**位置**: `localite-app/components/PlaceIntroCard.tsx` → `localite-app-merged/components/PlaceIntroCard.tsx`
**功能**: 提供統一的地點介紹介面，包含愛心按讚功能
**依賴**: 使用 firestoreService 進行愛心狀態管理

### 2. News 資料系統
**狀態**: 完全缺失
**位置**: `localite-app/data/news.ts` → `localite-app-merged/data/news.ts`
**功能**: 新聞資料管理，支援 accordion 類型展示
**包含**: newsData 陣列、newsImages 圖片映射、NewsItem 介面

### 3. Firestore 服務
**狀態**: 功能衝突
**問題**: 
- `localite-app/utils/firestoreService.ts` 包含地點愛心功能
- `localite-app-merged/` 已有完整的 FirestoreService 類別
**解決方案**: 需要將愛心功能整合到 `localite-app-merged/src/services/FirestoreService.ts`

## 📱 需要更新的頁面

### 1. PlaceIntroScreen
**狀態**: 功能差異
**問題**: `localite-app-merged/` 的版本沒有使用 PlaceIntroCard 元件
**需要整合**: 
- 導入 PlaceIntroCard 元件
- 整合愛心按讚功能
- 更新 UI 佈局

### 2. news.tsx 頁面
**狀態**: 功能差異
**問題**: `localite-app-merged/` 的版本可能使用舊版新聞系統
**需要整合**:
- 導入 news.ts 資料
- 更新 accordion 展示邏輯
- 整合新聞圖片顯示

## 🖼️ 需要同步的資源

### 1. 新聞圖片
**缺失檔案**: 
- `assets/news/n001.png`
- `assets/news/n002.png`
- `assets/news/n003.png`
- `assets/news/n004.png`
- `assets/news/n005.png`

### 2. 圖示資源
**缺失檔案**:
- `assets/icons/icon_heart.png`
- `assets/icons/icon_heart_filled.png`
- `assets/icons/icon_arrow_left.png`
- `assets/icons/icon_star.png`
- `assets/icons/icon_calendar.png`

### 3. 徽章圖片
**缺失檔案**:
- `assets/badges/b4-2-share.png`
- `assets/badges/b4-3-share.png`
- `assets/badges/b4-3.png`

### 4. 場景圖片
**缺失檔案**:
- `assets/scenario/santa_bye.png`

## ⚙️ 整合步驟詳細計劃

### Phase 1: 資源文件同步
1. **複製缺失的圖片資源**
   ```bash
   cp localite-app/assets/news/* localite-app-merged/assets/news/
   cp localite-app/assets/icons/icon_heart*.png localite-app-merged/assets/icons/
   cp localite-app/assets/icons/icon_arrow_left.png localite-app-merged/assets/icons/
   cp localite-app/assets/icons/icon_star.png localite-app-merged/assets/icons/
   cp localite-app/assets/icons/icon_calendar.png localite-app-merged/assets/icons/
   cp localite-app/assets/badges/b4-*.png localite-app-merged/assets/badges/
   cp localite-app/assets/scenario/santa_bye.png localite-app-merged/assets/scenario/
   ```

2. **複製資料檔案**
   ```bash
   cp localite-app/data/news.ts localite-app-merged/data/news.ts
   ```

### Phase 2: 元件整合
1. **PlaceIntroCard 元件**
   - 複製 `localite-app/components/PlaceIntroCard.tsx`
   - 修改 import 路徑以適應 localite-app-merged 的結構
   - 整合到 TypeScript 類型系統

2. **FirestoreService 功能整合**
   - 將地點愛心功能從 `localite-app/utils/firestoreService.ts` 整合到現有的 FirestoreService 類別
   - 需要添加的方法:
     - `updatePlaceLikeCount()`
     - `subscribeToPlaceLikes()`
     - `checkUserLikeStatus()`

### Phase 3: 頁面更新
1. **PlaceIntroScreen 更新**
   - 導入 PlaceIntroCard 元件
   - 整合愛心功能邏輯
   - 更新 UI 佈局

2. **news.tsx 頁面更新**
   - 導入新聞資料系統
   - 更新 accordion 邏輯
   - 整合圖片顯示功能

### Phase 4: 類型定義更新
1. **新增介面定義**
   - NewsItem 介面
   - PlaceLikeData 介面
   - PlaceIntroCardProps 介面

## 🔍 潛在問題與風險

### 1. 依賴衝突
**問題**: localite-app 使用簡單的 utils 結構，而 localite-app-merged 使用完整的服務架構
**解決方案**: 重構 firestoreService 功能以符合 localite-app-merged 的架構

### 2. 狀態管理差異
**問題**: 愛心功能可能需要與現有的狀態管理系統整合
**解決方案**: 使用 localite-app-merged 現有的 Context 系統

### 3. 測試覆蓋
**問題**: 新整合的功能需要測試覆蓋
**解決方案**: 為 PlaceIntroCard 和愛心功能撰寫單元測試

## 🧪 測試計劃

### 1. 元件測試
- PlaceIntroCard 渲染測試
- 愛心按鈕功能測試
- 新聞 accordion 功能測試

### 2. 整合測試
- Firestore 愛心功能測試
- 新聞資料載入測試
- 圖片資源載入測試

### 3. E2E 測試
- 地點介紹頁面完整流程測試
- 新聞頁面互動測試

## 📊 預估工時

| 任務 | 預估時間 | 優先級 |
|------|----------|--------|
| 資源文件同步 | 0.5 天 | 高 |
| PlaceIntroCard 整合 | 1 天 | 高 |
| FirestoreService 整合 | 1.5 天 | 高 |
| PlaceIntroScreen 更新 | 1 天 | 中 |
| News 系統整合 | 1 天 | 中 |
| 測試撰寫與調試 | 1.5 天 | 高 |
| **總計** | **6.5 天** | |

## ✅ 完成檢查清單

### 基本功能
- [ ] PlaceIntroCard 元件運作正常
- [ ] 愛心按讚功能正常
- [ ] 新聞系統展示正確
- [ ] 所有圖片資源載入成功

### 整合品質
- [ ] 無 TypeScript 錯誤
- [ ] 無 ESLint 警告
- [ ] 所有測試通過
- [ ] 無記憶體洩漏

### 用戶體驗
- [ ] UI 佈局正確
- [ ] 互動流程順暢
- [ ] 效能無明顯下降
- [ ] 支援所有目標設備

## 🔄 回滾計劃

如果整合過程中出現問題：
1. 保留 localite-app-merged 的 git 備份
2. 分階段提交，便於快速回滾
3. 準備功能開關，可以暫時關閉新功能
