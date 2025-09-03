# 更新日誌

所有 Localite 專案的重要更改都會記錄在此檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
並且此專案遵循 [語意化版本](https://semver.org/lang/zh-TW/)。

## [未發布]

### 新增
- **RouteCard 元件**：可重複使用的路線卡片元件，支援 props 傳入不同內容
- **MiniCard 元件**：可重複使用的小型卡片元件，支援圖示和標題
- **ButtonOption 元件**：可重複使用的選項按鈕元件
- **ButtonCamera 元件**：帶有相機圖示的按鈕元件
- **ExhibitCard 元件**：展覽卡片元件，去除學習單內容，尺寸為 W180 x H230
- **預覽頁面**：為每個新元件建立專屬預覽頁面
- **聊天介面整合**：將 MiniCard 和 RouteCard 整合到 ChatScreen 中
- **平行 Slide 展示**：實現水平滑動的卡片展示方式
- **聊天氣泡對齊**：調整 AI 導覽員頭像對齊文字第一行
- **學習單標籤樣式**：調整學習單標籤的圓角為 2px

### 變更
- 更新 expo 到 53.0.11
- 更新 expo-camera 到 16.1.8
- 更新 expo-linear-gradient 到 14.1.5
- 更新 react-native 到 0.79.3
- **ChatScreen 重構**：加入 MiniCard 和 RouteCard 的觸發邏輯
- **RouteCard 尺寸調整**：從 W280 x H280 調整為 W180 x H280
- **MiniCard 樣式調整**：圖示尺寸調整為 40x40，文字為 14pt Bold
- **聊天流程優化**：實現 AI 導覽員介紹 → MiniCard 選擇 → RouteCard 展示的流程

### 修復
- 修復 ChatScreen 中 TypeScript 類型錯誤
- 修復 RouteCard 水平滾動的樣式問題
- 修復聊天氣泡對齊問題

## [0.1.0] - 2024-03-21

### 新增
- 專案初始化
- 基本專案架構
- 初始文件

---

## 如何更新此文件

每次提交新的更改時，請在 [未發布] 區段下添加相應的更改記錄：

### 新增
- 新功能
- 新文件
- 新依賴

### 變更
- 現有功能的改進
- 文件更新
- 依賴更新

### 修復
- 錯誤修復
- 安全更新
- 效能改進

當發布新版本時，將 [未發布] 的內容移動到新的版本區段下。 