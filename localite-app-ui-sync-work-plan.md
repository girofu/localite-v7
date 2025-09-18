# Localite App UI 同步工作規劃

## 基於 CHANGELOG v1.0.0 - v1.0.3 版本差異分析

### 📋 專案概述

此文件記錄了 `localite-app/` 與 `localite-app-merged/` 之間的 UI 層面差異，並制定詳細的同步工作計劃。重點在於保留 `localite-app-merged/` 的後端架構，僅同步 UI 相關的新增和改進。

---

## 🔍 主要差異分析

### 1. 架構差異

| 項目          | localite-app        | localite-app-merged        |
| ------------- | ------------------- | -------------------------- |
| **目錄結構**  | 扁平化結構 (根目錄) | 層次化結構 (src/ 目錄)     |
| **Type 定義** | `../data/badges`    | `../src/types/badge.types` |
| **Services**  | 簡化版本            | 完整的服務層架構           |
| **後端整合**  | 註釋掉的 Firestore  | 完整的 Firestore 整合      |

### 2. 新增檔案需求

| 檔案路徑                        | 狀態    | 說明               |
| ------------------------------- | ------- | ------------------ |
| `components/PlaceIntroCard.tsx` | ❌ 缺失 | 地點介紹卡片元件   |
| `data/news.ts`                  | ❌ 缺失 | 新聞資料結構       |
| `utils/firestoreService.ts`     | ❌ 缺失 | Firestore 服務工具 |

---

## 🛠️ 工作任務清單

### Phase 1: 新增元件同步 (高優先級)

#### 1.1 PlaceIntroCard 元件

**檔案**: `components/PlaceIntroCard.tsx`

- **狀態**: 需新增
- **功能**: 地點介紹卡片，支援愛心計數和翻轉顯示徽章
- **依賴**:
  - Badge 資料結構 ✅
  - 地點資料結構 ✅
  - 愛心互動功能 🔄 (需適配 merged 版本的 Firestore)

#### 1.2 News 資料系統

**檔案**: `data/news.ts`

- **狀態**: 需新增
- **功能**: 新聞資料結構和圖片資源對應
- **依賴**:
  - 新聞圖片資源 (`assets/news/`)
  - Accordion 展開/收合功能

### Phase 2: UI 功能增強

#### 2.1 通知系統優化

**影響檔案**:

- `contexts/UpdateContext.tsx`
- `screens/AboutLocalite.tsx`
- `screens/DrawerNavigation.tsx`

**改進點**:

- ✅ 紅點位置優化（文字最後一個字的右上角）
- ✅ 隱私權政策通知功能
- ✅ 佈局一致性改進

#### 2.2 Babyron 導覽員整合

**影響檔案**:

- `data/guide.ts` - 新增 babyron 導覽員
- `screens/ChatScreen.tsx` - 新增 babyron 圖像支援
- `screens/ChatEndScreen.tsx` - 新增 babyron bye 場景

**新增資源**:

- `assets/guides/babyron_guide.png`
- `assets/scenario/babyron_bye.png`

#### 2.3 徽章圖片資源擴展

**新增徽章圖片**:

- B4-2 系列和 B4-3 系列徽章圖片
- 對應的 share 版本圖片

### Phase 3: 介面一致性改進

#### 3.1 選單項目佈局統一

**影響檔案**: `screens/AboutLocalite.tsx`

- ✅ 確保所有選單項目的右箭頭正確對齊
- ✅ 統一佈局結構

#### 3.2 版本資訊更新

**影響檔案**: `screens/AboutLocalite.tsx`

- 更新版本號為 V1.0.3

---

## 🔄 同步策略

### 原則 1: 保留 merged 版本架構

- **不修改**: `src/services/`, `src/types/`, `src/hooks/` 等後端架構
- **只同步**: UI 元件、頁面、資料結構、樣式

### 原則 2: 適配 Import 路徑

localite-app → localite-app-merged 的路徑轉換：

