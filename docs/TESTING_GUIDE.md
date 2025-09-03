# 🧪 測試指南與檔案目錄

## 📋 概述

本專案已建立完整的測試生態系統，包含單元測試、整合測試、端到端測試、性能測試和部署前檢查。所有測試檔案均有系統化的組織結構和執行順序。

## 📁 測試檔案目錄結構

### 核心測試檔案結構

```
localite-app-main/
├── __tests__/                          # 主要測試目錄
│   ├── setup.ts                       # 測試環境設置
│   ├── integration/                   # 整合測試
│   │   ├── ServiceIntegration.test.ts # 服務整合測試
│   │   └── UserJourney.test.ts        # 用戶旅程端到端測試
│   ├── navigation/                    # 導航測試
│   │   ├── AppNavigation.test.tsx     # 主導航測試
│   │   └── NavigationStructure.test.ts # 導航結構測試
│   ├── screens/                       # 畫面測試
│   │   ├── ChatScreen.test.tsx        # 聊天畫面測試
│   │   ├── ChatScreen.photo.test.tsx  # 聊天畫面照片功能測試
│   │   └── ChatScreen.voice.test.tsx  # 聊天畫面語音功能測試
│   └── services/                      # 服務測試
│       ├── APIService.simple.test.ts      # API 服務基礎測試
│       ├── APIService.integration.test.ts # API 服務整合測試
│       ├── ErrorHandlingService.test.ts   # 錯誤處理服務測試
│       ├── FirebaseAuthService.integration.test.ts     # Firebase 認證整合測試
│       ├── FirebaseStorageService.integration.test.ts   # Firebase 儲存整合測試
│       ├── FirestoreService.integration.test.ts         # Firestore 整合測試
│       ├── GoogleAIService.integration.test.ts          # Google AI 整合測試
│       ├── GoogleTTSService.integration.test.ts         # Google TTS 整合測試
│       ├── MerchantService.test.ts      # 商家服務測試
│       └── MultiLanguageService.test.ts # 多語言服務測試
│
├── scripts/                           # 測試腳本
│   ├── pre-release-check.cjs          # 部署前完整檢查腳本
│   ├── performance-test.js            # 性能測試腳本
│   ├── staging-setup.js               # Staging 環境設置腳本
│   ├── verify-api-keys.js             # API 金鑰驗證腳本
│   ├── fix-xcode.sh                   # Xcode 修復腳本
│   └── ios-setup.sh                   # iOS 設置腳本
│
├── jest.config.cjs                    # Jest 配置檔案
├── eslint.config.js                   # ESLint 配置檔案
└── tsconfig.json                      # TypeScript 配置檔案
```

## 🚀 測試執行指南

### 1. 快速測試執行順序

#### 階段一：基礎檢查 (建議每次提交前執行)

```bash
# 1. 程式碼品質檢查
npm run lint

# 2. TypeScript 類型檢查
npm run type-check

# 3. 基礎單元測試
npm run test
```

#### 階段二：完整測試套件 (建議發佈前執行)

```bash
# 1. 部署前完整檢查 (包含所有項目)
npm run pre-release-check

# 2. 測試覆蓋率檢查
npm run test:coverage

# 3. 性能測試
npm run performance-test
```

#### 階段三：特殊測試情境

```bash
# 監控模式測試
npm run test:watch

# 特定測試檔案
npm run test -- __tests__/services/ErrorHandlingService.test.ts

# 整合測試專門執行
npm run test -- --testPathPattern=integration

# 服務測試專門執行
npm run test -- --testPathPattern=services
```

### 2. 測試類型說明

#### 🔸 單元測試 (Unit Tests)

- **位置**: `__tests__/services/`
- **目的**: 測試個別函數、方法和模組
- **範例**: `ErrorHandlingService.test.ts`

#### 🔸 整合測試 (Integration Tests)

- **位置**: `__tests__/integration/`
- **目的**: 測試多個服務或模組間的互動
- **範例**: `ServiceIntegration.test.ts`

