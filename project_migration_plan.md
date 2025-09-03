# 專案重建與遷移計畫

## 🎯 總體目標

為了解決頑固的 Metro Bundler 依賴衝突問題，我們將建立一個全新的、基於 Expo SDK 51 穩定版本的專案，並將現有的 `localite-app-main` 專案中的原始碼、資源和設定逐步遷移過去。

---

## 📅 執行階段

### ✅ 階段一：建立新的穩定專案

- [ ] **任務 1：初始化新專案**

  - **指令**：在 `localite-v7/` 目錄下執行 `npx create-expo-app localite-app-stable --template blank@51`。
  - **目標**：建立一個名為 `localite-app-stable` 的全新 Expo SDK 51 專案，作為我們穩定乾淨的基礎。

- [ ] **任務 2：安裝核心依賴**
  - **說明**：進入 `localite-app-stable` 目錄，根據舊 `package.json` 的 `dependencies` 列表，使用 `npx expo install` 指令逐一安裝所有必要的函式庫。這可以確保每個函式庫都安裝了與 SDK 51 最相容的版本。
  - **依賴列表**：
    - `@react-navigation/bottom-tabs`
    - `@react-navigation/native`
    - `@react-navigation/stack`
    - `expo-camera`
    - `expo-image-picker`
    - `expo-linear-gradient`
    - `expo-location`
    - `firebase`
    - `geolib`
    - `react-native-gesture-handler`
    - `react-native-maps`
    - `react-native-reanimated`
    - `react-native-safe-area-context`
    - `react-native-screens`
    - 其他在舊專案中使用的第三方服務 (如 `@google-cloud/firestore` 等)

### ✅ 階段二：程式碼與資源遷移

- [ ] **任務 3：複製原始碼與資源目錄**

  - **說明**：將以下目錄從 `localite-app-main/` 完整複製到 `localite-app-stable/` 對應的位置：
    - `src/`
    - `components/`
    - `screens/`
    - `assets/`
    - `data/`
    - `utils/`

- [ ] **任務 4：遷移測試檔案**
  - **說明**：將 `localite-app-main/__tests__/` 目錄完整複製到 `localite-app-stable/`。

### ✅ 階段三：設定檔合併

- [ ] **任務 5：合併 `app.json` 設定**

  - **說明**：手動比對 `localite-app-main/app.json` 和 `localite-app-stable/app.json`，將舊專案中的 `ios`、`android`、`extra` 和 `plugins` 等關鍵設定合併到新專案的 `app.json` 中。

- [ ] **任務 6：遷移 `eas.json`**

  - **說明**：將 `localite-app-main/eas.json` 檔案直接複製到 `localite-app-stable/` 目錄中。

- [ ] **任務 7：遷移 Firebase 設定檔**
  - **說明**：將 `localite-app-main/GoogleService-Info.plist` (iOS) 和 `google-services.json` (Android，如果存在) 複製到新專案的根目錄。

### ✅ 階段四：最終驗證

- [ ] **任務 8：重新生成原生專案**

  - **指令**：在 `localite-app-stable/` 目錄中，執行 `npx expo prebuild --platform ios --clean`。
  - **目標**：根據新的依賴和設定，生成一個全新的 `ios` 原生專案目錄。

- [ ] **任務 9：啟動 App**
  - **指令**：在 `localite-app-stable/` 目錄中，執行 `npm run ios`。
  - **目標**：驗證 App 是否能在 iOS 模擬器上成功建置並啟動，解決最初的 Metro Bundler 錯誤。

---
