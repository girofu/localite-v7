# 📱 EAS 憑證設定完整指南

## 🎯 當前狀態

✅ **EAS 項目已配置**

- 項目名稱: `@cwfu/Localite-App`
- 項目 ID: `48260140-7233-42af-b7ca-4ae2e6c0b1ff`
- Bundle ID: `com.localite.app`

## 📋 iOS 憑證狀態 (已完成 ✅)

### 已配置的憑證

```
Distribution Certificate: ✅ 已設置
├─ Serial Number: 20149B5399C5776A333376745FA55E7C
├─ 過期時間: Wed, 02 Sep 2026
└─ Apple Team: NK8JM2RG5G (CHANG-WEI FU)

Provisioning Profile: ✅ 已設置
├─ Developer Portal ID: 5QUZG9MU76
├─ Status: active
├─ 過期時間: Wed, 02 Sep 2026
└─ 已註冊設備: iPhone (UDID: 00008140-001A7854...)
```

## 🔧 憑證管理指令

### 1. 檢查憑證狀態

```bash
# 檢查所有憑證
eas credentials

# 檢查特定平台憑證
eas credentials --platform ios
eas credentials --platform android
```

### 2. iOS 憑證配置

#### 開發建置 (Development)

```bash
eas credentials --platform ios --profile development
```

**用途**: 真機測試、開發調試
**需要**: Development Certificate + Development Provisioning Profile

#### 預覽建置 (Preview/Ad Hoc)

```bash
eas credentials --platform ios --profile preview
```

**用途**: 內部測試、TestFlight 之前的測試
**需要**: Distribution Certificate + Ad Hoc Provisioning Profile

#### 生產建置 (Production)

```bash
eas credentials --platform ios --profile production
```

**用途**: App Store 發布
**需要**: Distribution Certificate + App Store Provisioning Profile

### 3. Android 憑證配置

#### 生成新的 Android Keystore

```bash
eas credentials --platform android --profile production
# 選擇 "Generate new keystore"
```

#### 使用現有 Keystore

```bash
eas credentials --platform android --profile production
# 選擇 "Upload existing keystore"
```

## 🚀 建置配置對應

### Development Profile

```json
"development": {
  "developmentClient": true,
  "distribution": "internal",
  "ios": {
    "simulator": true,
    "buildConfiguration": "Debug"
  }
}
```

**憑證需求**: Development Certificate (僅真機需要)

### iOS-Device Profile

```json
"ios-device": {
  "developmentClient": true,
  "distribution": "internal",
  "ios": {
    "simulator": false,
    "buildConfiguration": "Debug"
  }
}
```

**憑證需求**: Development Certificate + Development Provisioning Profile

### Preview Profile

```json
"preview": {
  "distribution": "internal",
  "ios": {
    "simulator": false,
    "buildConfiguration": "Release"
  }
}
```

**憑證需求**: Distribution Certificate + Ad Hoc Provisioning Profile

### Production Profile

```json
"production": {
  "distribution": "store",
  "ios": {
    "simulator": false,
    "buildConfiguration": "Release"
  }
}
```

**憑證需求**: Distribution Certificate + App Store Provisioning Profile

## 🔑 App Store Connect API Key 設置

### 1. 生成 API Key

1. 登入 [App Store Connect](https://appstoreconnect.apple.com)
2. 前往 **用戶和存取** > **金鑰**
3. 點擊 **生成 API 金鑰**
4. 選擇角色: **App Manager** 或 **Developer**
5. 下載 `.p8` 文件

### 2. 配置 EAS

```bash
eas credentials --platform ios
# 選擇 "App Store Connect: Manage your API Key"
# 選擇 "Set up your project to use an API Key for EAS Submit"
```

### 3. 手動配置 (可選)

在 `eas.json` 中添加:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascApiKeyPath": "./path/to/AuthKey_XXXXXXXXXX.p8",
        "ascApiKeyId": "XXXXXXXXXX",
        "ascApiKeyIssuerId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      }
    }
  }
}
```

## 🔔 Push Notifications 設置

### 1. 配置 APNs Key

```bash
eas credentials --platform ios
# 選擇 "Push Notifications: Manage your Apple Push Notifications Key"
```

### 2. Firebase Cloud Messaging (可選)

如果使用 Firebase，還需要配置:

```bash
eas credentials --platform android
# 配置 Firebase 服務帳戶金鑰
```

## 📱 建置命令

### 測試不同配置

```bash
# iOS 模擬器建置 (無需憑證)
eas build --platform ios --profile development

# iOS 真機開發建置
eas build --platform ios --profile ios-device

# iOS 預覽建置 (Ad Hoc)
eas build --platform ios --profile preview

# iOS 生產建置 (App Store)
eas build --platform ios --profile production

# Android 建置
eas build --platform android --profile production

# 同時建置兩個平台
eas build --platform all --profile production
```

## ⚠️ 常見問題與解決方案

### 1. 憑證過期

```bash
# 更新過期的憑證
eas credentials --platform ios --profile production
# 選擇 "Build Credentials" > "All: Set up all the required credentials"
```

### 2. 設備未註冊

```bash
# 添加新設備到 Ad Hoc Profile
eas device:create
eas credentials --platform ios --profile preview
# 更新 Provisioning Profile
```

### 3. Bundle ID 不匹配

確保以下文件中的 Bundle ID 一致:

- `app.json`: `expo.ios.bundleIdentifier`
- `ios/AI/AI.entitlements`
- Apple Developer Portal 中的 App ID

### 4. 權限問題

```bash
# 檢查當前登入帳戶
eas whoami

# 重新登入
eas logout
eas login
```

## 🔄 憑證備份與還原

### 備份憑證

```bash
# 下載憑證到本地
eas credentials --platform ios
# 選擇 "credentials.json: Upload/Download credentials"
# 選擇 "Download credentials to credentials.json"
```

### 還原憑證

```bash
# 從本地上傳憑證
eas credentials --platform ios
# 選擇 "credentials.json: Upload/Download credentials"
# 選擇 "Upload credentials from credentials.json"
```

## 📊 憑證檢查清單

### iOS 憑證完整性

- [ ] Distribution Certificate (有效期 2 年)
- [ ] Development Certificate (有效期 1 年)
- [ ] App Store Provisioning Profile
- [ ] Ad Hoc Provisioning Profile
- [ ] Development Provisioning Profile
- [ ] App Store Connect API Key
- [ ] APNs Key (如需 Push Notifications)

### Android 憑證完整性

- [ ] Upload Key (.jks 或 .keystore)
- [ ] Play Console Service Account JSON
- [ ] Firebase Service Account JSON (如使用 FCM)

## 🎯 下一步建議

1. **測試模擬器建置**: `eas build --platform ios --profile development`
2. **測試真機建置**: `eas build --platform ios --profile ios-device`
3. **配置 Android 憑證**: `eas credentials --platform android`
4. **設置 App Store Connect API Key** (用於自動提交)
5. **配置 Push Notifications** (如需要)

---

💡 **小貼士**: 憑證配置是一次性設置，完成後可以重複使用於多次建置。建議定期檢查憑證有效期，提前更新即將過期的憑證。
