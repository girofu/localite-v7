# Localite 日誌管理系統

獨立的實時日誌監控與管理 Web 介面，用於監控 Localite 應用程式的運行狀態和排查問題。

## 功能特性

- 🚀 **實時日誌流**: 使用 Socket.IO 實現實時日誌推送
- 🔍 **智能過濾**: 支持按級別、服務、關鍵字搜索
- 📊 **統計儀表板**: 實時顯示錯誤、警告、資訊日誌統計
- 🎨 **現代化 UI**: 暗色主題，響應式設計
- 💾 **持久化存儲**: 支持 Winston 日誌文件存儲
- 🔌 **API 接口**: RESTful API 支持外部系統日誌推送

## 技術架構

### 後端

- **Express.js**: Web 服務器框架
- **Socket.IO**: 實時雙向通信
- **Winston**: 日誌管理與存儲
- **CORS**: 跨域支持

### 前端

- **React 18**: 現代化 UI 框架
- **Socket.IO Client**: 實時日誌接收
- **CSS3**: 現代化樣式與動畫

## 快速開始

### 安裝依賴

\`\`\`bash
cd localite-logs-dashboard
npm install
\`\`\`

### 啟動服務

\`\`\`bash

# 同時啟動服務器和客戶端

npm start

# 或分別啟動

npm run server # 啟動後端服務器 (端口: 5001)
npm run client # 啟動前端客戶端 (端口: 3003)
\`\`\`

### 訪問地址

- 前端 Dashboard: http://localhost:3003
- 後端 API: http://localhost:5001

## API 使用

### 推送日誌

\`\`\`bash
curl -X POST http://localhost:5001/api/logs \\
-H "Content-Type: application/json" \\
-d '{
"level": "error",
"message": "註冊功能失敗",
"service": "localite-app",
"metadata": {
"userId": "user123",
"action": "register",
"error": "Invalid component used"
}
}'
\`\`\`

### 查詢日誌

\`\`\`bash

# 獲取最近 100 條日誌

curl http://localhost:5001/api/logs?limit=100

# 按級別過濾

curl http://localhost:5001/api/logs?level=error

# 按服務過濾

curl http://localhost:5001/api/logs?service=localite-app
\`\`\`

### 健康檢查

\`\`\`bash
curl http://localhost:5001/api/health
\`\`\`

## 整合到現有應用

### React Native / Expo 整合

\`\`\`javascript
// 在你的應用中添加日誌推送
const logToRemote = async (level, message, metadata = {}) => {
try {
await fetch('http://localhost:5001/api/logs', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
level,
message,
service: 'localite-app',
metadata
})
});
} catch (error) {
console.error('Failed to send log:', error);
}
};

// 使用範例
logToRemote('error', '註冊按鈕無反應', {
component: 'SignupScreen',
action: 'button_click',
userId: currentUser?.uid
});
\`\`\`

### Socket.IO 即時整合

\`\`\`javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

// 發送即時日誌
socket.emit('log', {
level: 'warn',
message: '用戶註冊流程異常',
service: 'localite-app',
metadata: {
screen: 'RegisterScreen',
timestamp: Date.now()
}
});
\`\`\`

## 目錄結構

\`\`\`
localite-logs-dashboard/
├── server/
│ ├── server.js # Express + Socket.IO 服務器
│ └── logs/ # Winston 日誌文件目錄
├── src/
│ ├── App.js # React 主應用組件
│ ├── App.css # 主要樣式文件
│ └── index.js # React 入口文件
├── public/
│ └── index.html # HTML 模板
├── package.json # 項目依賴與腳本
└── README.md # 項目文檔
\`\`\`

## 日誌級別

- **ERROR**: 錯誤日誌，需要立即關注
- **WARN**: 警告日誌，可能影響功能
- **INFO**: 資訊日誌，正常運行狀態
- **DEBUG**: 調試日誌，開發階段使用

## 常見問題排查

### 1. 註冊功能無反應

根據日誌分析，問題出現在 \`app/index.tsx\` 第 307 行：

- 使用了錯誤的 \`SignupScreen\` 組件
- 應該使用 \`RegisterScreen\` 組件
- 解決方案：修改組件引用

### 2. 連接問題

如果前端無法連接到後端：

1. 確認後端服務正常運行在端口 5000
2. 檢查 CORS 設置
3. 查看瀏覽器控制台錯誤信息

### 3. 日誌丟失

日誌持久化到文件系統：

- 錯誤日誌：\`server/logs/error.log\`
- 所有日誌：\`server/logs/combined.log\`
- 內存最多保留 1000 條最新日誌

## 生產環境部署

### Docker 部署 (推薦)

\`\`\`dockerfile

# Dockerfile 範例

FROM node:18-alpine
WORKDIR /app
COPY package\*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000 3001
CMD ["npm", "start"]
\`\`\`

### PM2 部署

\`\`\`bash

# 安裝 PM2

npm install -g pm2

# 啟動服務

pm2 start server/server.js --name localite-logs

# 查看狀態

pm2 status
\`\`\`

## 貢獻指南

1. Fork 項目
2. 創建功能分支
3. 提交變更
4. 推送到分支
5. 創建 Pull Request

## 許可證

MIT License
