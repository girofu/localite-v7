#!/bin/bash

# 🌍 自動配置日誌服務器 IP 地址腳本
# 支援開發、測試、生產環境的靈活切換

echo "🔧 正在配置日誌服務器 IP 地址..."

# 檢測當前網路 IP
CURRENT_IP=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}')

if [ -z "$CURRENT_IP" ]; then
    echo "❌ 無法檢測到網路 IP 地址"
    echo "💡 請手動設定環境變數：export LOG_SERVER_IP=your_ip_address"
    exit 1
fi

echo "🌍 檢測到當前 IP: $CURRENT_IP"

# 更新 .env.local 文件
ENV_FILE="/Users/fuchangwei/Projects/localite-v7/localite-app-merged/.env.local"
if [ -f "$ENV_FILE" ]; then
    # 檢查是否已存在 EXPO_PUBLIC_DEV_LOG_IP 配置
    if grep -q "EXPO_PUBLIC_DEV_LOG_IP" "$ENV_FILE"; then
        sed -i "" "s/EXPO_PUBLIC_DEV_LOG_IP=.*/EXPO_PUBLIC_DEV_LOG_IP=$CURRENT_IP/" "$ENV_FILE"
        echo "✅ 已更新 $ENV_FILE 中的 EXPO_PUBLIC_DEV_LOG_IP = $CURRENT_IP"
    else
        echo "EXPO_PUBLIC_DEV_LOG_IP=$CURRENT_IP" >> "$ENV_FILE"
        echo "✅ 已添加 EXPO_PUBLIC_DEV_LOG_IP = $CURRENT_IP 到 $ENV_FILE"
    fi
fi

# 設定當前 shell 環境變數
export LOG_SERVER_IP="$CURRENT_IP"

echo ""
echo "🎉 配置完成！"
echo "📝 當前配置："
echo "   - 開發環境 IP: $CURRENT_IP"
echo "   - 環境變數: LOG_SERVER_IP=$LOG_SERVER_IP"
echo "   - 應用配置: EXPO_PUBLIC_DEV_LOG_IP=$CURRENT_IP"
echo ""
echo "💡 使用方式："
echo "   1. 載入環境變數: source scripts/setup-log-server-ip.sh"
echo "   2. 測試連接: curl -s http://\$LOG_SERVER_IP:5001/api/health"
echo "   3. 重啟日誌服務: bash localite-logs-dashboard/scripts/restart-logs-server.sh"
echo ""
echo "🔄 建議重啟模擬器讓新配置生效"

# 測試連接
echo "🧪 測試連接到日誌服務器..."
if curl -s --connect-timeout 3 "http://$CURRENT_IP:5001/api/health" > /dev/null; then
    echo "✅ 日誌服務器連接成功"
else
    echo "⚠️  日誌服務器未運行或無法連接"
    echo "💡 請先執行: bash localite-logs-dashboard/scripts/restart-logs-server.sh"
fi
