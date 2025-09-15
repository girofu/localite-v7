# 🔧 認證流程缺少的實作計劃

## 優先級 1：註冊後自動建立 Firestore 個人資料

### 當前問題

```typescript
// 目前 AuthContext.signUp 只有這樣：
const result = await authService.signUpWithEmail(email, password);
setUser(result.user); // ❌ 只有基本認證資訊，沒有個人資料
```

### 需要的修改

```typescript
// 修改後應該是：
const result = await authService.signUpWithEmail(email, password);

// 🔥 新增：建立 Firestore 個人資料
const firestoreService = new FirestoreService();
await firestoreService.createUser({
  uid: result.user.uid,
  email: result.user.email,
  isEmailVerified: result.user.emailVerified,
  preferredLanguage: "zh-TW",
});

setUser(result.user);
```

## 優先級 2：登入後同步完整用戶資料

### 當前問題

```typescript
// 目前只載入 Firebase Auth 基本資訊
const user = this.mapFirebaseUser(credential.user);
return { user }; // ❌ 缺少 Firestore 個人資料
```

### 需要的修改

```typescript
// 登入成功後應該同步 Firestore 資料
const authUser = this.mapFirebaseUser(credential.user);

// 🔥 新增：載入完整個人資料
const firestoreService = new FirestoreService();
const userProfile = await firestoreService.getUserById(authUser.uid);

if (!userProfile) {
  // 如果個人資料不存在，建立一個
  await firestoreService.createUser({
    uid: authUser.uid,
    email: authUser.email,
    isEmailVerified: authUser.emailVerified,
  });
}

return {
  user: authUser,
  profile: userProfile,
};
```

## 優先級 3：錯誤訊息中文化

### 當前問題

```typescript
// 錯誤訊息都是英文
switch (errorCode) {
  case "auth/user-not-found":
    message = "Invalid credentials"; // ❌ 英文訊息
}
```

### 需要的修改

```typescript
// 中文化錯誤訊息
const ERROR_MESSAGES = {
  "auth/user-not-found": "用戶不存在或密碼錯誤",
  "auth/wrong-password": "用戶不存在或密碼錯誤",
  "auth/invalid-credential": "用戶不存在或密碼錯誤",
  "auth/email-already-in-use": "此 Email 已被註冊",
  "auth/weak-password": "密碼強度不足，請使用至少 6 個字元",
  "auth/invalid-email": "Email 格式不正確",
  "auth/network-request-failed": "網路連線異常，請檢查網路設定",
};
```

## 實作順序建議

### 階段 1：修復註冊流程（1-2 小時）

1. 修改 `AuthContext.signUp`
2. 整合 `FirestoreService.createUser`
3. 加入錯誤處理
4. 測試註冊流程

### 階段 2：修復登入流程（1-2 小時）

1. 修改 `AuthContext.signIn`
2. 加入 Firestore 資料同步
3. 處理資料不存在情況
4. 測試登入流程

### 階段 3：改善用戶體驗（30 分鐘）

1. 中文化錯誤訊息
2. 測試各種錯誤情況

## 測試計劃

### 註冊流程測試

- [ ] 新用戶註冊成功
- [ ] 註冊後 Firestore 個人資料正確建立
- [ ] 重複 Email 註冊錯誤處理
- [ ] 密碼強度不足錯誤處理

### 登入流程測試

- [ ] 正確帳密登入成功
- [ ] 登入後完整用戶資料載入
- [ ] 錯誤帳密登入失敗
- [ ] 網路異常處理

### 整合測試

- [ ] 註冊後立即登入
- [ ] 認證狀態正確變化
- [ ] 個人化功能正常運作
- [ ] 日誌記錄完整

## 風險評估

### 低風險

- 中文化錯誤訊息
- 日誌記錄改善

### 中風險

- Firestore 個人資料同步邏輯
- 需要完整測試避免資料不一致

### 高風險

- 認證狀態管理修改
- 可能影響現有功能，需要完整回歸測試
