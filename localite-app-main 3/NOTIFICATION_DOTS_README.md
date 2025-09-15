# Drawer Navigation 通知小圓點功能

## 功能說明

在 drawer navigation 中為「我的徽章」和「關於Localite AI」選項添加了紅色小圓點，用於顯示更新狀態。

## 實作細節

### 1. UpdateContext (`contexts/UpdateContext.tsx`)
- 管理徽章和消息的更新狀態
- 提供檢查更新、標記已讀等功能
- 支援開發模式下的手動測試

### 2. DrawerNavigation 組件更新
- 導入 `useUpdate` hook
- 為「我的徽章」和「關於Localite AI」添加紅色小圓點
- 點擊時自動標記為已讀

### 3. 樣式
- 紅色小圓點：8x8 像素，圓角 4 像素
- 顏色：`#FF3B30`（iOS 系統紅色）
- 位置：選項文字右側

## 使用方法

### 開發測試
在開發模式下，可以使用以下控制台命令測試功能：

```javascript
// 觸發徽章更新通知
global.testUpdateBadges()

// 觸發消息更新通知
global.testUpdateNews()

// 清除所有通知
global.clearUpdates()
```

### 實際應用
在實際應用中，需要根據以下情況觸發更新：

1. **徽章更新**：
   - 用戶完成導覽任務
   - 用戶獲得新徽章
   - 檢查本地存儲的徽章記錄

2. **消息更新**：
   - 有新的系統公告
   - 有新的功能更新通知
   - 檢查 API 獲取最新消息

## 自定義更新邏輯

可以在 `UpdateContext.tsx` 中修改 `checkForBadgeUpdates` 和 `checkForNewsUpdates` 函數來實現實際的更新檢測邏輯。

## 注意事項

- 小圓點只在有更新時顯示
- 點擊對應選項後會自動標記為已讀
- 支援同時顯示多個通知
- 狀態會在應用重新啟動時重置（可根據需求修改為持久化存儲）
