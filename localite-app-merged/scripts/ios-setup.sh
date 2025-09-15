#!/bin/bash

# iOS 設置腳本
# 用於設定 iOS 開發和部署環境

set -e

echo "🍎 開始 iOS 環境設置..."

# 檢查必要工具
echo "📋 檢查必要工具..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安裝"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "❌ npx 未安裝"
    exit 1
fi

echo "✅ Node.js 和 npm 已安裝"

# 檢查 EAS CLI
if ! command -v eas &> /dev/null; then
    echo "📦 安裝 EAS CLI..."
    npm install -g eas-cli
else
    echo "✅ EAS CLI 已安裝"
fi

# 檢查 Expo CLI
if ! command -v expo &> /dev/null; then
    echo "📦 安裝 Expo CLI..."
    npm install -g @expo/cli
else
    echo "✅ Expo CLI 已安裝"
fi

# 檢查 Xcode (僅在 macOS 上)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v xcodebuild &> /dev/null; then
        echo "⚠️  Xcode 未安裝或未正確配置"
        echo "請從 App Store 安裝 Xcode"
        exit 1
    else
        echo "✅ Xcode 已安裝"
        
        # 確保 xcode-select 指向正確路徑
        if [[ $(xcode-select --print-path) == *"CommandLineTools"* ]]; then
            echo "🔧 修正 xcode-select 路徑..."
            sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
        fi
        
        # 接受 Xcode 授權條款
        echo "📄 檢查 Xcode 授權條款..."
        if ! xcodebuild -checkFirstLaunchStatus &> /dev/null; then
            echo "🔑 接受 Xcode 授權條款..."
            sudo xcodebuild -license accept
        fi
        
        echo "📱 Xcode 版本："
        xcodebuild -version
    fi
fi

# 設置環境變數
echo "🔧 設置 iOS 環境變數..."
if [ ! -f ".env.ios" ]; then
    echo "❌ .env.ios 檔案不存在"
    exit 1
fi

# 複製 iOS 環境變數到主要環境檔案
cp .env.ios .env

echo "✅ 環境變數已設置"

# 安裝依賴
echo "📦 安裝專案依賴..."
npm install --legacy-peer-deps

# 檢查專案健康狀態
echo "🔍 檢查專案健康狀態..."
npx expo-doctor || echo "⚠️  發現一些問題，但可以繼續"

# 預建置 iOS 專案
echo "🏗️  預建置 iOS 專案..."
npx expo prebuild -p ios --clean

echo "🎉 iOS 環境設置完成！"
echo ""
echo "📱 下一步："
echo "1. 確保你有 Apple Developer 帳號"
echo "2. 執行 'eas device:create' 註冊你的 iOS 裝置"
echo "3. 執行 'eas credentials' 設置憑證"
echo "4. 執行 'npm run build:ios:dev' 建置開發版本"
echo ""
