# ProfileScreen 功能說明

## 概述
ProfileScreen 是一個個人檔案管理頁面，提供用戶管理個人資料、頭像、姓名等功能。

## 主要功能

### 1. 頭像管理
- 使用 `icon_profile.png` 圖標
- 預設顯示灰色圓圈，內含 `icon_user.png` 圖標
- 點擊頭像區域可開啟相簿選擇新頭像
- 支援圖片裁剪和品質優化

### 2. 電子郵件顯示
- 使用 `icon_mail.png` 圖標
- 顯示用戶登入的電子郵件地址
- 此區域不可編輯，僅供顯示

### 3. 姓名/匿稱編輯
- 使用 `icon_user.png` 圖標
- 預設顯示電子郵件 @ 符號前的名稱
- 點擊姓名區域進入編輯模式
- 編輯模式提供儲存(✓)和取消(✕)按鈕
- 使用 `icon_edit.png` 表示可編輯狀態

### 4. 訂閱方案
- 使用 `icon_hand.png` 圖標
- 固定顯示「免費遊覽方案」
- 此區域不可編輯

## 操作按鈕

### 昇級訂閱方案
- 使用 `icon_sparkles.png` 圖標
- 深灰色背景，白色文字
- 點擊觸發 `onUpgradeSubscription` 回調

### 刪除個人帳號
- 紅色背景，白色文字
- 點擊顯示確認對話框
- 確認後觸發 `onDeleteAccount` 回調

### 登出
- 使用 `icon_logout.png` 圖標
- 白色文字，無背景
- 設計與 DrawerNavigation 的「登入｜註冊」按鈕保持一致
- 包含分隔線和左對齊佈局
- 點擊觸發 `onLogout` 回調

## 技術特點

- 使用 React Native 和 TypeScript
- 整合 expo-image-picker 進行圖片選擇
- 響應式設計，支援 iOS 和 Android
- 深色主題設計，符合應用整體風格
- 完整的錯誤處理和用戶提示

## 使用方式

```tsx
import ProfileScreen from './screens/ProfileScreen';

// 在導航中使用
<ProfileScreen
  onBack={() => navigation.goBack()}
  onLogout={() => handleLogout()}
  onUpgradeSubscription={() => handleUpgrade()}
  onDeleteAccount={() => handleDeleteAccount()}
/>
```

## 依賴項目

- `expo-image-picker`: 圖片選擇功能
- `react-native`: 核心組件
- 圖標資源: 位於 `assets/icons/` 目錄
