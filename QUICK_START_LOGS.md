# 🚀 日誌管理系統 - 快速啟動指南

## ⚡ 1 分鐘快速開始

### 問題已解決 ✅

**原問題**: 註冊帳號時點擊註冊按鈕沒有反應
**解決方案**: 修復了 `app/index.tsx` 中錯誤的組件引用

### 立即啟動日誌系統

```bash
# 1. 進入日誌系統目錄
cd /Users/fuchangwei/Projects/localite-v7/localite-logs-dashboard

# 2. 啟動日誌管理系統（後端 + 前端）
npm start
```

系統將啟動：

- 🟢 **後端 API**: http://localhost:5001
- 🟢 **前端 Dashboard**: http://localhost:3003

## 📊 立即測試

### 1. 訪問 Dashboard

打開瀏覽器: http://localhost:3003

### 2. 推送測試日誌

```bash
curl -X POST http://localhost:5001/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "info", "message": "系統測試成功", "service": "test"}'
```

### 3. 測試註冊功能

```bash
# 啟動主應用
cd localite-app-stable
npm start  # 或 expo start

# 在應用中測試註冊功能，實時觀察日誌
```

## 🎯 端口分配（避免衝突）

| 系統         | 端口     | URL                       |
| ------------ | -------- | ------------------------- |
| 管理員系統   | 3001     | http://localhost:3001     |
| 商家系統     | 3002     | http://localhost:3002     |
| **日誌系統** | **3003** | **http://localhost:3003** |
| 日誌 API     | 5001     | http://localhost:5001     |

## 🔍 即時監控功能

Dashboard 提供：

- ✨ **即時日誌流**: Socket.IO 零延遲推送
- 🎛️ **智能過濾**: 級別/服務/關鍵字搜索
- 📊 **統計數據**: 錯誤/警告/資訊計數
- 💾 **持久存儲**: 自動保存到文件
- 🎨 **現代 UI**: 暗色主題護眼設計

## 🆘 快速故障排除

```bash
# 檢查端口衝突
lsof -i :3003  # 日誌前端
lsof -i :5001  # 日誌後端

# 健康檢查
curl http://localhost:5001/api/health

# 重啟服務
cd localite-logs-dashboard && npm start
```

## 🎉 成功標誌

看到以下輸出表示成功：

```
🚀 日誌管理服務器運行在 http://localhost:5001
✅ Dashboard 可通過 http://localhost:3003 訪問
🟢 已連接 - Socket.IO 實時通信正常
```

現在你的 Localite 系統具備完整的日誌監控能力！
