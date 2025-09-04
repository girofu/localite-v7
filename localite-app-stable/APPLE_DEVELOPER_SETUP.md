# Apple 開發者帳戶設置指南

## 📋 需要填入的資訊

在 `eas.json` 的 `submit.production.ios` 和 `submit.preview.ios` 區域中，需要填入真實的 Apple 開發者帳戶資訊：

### 必填資訊

1. **appleId**: `your-apple-id@example.com`

   - 替換為你的 Apple ID email 地址
   - 例如：`developer@localite.app`

2. **ascAppId**: `your-app-store-connect-app-id`

   - App Store Connect 中應用程式的數字 ID
   - 在 App Store Connect > 我的 App > [你的應用程式] > App 資訊中找到
   - 格式：`1234567890`

3. **appleTeamId**: `your-apple-team-id`
   - Apple Developer Program 的團隊 ID
   - 在 Apple Developer Portal > Membership 中找到
   - 格式：`ABC1234567`

### 已配置的資訊 ✅

- **sku**: `com.localite.app` (Bundle ID)
- **language**: `zh-Hant` (繁體中文)
- **companyName**: `Localite Inc.`
- **appName**: `在地人 AI 導覽`

## 🚀 設置步驟

1. **註冊 Apple Developer Program**

   - 訪問 https://developer.apple.com/programs/
   - 年費 $99 USD

2. **創建 App Store Connect 應用程式**

   - 登入 https://appstoreconnect.apple.com/
   - 點擊 "+" 新增應用程式
   - 使用 Bundle ID: `com.localite.app`

3. **獲取必要 ID**

   - **Team ID**: Apple Developer Portal > Membership
   - **App ID**: App Store Connect > 應用程式詳情

4. **更新 eas.json**
   ```json
   "ios": {
     "appleId": "你的真實Apple ID",
     "ascAppId": "應用程式的數字ID",
     "appleTeamId": "你的團隊ID"
   }
   ```

## ⚠️ 注意事項

- 這些資訊只在提交到 App Store 時需要
- 開發和測試不需要這些資訊
- 請妥善保管這些敏感資訊，不要提交到版本控制

## 📱 測試說明

目前專案可以在 iOS 模擬器上運行而不需要填入這些資訊。只有在準備提交到 App Store 時才需要完成這個設置。
