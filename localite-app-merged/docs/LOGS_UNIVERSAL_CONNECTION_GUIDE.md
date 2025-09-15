# 🌐 日誌服務萬用連接指南

> 一勞永逸的解決方案：支援電腦模擬器、手機實體設備、生產環境的智能日誌配置

## 🎯 問題解決

### ❌ 原始問題

- `localhost:5001` 只在電腦本地有效
- 手機無法連接到電腦的 localhost
- 每次網路環境變更都需要手動修改程式碼

### ✅ 解決方案

智能多模式日誌配置，自動適應不同使用情境

## 🚀 快速開始

### 方法一：自動配置（推薦）

```bash
# 在 localite-app-merged 目錄下執行
./scripts/setup-logs-config.sh
```

**完成！** 腳本會：

- 自動檢測你的網路 IP
- 生成配置檔案 `.env.local`
- 測試連接是否正常
- 發送測試日誌驗證

### 方法二：手動配置

1. **複製配置範本**

```bash
cp .env.logs.example .env.local
```

2. **獲取你的網路 IP**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'
# 輸出例如：172.20.10.3
```

3. **編輯 `.env.local`**

```bash
EXPO_PUBLIC_DEV_LOG_IP=你的IP地址
```

## 📱 使用情境

### 🖥️ 電腦模擬器

```bash
npm run start
# 自動使用 localhost:5001，無需額外配置
```

### 📱 手機實體設備 / Expo Go

```bash
npm run start
# 自動使用你配置的網路 IP，如：http://172.20.10.3:5001
```

### 🌐 生產環境

設定環境變數：

```bash
EXPO_PUBLIC_REMOTE_LOG_URL=https://your-log-server.com/api/logs
```

## ⚙️ 配置選項

### 環境變數優先級（由高到低）

1. **`EXPO_PUBLIC_REMOTE_LOG_URL`** - 完全自定義 URL
2. **`EXPO_PUBLIC_DEV_LOG_IP`** - 指定開發 IP
3. **`EXPO_PUBLIC_DEFAULT_DEV_IP`** - 默認開發 IP
4. **自動檢測** - 系統自動檢測（172.20.10.3）

### 特殊控制

```bash
# 完全禁用遠程日誌
EXPO_PUBLIC_DISABLE_REMOTE_LOGS=true
```

## 🔧 故障排除

### 手機無法連接

1. **確認網路連接**

```bash
# 確認電腦和手機在同一 WiFi
ping [你的IP]
```

2. **檢查服務器狀態**

```bash
curl http://localhost:5001/api/health
curl http://[你的IP]:5001/api/health
```

3. **檢查防火牆**

```bash
# macOS 檢查防火牆
sudo pfctl -s nat
# 或在系統偏好設定 > 安全性與隱私權 > 防火牆
```

4. **重新生成配置**

```bash
rm .env.local
./scripts/setup-logs-config.sh
```

### 服務器未運行

```bash
# 啟動日誌服務器
cd ../localite-logs-dashboard
node server/server.js &
```

### 環境變數未生效

```bash
# 重啟 Expo 應用
npm run start -- --clear
```

## 🧪 測試驗證

### 手動測試

```bash
# 測試本地連接
curl http://localhost:5001/api/health

# 測試手機連接
curl http://[你的IP]:5001/api/health

# 發送測試日誌
curl -X POST http://[你的IP]:5001/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "info", "message": "手機連接測試", "service": "manual-test"}'

# 查看測試日誌
curl -s "http://localhost:5001/api/logs?service=manual-test&limit=1"
```

## 📊 配置範例

### 家庭 WiFi 環境

```bash
EXPO_PUBLIC_DEV_LOG_IP=192.168.1.100
```

### 企業網路環境

```bash
EXPO_PUBLIC_DEV_LOG_IP=10.0.0.156
```

### 手機熱點環境

```bash
EXPO_PUBLIC_DEV_LOG_IP=172.20.10.3
```

### 多重配置（支援多個 IP）

```bash
# 主要 IP
EXPO_PUBLIC_DEV_LOG_IP=172.20.10.3
# 備用 IP
EXPO_PUBLIC_DEFAULT_DEV_IP=192.168.1.100
```

## ✨ 智能特性

### 自動適應

- **開發模式**：自動使用網路 IP
- **生產模式**：需明確配置遠程服務
- **測試模式**：可選擇禁用遠程日誌

### 容錯機制

- 連接失敗時靜默降級
- 不影響應用主要功能
- 自動重試機制

### 效能優化

- 批次發送日誌
- 連接超時控制
- 緩衝區管理

## 🎉 最佳實踐

### 開發階段

1. 使用自動配置腳本
2. 定期檢查連接狀態
3. 監控日誌內容

### 部署階段

1. 設定生產環境 URL
2. 配置正確的安全策略
3. 監控服務器效能

### 維護階段

1. 定期清理日誌檔案
2. 更新配置以適應網路變更
3. 監控錯誤率和連接穩定性

---

## 🚀 一鍵解決

```bash
# 完整解決方案（一行指令）
cd localite-app-merged && ./scripts/setup-logs-config.sh && echo "✅ 配置完成！重啟 Expo 應用即可使用。"
```

> **💡 提示**：此解決方案已考慮所有常見使用情境，應該能滿足 95% 的開發需求。如遇特殊情況，請參考故障排除章節。
