# 技術堆疊和開發指令

## 技術堆疊

### 前端框架
- **React Native** (19.0.0) - 跨平台移動應用開發
- **Expo** (53.0.11) - React Native 開發工具平台
- **TypeScript** (5.8.3) - 靜態類型檢查

### 後端服務
- **Firebase Authentication** - 用戶認證管理
- **Firebase Firestore** - NoSQL 資料庫
- **Firebase Storage** - 檔案存儲服務
- **Google AI Studio API** - AI 對話生成
- **Google Cloud TTS** - 文字轉語音服務

### 開發工具
- **Jest** - 測試框架
- **ESLint** - 程式碼檢查工具
- **TypeScript Compiler** - 類型檢查
- **Babel** - JavaScript 編譯器

## 核心開發指令

### 專案啟動
```bash
cd /Users/fuchangwei/Projects/localite-v7/localite-app-main
npm install                # 安裝依賴
npm start                  # 啟動 Expo 開發伺服器
npx expo start --ios       # 在 iOS 模擬器運行
npx expo start --android   # 在 Android 模擬器運行
```

### 測試指令
```bash
npm test                   # 執行所有測試
npm run test:watch         # 監聽模式測試
npm run test:coverage      # 生成測試覆蓋率報告
```

### 程式碼品質
```bash
npm run lint               # ESLint 檢查
npm run lint:fix           # 自動修復 ESLint 問題
npm run type-check         # TypeScript 類型檢查
```

### 建置指令
```bash
npm run build              # 生產環境建置（如果有配置）
```

## 測試配置
- 測試覆蓋率要求: 85% (functions, lines, statements), 80% (branches)
- 測試文件位置: `__tests__/**/*.(test|spec).(js|jsx|ts|tsx)`
- Mock 設置: 已配置 Firebase 和 Expo 相關服務的 Mock

## 重要文件路径
- 主應用: `localite-app-main/App.tsx`
- Firebase 配置: `src/config/firebase.ts`
- 服務層: `src/services/`
- 類型定義: `src/types/`
- 測試設置: `__tests__/setup.ts`