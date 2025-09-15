#!/bin/bash

# 日誌系統標準化關閉與驗證腳本
# 確保端口 5001 正確釋放，避免影響後續執行

set -e

echo "🔄 開始日誌系統清理流程..."

# 1. 停止所有相關進程
echo "📍 步驟 1: 停止日誌服務器進程"
if pkill -f "server/server.js" 2>/dev/null; then
    echo "✅ 日誌服務器進程已停止"
else
    echo "ℹ️  無運行中的日誌服務器進程"
fi

# 2. 強制釋放端口 (如果需要)
echo "📍 步驟 2: 檢查並釋放端口 5001"
if lsof -i :5001 >/dev/null 2>&1; then
    echo "⚠️  檢測到端口 5001 仍被佔用，強制釋放..."
    pkill -9 -f ":5001" 2>/dev/null || true
    sleep 2
fi

# 3. 驗證端口完全釋放
echo "📍 步驟 3: 驗證端口釋放狀態"
if lsof -i :5001 >/dev/null 2>&1; then
    echo "❌ 端口 5001 仍被佔用！"
    lsof -i :5001
    exit 1
else
    echo "✅ 端口 5001 已正確釋放"
fi

# 4. 驗證進程完全清理
echo "📍 步驟 4: 驗證進程清理狀態"
if ps aux | grep "server/server.js" | grep -v grep >/dev/null 2>&1; then
    echo "❌ 仍有日誌服務器進程在運行！"
    ps aux | grep "server/server.js" | grep -v grep
    exit 1
else
    echo "✅ 日誌服務器進程已完全清理"
fi

# 5. 清理臨時文件
echo "📍 步驟 5: 清理臨時文件"
rm -f /tmp/logs-server.log
echo "✅ 臨時文件已清理"

echo "🎉 日誌系統清理完成！端口 5001 可供下次使用"
echo ""
echo "使用方法："
echo "  ./scripts/logs-system-cleanup.sh         # 執行完整清理"
echo "  ./scripts/logs-system-cleanup.sh --quick # 快速清理 (不等待)"
echo ""
