# iOS 運行準備狀態檢查清單

## 🎯 總體目標：在 iOS 模擬器上成功運行 App

本文件旨在追蹤並解決所有阻礙應用程式在 iOS 上穩定運行的已知問題。我們將分階段處理程式碼品質、類型錯誤、測試失敗和環境配置等問題。

---

## 階段一：程式碼健康度與穩定性修復 (高優先級)

**目標：** 解決所有編譯錯誤和測試失敗，確保程式碼庫處於一個已知的穩定狀態。

### ✅ 任務 1：修復 TypeScript 類型錯誤 (共 3 個)

- [ ] **檔案**: `__tests__/screens/ChatScreen.test.tsx`
  - [ ] 錯誤：`Property 'ios' does not exist on type 'unknown'`
  - [ ] 錯誤：`Property 'default' does not exist on type 'unknown'`
- [ ] **檔案**: `__tests__/screens/ChatScreen.voice.test.tsx`
  - [ ] 錯誤：`Argument of type '{...}' is not assignable to parameter of type 'never'`

### ✅ 任務 2：修復失敗的測試套件 (共 5 個)

- [ ] **測試套件**: `__tests__/services/APIService.integration.test.ts`
  - [ ] **問題**: 斷言失敗，期望收到 `string` 但實際收到 `object`。
- [ ] **測試套件**: `__tests__/screens/ChatScreen.test.tsx`
  - [ ] **問題**: `MockedGoogleAIService` 的 `toHaveBeenCalledWith` 斷言失敗，收到的參數不匹配。
- [ ] **測試套件**: `__tests__/navigation/AppNavigation.test.tsx`
  - [ ] **問題**: 6 個測試因 `Element type is invalid` 錯誤而失敗，可能是 React Navigation 的 mock 不正確。
- [ ] **測試套件**: `__tests__/integration/UserJourney.test.ts`
  - [ ] **問題**: 斷言失敗，`result.data?.analysis` 的類型應為 `string` 但實際為 `object`。
- [ ] **測試套件**: `__tests__/screens/ChatScreen.voice.test.tsx`
  - [ ] **問題**: 找不到 `voice-error-indicator` 元素，表示語音錯誤處理的 UI 未如預期呈現。

---

## 階段二：程式碼品質提升 (中優先級)

**目標：** 清理警告，提高程式碼可維護性。

- [ ] **任務 3：處理 ESLint 警告 (共 236 個)**

  - [ ] **主要問題**: 大量的 `@typescript-eslint/no-explicit-any` 和 `@typescript-eslint/no-unused-vars` 警告。
  - [ ] **行動**: 分批次為 `any` 類型添加具體的類型定義，並移除未使用的變數。

- [ ] **任務 4：解決測試環境警告**
  - [ ] **問題**: `react-test-renderer is deprecated`。
  - [ ] **行動**: 評估是否可以遷移到新的測試渲染器。
  - [ ] **問題**: `Firebase 初始化失敗，使用 mock 模式`。
  - [ ] **行動**: 檢查 `setup.ts` 中的 Firebase mock 設置，確保其在測試環境中能被正確初始化。

---

## 階段三：iOS 環境配置與運行

**目標：** 在解決上述問題後，於 iOS 模擬器上啟動並運行 App。

- [ ] **任務 5：確保 iOS 環境配置正確**

  - [ ] **確認**: `package.json` 中的 `npm run ios` 指令可以正常執行。
  - [ ] **檢查**: `app.json` 中的 `ios.bundleIdentifier` (`com.localite.app`) 是否正確。
  - [ ] **檢查**: `eas.json` 中的 `development` profile 是否配置為 `simulator: true`。
  - [ ] **確認**: 專案根目錄中的 `GoogleService-Info.plist` 檔案存在且配置正確。

- [ ] **任務 6：安裝 Pods 並啟動 App**

  - [ ] **執行**: `cd localite-app-main/ios && pod install` 來安裝 iOS 原生依賴。
  - [ ] **執行**: 返回 `localite-app-main` 目錄，運行 `npm run ios` 啟動應用程式。

- [ ] **任務 7：手動功能驗證**
  - [ ] **測試**: 在模擬器上手動測試核心功能，如登入、聊天、拍照分析，確保功能正常。

---

## 階段四：部署準備 (未來工作)

- [ ] **任務 8：更新 EAS Submit 配置**
  - [ ] **行動**: 在 `eas.json` 的 `submit.production` 和 `submit.preview` 部分填入真實的 Apple 開發者帳戶資訊 (`appleId`, `ascAppId`, `appleTeamId`)。
