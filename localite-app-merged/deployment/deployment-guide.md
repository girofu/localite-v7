# 在地人 AI 導覽 - 完整部署指南

## 🎯 部署概覽

本指南涵蓋 Day 22-24 部署準備階段的完整流程，包括：

- 環境配置管理
- EAS Build 建置流程
- App Store 和 Play Store 提交
- 安全性檢查和監控設置

## 📋 前置需求

### 必要工具安裝

```bash
# 1. 安裝 EAS CLI
npm install -g eas-cli

# 2. 登入 Expo 帳號
eas login

# 3. 確認專案連結
eas build:list
```

### 帳號和憑證準備

- **Expo 帳號**: 已建立並連結專案
- **Apple Developer Program**: $99/年會員資格
- **Google Play Console**: $25 一次性費用
- **Firebase 生產專案**: 獨立的生產環境專案

## 🔧 環境配置設置

### 1. 環境變數配置

已建立的環境檔案：

- `.env.production` - 生產環境配置
- `.env.staging` - 預生產環境配置
- `.env.example` - 環境變數模板

### 2. 生產環境 Firebase 設置

```bash
# 建立生產環境 Firebase 專案
firebase projects:create localite-production

# 初始化 Firebase 配置
firebase init

# 部署 Firestore 規則和 Cloud Functions
firebase deploy --only firestore:rules,functions
```

### 3. API Keys 安全配置

#### Google AI Studio API

1. 在 Google AI Studio 建立生產環境 API Key
2. 設置使用量限制和監控
3. 更新 `.env.production` 中的 API Key

#### Firebase 配置

1. 下載生產環境的 `google-services.json` (Android)
2. 下載生產環境的 `GoogleService-Info.plist` (iOS)
3. 更新 `.env.production` 中的 Firebase 配置

## 🏗️ EAS Build 建置流程

### 1. EAS 專案配置

`eas.json` 已配置三種建置設定檔：

- `development` - 開發版本 (internal distribution)
- `preview` - 預覽版本 (internal testing)
- `production` - 生產版本 (store submission)

### 2. Android 建置流程

#### 第一次建置設置

```bash
# 建立 Android Keystore (只需執行一次)
eas credentials

# 選擇 Android → Generate new keystore
# EAS 會自動產生並管理 keystore
```

#### 執行生產建置

```bash
# Android 生產版本建置 (AAB 格式，適合 Play Store)
eas build --platform android --profile production

# 檢查建置狀態
eas build:list

# 下載建置結果 (可選)
eas build:download [BUILD_ID]
```

### 3. iOS 建置流程

#### 第一次建置設置

```bash
# 設置 iOS 憑證 (需要 Apple Developer 帳號)
eas credentials

# 選擇 iOS → Generate new certificate and provisioning profile
# EAS 會自動處理憑證和配置文件
```

#### 執行生產建置

```bash
# iOS 生產版本建置
eas build --platform ios --profile production

# 同時建置兩個平台
eas build --platform all --profile production
```

### 4. 建置腳本自動化

更新的 `package.json` 腳本：

```json
{
  "scripts": {
    "build:android": "eas build --platform android --profile production",
    "build:ios": "eas build --platform ios --profile production",
    "build:all": "eas build --platform all --profile production",
    "build:preview": "eas build --platform all --profile preview",
    "submit:android": "eas submit --platform android",
    "submit:ios": "eas submit --platform ios",
    "deploy": "npm run lint && npm run type-check && npm run test && eas build --platform all --auto-submit"
  }
}
```

## 📱 應用商店提交

### 1. Google Play Store 提交

#### 準備服務帳號金鑰

1. 在 Google Cloud Console 建立服務帳號
2. 下載 JSON 金鑰檔案為 `play-store-service-account.json`
3. 在 Play Console 中授予服務帳號權限

#### 執行提交

```bash
# 第一次提交 (會提示設置)
eas submit --platform android

# 或使用自動建置+提交
eas build --platform android --auto-submit
```

#### 提交流程

1. EAS 會自動上傳 AAB 檔案
2. 在 Play Console 中設置應用程式資訊
3. 上傳截圖和圖形資產
4. 設置內容分級
5. 提交審核

### 2. Apple App Store 提交

#### 準備 App Store Connect

1. 在 App Store Connect 建立新應用程式
2. 填寫基本資訊 (Bundle ID: com.localite.app)
3. 上傳應用程式圖示和截圖

#### 執行提交

```bash
# 第一次提交
eas submit --platform ios

# 或使用自動建置+提交
eas build --platform ios --auto-submit
```

#### 提交流程

1. EAS 會自動上傳 IPA 檔案到 TestFlight
2. 在 App Store Connect 中完善應用程式資訊
3. 設置價格和發佈地區
4. 提交 App Store 審核

## 🧪 測試階段設置

### 1. 內部測試 (Alpha)

```bash
# 建置內部測試版本
eas build --platform all --profile preview

# 邀請內部測試員
# Android: 透過 Play Console 內部測試
# iOS: 透過 TestFlight 內部測試
```

### 2. 外部測試 (Beta)

#### Android 開放測試

1. 在 Play Console 設置開放測試軌道
2. 設置測試人數上限 (建議 1000 人)
3. 提供測試說明和意見回饋管道

#### iOS TestFlight 外部測試

1. 在 App Store Connect 設置外部測試
2. 邀請外部測試員 (最多 10,000 人)
3. 提供測試說明

