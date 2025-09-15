# Localite 帳號創建腳本

快速創建測試帳號的自動化腳本，包含管理員和商家帳號。

## 🚀 快速開始

### 1. 準備工作

```bash
# 切換到 scripts 目錄
cd scripts

# 安裝依賴
npm install
```

### 2. 下載 Firebase Service Account Key

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 `localiteai-a3dc1`
3. 設定 ⚙️ → Project settings → Service accounts
4. 點擊 "Generate new private key"
5. 下載的 JSON 檔案重命名為 `service-account-key.json` 並放到此目錄

### 3. 執行腳本

```bash
# 創建測試帳號
npm run seed

# 清理測試帳號 (可選)
npm run clean
```

## 📋 創建的帳號

執行成功後將創建以下測試帳號：

### 🔐 管理員系統 (http://localhost:3001)

- **Email:** admin@localite.com
- **Password:** admin123456

### 🏪 商家系統 (http://localhost:3002)

- **Email:** merchant@localite.com
- **Password:** merchant123456

## 📁 檔案說明

- `create-seed-accounts.js` - 創建種子數據主腳本
- `clean-seed-data.js` - 清理種子數據腳本
- `package.json` - Node.js 專案配置
- `service-account-key.json` - Firebase 服務帳號金鑰 (需手動下載)

## ⚠️ 注意事項

1. **service-account-key.json** 包含敏感資訊，請勿提交到 Git
2. 腳本執行前會檢查必要檔案是否存在
3. 如果帳號已存在，腳本會獲取現有 UID 並更新相關資料
4. 清理腳本會要求確認後才執行刪除操作

## 🐛 故障排除

### 常見錯誤

**找不到 service-account-key.json:**

```
請先從 Firebase Console 下載 Service Account Key
詳細步驟請參考: ../docs/FIREBASE_SETUP_GUIDE.md
```

**權限錯誤:**

```
確認 Firebase 專案權限正確，且 Service Account Key 有效
```

**網路連接問題:**

```
檢查網路連接和 Firebase 服務狀態
```

## 📚 詳細文檔

完整的操作指南和故障排除請參考：
👉 [FIREBASE_SETUP_GUIDE.md](../docs/FIREBASE_SETUP_GUIDE.md)

---

**快速測試流程：**

1. `npm install` → 2. 下載 service key → 3. `npm run seed` → 4. 啟動系統測試登入 ✅
