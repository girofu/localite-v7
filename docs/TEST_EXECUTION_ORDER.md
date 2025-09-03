# 🚀 測試執行順序指南

## 📋 總覽

按照以下順序執行測試，可以系統性地確保代碼品質和功能完整性。每個階段都有明確的目標和驗證標準。

---

## 🎯 第一階段：開發階段檢查 (每天執行)

### 目標

- 確保代碼品質
- 驗證基本功能
- 及早發現問題

### 執行順序

```bash
# 1. 程式碼品質檢查 (1-2分鐘)
npm run lint

# 2. TypeScript 類型檢查 (2-3分鐘)
npm run type-check

# 3. 基礎單元測試 (3-5分鐘)
npm run test
```

### 通過標準

- ✅ ESLint: 無錯誤 (警告可接受)
- ✅ TypeScript: 無編譯錯誤
- ✅ Jest: 測試通過率 > 80%

---

## 🔍 第二階段：整合測試 (PR 提交前)

### 目標

- 驗證服務間整合
- 測試用戶關鍵流程
- 檢查效能表現

### 執行順序

```bash
# 1. 所有測試執行
npm run test -- --run

# 2. 測試覆蓋率檢查
npm run test:coverage

# 3. 整合測試專門執行
npm run test -- --testPathPattern=integration

# 4. 效能測試 (可選)
npm run performance-test
```

### 通過標準

- ✅ 測試覆蓋率 > 30% (目標 75%)
- ✅ 所有關鍵用戶流程測試通過
- ✅ 無效能退化

---

## 🚀 第三階段：發佈前完整檢查 (發佈前必執行)

### 目標

- 確保生產環境就緒
- 驗證所有品質標準
- 確認安全性和相容性

### 執行順序

```bash
# 🎯 一步到位：完整檢查 (推薦)
npm run pre-release-check

# 或分步執行：
npm run lint
npm run type-check
npm run test:coverage
npm run build:all
npm run performance-test
```

### 通過標準

#### ✅ 必須通過項目 (0 錯誤容忍)

- 程式碼品質檢查 (ESLint)
- TypeScript 類型檢查
- 建置測試
- 安全檢查

#### ⚠️ 可接受警告項目

- 測試覆蓋率 (目標 75%，最低 30%)
- 效能指標 (有改進計劃即可)

---

## 🎨 第四階段：特殊情境測試

### Staging 環境測試

```bash
# 1. 設置 Staging 環境
npm run staging:setup

# 2. 部署到 Staging
npm run deploy:staging

# 3. 驗證 Staging 環境
npm run staging:validate
```

### 持續監控測試

```bash
# 監控模式 (開發時使用)
npm run test:watch

# 特定檔案測試
npm run test -- __tests__/services/APIService.test.ts

# 只執行失敗的測試
npm run test -- --onlyFailures
```

### CI/CD 環境測試

```bash
# GitHub Actions 或其他 CI 環境
npm ci                    # 乾淨安裝
npm run lint             # 程式碼檢查
npm run type-check       # 類型檢查
npm run test:coverage    # 覆蓋率測試
npm run build:all        # 建置測試
```

---

## 📊 測試結果解讀

### 成功標準一覽表

| 檢查項目   | 成功標準        | 失敗處理                |
| ---------- | --------------- | ----------------------- |
| ESLint     | 0 錯誤          | 執行 `npm run lint:fix` |
| TypeScript | 編譯通過        | 修復類型錯誤            |
| 單元測試   | >80% 通過       | 修復測試或代碼邏輯      |
| 覆蓋率     | >30% (目標 75%) | 增加測試用例            |
| 建置測試   | EAS Build 成功  | 檢查配置和依賴          |
| 效能測試   | 無重大退化      | 優化代碼或接受基準線    |

### 常見問題處理

```bash
# ESLint 錯誤太多
npm run lint:fix                    # 自動修復
npm run lint -- --quiet             # 只顯示錯誤

# 測試執行太慢
npm run test -- --maxWorkers=2      # 限制並行數
npm run test -- --testNamePattern="關鍵測試"  # 只執行重要測試

# 覆蓋率不夠
npm run test:coverage -- --collectCoverageFrom='src/services/**'  # 指定覆蓋範圍

# 記憶體不足
node --max-old-space-size=4096 node_modules/.bin/jest  # 增加記憶體
```

---

## 🎯 快速參考

### 日常開發 (最常用)

```bash
npm run lint && npm run type-check && npm run test
```

### 發佈準備 (完整檢查)

```bash
npm run pre-release-check
```

### 問題排查 (分步檢查)

```bash
npm run lint                    # 步驟1
npm run type-check             # 步驟2
npm run test                   # 步驟3
npm run test:coverage          # 步驟4
```

### 效能分析

```bash
npm run performance-test       # 效能報告
npm run test:coverage         # 覆蓋率報告
```

---

## 📈 品質改進追蹤

### 每月目標

- [ ] 測試覆蓋率提升 5%
- [ ] 減少 ESLint 警告 10%
- [ ] 改善效能指標 5%
- [ ] 新功能測試覆蓋率 80%

### 品質門檻

- **覆蓋率**: 最低 30%, 目標 75%
- **測試通過率**: 最低 80%, 目標 95%
- **建置成功率**: 100%
- **效能回歸**: 不得退化超過 5%

---

## 🆘 緊急情況處理

### 發佈截止日期臨近

```bash
# 核心功能優先檢查
npm run test -- --testPathPattern="services/ErrorHandlingService|navigation"

# 跳過效能測試 (如果時間緊迫)
npm run lint && npm run type-check && npm run test:coverage
```

### CI/CD 失敗

```bash
# 本地復現問題
npm ci
npm run pre-release-check

# 檢查特定失敗項目
npm run lint 2>&1 | head -20
npm run test 2>&1 | grep "FAILED"
```

### 重大回歸

```bash
# 緊急修復模式
npm run test -- --bail           # 第一個失敗就停止
npm run test -- --verbose        # 詳細輸出
npm run test -- --detectOpenHandles  # 檢查資源洩露
```

---

## 🎉 總結

按照這個執行順序，你可以：

1. **每天**: 維持代碼品質和基本功能
2. **PR 前**: 確保整合測試通過
3. **發佈前**: 進行完整品質驗證
4. **問題時**: 有系統的排查流程

這樣的分層檢查確保了代碼品質，同時不會影響開發效率！ 🚀
