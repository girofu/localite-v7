#!/bin/bash

# 系統類型參數
SYSTEM_TYPE=${1:-"all"}

echo "🚀 啟動 Localite 系統"
echo "=================================="

# 檢查指定系統的依賴
check_and_install_deps() {
  local system_name=$1
  local system_path=$2
  local display_name=$3
  
  if [ ! -d "$system_path/node_modules" ]; then
    echo "⚠️  ${display_name}缺少依賴，安裝中..."
    cd "$system_path" && npm install && cd ..
  fi
}

# 啟動指定系統
start_system() {
  local system_name=$1
  local system_path=$2
  local display_name=$3
  local port=$4
  
  echo "🏃 啟動${display_name}..." >&2
  
  # 先殺死可能佔用端口的舊進程
  lsof -ti:$port | xargs kill -9 2>/dev/null || true
  sleep 1
  
  # 創建日誌文件
  local log_file="/tmp/${system_name}_startup.log"
  rm -f "$log_file"
  
  if [ "$system_name" = "app" ]; then
    cd "$system_path" && npx expo start --port "$port" > "$log_file" 2>&1 &
  else
    cd "$system_path" && BROWSER=none PORT="$port" npm start > "$log_file" 2>&1 &
  fi
  local pid=$!
  cd .. > /dev/null 2>&1
  
  # 等待啟動並檢查編譯結果
  sleep 5
  
  # 檢查進程是否還在運行
  if ! kill -0 $pid 2>/dev/null; then
    echo "Error: 進程啟動失敗" >&2
    [ -f "$log_file" ] && echo "錯誤日誌：" >&2 && tail -10 "$log_file" >&2
    return 1
  fi
  
  # 檢查是否有編譯錯誤
  if [ -f "$log_file" ] && grep -q "Failed to compile\|ERROR in\|Module not found" "$log_file"; then
    echo "Error: 編譯失敗" >&2
    echo "編譯錯誤：" >&2
    grep -A 5 -B 2 "Failed to compile\|ERROR in\|Module not found" "$log_file" | head -10 >&2
    kill $pid 2>/dev/null || true
    return 1
  fi
  
  # 檢查是否編譯成功
  if [ -f "$log_file" ] && grep -q "webpack compiled successfully\|Compiled successfully" "$log_file"; then
    echo "✅ 編譯成功！" >&2
  elif [ -f "$log_file" ] && grep -q "Starting the development server" "$log_file"; then
    echo "📦 開發服務器啟動中..." >&2
  fi
  
  echo "$pid"
}

case $SYSTEM_TYPE in
  "app"|"user")
    echo "📱 啟動用戶系統"
    check_and_install_deps "app" "localite-app-stable" "用戶系統"
    echo "🖥️  系統運行端口: http://localhost:19006"
    USER_PID=$(start_system "app" "localite-app-stable" "用戶系統" "19006")
    echo "✅ 用戶系統已啟動！"
    echo "🌐 存取方式：用 Expo Go 掃描 QR 碼"
    # 等待用戶系統進程
    while kill -0 $USER_PID 2>/dev/null; do
      sleep 1
    done
    ;;
  "admin")
    echo "👔 啟動管理員系統"
    check_and_install_deps "admin" "localite-admin-dashboard" "管理員系統"
    echo "🖥️  系統運行端口: http://localhost:3001"
    ADMIN_PID=$(start_system "admin" "localite-admin-dashboard" "管理員系統" "3001")
    echo "✅ 管理員系統已啟動！"
    echo "🌐 存取網址：http://localhost:3001"
    # 等待管理員系統進程
    while kill -0 $ADMIN_PID 2>/dev/null; do
      sleep 1
    done
    ;;
  "merchant")
    echo "🏪 啟動商家系統"
    check_and_install_deps "merchant" "localite-merchant-portal" "商家系統"
    echo "🖥️  系統運行端口: http://localhost:3002"
    MERCHANT_PID=$(start_system "merchant" "localite-merchant-portal" "商家系統" "3002")
    echo "✅ 商家系統已啟動！"
    echo "🌐 存取網址：http://localhost:3002"
    # 等待商家系統進程
    while kill -0 $MERCHANT_PID 2>/dev/null; do
      sleep 1
    done
    ;;
  "all"|*)
    echo "🚀 啟動所有系統"
    echo "📦 檢查系統依賴..."
    check_and_install_deps "app" "localite-app-stable" "用戶系統"
    check_and_install_deps "admin" "localite-admin-dashboard" "管理員系統"
    check_and_install_deps "merchant" "localite-merchant-portal" "商家系統"
    
    echo "🖥️  系統運行端口分配："
    echo "   用戶系統（React Native）:    http://localhost:19006"
    echo "   管理員系統（React Web）:      http://localhost:3001"
    echo "   商家系統（React Web）:        http://localhost:3002"
    echo ""
    
    echo "🚀 啟動所有系統..."
    USER_PID=$(start_system "app" "localite-app-stable" "用戶系統" "19006")
    ADMIN_PID=$(start_system "admin" "localite-admin-dashboard" "管理員系統" "3001")
    MERCHANT_PID=$(start_system "merchant" "localite-merchant-portal" "商家系統" "3002")
    
    echo "✅ 所有系統已啟動！"
    echo "🌐 存取網址："
    echo "   用戶 App（掃描 QR 碼）:       Expo Go 應用程式"
    echo "   管理員後台:                  http://localhost:3001"
    echo "   商家管理入口:                http://localhost:3002"
    
    # 等待所有系統進程
    while kill -0 $USER_PID 2>/dev/null || kill -0 $ADMIN_PID 2>/dev/null || kill -0 $MERCHANT_PID 2>/dev/null; do
      sleep 1
    done
    ;;
esac

echo ""
echo "⚠️  服務已停止"

