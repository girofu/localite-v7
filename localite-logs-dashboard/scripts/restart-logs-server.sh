#!/bin/bash

# 🔄 日誌服務器重啟腳本
# 自動處理端口占用問題並重新啟動服務

PORT=5001
SERVICE_NAME="日誌管理服務器"

# 🌐 動態 IP 配置 (支援開發與生產環境)
LOG_SERVER_IP=${LOG_SERVER_IP:-$(ifconfig | grep "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}')}
if [ -z "$LOG_SERVER_IP" ]; then
    LOG_SERVER_IP="localhost"
    echo "⚠️  無法檢測網路 IP，使用預設 localhost"
else
    echo "🌍 檢測到網路 IP: $LOG_SERVER_IP"
fi

echo "🔄 正在重啟 $SERVICE_NAME..."

# 檢查端口是否被占用
PID=$(lsof -ti :$PORT)

if [ -n "$PID" ]; then
    echo "⚠️  發現端口 $PORT 被進程 $PID 占用"
    echo "🔨 正在終止進程..."
    kill -9 $PID
    sleep 2
    
    # 確認進程已被終止
    if kill -0 $PID 2>/dev/null; then
        echo "❌ 無法終止進程 $PID，請手動處理"
        exit 1
    else
        echo "✅ 進程 $PID 已成功終止"
    fi
else
    echo "✅ 端口 $PORT 未被占用"
fi

# 確認端口已釋放
echo "🔍 確認端口狀態..."
if lsof -ti :$PORT > /dev/null 2>&1; then
    echo "❌ 端口仍被占用，無法啟動服務"
    lsof -i :$PORT
    exit 1
fi

# 啟動服務
echo "🚀 啟動 $SERVICE_NAME..."
cd "$(dirname "$0")/.."
nohup node server/server.js > logs/server.log 2>&1 &
NEW_PID=$!

echo "⏳ 等待服務啟動..."
sleep 3

# 驗證服務是否正常啟動
if kill -0 $NEW_PID 2>/dev/null; then
    echo "✅ 服務已啟動 (PID: $NEW_PID)"
    
    # 測試健康檢查
    if curl -s --connect-timeout 5 http://$LOG_SERVER_IP:$PORT/api/health > /dev/null; then
        echo "✅ 健康檢查通過"
        echo "🌐 服務地址: http://$LOG_SERVER_IP:$PORT"
        echo "📊 儀表板: http://$LOG_SERVER_IP:$PORT"
        echo "📱 模擬器連接地址: http://$LOG_SERVER_IP:$PORT"
        
        # 發送測試日誌
        curl -X POST http://$LOG_SERVER_IP:$PORT/api/logs \
             -H "Content-Type: application/json" \
             -d '{"level": "info", "message": "服務重啟成功", "service": "restart-script"}' \
             > /dev/null 2>&1
        
        echo "📤 測試日誌已發送"
    else
        echo "⚠️  健康檢查失敗，服務可能未完全啟動"
    fi
else
    echo "❌ 服務啟動失敗"
    exit 1
fi

echo ""
echo "🎉 $SERVICE_NAME 重啟完成！"
echo "💡 使用 'ps aux | grep server.js' 查看進程狀態"
echo "📋 使用 'tail -f logs/server.log' 查看服務日誌"
