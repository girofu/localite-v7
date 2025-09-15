#!/bin/bash

# 🎯 日誌服務自動配置腳本
# 自動檢測網路 IP 並生成配置檔案

echo "🔧 正在設定日誌服務配置..."

# 檢測當前網路 IP
DETECTED_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

if [ -z "$DETECTED_IP" ]; then
    echo "❌ 無法自動檢測網路 IP，請手動配置"
    echo "💡 使用指令查看可用 IP：ifconfig | grep 'inet '"
    exit 1
fi

echo "🎯 檢測到的網路 IP: $DETECTED_IP"

# 測試日誌服務器是否運行
echo "🔍 檢查日誌服務器狀態..."
if curl -s --connect-timeout 3 "http://localhost:5001/api/health" > /dev/null 2>&1; then
    echo "✅ 日誌服務器運行正常"
else
    echo "⚠️  日誌服務器未運行，正在啟動..."
    cd ../localite-logs-dashboard
    node server/server.js &
    sleep 3
    cd - > /dev/null
    echo "🚀 日誌服務器已啟動"
fi

# 生成配置檔案
ENV_FILE=".env.local"

echo "📝 生成環境配置檔案: $ENV_FILE"

cat > "$ENV_FILE" << EOF
# 🎯 自動生成的日誌配置 - $(date)
# 當前網路環境：$DETECTED_IP

# 開發環境日誌 IP（適合手機連接）
EXPO_PUBLIC_DEV_LOG_IP=$DETECTED_IP

# 備用配置（如需要可取消註解）
# EXPO_PUBLIC_DEFAULT_DEV_IP=192.168.1.100
# EXPO_PUBLIC_DISABLE_REMOTE_LOGS=true
# EXPO_PUBLIC_REMOTE_LOG_URL=http://your-server.com:5001/api/logs

EOF

echo "✅ 配置檔案已生成: $ENV_FILE"
echo ""
echo "📋 配置摘要："
echo "   開發 IP: $DETECTED_IP"
echo "   日誌端口: 5001"
echo "   配置檔案: $ENV_FILE"
echo ""
echo "🧪 測試連接："
echo "   本地測試: curl http://localhost:5001/api/health"
echo "   手機測試: curl http://$DETECTED_IP:5001/api/health"
echo ""
echo "📱 使用方式："
echo "   1. 電腦模擬器：自動使用 localhost"
echo "   2. 手機實體設備：使用 $DETECTED_IP"
echo "   3. 生產環境：需設定 EXPO_PUBLIC_REMOTE_LOG_URL"
echo ""

# 驗證配置
echo "🔬 驗證配置..."
if curl -s --connect-timeout 5 "http://$DETECTED_IP:5001/api/health" > /dev/null 2>&1; then
    echo "✅ 手機連接測試通過"
    
    # 發送測試日誌
    curl -X POST "http://$DETECTED_IP:5001/api/logs" \
         -H "Content-Type: application/json" \
         -d "{\"level\": \"info\", \"message\": \"自動配置測試成功\", \"service\": \"setup-script\", \"ip\": \"$DETECTED_IP\"}" \
         > /dev/null 2>&1
    
    echo "📤 測試日誌已發送"
else
    echo "⚠️  手機連接測試失敗，請檢查："
    echo "   1. 確認電腦和手機在同一 WiFi"
    echo "   2. 檢查防火牆設定"
    echo "   3. 確認端口 5001 可用"
fi

echo ""
echo "🎉 配置完成！重啟 Expo 應用以應用新設定。"