#### 🔸 端到端測試 (E2E Tests)

- **位置**: `__tests__/integration/UserJourney.test.ts`
- **目的**: 測試完整用戶流程
- **涵蓋**: 註冊 → 登入 → 聊天 → 導航 → 登出

#### 🔸 畫面測試 (Screen Tests)

- **位置**: `__tests__/screens/`
- **目的**: 測試 React Native 畫面組件
- **涵蓋**: 聊天畫面、導航功能

#### 🔸 導航測試 (Navigation Tests)

- **位置**: `__tests__/navigation/`
- **目的**: 測試應用導航結構和路由
- **涵蓋**: 導航配置、路由切換

## 📊 測試覆蓋率報告

### 當前覆蓋率狀態 (2024-09-02)

```
整體覆蓋率: 30.73%
目標覆蓋率: 75%
差距: 44.27%

模組覆蓋率排名:
1. ErrorHandlingService.ts    73.19% ✅
2. FirebaseStorageService.ts  72.66% ✅
3. FirebaseAuthService.ts     65.16% ✅
4. GoogleTTSService.ts        49.23% ⚠️
5. MultiLanguageService.ts    51.72% ⚠️
6. FirestoreService.ts        42.73% ⚠️
7. APIService.ts               0% ❌
8. GoogleAIService.ts          0% ❌
9. ServiceManager.ts           0% ❌
```

### 覆蓋率改進計劃

#### 🎯 高優先級 (立即執行)

- [ ] 修復 `APIService.ts` 單元測試 (0% → 70%)
- [ ] 修復 `GoogleAIService.ts` 單元測試 (0% → 70%)
- [ ] 修復 `ServiceManager.ts` 單元測試 (0% → 70%)

#### 📈 中優先級 (1-2 週內)

- [ ] 完善 `FirestoreService.ts` 測試 (42.73% → 80%)
- [ ] 完善 `GoogleTTSService.ts` 測試 (49.23% → 80%)
- [ ] 完善 `MultiLanguageService.ts` 測試 (51.72% → 80%)

#### 🎨 低優先級 (持續改進)

- [ ] 增加畫面組件測試覆蓋率
- [ ] 增加導航測試覆蓋率
- [ ] 建立視覺回歸測試

## 🛠️ 測試工具與配置

### Jest 配置 (`jest.config.cjs`)

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  testMatch: [
    "**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)",
    "!**/__tests__/setup.ts",
  ],
  // ... 其他配置
};
```

### ESLint 配置 (`eslint.config.js`)

```javascript
export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        // Node.js, Browser, React Native globals
        console: "readonly",
        process: "readonly",
        // ... 更多 globals
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      // ... 更多規則
    },
  },
];
```

## 📋 部署前檢查清單

### 自動化檢查項目

#### ✅ 程式碼品質檢查

```bash
npm run lint
```

- ESLint 程式碼風格檢查
- 未使用變數檢查
- 程式碼複雜度檢查

#### ✅ TypeScript 類型檢查

```bash
npm run type-check
```

- 編譯時類型檢查
- 類型安全驗證
- 介面一致性檢查

#### ✅ 單元測試檢查

```bash
npm run test
```

- 所有單元測試執行
- 測試通過率檢查
- 錯誤處理驗證

#### ✅ 測試覆蓋率檢查

```bash
npm run test:coverage
```

- 覆蓋率門檻驗證 (目標 75%)
- 未覆蓋程式碼識別
- 覆蓋率趨勢追蹤

#### ✅ 建置測試

```bash
npm run build:all
```

- Metro bundler 建置測試
- EAS Build 配置驗證
- 建置產物檢查

#### ✅ 安全檢查

```bash
node scripts/verify-api-keys.js
```

- API 金鑰洩露檢查
- 敏感資訊掃描
- 安全配置驗證

#### ✅ 效能檢查

```bash
npm run performance-test
```

- 應用啟動時間
- Bundle 大小分析
- 記憶體使用檢查

### 手動檢查項目

#### 🔍 應用功能測試

- [ ] 用戶註冊/登入流程
- [ ] 聊天功能正常運作
- [ ] 語音功能測試
- [ ] 相片分析功能測試
- [ ] 地點搜尋功能測試
- [ ] 導航功能測試

#### 📱 裝置相容性測試

- [ ] iOS 模擬器測試
- [ ] Android 模擬器測試
- [ ] 不同螢幕尺寸適配
- [ ] 網路狀態切換測試

#### 🔐 安全與隱私測試

- [ ] 資料加密驗證
- [ ] 用戶資料保護
- [ ] API 請求安全性
- [ ] 離線資料處理

## 🎯 測試最佳實踐

### 測試命名慣例

```typescript
// 單元測試
describe("ServiceName", () => {
  describe("methodName", () => {
    it("should return expected result when condition", () => {
      // 測試邏輯
    });
  });
});

