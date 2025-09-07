# Localite 三系統獨立架構

## 🏗️ 系統架構總覽

本專案已成功重構為三個完全獨立的系統，每個系統針對不同用戶群體設計：

```
Localite 生態系統
├── 用戶系統 (localite-app-stable/)     - React Native + Expo
├── 管理員系統 (localite-admin-dashboard/) - React Web
└── 商家系統 (localite-merchant-portal/)   - React Web
```

## 🎯 系統分工

### 📱 用戶系統 (React Native)

- **端口**: 19006 (Expo)
- **目標群體**: 終端用戶 (遊客)
- **主要功能**:
  - 旅遊景點導覽
  - AI 聊天助手
  - 照片上傳與識別
  - 個人化推薦
  - 地圖導航

### 👔 管理員系統 (React Web)

- **端口**: 3001
- **目標群體**: 系統管理員
- **主要功能**:
  - 用戶管理 (查看、編輯、角色管理)
  - 商家管理 (審核、驗證、狀態管理)
  - 系統統計與分析
  - 稽核日誌查看
  - 系統設定管理
- **權限層級**:
  - super_admin (超級管理員)
  - user_manager (用戶管理員)
  - merchant_manager (商家管理員)
  - analyst (分析師)
  - auditor (稽核員)

### 🏪 商家系統 (React Web)

- **端口**: 3002
- **目標群體**: 商家業主
- **主要功能**:
  - 商家資料管理
  - 產品/服務管理
  - 訂單處理
  - 營業分析
  - 客戶互動

## 🚀 系統啟動

### 方式一：統一啟動腳本 (推薦)

```bash
./start-systems.sh
```

### 方式二：個別啟動

```bash
# 用戶系統
cd localite-app-stable
npx expo start --port 19006

# 管理員系統
cd localite-admin-dashboard
npm start  # 運行在端口 3001

# 商家系統
cd localite-merchant-portal
npm start  # 運行在端口 3002
```

## 🌐 系統存取

| 系統       | 存取方式   | 網址                  | 說明                  |
| ---------- | ---------- | --------------------- | --------------------- |
| 用戶系統   | 手機 App   | 掃描 QR 碼            | 使用 Expo Go 應用程式 |
| 管理員系統 | Web 瀏覽器 | http://localhost:3001 | 需要管理員權限        |
| 商家系統   | Web 瀏覽器 | http://localhost:3002 | 需要商家帳號          |

## 🔐 認證與權限

### 共享 Firebase 配置

三個系統共享同一個 Firebase 專案 (`localiteai-a3dc1`)，但使用不同的權限檢查：

- **用戶系統**: 基本 Firebase Auth
- **管理員系統**: Firebase Auth + Custom Claims (admin: true)
- **商家系統**: Firebase Auth + Firestore merchants 集合檢查

### 測試帳號

```
管理員測試帳號: girofu@gmail.com
商家測試帳號: (需要在 Firebase 中建立)
```

## 📁 文件結構

### 用戶系統 (localite-app-stable/)

```
localite-app-stable/
├── src/
│   ├── contexts/         # React 上下文
│   ├── screens/
│   │   ├── auth/        # 認證相關頁面
│   │   └── main/        # 主要功能頁面
│   ├── navigation/      # 導航配置 (已清理)
│   ├── services/        # API 服務層
│   └── types/           # TypeScript 類型
├── assets/              # 資源文件
├── app.json             # Expo 配置
└── package.json         # React Native 依賴
```

### 管理員系統 (localite-admin-dashboard/)

```
localite-admin-dashboard/
├── src/
│   ├── contexts/        # 管理員認證上下文
│   ├── pages/           # React 頁面組件
│   ├── components/      # UI 組件
│   ├── services/        # 管理員 API 服務
│   ├── types/           # 管理員系統類型
│   └── firebase/        # Firebase 配置
├── public/assets/       # 靜態資源
└── package.json         # React Web 依賴
```

### 商家系統 (localite-merchant-portal/)

```
localite-merchant-portal/
├── src/
│   ├── contexts/        # 商家認證上下文
│   ├── pages/           # 商家頁面組件
│   ├── services/        # 商家 API 服務
│   ├── types/           # 商家系統類型
│   └── firebase/        # Firebase 配置
├── public/assets/       # 靜態資源
└── package.json         # React Web 依賴
```

## 🔧 技術棧

### 共通技術

- **資料庫**: Firebase Firestore
- **認證**: Firebase Auth
- **儲存**: Firebase Storage
- **語言**: TypeScript

### 用戶系統專用

- React Native 0.79.5
- Expo SDK ~53.0
- React Navigation 7.x
- Expo Router

### 管理員/商家系統專用

- React 18.2.0
- Material-UI (MUI) 5.x
- React Router DOM 6.x
- Emotion (CSS-in-JS)

## 📊 資料庫設計

### Firestore 集合結構

```
Firestore Database
├── users/              # 用戶資料 (所有系統共用)
├── merchants/          # 商家資料 (管理員、商家系統)
├── products/           # 產品資料 (商家系統)
├── orders/             # 訂單資料 (商家系統)
├── conversations/      # 對話記錄 (用戶系統)
├── photos/             # 照片記錄 (用戶系統)
└── audit_logs/         # 稽核日誌 (管理員系統)
```

## 🚦 開發與部署

### 開發環境

```bash
# 安裝所有系統依賴
cd localite-app-stable && npm install
cd ../localite-admin-dashboard && npm install
cd ../localite-merchant-portal && npm install
```

### 生產部署建議

```bash
# 用戶系統 - Expo EAS Build
cd localite-app-stable
eas build --platform all

# Web 系統 - 靜態檔案部署
cd localite-admin-dashboard && npm run build
cd ../localite-merchant-portal && npm run build
```

## 🔍 系統優勢

### ✅ 關注點分離

- 每個系統專注於特定用戶群體
- 減少代碼耦合和複雜性
- 更容易維護和擴展

### ✅ 獨立部署

- 各系統可獨立更新版本
- 降低部署風險
- 支援不同的發布周期

### ✅ 技術靈活性

- 用戶系統使用 React Native (跨平台)
- Web 系統使用 React (響應式設計)
- 可針對不同需求選擇最佳技術

### ✅ 安全隔離

- 權限分離更明確
- 降低安全風險
- 更容易進行安全審計

### ✅ 擴展性

- 可獨立添加新功能
- 支援微服務架構演進
- 更好的負載分散

## 📋 注意事項

1. **Firebase 配置**: 三個系統共享同一個 Firebase 專案，請確保 API Keys 一致
2. **端口衝突**: 確保各系統使用不同端口避免衝突
3. **資料同步**: 跨系統的資料變更需要注意一致性
4. **權限管理**: 定期檢查和更新用戶權限設定
5. **備份策略**: 定期備份 Firebase 資料和設定

## 🎉 完成狀態

- ✅ 三系統架構設計
- ✅ 用戶系統清理 (移除管理員/商家代碼)
- ✅ 管理員系統建置 (React Web + MUI)
- ✅ 商家系統建置 (React Web + MUI)
- ✅ Firebase 配置 (共享資料庫)
- ✅ 認證系統 (分層權限)
- ✅ 統一啟動腳本
- ✅ 系統文檔完整

**系統已準備就緒，可立即投入使用！** 🚀
