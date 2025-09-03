# 部署安全檢查清單

## 🔒 API Keys 和密鑰管理

### Firebase 配置安全

- [ ] **生產環境 Firebase 專案獨立**: 確保生產環境使用獨立的 Firebase 專案
- [ ] **API Keys 限制**: 在 Google Cloud Console 中限制 API Keys 的使用範圍
  - 限制 HTTP referrers (Android: com.localite.app)
  - 限制 IP 地址範圍 (如需要)
  - 限制 API 服務 (只啟用需要的服務)
- [ ] **Firebase Security Rules**: 配置適當的 Firestore 安全規則
- [ ] **Firebase Auth 設定**: 確保只啟用需要的登入方式

### Google AI Studio API 安全

- [ ] **API Key 保護**: 確保 API Key 不會在客戶端暴露
- [ ] **使用量監控**: 設置 API 使用量警報和限制
- [ ] **請求來源限制**: 限制 API Key 的使用來源

### 環境變數安全

- [ ] **敏感資料檢查**: 確保所有敏感資料都透過環境變數管理
- [ ] **.env 檔案保護**: 確保 .env 檔案不會提交到版本控制
- [ ] **生產環境配置**: 生產環境使用獨立的 API Keys 和配置

## 📱 應用程式安全

### 程式碼保護

- [ ] **混淆設置**: Android 啟用 ProGuard/R8 混淆
- [ ] **iOS 程式碼保護**: 啟用 Bitcode 和符號混淆
- [ ] **敏感資訊隱藏**: 確保沒有硬編碼的密鑰或敏感資訊
- [ ] **除錯模式關閉**: 生產版本關閉所有除錯模式

### 憑證和簽名

- [ ] **Android Keystore 保護**: 安全儲存 Android 簽名金鑰
- [ ] **iOS Certificates**: 確保 iOS 憑證和配置文件正確
- [ ] **簽名驗證**: 確保 APK/IPA 正確簽名

### 權限最小化

- [ ] **必要權限檢查**: 只申請應用程式必需的權限
- [ ] **權限說明**: 為所有權限提供清楚的使用說明
- [ ] **運行時權限**: Android 6.0+ 適當處理運行時權限

## 🌐 網路和資料安全

### 資料傳輸

- [ ] **HTTPS 強制**: 所有網路請求使用 HTTPS
- [ ] **SSL Pinning**: 實作 SSL Certificate Pinning (考慮)
- [ ] **資料加密**: 敏感資料傳輸時加密

### 本地資料保護

- [ ] **本地資料庫加密**: 使用 SQLCipher 或類似技術
- [ ] **暫存資料清理**: 適當清理暫存檔案和快取
- [ ] **敏感資料避免儲存**: 避免在本地儲存敏感資訊

## 🔐 使用者隱私保護

### 隱私政策和條款

- [ ] **隱私政策完整**: 詳細說明資料收集和使用方式
- [ ] **使用者條款**: 明確的使用者協議
- [ ] **同意機制**: 使用者明確同意資料處理

### 資料最小化

- [ ] **最少收集原則**: 只收集必要的使用者資料
- [ ] **資料保留期限**: 設定適當的資料保留政策
- [ ] **使用者控制權**: 提供資料刪除和修改選項

### GDPR 和法規遵循

- [ ] **GDPR 遵循**: 如果服務歐盟使用者，確保 GDPR 合規
- [ ] **本地法規**: 遵循台灣個資法等相關法規
- [ ] **資料跨境傳輸**: 適當處理跨境資料傳輸

## 🛡️ 應用程式防護

### 反逆向工程

- [ ] **程式碼混淆**: 啟用適當的程式碼混淆
- [ ] **反調試檢測**: 實作反調試機制 (可選)
- [ ] **Root/越獄檢測**: 檢測設備是否被 Root 或越獄

### 運行時保護

- [ ] **模擬器檢測**: 檢測應用程式是否在模擬器運行
- [ ] **Hooking 防護**: 防範應用程式被 Hook 或注入
- [ ] **螢幕錄製防護**: 防止敏感畫面被錄製 (可選)

## 📊 監控和日誌

### 安全監控

- [ ] **異常活動監控**: 監控異常的 API 呼叫和使用模式
- [ ] **失敗登入監控**: 記錄和監控登入失敗
- [ ] **安全事件記錄**: 記錄重要的安全相關事件

### 日誌安全

- [ ] **敏感資料過濾**: 確保日誌不包含敏感資料
- [ ] **日誌加密**: 考慮加密存儲的日誌
- [ ] **日誌保留政策**: 設定適當的日誌保留時間

## 🚨 事件回應計劃

### 安全事件處理

- [ ] **事件回應流程**: 制定安全事件回應計劃
- [ ] **聯絡清單**: 準備緊急聯絡人清單
- [ ] **回滾計劃**: 準備緊急版本回滾程序

### 漏洞管理

- [ ] **定期安全掃描**: 定期進行安全漏洞掃描
- [ ] **依賴項檢查**: 檢查第三方庫的安全漏洞
- [ ] **更新機制**: 建立快速安全更新機制

## ✅ 部署前最終檢查

### 組態確認

- [ ] **環境配置正確**: 確認所有環境變數正確設置
- [ ] **功能旗標設置**: 確認生產環境功能旗標正確
- [ ] **第三方服務**: 確認所有第三方服務正常運作

### 安全測試

- [ ] **滲透測試**: 進行基本的安全測試
- [ ] **API 安全測試**: 測試 API 端點的安全性
- [ ] **客戶端安全測試**: 檢查應用程式的客戶端安全

### 合規檢查

- [ ] **應用商店政策**: 確保符合 App Store 和 Play Store 政策
- [ ] **法律合規**: 確保符合相關法律法規
- [ ] **行業標準**: 遵循相關行業安全標準

## 📋 安全配置範例

### Firebase Security Rules 範例

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 使用者只能存取自己的資料
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 景點資料只能讀取
    match /places/{placeId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Android ProGuard 配置範例

```
# Keep API Keys 混淆
-keep class com.localite.app.config.ApiKeys { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
```

### iOS Info.plist 安全設置

```xml
<!-- 禁用 HTTP -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>

<!-- 防止螢幕錄製 (可選) -->
<key>UIApplicationExitsOnSuspend</key>
<false/>
```

## 🔄 持續安全維護

### 定期檢查項目

- **每週**: 檢查依賴項安全更新
- **每月**: 審查存取日誌和異常活動
- **每季**: 進行完整安全評估
- **每年**: 更新隱私政策和安全策略

### 團隊培訓

- 開發團隊安全意識培訓
- 最新安全威脅和防護措施更新
- 事件回應演練

---

**重要提醒**: 這份檢查清單應該根據應用程式的具體需求和威脅模型進行調整。建議定期更新和完善安全措施。