```typescript
// localite-app 格式
import { Badge } from "../data/badges";

// 需要轉換為 localite-app-merged 格式
import { Badge } from "../src/types/badge.types";
```

### 原則 3: 保持功能完整性

- Firestore 整合：使用 merged 版本的 `FirestoreService`
- 通知系統：保留 merged 版本的 Context 架構
- 導覽員系統：確保新增的 babyron 能與現有服務整合

---

## 📝 詳細實作步驟

### Step 1: PlaceIntroCard 元件遷移

```bash
# 1. 複製元件檔案
cp localite-app/components/PlaceIntroCard.tsx localite-app-merged/components/

# 2. 修改 import 路徑適配 merged 版本架構
# 3. 整合 Firestore 服務調用
# 4. 測試愛心計數功能
```

### Step 2: News 系統整合

```bash
# 1. 檢查是否已有新聞相關實作在 merged 版本
# 2. 同步新聞資料結構
# 3. 確保 news.tsx 頁面正常運作
# 4. 驗證圖片資源載入
```

### Step 3: Babyron 導覽員整合

```bash
# 1. 檢查 guide.ts 是否已包含 babyron
# 2. 確保所有相關圖片資源已同步
# 3. 測試導覽員選擇和聊天功能
# 4. 驗證場景圖片顯示
```

### Step 4: 通知系統驗證

```bash
# 1. 檢查 UpdateContext 是否包含隱私權政策通知
# 2. 驗證紅點位置是否正確
# 3. 測試通知狀態管理
# 4. 確保佈局一致性
```

---

## 🧪 測試檢查清單

### UI 元件測試

- [ ] PlaceIntroCard 愛心功能正常
- [ ] PlaceIntroCard 翻轉動畫流暢
- [ ] 徽章資訊正確顯示
- [ ] 地點資訊正確載入

### 通知系統測試

- [ ] 紅點位置準確（文字右上角）
- [ ] 隱私權政策通知正常
- [ ] 新聞通知正常
- [ ] 徽章通知正常

### 導覽員系統測試

- [ ] Babyron 導覽員可正常選擇
- [ ] Babyron 圖像正確顯示
- [ ] Babyron bye 場景正確
- [ ] 與現有導覽員無衝突

### 整體整合測試

- [ ] 所有頁面導航正常
- [ ] 沒有破壞現有功能
- [ ] 新增功能與後端服務正常整合
- [ ] 效能沒有顯著下降

---

## ⚠️ 注意事項

### 重要限制

1. **不可修改**: `localite-app-merged/src/services/` 下的所有服務層代碼
2. **不可修改**: `localite-app-merged/src/types/` 下的類型定義
3. **不可修改**: 現有的資料庫架構和 API 介面

### 優先級排序

1. **P0 (Critical)**: PlaceIntroCard 元件缺失
2. **P1 (High)**: Babyron 導覽員整合
3. **P2 (Medium)**: News 系統同步
4. **P3 (Low)**: 版本號更新和細節優化

### 風險評估

- **低風險**: UI 元件和樣式修改
- **中風險**: 新增導覽員可能影響現有邏輯
- **高風險**: Firestore 服務整合需謹慎測試

---

## 📈 預期成果

完成同步後，`localite-app-merged/` 將具備：

- ✅ 完整的地點介紹卡片功能
- ✅ Babyron 導覽員支援
- ✅ 優化的通知系統
- ✅ 改進的 UI 佈局一致性
- ✅ 保持原有的後端服務架構完整性

---

## 📅 預估時間

| 階段     | 預估時間     | 說明               |
| -------- | ------------ | ------------------ |
| Phase 1  | 2-3 小時     | 元件遷移和路徑適配 |
| Phase 2  | 3-4 小時     | 功能整合和測試     |
| Phase 3  | 1-2 小時     | 佈局優化和細節調整 |
| **總計** | **6-9 小時** | 包含測試和驗證時間 |

---

_文件生成時間: 2025-01-15_  
_基於: CHANGELOG.md v1.0.0-v1.0.3 分析_
