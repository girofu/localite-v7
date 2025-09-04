# DrawerNavigation 更新總結

## 概述
已成功更新 DrawerNavigation，使其在用戶登入後顯示用戶頭像和姓名，點擊後進入 ProfileScreen。

## 主要更新內容

### 1. 新增 Props
- `onNavigateToProfile`: 導航到 ProfileScreen 的回調函數
- `isLoggedIn`: 用戶登入狀態（布林值）
- `userAvatar`: 用戶頭像 URL（可選）
- `userName`: 用戶姓名/匿稱

### 2. 動態 Footer 顯示
- **未登入狀態**: 顯示「登入 | 註冊」按鈕
- **已登入狀態**: 顯示用戶頭像和姓名

### 3. 新增樣式
- `userAvatarContainer`: 用戶頭像容器
- `userAvatar`: 用戶頭像圖片
- `defaultUserAvatar`: 預設頭像（灰色圓圈）
- `defaultUserAvatarIcon`: 預設頭像圖標
- `userNameText`: 用戶姓名文字

## 使用方式

### 在 App.tsx 中配置
```tsx
<DrawerNavigation 
  onClose={goBack}
  onNavigateToLogin={() => navigateToScreen('login')}
  onNavigateToRegister={() => navigateToScreen('signup')}
  onNavigateToProfile={() => navigateToScreen('profile')}
  // User data - in real app this would come from user context/state
  isLoggedIn={isLoggedIn}
  userAvatar={userAvatar}
  userName={userName}
/>
```

### 狀態管理
- 當 `isLoggedIn={false}` 時，顯示「登入 | 註冊」
- 當 `isLoggedIn={true}` 時，顯示用戶頭像和姓名
- 點擊用戶區域會觸發 `onNavigateToProfile` 進入 ProfileScreen

## 視覺效果

### 未登入狀態
- 左側：登入圖標 + 「登入 | 註冊」文字
- 右側：更多選項圖標（三點）

### 已登入狀態
- 左側：用戶頭像（40x40 圓形）+ 用戶姓名
- 右側：更多選項圖標（三點）

## 技術實現

### 條件渲染
```tsx
{isLoggedIn ? (
  // 已登入：顯示用戶頭像和姓名
  <TouchableOpacity onPress={onNavigateToProfile}>
    <View style={styles.userAvatarContainer}>
      {/* 頭像顯示邏輯 */}
    </View>
    <Text style={styles.userNameText}>{userName}</Text>
  </TouchableOpacity>
) : (
  // 未登入：顯示登入｜註冊
  <TouchableOpacity onPress={onNavigateToLogin}>
    {/* 登入｜註冊顯示邏輯 */}
  </TouchableOpacity>
)}
```

### 頭像處理
- 如果有 `userAvatar`，顯示用戶上傳的頭像
- 如果沒有 `userAvatar`，顯示預設的灰色圓圈 + 用戶圖標

## 下一步

1. **整合用戶狀態管理**: 將 mock 數據替換為真實的用戶登入狀態
2. **頭像上傳**: 實現頭像上傳和儲存功能
3. **用戶資料同步**: 確保 ProfileScreen 和 DrawerNavigation 的用戶資料一致

## 使用方式

1. **運行應用**
2. **點擊選單按鈕**打開 DrawerNavigation
3. **查看 footer 區域**：
   - 未登入狀態：顯示「登入 | 註冊」按鈕
   - 已登入狀態：顯示用戶頭像和姓名
4. **點擊用戶區域**：進入 ProfileScreen
5. **測試返回和登出功能**
