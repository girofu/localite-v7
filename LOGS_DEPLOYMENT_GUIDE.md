# 🚀 日誌系統部署指南

## 📋 概述

本專案的日誌系統已完成動態 IP 配置，支援開發、測試、生產環境的無縫切換。

## 🔧 修正內容

### ✅ 已修正的硬編碼問題

1. **terminal-command.mdc** - 所有 `localhost:5001` 替換為 `$LOG_SERVER_IP:5001`
2. **restart-logs-server.sh** - 添加動態 IP 檢測和環境變數支援
3. **新增自動配置腳本** - `scripts/setup-log-server-ip.sh`

### 🌍 環境支援

- **開發環境**: 自動檢測本機網路 IP
- **測試環境**: 支援自定義測試服務器 IP
- **生產環境**: 支援域名和生產服務器配置

## 🚀 快速開始

### 1. 自動配置（推薦）

```bash
# 自動檢測並配置當前網路 IP
source scripts/setup-log-server-ip.sh

# 重啟日誌服務器
bash localite-logs-dashboard/scripts/restart-logs-server.sh
```

### 2. 手動配置

```bash
# 設定環境變數
export LOG_SERVER_IP=192.168.1.110  # 替換為你的 IP

# 更新應用配置
echo "EXPO_PUBLIC_DEV_LOG_IP=$LOG_SERVER_IP" >> localite-app-merged/.env.local

# 重啟服務
LOG_SERVER_IP=$LOG_SERVER_IP bash localite-logs-dashboard/scripts/restart-logs-server.sh
```

## 📱 環境配置

### 開發環境

```bash
# 設定開發 IP (自動檢測)
export LOG_SERVER_IP=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}')

# 或手動設定
export LOG_SERVER_IP=192.168.1.110
```

### 測試環境

```bash
# 設定測試服務器 IP
export LOG_SERVER_IP=test-server.yourcompany.com

# 或測試環境 IP
export LOG_SERVER_IP=10.0.0.100
```

### 生產環境

```bash
# 設定生產服務器域名
export LOG_SERVER_IP=logs.yourcompany.com

# 或生產服務器 IP
export LOG_SERVER_IP=prod-server-ip
```

## 🧪 測試指令

### 健康檢查

```bash
# 使用環境變數
curl -s http://$LOG_SERVER_IP:5001/api/health | jq

# 直接指定 IP
LOG_SERVER_IP=192.168.1.110 curl -s http://$LOG_SERVER_IP:5001/api/health
```

### 推送測試日誌

```bash
# 資訊日誌
curl -X POST http://$LOG_SERVER_IP:5001/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "info", "message": "測試訊息", "service": "test"}'

# 錯誤日誌
curl -X POST http://$LOG_SERVER_IP:5001/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "error", "message": "錯誤測試", "service": "test"}'
```

### 查詢日誌

```bash
# 查詢最近 5 條日誌
curl -s "http://$LOG_SERVER_IP:5001/api/logs?limit=5" | jq '.[].message'

# 查詢錯誤日誌
curl -s "http://$LOG_SERVER_IP:5001/api/logs?level=error" | jq
```

## 🔄 重啟與維護

### 智能重啟腳本

```bash
# 自動處理端口占用並重啟
bash localite-logs-dashboard/scripts/restart-logs-server.sh

# 指定 IP 重啟
LOG_SERVER_IP=your-ip bash localite-logs-dashboard/scripts/restart-logs-server.sh
```

### 系統清理

```bash
# 完整系統清理
./scripts/logs-system-cleanup.sh

# 快速清理
./scripts/logs-system-cleanup.sh --quick
```

## 📊 監控與維護

### 即時監控

```bash
# 監控系統健康狀態
watch -n 2 "curl -s http://$LOG_SERVER_IP:5001/api/health | jq"

# 監控日誌文件
tail -f localite-logs-dashboard/server/logs/combined.log
```

### 系統狀態檢查

```bash
# 檢查端口狀態
lsof -i :5001

# 檢查服務進程
ps aux | grep "server/server.js" | grep -v grep
```

## 🚨 故障排除

### 常見問題

1. **連接超時**

   - 檢查 IP 地址是否正確
   - 確認日誌服務器正在運行
   - 檢查防火牆設定

2. **端口占用**

   - 使用重啟腳本自動處理：`bash localite-logs-dashboard/scripts/restart-logs-server.sh`

3. **模擬器無法連接**
   - 確認使用網路 IP 而非 localhost
   - 重啟模擬器讓新配置生效

### 診斷指令

```bash
# IP 檢測
ifconfig | grep "inet " | grep -v "127.0.0.1"

# 網路測試
ping $LOG_SERVER_IP

# 端口測試
telnet $LOG_SERVER_IP 5001
```

## 🌐 部署到生產環境

### 1. 準備生產配置

```bash
# 複製生產環境範例
cp .env.logs.production.example .env.logs.production

# 編輯生產配置
vim .env.logs.production
```

### 2. 設定生產服務器

```bash
# 在生產服務器上部署日誌系統
scp -r localite-logs-dashboard/ user@your-server:/path/to/logs/
ssh user@your-server "cd /path/to/logs/localite-logs-dashboard && npm install && npm start"
```

### 3. 更新應用配置

```bash
# 切換到生產配置
cp .env.logs.production .env

# 重新建置應用
eas build --platform all --profile production
```

## 📈 效能考量

- **開發環境**: 所有日誌級別，即時發送
- **測試環境**: warn 和 error 級別，批量發送
- **生產環境**: 僅 error 級別，批量發送 + 快取

## 🔐 安全考量

- 生產環境建議使用 HTTPS
- 敏感資訊應避免記錄到日誌
- 定期清理舊日誌檔案
- 考慮添加 API 認證機制

---

## 💡 使用技巧

1. **環境變數優先級**: 明確設定的環境變數 > 自動檢測 > 預設值
2. **多環境切換**: 使用不同的 .env 檔案管理各環境配置
3. **監控預警**: 設定日誌級別過濾，避免噪音
4. **效能優化**: 生產環境使用批量發送減少網路負載

🎉 **日誌系統現在已完全支援多環境部署！**
