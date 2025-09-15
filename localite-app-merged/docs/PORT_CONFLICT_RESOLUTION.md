# 🔧 端口衝突解決指南

> 徹底解決 `EADDRINUSE: address already in use` 錯誤

## ❌ 問題現象

```bash
Error: listen EADDRINUSE: address already in use :::5001
    at Server.setupListenHandle [as _listen2] (node:net:1940:16)
    at listenInCluster (node:net:1997:12)
    at Server.listen (node:net:2102:7)
```

## 🔍 問題診斷

### 1. 檢查端口占用

```bash
lsof -i :5001
```

輸出範例：

```
COMMAND   PID       USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
node    65303 fuchangwei   16u  IPv6 0x849867cf062931b4      0t0  TCP *:commplex-link (LISTEN)
```

### 2. 檢查相關進程

```bash
ps aux | grep "server.js" | grep -v grep
```

## ⚡ 快速解決方案

### 方法一：自動腳本（推薦）

```bash
# 使用自動重啟腳本
cd localite-logs-dashboard
./scripts/restart-logs-server.sh
```

### 方法二：手動處理

1. **找出占用進程**

```bash
lsof -i :5001
```

2. **終止占用進程**

```bash
kill -9 [PID]
# 例如：kill -9 65303
```

3. **確認端口釋放**

```bash
lsof -i :5001
# 應該沒有輸出
```

4. **重新啟動服務**

```bash
cd localite-logs-dashboard
nohup node server/server.js > logs/server.log 2>&1 &
```

5. **驗證服務**

```bash
curl -s http://localhost:5001/api/health
```

## 🛠️ 完整解決流程

### Step 1: 診斷問題

```bash
echo "🔍 檢查端口占用..."
lsof -i :5001
```

### Step 2: 清理進程

```bash
echo "🧹 清理占用進程..."
PID=$(lsof -ti :5001)
if [ -n "$PID" ]; then
    echo "終止進程: $PID"
    kill -9 $PID
    sleep 2
fi
```

### Step 3: 重啟服務

```bash
echo "🚀 重新啟動服務..."
cd localite-logs-dashboard
nohup node server/server.js > /dev/null 2>&1 &
sleep 3
```

### Step 4: 驗證結果

```bash
echo "✅ 驗證服務狀態..."
curl -s http://localhost:5001/api/health
```

## 🎯 預防措施

### 1. 正確關閉服務

```bash
# 使用 Ctrl+C 而不是直接關閉終端
# 或使用 graceful shutdown
pkill -SIGTERM -f "server.js"
```

### 2. 使用進程管理工具

```bash
# 使用 PM2 管理 Node.js 進程
npm install -g pm2
pm2 start server/server.js --name "logs-server"
pm2 stop logs-server
```

### 3. 設置進程監控

```bash
# 檢查僵屍進程
ps aux | grep defunct
```

## 🔄 自動重啟腳本

已創建自動重啟腳本：`localite-logs-dashboard/scripts/restart-logs-server.sh`

### 腳本功能：

- ✅ 自動檢測端口占用
- ✅ 強制終止占用進程
- ✅ 驗證端口釋放
- ✅ 重新啟動服務
- ✅ 健康檢查驗證
- ✅ 發送測試日誌

### 使用方法：

```bash
cd localite-logs-dashboard
./scripts/restart-logs-server.sh
```

## 🚨 常見問題

### Q1: 無法找到占用進程

**解決**：可能是權限問題，嘗試使用 `sudo`

```bash
sudo lsof -i :5001
sudo kill -9 [PID]
```

### Q2: 進程無法終止

**解決**：使用更強制的信號

```bash
kill -KILL [PID]
# 或
sudo kill -9 [PID]
```

### Q3: 服務重啟後仍然無法連接

**解決**：檢查防火牆和網路配置

```bash
# macOS 檢查防火牆
sudo pfctl -s all | grep 5001
```

### Q4: 端口被系統保留

**解決**：更改服務端口

```javascript
// 在 server.js 中修改
const PORT = process.env.PORT || 5002;
```

## 🎉 驗證解決方案

### 完整測試流程：

```bash
# 1. 健康檢查
curl -s http://localhost:5001/api/health

# 2. 日誌推送測試
curl -X POST http://localhost:5001/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "info", "message": "測試訊息", "service": "test"}'

# 3. 日誌查詢測試
curl -s "http://localhost:5001/api/logs?limit=1"
```

### 預期結果：

- ✅ 健康檢查返回 `{"status":"ok",...}`
- ✅ 日誌推送返回 `{"success":true}`
- ✅ 日誌查詢返回最新記錄

---

## 💡 小提示

- 定期清理日誌文件以避免磁盘空間問題
- 使用 `ps aux | grep node` 監控 Node.js 進程
- 考慮使用 PM2 或 systemd 進行生產環境部署
- 設置監控告警以快速發現服務異常
