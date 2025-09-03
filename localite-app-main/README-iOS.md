# iOS 部署指南

## 🍎 iOS 優先部署設定

本專案已針對 iOS 優先部署進行最佳化配置。

## 📋 環境需求

### 必要工具

- **macOS** (建議 macOS 13+)
- **Xcode** (建議 15.0+)
- **Node.js** (18.0+)
- **npm** (9.0+)
- **EAS CLI** (已自動安裝)
- **Expo CLI** (已自動安裝)

### Apple Developer 帳號

- 需要有效的 Apple Developer 帳號
- 建議使用 Apple Developer Program ($99/年)

## 🚀 快速開始

### 1. 環境設置

```bash
# 執行 iOS 自動設置腳本
./scripts/ios-setup.sh
```

### 2. 設備註冊 (實機測試)

```bash
# 註冊 iOS 設備
eas device:create
```

### 3. 憑證設置

```bash
# 設置 Apple Developer 憑證
eas credentials
```

### 4. 建置應用

#### iOS 模擬器版本

```bash
npm run build:ios:sim
```

#### iOS 實機開發版本

```bash
npm run build:ios:dev
```

#### iOS 生產版本

```bash
npm run build:ios
```

## 📱 建置配置

### 建置設定檔 (eas.json)

| 設定檔        | 用途       | 目標          | 配置    |
| ------------- | ---------- | ------------- | ------- |
| `development` | 模擬器開發 | iOS Simulator | Debug   |
| `ios-device`  | 實機開發   | 實體裝置      | Debug   |
| `preview`     | 測試版本   | 實體裝置      | Release |
| `production`  | 正式版本   | App Store     | Release |

### 環境變數配置

#### 開發環境 (.env.ios)

- 本地 API 端點
- 開發用 Firebase 配置
- 除錯模式開啟

#### 生產環境 (.env.production)

- 正式 API 端點
- 生產 Firebase 配置
- 分析和監控開啟

## 🔧 iOS 特定配置

### app.json 重要設定

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.localite.app",
      "deploymentTarget": "15.1",
      "supportsTablet": true,
      "usesAppleSignIn": false,
      "entitlements": {
        "com.apple.developer.networking.wifi-info": true
      }
    }
  }
}
```

### 權限設定

- **相機權限**: 拍照和掃描 QR Code
- **位置權限**: 提供位置相關導覽
- **麥克風權限**: 語音功能
- **相簿權限**: 照片選擇和分析
- **動作感測**: 提升導覽體驗

## 📦 部署流程

### 開發階段

1. 使用 iOS 模擬器進行快速測試
2. 在實機上測試核心功能
3. 驗證所有權限和功能

### 測試階段

1. 建置 preview 版本
2. 透過 TestFlight 分發
3. 收集測試反饋

### 生產階段

1. 建置 production 版本
2. 提交到 App Store
3. 等待審核和發布

## 🛠️ 常用指令

```bash
# 檢查專案健康狀態
npx expo-doctor

# 預建置 iOS 專案
npx expo prebuild -p ios --clean

# 在模擬器中執行
npx expo run:ios

# 在實機中執行
npx expo run:ios --device

# 檢查 EAS 建置狀態
eas build:list

# 提交到 App Store
eas submit --platform ios
```

## 🔍 故障排除

### 常見問題

#### 1. 憑證問題

```bash
# 重新設置憑證
eas credentials --clear-cache
eas credentials
```

#### 2. 依賴版本衝突

```bash
# 清理並重新安裝
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 3. Xcode 建置錯誤

```bash
# 清理 iOS 建置快取
npx expo prebuild -p ios --clean
cd ios && xcodebuild clean
```

#### 4. 模擬器問題

```bash
# 重置 iOS 模擬器
xcrun simctl erase all
```

## 📊 性能最佳化

### iOS 特定最佳化

- 使用 iOS 15.1+ 部署目標
- 啟用 Hermes JavaScript 引擎
- 最佳化圖片和資源大小
- 實作 iOS 原生導航

### 監控和分析

- Firebase Analytics (生產環境)
- Crashlytics 錯誤追蹤
- 性能監控 (開發階段啟用)

## 🔐 安全設定

### 資料保護

- 使用 iOS Keychain 儲存敏感資料
- 啟用 App Transport Security
- 實作生物識別認證 (未來版本)

### API 安全

- 使用 HTTPS 端點
- API Key 環境變數管理
- Firebase 安全規則

## 📱 App Store 準備

### 必要資料

- App 圖標 (1024x1024)
- 螢幕截圖 (各種裝置尺寸)
- App 描述 (繁體中文)
- 隱私政策 URL
- 支援 URL

### 提交檢查清單

- [ ] 所有功能正常運作
- [ ] 通過 App Store 審核指南
- [ ] 隱私權限說明完整
- [ ] 測試在各種 iOS 裝置
- [ ] 效能符合標準

## 🆘 支援資源

- [Expo iOS 文件](https://docs.expo.dev/workflow/ios/)
- [EAS Build 指南](https://docs.expo.dev/build/introduction/)
- [Apple Developer 文件](https://developer.apple.com/documentation/)
- [App Store 審核指南](https://developer.apple.com/app-store/review/guidelines/)


