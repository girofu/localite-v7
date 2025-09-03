# Localite-v7 項目概覽

## 項目目的
在地人 AI 導覽系統 (Localite AI Tour Guide) - 一個使用 AI 技術提供智能導覽服務的移動應用程式。

### 核心功能
1. **遊客端功能**:
   - Firebase 快速登入 (Email/Google)
   - AI 文字對話導覽 (Google AI Studio API)
   - 照片上傳分析 - 拍照詢問景點資訊
   - 基本語音播放 (Google TTS)
   - 中英文切換

2. **商戶端功能**:
   - 商戶註冊
   - 內容上傳 (景點介紹文字 + 圖片)
   - 內容管理系統

## 項目結構
```
localite-app-main/
├── app/                    # 主要應用頁面
├── screens/               # 所有畫面元件
├── components/            # 可重複使用的 UI 元件
├── src/
│   ├── config/           # Firebase 配置
│   ├── services/         # API 服務層
│   └── types/            # TypeScript 類型定義
├── __tests__/            # 測試文件
├── assets/               # 靜態資源
├── data/                 # 資料檔案
└── utils/                # 工具函數
```

## 開發狀態
目前已完成:
- [x] Firebase 基礎設置 (Auth, Firestore, Storage)
- [x] Google AI Studio API 整合
- [x] Google TTS 服務整合
- [x] 基礎服務架構

進行中:
- [ ] Mobile App UI 開發
- [ ] AI 導覽功能完善
- [ ] 商戶後台開發

## 關鍵文件
- `PROJECT_DOCUMENTATION.md` - 詳細項目說明
- `COMPONENTS_GUIDE.md` - UI 元件使用指南
- `MVP-精簡上線規劃.md` - 30天開發計劃
- `30天開發檢查清單.md` - 詳細開發步驟