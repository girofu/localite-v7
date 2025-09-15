#!/usr/bin/env node

/**
 * 最終部署檢查腳本
 * 驗證徽章系統和核心功能的生產就緒性
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 執行最終部署檢查...\n");

const checks = [];
let totalScore = 0;
const maxScore = 100;

// 1. 檢查徽章系統測試
console.log("1. 🏆 檢查徽章系統測試狀態...");
try {
  const result = execSync(
    'npm test -- --testPathPattern="Badge" --passWithNoTests',
    {
      encoding: "utf8",
      stdio: "pipe",
    }
  );

  if (result.includes("74 passed") || result.includes("passed")) {
    console.log("   ✅ 徽章系統測試：PASS");
    checks.push({ name: "徽章系統測試", status: "PASS", score: 25 });
    totalScore += 25;
  } else {
    console.log("   ❌ 徽章系統測試：FAIL");
    checks.push({ name: "徽章系統測試", status: "FAIL", score: 0 });
  }
} catch (error) {
  console.log("   ⚠️ 徽章系統測試：無法執行");
  checks.push({ name: "徽章系統測試", status: "ERROR", score: 0 });
}

// 2. 檢查 package.json 配置
console.log("2. 📦 檢查應用配置...");
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));

  const hasRequiredFields =
    packageJson.name &&
    packageJson.version &&
    appJson.expo.name &&
    appJson.expo.version;

  if (hasRequiredFields) {
    console.log(
      `   ✅ 應用配置：${appJson.expo.name} v${appJson.expo.version}`
    );
    checks.push({ name: "應用配置", status: "PASS", score: 15 });
    totalScore += 15;
  } else {
    console.log("   ❌ 應用配置：缺少必要字段");
    checks.push({ name: "應用配置", status: "FAIL", score: 0 });
  }
} catch (error) {
  console.log("   ❌ 應用配置：無法讀取");
  checks.push({ name: "應用配置", status: "ERROR", score: 0 });
}

// 3. 檢查 EAS 配置
console.log("3. 🏗️ 檢查 EAS 建置配置...");
try {
  const easJson = JSON.parse(fs.readFileSync("eas.json", "utf8"));

  const hasProduction =
    easJson.build &&
    easJson.build.production &&
    easJson.submit &&
    easJson.submit.production;

  if (hasProduction) {
    console.log("   ✅ EAS 配置：生產環境準備完成");
    checks.push({ name: "EAS 配置", status: "PASS", score: 20 });
    totalScore += 20;
  } else {
    console.log("   ❌ EAS 配置：缺少生產環境配置");
    checks.push({ name: "EAS 配置", status: "FAIL", score: 0 });
  }
} catch (error) {
  console.log("   ❌ EAS 配置：無法讀取");
  checks.push({ name: "EAS 配置", status: "ERROR", score: 0 });
}

// 4. 檢查環境變數
console.log("4. 🔑 檢查生產環境變數...");
try {
  const envProduction = fs.readFileSync(".env.production", "utf8");

  const hasFirebaseKeys =
    envProduction.includes("EXPO_PUBLIC_FIREBASE_API_KEY") &&
    envProduction.includes("EXPO_PUBLIC_FIREBASE_PROJECT_ID");

  const hasAIKeys = envProduction.includes("EXPO_PUBLIC_GOOGLE_AI_API_KEY");

  if (hasFirebaseKeys && hasAIKeys) {
    console.log("   ✅ 環境變數：關鍵 API Keys 已配置");
    checks.push({ name: "環境變數", status: "PASS", score: 20 });
    totalScore += 20;
  } else {
    console.log("   ❌ 環境變數：缺少關鍵 API Keys");
    checks.push({ name: "環境變數", status: "FAIL", score: 0 });
  }
} catch (error) {
  console.log("   ❌ 環境變數：無法讀取生產配置");
  checks.push({ name: "環境變數", status: "ERROR", score: 0 });
}

// 5. 檢查關鍵檔案存在性
console.log("5. 📁 檢查關鍵檔案...");
const criticalFiles = [
  "src/services/BadgeService.ts",
  "src/hooks/useBadgeService.ts",
  "components/BadgeChatBubble.tsx",
  "screens/BadgeTypeScreen.tsx",
  "screens/BadgeDetailScreen.tsx",
  "data/badges.ts",
  "src/types/badge.types.ts",
];

let missingFiles = 0;
criticalFiles.forEach((file) => {
  if (!fs.existsSync(file)) {
    console.log(`   ❌ 缺少檔案: ${file}`);
    missingFiles++;
  }
});

if (missingFiles === 0) {
  console.log("   ✅ 關鍵檔案：全部存在");
  checks.push({ name: "關鍵檔案", status: "PASS", score: 10 });
  totalScore += 10;
} else {
  console.log(`   ❌ 關鍵檔案：缺少 ${missingFiles} 個檔案`);
  checks.push({ name: "關鍵檔案", status: "FAIL", score: 0 });
}

// 6. 檢查資產檔案
console.log("6. 🎨 檢查徽章資產檔案...");
const badgeAssets = [
  "assets/badges",
  "assets/guides",
  "assets/icons",
  "assets/logo",
];

let missingAssets = 0;
badgeAssets.forEach((assetDir) => {
  if (!fs.existsSync(assetDir)) {
    console.log(`   ❌ 缺少資產目錄: ${assetDir}`);
    missingAssets++;
  }
});

if (missingAssets === 0) {
  console.log("   ✅ 徽章資產：全部存在");
  checks.push({ name: "徽章資產", status: "PASS", score: 10 });
  totalScore += 10;
} else {
  console.log(`   ❌ 徽章資產：缺少 ${missingAssets} 個目錄`);
  checks.push({ name: "徽章資產", status: "FAIL", score: 0 });
}

// 結果總結
console.log("\n============================================================");
console.log("🎯 最終部署檢查結果");
console.log("============================================================\n");

checks.forEach((check) => {
  const status =
    check.status === "PASS" ? "✅" : check.status === "FAIL" ? "❌" : "⚠️";
  console.log(`${status} ${check.name}: ${check.status} (${check.score}分)`);
});

console.log(`\n📊 總分: ${totalScore}/${maxScore}`);

if (totalScore >= 80) {
  console.log("🎉 恭喜！應用已準備好生產部署");
  console.log("\n🚀 建議執行步驟:");
  console.log("1. eas build --platform all --profile preview  (先測試預覽版)");
  console.log("2. eas build --platform all --profile production  (生產版建置)");
  console.log(
    "3. eas submit --platform all --profile production  (提交應用商店)"
  );

  process.exit(0);
} else if (totalScore >= 60) {
  console.log("⚠️ 應用基本準備完成，但有改進空間");
  console.log("\n🔧 建議先修復失敗項目再部署");

  process.exit(1);
} else {
  console.log("❌ 應用尚未準備好生產部署");
  console.log("\n🛠️ 請先修復失敗項目");

  process.exit(2);
}