// 整合測試
describe("Service Integration", () => {
  it("should handle end-to-end user flow", () => {
    // 整合測試邏輯
  });
});
```

### Mock 策略

```typescript
// Firebase 服務 Mock
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

// API 服務 Mock
jest.mock("../services/APIService", () => ({
  APIService: {
    sendChatMessage: jest.fn(),
    analyzeImage: jest.fn(),
  },
}));
```

### 測試資料管理

```typescript
// 測試資料工廠
const createMockUser = (overrides = {}) => ({
  id: "test-user-id",
  email: "test@example.com",
  displayName: "Test User",
  ...overrides,
});

// 測試設定
const testConfig = {
  timeout: 5000,
  retries: 3,
  apiUrl: "http://localhost:3001",
};
```

## 📈 持續整合建議

### GitHub Actions 工作流程

```yaml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - run: npm run pre-release-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run build:all
```

### 品質門檻設定

```javascript
// jest.config.cjs
module.exports = {
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
```

## 🐛 常見問題與解決方案

### 測試執行問題

#### Q: Jest 無法找到模組

```bash
# 解決方案：檢查 jest.config.cjs 中的模組映射
moduleNameMapper: {
  "^@/(.*)$": "<rootDir>/src/$1",
  "\\.(jpg|png|svg)$": "identity-obj-proxy",
},
```

#### Q: ESLint 報錯太多

```bash
# 解決方案：使用自動修復
npm run lint:fix

# 或調整規則嚴格度
rules: {
  "@typescript-eslint/no-explicit-any": "warn", // 改為警告而非錯誤
}
```

#### Q: 測試覆蓋率過低

```bash
# 解決方案：專注測試核心業務邏輯
# 忽略第三方程式庫和簡單 getter/setter
coveragePathIgnorePatterns: [
  "node_modules",
  "src/types",
  "src/config",
],
```

### 效能優化

#### Q: 測試執行太慢

```bash
# 解決方案：啟用平行執行
jest.config.cjs:
  maxWorkers: "50%", // 使用 CPU 核心的 50%
```

#### Q: Bundle 太大

```bash
# 解決方案：檢查依賴使用情況
npm run performance-test
# 查看 Bundle 分析報告
```

## 🎯 總結

本測試系統提供了完整的品質保障流程：

1. **分層測試架構**: 單元測試 → 整合測試 → 端到端測試
2. **自動化檢查**: 部署前自動執行 8 項品質檢查
3. **覆蓋率追蹤**: 持續監控和改進測試覆蓋率
4. **效能監控**: 應用啟動時間、Bundle 大小、記憶體使用
5. **CI/CD 整合**: 支援自動化測試流程

### 快速開始指南

```bash
# 1. 開發階段：快速檢查
npm run lint && npm run type-check && npm run test

# 2. 發佈準備：完整檢查
npm run pre-release-check

# 3. 效能分析：深入檢查
npm run performance-test

# 4. 覆蓋率：品質驗證
npm run test:coverage
```

這套測試系統確保了代碼品質、功能完整性和效能表現，讓你可以更自信地進行應用開發和部署！ 🚀
