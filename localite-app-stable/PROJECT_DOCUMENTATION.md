# Localite APP 專案說明書

## 專案概述
Localite 是一個導覽應用程式，提供景點導覽、QR Code 掃描、聊天等功能。

## 技術堆疊
- React Native / Expo
- TypeScript
- React Navigation
- Expo Camera (QR Code 掃描)
- React Native Maps (地圖功能)

## 專案結構
```
app/
├── (tabs)/              # 主要分頁導航
│   └── qrcodescannerscreen.tsx
├── screens/            # 所有畫面元件
│   ├── HomeScreen.tsx
│   ├── MapScreen.tsx
│   ├── ChatScreen.tsx
│   ├── QRCodeScannerScreen.tsx
│   ├── GuideSelectionScreen.tsx
│   ├── GuideActivationScreen.tsx
│   ├── JourneyDetailScreen.tsx
│   ├── LearningSheetScreen.tsx
│   ├── PlaceIntroScreen.tsx
│   └── ...
├── assets/            # 靜態資源
├── data/             # 資料檔案
└── utils/            # 工具函數
```

## 畫面說明

### 1. 首頁 (HomeScreen)
- **功能**：顯示主要導覽選項和推薦景點
- **主要元件**：
  - 景點卡片列表
  - 搜尋欄
  - 導覽選項按鈕

### 2. 地圖畫面 (MapScreen)
- **功能**：顯示景點位置和導覽路線
- **主要元件**：
  - 互動式地圖
  - 景點標記
  - 路線規劃

### 3. 聊天畫面 (ChatScreen)
- **功能**：與導覽員即時對話
- **主要元件**：
  - 聊天訊息列表
  - 輸入框
  - 語音訊息按鈕

### 4. QR Code 掃描器 (QRCodeScannerScreen)
- **功能**：掃描景點 QR Code
- **主要元件**：
  - 相機預覽
  - 掃描框
  - 手電筒控制
- **目前狀態**：
  - ⚠️ 目前僅為 UI Mockup
  - 相機功能尚未實作
  - QR Code 掃描功能待開發

### 5. 導覽員選擇 (GuideSelectionScreen)
- **功能**：選擇導覽員
- **主要元件**：
  - 導覽員列表
  - 篩選選項
  - 預約按鈕

### 6. 導覽員啟用 (GuideActivationScreen)
- **功能**：啟用導覽員服務
- **主要元件**：
  - 啟用碼輸入
  - 確認按鈕
  - 狀態顯示

### 7. 旅程詳情 (JourneyDetailScreen)
- **功能**：顯示旅程資訊
- **主要元件**：
  - 旅程時間軸
  - 景點資訊
  - 分享按鈕

### 8. 學習單 (LearningSheetScreen)
- **功能**：顯示景點相關學習資料
- **主要元件**：
  - 學習內容
  - 互動問答
  - 進度追蹤

### 9. 景點介紹 (PlaceIntroScreen)
- **功能**：顯示景點詳細資訊
- **主要元件**：
  - 景點圖片
  - 介紹文字
  - 相關連結

## 開發指南

### 環境設定
1. 安裝 Node.js 和 npm
2. 安裝 Expo CLI：`npm install -g expo-cli`
3. 安裝專案依賴：`npm install`

### 開發指令
- 啟動開發伺服器：`npx expo start`
- 在 iOS 模擬器運行：`npx expo start --ios`
- 在 Android 模擬器運行：`npx expo start --android`

### 程式碼規範
- 使用 TypeScript 進行開發
- 遵循 React Native 最佳實踐
- 使用 ESLint 和 Prettier 進行程式碼格式化

### 版本控制
- 使用 Git 進行版本控制
- 遵循 Git Flow 工作流程
- 提交訊息格式：`type(scope): message`

## 部署流程
1. 更新版本號
2. 更新 CHANGELOG.md
3. 提交更改
4. 建立發布標籤
5. 部署到 App Store / Google Play

## 注意事項
1. 確保相機權限設定正確
2. 注意地圖 API 金鑰的安全性
3. 定期更新依賴套件
4. 遵循 Apple 和 Google 的審查指南
5. ⚠️ QR Code 掃描功能目前僅為 UI Mockup，尚未實作相機功能

## 開發待辦事項
1. 實作 QR Code 掃描功能
   - 整合 Expo Camera
   - 實作 QR Code 解碼
   - 處理掃描結果
2. 相機權限處理
3. 掃描結果頁面設計

## 常見問題
1. 相機權限問題
2. 地圖載入失敗
3. 網路連線問題
4. 推播通知設定

## 聯絡資訊
- 專案負責人：[待補充]
- 技術支援：[待補充]
- 問題回報：[待補充] 