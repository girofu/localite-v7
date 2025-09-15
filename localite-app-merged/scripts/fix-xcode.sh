#!/bin/bash

# Xcode 問題修復腳本
# 解決 xcode-select 和 Xcode 配置問題

echo "🔧 Xcode 問題修復工具"
echo "========================"

# 檢查是否為 macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ 此腳本僅支援 macOS"
    exit 1
fi

# 檢查 Xcode 是否安裝
if [ ! -d "/Applications/Xcode.app" ]; then
    echo "❌ Xcode 未安裝"
    echo "請從 App Store 安裝 Xcode"
    exit 1
fi

echo "✅ 找到 Xcode 應用程式"

# 檢查當前 xcode-select 路徑
current_path=$(xcode-select --print-path)
echo "📍 當前路徑: $current_path"

# 修正 xcode-select 路徑
if [[ "$current_path" == *"CommandLineTools"* ]]; then
    echo "🔧 修正 xcode-select 路徑..."
    sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
    echo "✅ 路徑已修正為: $(xcode-select --print-path)"
else
    echo "✅ xcode-select 路徑正確"
fi

# 接受授權條款
echo "📄 處理 Xcode 授權條款..."
if ! xcodebuild -checkFirstLaunchStatus &> /dev/null; then
    echo "🔑 接受 Xcode 授權條款..."
    sudo xcodebuild -license accept
    echo "✅ 授權條款已接受"
else
    echo "✅ 授權條款已經接受"
fi

# 測試 xcodebuild
echo "🧪 測試 xcodebuild..."
if xcodebuild -version &> /dev/null; then
    echo "✅ xcodebuild 運作正常"
    echo "📱 版本資訊："
    xcodebuild -version
else
    echo "❌ xcodebuild 仍有問題"
    exit 1
fi

# 安裝 iOS 模擬器 (如果需要)
echo "📱 檢查 iOS 模擬器..."
simulators=$(xcrun simctl list devices | grep "iOS" | head -1)
if [ -z "$simulators" ]; then
    echo "⚠️  未找到 iOS 模擬器"
    echo "請開啟 Xcode > Preferences > Components 安裝模擬器"
else
    echo "✅ iOS 模擬器可用"
fi

echo ""
echo "🎉 Xcode 修復完成！"
echo "現在可以正常使用 iOS 開發工具了"


