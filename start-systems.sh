#!/bin/bash
echo "🚀 啟動 Localite 三系統架構"
echo "=================================="

# 檢查所有系統的依賴
echo "📦 檢查系統依賴..."

if [ ! -d "localite-app-stable/node_modules" ]; then
  echo "⚠️  用戶系統缺少依賴，安裝中..."
  cd localite-app-stable && npm install && cd ..
fi

if [ ! -d "localite-admin-dashboard/node_modules" ]; then
  echo "⚠️  管理員系統缺少依賴，安裝中..."
  cd localite-admin-dashboard && npm install && cd ..
fi

if [ ! -d "localite-merchant-portal/node_modules" ]; then
  echo "⚠️  商家系統缺少依賴，安裝中..."
  cd localite-merchant-portal && npm install && cd ..
fi

echo ""
echo "🖥️  系統運行端口分配："
echo "   用戶系統（React Native）:    http://localhost:19006"
echo "   管理員系統（React Web）:      http://localhost:3001"
echo "   商家系統（React Web）:        http://localhost:3002"
echo ""

# 啟動所有系統
echo "🚀 啟動系統中..."

# 用戶系統（React Native/Expo）
cd localite-app-stable
echo "📱 啟動用戶系統..."
npx expo start --port 19006 &
USER_PID=$!

# 管理員系統（React Web）
cd ../localite-admin-dashboard
echo "👔 啟動管理員系統..."
npm start &
ADMIN_PID=$!

# 商家系統（React Web）
cd ../localite-merchant-portal
echo "🏪 啟動商家系統..."
npm start &
MERCHANT_PID=$!

cd ..

echo ""
echo "✅ 所有系統已啟動！"
echo ""
echo "🌐 存取網址："
echo "   用戶 App（掃描 QR 碼）:       Expo Go 應用程式"
echo "   管理員後台:                  http://localhost:3001"
echo "   商家管理入口:                http://localhost:3002"
echo ""
echo "⚠️  按 Ctrl+C 可停止所有服務"
echo ""

# 等待用戶中斷
wait $USER_PID $ADMIN_PID $MERCHANT_PID

