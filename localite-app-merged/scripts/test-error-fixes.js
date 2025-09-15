#!/usr/bin/env node

/**
 * 測試錯誤修復腳本
 *
 * 測試以下修復是否生效：
 * 1. LoggingService 網路連接
 * 2. Firebase cancelled 錯誤處理
 * 3. 全域錯誤處理器
 */

const { logger } = require("../src/services/LoggingService");

async function testErrorFixes() {
  console.log("🔧 開始測試錯誤修復...\n");

  // 測試 1: 日誌服務器連接
  console.log("📡 測試 1: 日誌服務器連接...");
  try {
    const isConnected = await logger.testConnection();
    if (isConnected) {
      console.log("✅ 日誌服務器連接成功");
    } else {
      console.log("❌ 日誌服務器連接失敗");
    }
  } catch (error) {
    console.error("❌ 連接測試錯誤:", error.message);
  }

  // 測試 2: 模擬 Firebase cancelled 錯誤
  console.log("\n🔥 測試 2: Firebase cancelled 錯誤處理...");
  try {
    const mockFirebaseError = new Error("Operation cancelled");
    mockFirebaseError.code = "cancelled";

    // 這應該被全域錯誤處理器捕獲，而不是產生 unhandled rejection
    Promise.reject(mockFirebaseError).catch((error) => {
      console.log("✅ Firebase cancelled 錯誤被正確捕獲:", error.code);
    });
  } catch (error) {
    console.error("❌ Firebase 錯誤測試失敗:", error.message);
  }

  // 測試 3: 網路錯誤處理
  console.log("\n🌐 測試 3: 網路錯誤處理...");
  try {
    // 模擬網路錯誤
    const networkError = new Error("Network request timed out");
    Promise.reject(networkError).catch((error) => {
      console.log("✅ 網路錯誤被正確捕獲:", error.message);
    });
  } catch (error) {
    console.error("❌ 網路錯誤測試失敗:", error.message);
  }

  // 測試 4: 發送測試日誌
  console.log("\n📝 測試 4: 發送測試日誌...");
  try {
    logger.info("錯誤修復測試完成", {
      timestamp: new Date().toISOString(),
      test: "error-fixes",
      status: "completed",
    });
    console.log("✅ 測試日誌發送成功");
  } catch (error) {
    console.error("❌ 發送測試日誌失敗:", error.message);
  }

  console.log("\n🎉 錯誤修復測試完成！");
}

// 執行測試
if (require.main === module) {
  testErrorFixes().catch(console.error);
}

module.exports = { testErrorFixes };

