# Firebase 設置和帳號管理詳細教學

這份文檔將詳細指導你如何在 Firebase Console 中手動創建帳號，以及如何使用自動化腳本來管理測試帳號。

## 📋 目錄

1. [手動創建帳號 (Firebase Console)](#手動創建帳號-firebase-console)
2. [自動化腳本方式](#自動化腳本方式)
3. [登入測試](#登入測試)
4. [常見問題解決](#常見問題解決)

---

## 手動創建帳號 (Firebase Console)

### Step 1: 進入 Firebase Console

1. 開啟瀏覽器，前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 `localiteai-a3dc1`
3. 如果沒有存取權限，請聯繫專案管理員

### Step 2: 創建 Authentication 帳號

1. **進入 Authentication 頁面**

   - 在左側導航欄中點擊 `Authentication`
   - 點擊 `Users` 標籤頁

2. **添加管理員帳號**

   ```
   點擊 "Add user" 按鈕

   📧 Email: admin@localite.com
   🔐 Password: admin123456
   ✅ Email verified: 勾選

   點擊 "Add user" 完成
   ```

3. **添加商家帳號**

   ```
   再次點擊 "Add user" 按鈕

   📧 Email: merchant@localite.com
   🔐 Password: merchant123456
   ✅ Email verified: 勾選

   點擊 "Add user" 完成
   ```

4. **記錄 UID**
   - 創建完成後，在用戶列表中記下每個帳號的 `UID`
   - UID 是類似 `abc123def456...` 的長字串
   - 下一步設置 Firestore 資料時會用到

### Step 3: 設置 Firestore 權限數據

#### 3.1 創建管理員權限資料

1. **進入 Firestore Database**

   - 在左側導航欄點擊 `Firestore Database`
   - 確保已選擇正確的資料庫 (通常是 default)

2. **創建 admins Collection**

   ```
   點擊 "Start collection" 或 "+" 按鈕

   Collection ID: admins
   Document ID: [管理員帳號的 UID]

   Fields:
   ┌─────────────────┬────────────────┬─────────────────────────────────┐
   │ Field           │ Type           │ Value                           │
   ├─────────────────┼────────────────┼─────────────────────────────────┤
   │ uid             │ string         │ [管理員帳號的 UID]             │
   │ email           │ string         │ admin@localite.com              │
   │ isAdmin         │ boolean        │ true                            │
   │ role            │ string         │ super_admin                     │
   │ displayName     │ string         │ System Administrator           │
   │ permissions     │ array          │ ["all"]                         │
   │ createdAt       │ timestamp      │ [點擊選擇當前時間]              │
   │ lastLogin       │ timestamp      │ null                            │
   └─────────────────┴────────────────┴─────────────────────────────────┘

   點擊 "Save" 完成
   ```

3. **創建 users Collection (管理員)**

   ```
   創建新 Collection: users
   Document ID: [管理員帳號的 UID]

   Fields:
   ┌─────────────────┬────────────────┬─────────────────────────────────┐
   │ Field           │ Type           │ Value                           │
   ├─────────────────┼────────────────┼─────────────────────────────────┤
   │ uid             │ string         │ [管理員帳號的 UID]             │
   │ email           │ string         │ admin@localite.com              │
   │ isAdmin         │ boolean        │ true                            │
   │ role            │ string         │ super_admin                     │
   │ createdAt       │ timestamp      │ [當前時間]                      │
   └─────────────────┴────────────────┴─────────────────────────────────┘
   ```

#### 3.2 創建商家權限資料

1. **創建 merchants Collection**

   ```
   Collection ID: merchants
   Document ID: [商家帳號的 UID]

   Fields:
   ┌─────────────────┬────────────────┬─────────────────────────────────┐
   │ Field           │ Type           │ Value                           │
   ├─────────────────┼────────────────┼─────────────────────────────────┤
   │ uid             │ string         │ [商家帳號的 UID]               │
   │ email           │ string         │ merchant@localite.com           │
   │ businessName    │ string         │ 測試商家                        │
   │ contactPerson   │ string         │ 張老闆                          │
   │ businessType    │ string         │ restaurant                      │
   │ phone           │ string         │ +886-2-1234-5678                │
   │ address         │ string         │ 台北市信義區測試路123號         │
   │ status          │ string         │ approved                        │
   │ description     │ string         │ 測試商家帳號，用於開發測試      │
   │ createdAt       │ timestamp      │ [當前時間]                      │
   │ approvedAt      │ timestamp      │ [當前時間]                      │
   │ lastLogin       │ timestamp      │ null                            │
   └─────────────────┴────────────────┴─────────────────────────────────┘
   ```

2. **創建 users Collection (商家)**

   ```
   在 users Collection 中添加新 Document
   Document ID: [商家帳號的 UID]

   Fields:
   ┌─────────────────┬────────────────┬─────────────────────────────────┐
   │ Field           │ Type           │ Value                           │
   ├─────────────────┼────────────────┼─────────────────────────────────┤
   │ uid             │ string         │ [商家帳號的 UID]               │
   │ email           │ string         │ merchant@localite.com           │
   │ isMerchant      │ boolean        │ true                            │
   │ merchantId      │ string         │ [商家帳號的 UID]               │
   │ createdAt       │ timestamp      │ [當前時間]                      │
   └─────────────────┴────────────────┴─────────────────────────────────┘
   ```

---

## 自動化腳本方式

如果你想要更快速地創建測試帳號，可以使用我們提供的自動化腳本。

### 前置準備

#### Step 1: 下載 Service Account Key

1. **進入 Firebase Console**

   - 前往 [Firebase Console](https://console.firebase.google.com/)
   - 選擇專案 `localiteai-a3dc1`

2. **進入專案設置**

   - 點擊左上角的齒輪圖示 ⚙️
   - 選擇 `Project settings`

3. **進入 Service accounts 標籤頁**

   - 點擊 `Service accounts` 標籤
   - 確保選中 `Firebase Admin SDK`

4. **生成新私鑰**

   ```
   點擊 "Generate new private key" 按鈕

   ⚠️ 重要提醒會彈出
   點擊 "Generate key" 確認

   📥 JSON 檔案會自動下載
   重新命名為: service-account-key.json
   ```

5. **移動檔案到正確位置**
   ```bash
   # 將下載的檔案移動到 scripts 目錄
   mv ~/Downloads/localiteai-a3dc1-*.json /path/to/localite-v7/scripts/service-account-key.json
   ```

#### Step 2: 安裝依賴和執行腳本

```bash
# 1. 切換到 scripts 目錄
cd /Users/fuchangwei/Projects/localite-v7/scripts

# 2. 安裝 Node.js 依賴
npm install

# 3. 執行種子數據腳本
npm run seed

# 或者直接執行
node create-seed-accounts.js
```

### 執行結果

執行成功後會看到類似以下輸出：

```
🚀 開始創建 Localite 種子數據...

👨‍💼 創建管理員帳號...
✅ 成功創建 Auth 用戶: admin@localite.com (UID: abc123...)
✅ 成功創建管理員資料: admin@localite.com

🏪 創建商家帳號...
✅ 成功創建 Auth 用戶: merchant@localite.com (UID: def456...)
✅ 成功創建商家資料: 測試商家 (merchant@localite.com)

🎉 種子數據創建完成！

📋 登入資訊：
==========================================
🔐 管理員系統 (http://localhost:3001)
   Email: admin@localite.com
   Password: admin123456

🏪 商家系統 (http://localhost:3002)
   Email: merchant@localite.com
   Password: merchant123456
==========================================
```

### 清理種子數據

如果需要重新創建或清理測試數據：

```bash
# 清理所有種子數據
npm run clean

# 或者直接執行
node clean-seed-data.js
```

---

## 登入測試

### 管理員系統測試

1. **啟動管理員系統**

   ```bash
   cd /Users/fuchangwei/Projects/localite-v7/localite-admin-dashboard
   npm start
   ```

2. **訪問登入頁面**

   - 開啟瀏覽器，前往 http://localhost:3001
   - 應該會自動跳轉到登入頁面

3. **使用管理員帳號登入**

   ```
   📧 Email: admin@localite.com
   🔐 Password: admin123456
   ```

4. **驗證登入成功**
   - 登入成功後應該會跳轉到管理員控制台
   - 確認可以看到系統數據和管理功能

### 商家系統測試

1. **啟動商家系統**

   ```bash
   cd /Users/fuchangwei/Projects/localite-v7/localite-merchant-portal
   npm start
   ```

2. **訪問登入頁面**

   - 開啟瀏覽器，前往 http://localhost:3002
   - 應該會自動跳轉到登入頁面

3. **使用商家帳號登入**

   ```
   📧 Email: merchant@localite.com
   🔐 Password: merchant123456
   ```

4. **驗證登入成功**
   - 登入成功後應該會跳轉到商家控制台
   - 確認可以看到商家管理功能

---

## 常見問題解決

### Q1: 自動化腳本權限錯誤

**症狀：** 執行種子數據腳本時出現權限錯誤

```
FirebaseAuthError: Caller does not have required permission to use project
```

**原因：** Service Account 缺少必要的 IAM 權限

**解決方案：**

1. **前往 Google Cloud Console IAM 頁面**

   ```
   https://console.developers.google.com/iam-admin/iam/project?project=localiteai-a3dc1
   ```

2. **找到你的 Service Account 並編輯角色**

   - 找到類似 `firebase-adminsdk-xxx@localiteai-a3dc1.iam.gserviceaccount.com`
   - 點擊編輯按鈕 ✏️

3. **添加以下權限**

   ```
   ✅ Firebase Admin SDK Administrator Service Agent
   ✅ Service Usage Consumer
   ✅ Firebase Admin
   ✅ Editor (如果你是專案擁有者可選擇 Owner)
   ```

4. **等待權限生效** (2-5 分鐘)

### Q2: Firestore Security Rules 阻擋查詢

**症狀：** 登入後顯示 "存取被拒絕" 或 "Missing or insufficient permissions"

**原因：** Firestore Security Rules 太嚴格，阻擋了用戶查詢自己的資料

**解決方案：**

1. **前往 Firestore Rules 設置**

   - [Firestore Database Rules](https://console.firebase.google.com/project/localiteai-a3dc1/firestore/rules)
   - 點擊 "Rules" 標籤頁

2. **更新 Security Rules**

   ```javascript
   rules_version = '2';

   service cloud.firestore {
     match /databases/{database}/documents {
       // 用戶可以讀寫自己的資料
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }

       // 商家可以讀寫自己的資料
       match /merchants/{merchantId} {
         allow read, write: if request.auth != null && request.auth.uid == merchantId;
       }

       // 管理員可以讀寫自己的資料
       match /admins/{adminId} {
         allow read, write: if request.auth != null && request.auth.uid == adminId;
       }

       // 開發環境臨時規則 - 允許所有已認證用戶操作
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **點擊 "Publish" 發布規則**

### Q3: 管理員系統使用 Custom Claims vs Firestore 查詢

**症狀：** 管理員帳號存在但無法登入管理系統

**原因：** 管理員系統原本設計使用 Firebase Auth Custom Claims，但實際只有 Firestore 資料

**解決方案：**

我們已修改管理員系統改用 Firestore 查詢（統一架構）：

```javascript
// 原本：使用 Custom Claims
const claims = idTokenResult.claims;
const isAdminUser = claims.admin === true;

// 修改後：使用 Firestore 查詢
const adminDoc = await getDoc(doc(db, "admins", user.uid));
const isAdminUser = adminDoc.data().isAdmin === true;
```

### Q4: TypeScript 類型錯誤

**症狀：** 編譯時出現 `'error' is of type 'unknown'` 錯誤

**解決方案：**

```javascript
// 錯誤寫法
console.error("錯誤詳細:", error.message);

// 正確寫法
console.error(
  "錯誤詳細:",
  error instanceof Error ? error.message : String(error)
);
```

### Q5: 無法連接到 Firebase

**症狀：** 登入時出現網路連接錯誤

**解決方案：**

```bash
# 1. 檢查網路連接
ping console.firebase.google.com

# 2. 檢查 Firebase 配置
# 確認 .env 檔案中的配置正確
cat localite-admin-dashboard/.env
cat localite-merchant-portal/.env
```

### Q6: 帳號存在但無法登入

**症狀：** Firebase 中有帳號，但登入失敗

**可能原因：**

1. Firestore 中缺少對應的權限數據
2. 用戶角色配置錯誤
3. Document ID 與 UID 不匹配

**解決方案：**

```bash
# 重新執行種子腳本
cd scripts
node clean-seed-data.js  # 清理現有數據
node create-seed-accounts.js  # 重新創建
```

### Q7: UID 不匹配

**症狀：** 手動創建時 Firestore 數據與 Auth 不匹配

**解決方案：**

1. 在 Firebase Console Authentication 頁面找到正確的 UID
2. 更新 Firestore 中對應文檔的 UID 欄位
3. **關鍵：確保 Firestore Document ID 完全等於用戶 UID**

### Q8: 瀏覽器快取問題

**症狀：** 修改 Firestore 資料後仍然無法登入

**解決方案：**

1. **清除瀏覽器快取**

   - 按 `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`) 強制刷新
   - 或使用無痕視窗重新測試

2. **檢查 F12 開發者工具**
   - Console 標籤查看錯誤訊息
   - Network 標籤檢查 Firebase 請求狀態

---

## 🛠️ 開發調試技巧

### 添加調試日誌到 AuthContext

如果遇到登入問題，建議在 AuthContext 中添加詳細調試日誌：

**商家系統調試 (localite-merchant-portal/src/contexts/AuthContext.tsx):**

```javascript
const loadMerchantData = async (userId: string) => {
  console.log("🔍 開始查詢商家資料，UID:", userId);
  try {
    const merchantDoc = await getDoc(doc(db, "merchants", userId));
    console.log("📄 商家文檔存在:", merchantDoc.exists());

    if (merchantDoc.exists()) {
      const rawData = merchantDoc.data();
      console.log("📊 原始商家資料:", rawData);
      console.log("✅ 商家狀態:", rawData.status);
      // ... 更多調試日誌
    } else {
      console.log("❌ 找不到商家文檔！");
      console.log("🔍 查詢路徑: merchants/" + userId);
    }
  } catch (error) {
    console.error("❌ 載入商家資料失敗:", error);
  }
};
```

**管理員系統調試 (localite-admin-dashboard/src/contexts/AuthContext.tsx):**

```javascript
const checkAdminRole = async () => {
  console.log("🔍 檢查管理員權限，UID:", user.uid);
  const adminDoc = await getDoc(doc(db, "admins", user.uid));
  console.log("📄 管理員文檔存在:", adminDoc.exists());
  console.log("📊 管理員資料:", adminDoc.data());
  // ... 更多調試日誌
};
```

### 常用調試步驟

1. **檢查用戶 UID**

   ```javascript
   // 在 Console 中執行
   firebase.auth().currentUser?.uid;
   ```

2. **手動測試 Firestore 查詢**

   ```javascript
   // 在 Console 中執行
   import { doc, getDoc } from "firebase/firestore";
   import { db } from "./src/firebase/config";

   const testUID = "your-user-uid";
   getDoc(doc(db, "merchants", testUID)).then((doc) => {
     console.log("文檔存在:", doc.exists());
     console.log("文檔資料:", doc.data());
   });
   ```

3. **檢查 Security Rules**
   - 暫時使用寬鬆規則測試
   - 確認問題出在權限還是資料結構

---

## 🔧 進階設置

### 添加自定義管理員

如果需要添加更多管理員帳號：

1. **修改腳本配置**

   ```javascript
   // 在 create-seed-accounts.js 中添加
   const ADDITIONAL_ADMINS = [
     {
       email: "admin2@localite.com",
       password: "admin234567",
       displayName: "Secondary Admin",
     },
   ];
   ```

2. **或手動在 Firebase Console 中創建**
   - 按照上述手動步驟添加新帳號
   - 確保在 Firestore 中創建對應的權限數據

### 修改商家狀態

商家帳號有不同狀態，可以用來測試不同場景：

- `pending` - 待審核
- `approved` - 已核准 (可登入)
- `rejected` - 已拒絕
- `suspended` - 已暫停

### 批量清理數據

```javascript
// 在 clean-seed-data.js 中可以添加更多清理邏輯
const additionalCollections = ["orders", "products", "reviews"];
// 根據需要清理相關業務數據
```

---

## 📝 開發經驗總結

### 實際踩坑記錄

我們在設置過程中遇到的實際問題和解決方案：

1. **Service Account 權限配置複雜**

   - 需要多個角色：Service Usage Consumer、Firebase Admin 等
   - 權限生效需要等待時間

2. **Firestore Security Rules 容易出錯**

   - 開發環境建議使用寬鬆規則
   - 生產環境再細化具體權限

3. **認證架構統一很重要**

   - 商家系統：Firestore 查詢
   - 管理員系統：改為 Firestore 查詢（統一架構）
   - 避免混用 Custom Claims 和 Firestore

4. **調試技巧**
   - 添加詳細 console.log 幫助排錯
   - F12 開發者工具是最佳朋友
   - 清除瀏覽器快取很重要

### 生產環境注意事項

1. **移除調試日誌**

   ```javascript
   // 生產環境前移除所有 console.log 調試訊息
   ```

2. **細化 Security Rules**

   ```javascript
   // 移除寬鬆的開發環境規則
   // 只允許必要的讀寫權限
   ```

3. **定期輪換 Service Account Key**
   ```bash
   # 建議定期更新 service-account-key.json
   ```

---

## 📞 技術支援

如果遇到無法解決的問題：

1. 檢查 Firebase Console 中的 Authentication 和 Firestore 設置
2. 確認網路連接和 Firebase 服務狀態
3. 查看瀏覽器開發者工具的錯誤訊息
4. 檢查後端日志輸出
5. **使用 F12 Console 中的調試訊息進行排錯**

**祝你設置順利！** 🚀