### 3. 生產前最終測試

```bash
# 執行完整測試套件
npm run test:coverage

# 型別檢查
npm run type-check

# 程式碼規範檢查
npm run lint

# 手動功能測試檢查清單
```

## 🔒 安全性配置

### 1. API Keys 保護

#### 環境變數驗證

```bash
# 檢查環境變數配置
npm run env:check

# 驗證 API Keys 有效性
node scripts/verify-api-keys.js
```

#### Firebase 安全規則

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /places/{placeId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 2. 應用程式加固

#### Android ProGuard 配置

```groovy
// android/app/proguard-rules.pro
-keep class com.localite.app.** { *; }
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
```

#### iOS 安全設置

```xml
<!-- ios/LocaliteApp/Info.plist -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>
```

## 📊 監控和分析設置

### 1. Firebase Analytics 配置

```typescript
// src/services/AnalyticsService.ts
import analytics from "@react-native-firebase/analytics";

export class AnalyticsService {
  static async logEvent(eventName: string, parameters?: any) {
    if (process.env.NODE_ENV === "production") {
      await analytics().logEvent(eventName, parameters);
    }
  }

  static async setUserProperty(name: string, value: string) {
    if (process.env.NODE_ENV === "production") {
      await analytics().setUserProperty(name, value);
    }
  }
}
```

### 2. Crashlytics 設置

```typescript
// src/services/CrashReportingService.ts
import crashlytics from "@react-native-firebase/crashlytics";

export class CrashReportingService {
  static recordError(error: Error) {
    if (process.env.NODE_ENV === "production") {
      crashlytics().recordError(error);
    } else {
      console.error(error);
    }
  }

  static log(message: string) {
    if (process.env.NODE_ENV === "production") {
      crashlytics().log(message);
    }
  }
}
```

## 🚀 部署檢查清單

### 建置前檢查

- [ ] 所有環境變數正確設置
- [ ] Firebase 生產專案配置完成
- [ ] API Keys 安全限制已設置
- [ ] 程式碼審查完成
- [ ] 測試覆蓋率 ≥ 85%

### 建置階段檢查

- [ ] EAS Build 配置正確
- [ ] Android keystore 已設置
- [ ] iOS 憑證和配置文件已設置
- [ ] 建置成功完成
- [ ] 建置檔案完整性驗證

### 提交前檢查

- [ ] 應用程式圖示和截圖已準備
- [ ] Play Store 和 App Store 資料完整
- [ ] 隱私政策和使用條款可存取
- [ ] 內容分級設置正確
- [ ] 測試完成且問題已修復

### 提交後檢查

- [ ] 監控建置上傳狀態
- [ ] 設置應用商店頁面
- [ ] 準備審核期間的支援
- [ ] 設置發布後監控
- [ ] 準備回滾計劃

## 🔧 故障排除

### 常見建置問題

#### EAS Build 失敗

```bash
# 檢查建置日誌
eas build:list
eas build:view [BUILD_ID]

# 常見解決方案
1. 檢查 package.json 中的依賴版本
2. 清除 node_modules 並重新安裝
3. 檢查 app.json 配置語法
4. 確認環境變數正確設置
```

#### Android 建置問題

- Gradle 版本相容性
- NDK 版本問題
- Keystore 簽名問題

#### iOS 建置問題

- Xcode 版本相容性
- CocoaPods 依賴問題
- 憑證過期或配置錯誤

### 提交問題排除

#### Google Play 拒絕原因

- 權限使用說明不清楚
- 目標 SDK 版本過低
- 內容政策違規

#### App Store 拒絕原因

- 功能不完整或有 bug
- 隱私政策缺失
- 介面設計不符規範

## 📈 部署後監控

### 關鍵指標監控

- **安裝數**: 追蹤每日新增安裝
- **活躍用戶**: DAU/MAU 指標
- **崩潰率**: 維持在 1% 以下
- **評分**: 目標 4.0+ 星評
- **保留率**: 7 天和 30 天保留率

### 設置監控警報

```javascript
// 設置 Firebase 監控警報
const monitoring = {
  crashRate: { threshold: "1%", alert: true },
  performanceIssues: { threshold: "5%", alert: true },
  apiErrors: { threshold: "2%", alert: true },
};
```

## 🔄 持續部署流程

### 自動化 CI/CD

```yaml
# .github/workflows/deploy.yml (EAS Workflows 範例)
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build_and_deploy:
    name: Build and Submit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npx eas-cli build --platform all --auto-submit
```

### 版本管理策略

- **主版本**: 重大功能更新 (1.0.0 → 2.0.0)
- **次版本**: 新功能添加 (1.0.0 → 1.1.0)
- **修訂版**: Bug 修復 (1.0.0 → 1.0.1)

---

## 📞 支援和聯絡

### 緊急聯絡方式

- **技術支援**: dev-team@localite.app
- **應用商店問題**: store-support@localite.app
- **使用者支援**: support@localite.app

### 有用連結

- [EAS Build 文檔](https://docs.expo.dev/build/introduction/)
- [EAS Submit 文檔](https://docs.expo.dev/submit/introduction/)
- [App Store Connect 幫助](https://developer.apple.com/app-store-connect/)
- [Google Play Console 幫助](https://support.google.com/googleplay/android-developer/)

---

**重要提醒**: 首次部署建議先使用 preview 設定檔進行測試，確認所有流程正常後再進行生產部署。

