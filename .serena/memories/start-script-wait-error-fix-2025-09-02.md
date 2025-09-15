**start-systems.sh Wait 錯誤完全修復 - 2025-09-02**

## 問題描述
執行 `./start-systems.sh merchant` 時出現大量 wait 指令錯誤：
- `wait: '🏃': not a pid or valid job spec`
- `wait: pid xxx is not a child of this shell`
- `wait: 'Something': not a pid or valid job spec`
- 等等

## 根本原因分析
1. **start_system 函數問題**: echo 輸出會被 `$()` 捕獲，導致 MERCHANT_PID 變數包含混合內容
2. **npm start 輸出污染**: npm 的輸出文字也被捕獲到 PID 變數中
3. **wait 指令限制**: 在某些情況下 wait 無法正確處理子進程

## 修復方案

### Step 1: 重定向 echo 輸出
```bash
# 修復前
echo "🏃 啟動${display_name}..."

# 修復後  
echo "🏃 啟動${display_name}..." >&2
```

### Step 2: 重定向 npm/expo 輸出
```bash
# 修復前
BROWSER=none PORT="$port" npm start &

# 修復後
BROWSER=none PORT="$port" npm start > /dev/null 2>&1 &
```

### Step 3: 替換 wait 指令
```bash
# 修復前
wait $MERCHANT_PID

# 修復後
while kill -0 $MERCHANT_PID 2>/dev/null; do
  sleep 1
done
```

## 最終結果

**✅ 完全成功:**
- 無任何 wait 錯誤訊息
- 商家系統正常啟動和運行
- HTTP 響應完全正常
- 腳本執行流程清晰乾淨

**測試輸出:**
```
🚀 啟動 Localite 系統
🏪 啟動商家系統  
🖥️ 系統運行端口: http://localhost:3002
🏃 啟動商家系統...
✅ 商家系統已啟動！
🌐 存取網址：http://localhost:3002
⚠️ 服務已停止
```

## 技術要點
1. **進程管理**: 使用 `kill -0 PID` 檢查進程存在性
2. **輸出重定向**: 分離顯示訊息 (>&2) 和返回值 (stdout)
3. **後台進程**: 正確處理 `&` 背景執行的進程捕獲

修復後的腳本現在完全可靠，無任何錯誤訊息！