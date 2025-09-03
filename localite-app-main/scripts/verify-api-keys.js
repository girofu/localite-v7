#!/usr/bin/env node

/**
 * API Keys 驗證腳本
 * 驗證各種 API Keys 的有效性和配置正確性
 */

const https = require("https");

console.log("🔑 驗證 API Keys...\n");

/**
 * 載入環境變數
 */
function loadEnvFile(envFile = ".env") {
  const fs = require("fs");
  const path = require("path");

  const envPath = path.join(__dirname, "..", envFile);

  if (!fs.existsSync(envPath)) {
    console.log(`❌ 環境檔案不存在: ${envFile}`);
    return {};
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const env = {};

  envContent.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join("=");
      }
    }
  });

  return env;
}

/**
 * HTTP 請求封裝
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", reject);
    req.end();
  });
}

/**
 * 驗證 Firebase 配置
 */
async function validateFirebaseConfig(env) {
  console.log("1. 🔥 驗證 Firebase 配置...");

  const requiredKeys = [
    "EXPO_PUBLIC_FIREBASE_API_KEY",
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "EXPO_PUBLIC_FIREBASE_APP_ID",
  ];

  const missing = requiredKeys.filter((key) => !env[key]);

  if (missing.length > 0) {
    console.log(`   ❌ 缺少 Firebase 配置: ${missing.join(", ")}`);
    return false;
  }

  // 驗證 Firebase API Key 格式
  const apiKey = env.EXPO_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey.startsWith("AIza")) {
    console.log("   ❌ Firebase API Key 格式不正確");
    return false;
  }

  // 驗證 Project ID 格式
  const projectId = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  if (!/^[a-z0-9-]+$/.test(projectId)) {
    console.log("   ❌ Firebase Project ID 格式不正確");
    return false;
  }

  console.log("   ✅ Firebase 配置有效");
  return true;
}

/**
 * 驗證 Google AI API Key
 */
async function validateGoogleAIKey(env) {
  console.log("2. 🤖 驗證 Google AI Studio API Key...");

  const apiKey = env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.log("   ❌ 未找到 Google AI API Key");
    return false;
  }

  if (!apiKey.startsWith("AIza")) {
    console.log("   ❌ Google AI API Key 格式不正確");
    return false;
  }

  try {
    // 使用 Gemini API 進行簡單的驗證請求
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const testPayload = JSON.stringify({
      contents: [
        {
          parts: [{ text: "Hello" }],
        },
      ],
    });

    const response = await makeRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": testPayload.length,
      },
    });

    response.write = testPayload;

    if (response.statusCode === 200) {
      console.log("   ✅ Google AI API Key 有效");
      return true;
    } else if (response.statusCode === 403) {
      console.log("   ❌ Google AI API Key 無效或受限");
      return false;
    } else {
      console.log(`   ⚠️  Google AI API 回應狀態碼: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ 驗證 Google AI API Key 時發生錯誤: ${error.message}`);
    return false;
  }
}

/**
 * 檢查環境變數安全性
 */
function checkEnvironmentSecurity(env) {
  console.log("3. 🔒 檢查環境變數安全性...");

  const securityIssues = [];

  // 檢查是否有測試或開發用的預設值
  const dangerousValues = [
    "your_api_key_here",
    "your_production_api_key_here",
    "your_staging_api_key_here",
    "test_key",
    "development_key",
  ];

  Object.entries(env).forEach(([key, value]) => {
    if (dangerousValues.some((dangerous) => value.includes(dangerous))) {
      securityIssues.push(`${key} 包含預設或測試值`);
    }

    // 檢查是否有明文密碼
    if (key.toLowerCase().includes("password") && value.length < 8) {
      securityIssues.push(`${key} 密碼強度不足`);
    }
  });

  if (securityIssues.length > 0) {
    console.log("   ❌ 安全性問題:");
    securityIssues.forEach((issue) => console.log(`      - ${issue}`));
    return false;
  }

  console.log("   ✅ 環境變數安全性檢查通過");
  return true;
}

/**
 * 主要執行函數
 */
async function main() {
  const envFile = process.argv[2] || ".env.production";

  console.log(`載入環境配置: ${envFile}\n`);

  const env = loadEnvFile(envFile);

  if (Object.keys(env).length === 0) {
    console.log("❌ 無法載入環境變數");
    process.exit(1);
  }

  const validations = [
    () => validateFirebaseConfig(env),
    () => validateGoogleAIKey(env),
    () => checkEnvironmentSecurity(env),
  ];

  let allValid = true;

  for (const validate of validations) {
    const result = await validate();
    if (!result) {
      allValid = false;
    }
    console.log("");
  }

  console.log("=".repeat(50));

  if (allValid) {
    console.log("🎉 所有 API Keys 驗證通過！");
    process.exit(0);
  } else {
    console.log("⚠️  API Keys 驗證失敗，請檢查配置。");
    process.exit(1);
  }
}

// 執行主函數
main().catch((error) => {
  console.error("發生未預期的錯誤:", error);
  process.exit(1);
});

