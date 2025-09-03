#!/usr/bin/env node

/**
 * Staging 環境設置腳本
 * 配置和驗證實體測試環境
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🏗️  開始設置 Staging 環境...\n");

class StagingSetup {
  constructor() {
    this.stagingDir = path.join(__dirname, "..", ".staging");
    this.config = {};
  }

  async run() {
    try {
      console.log("📁 創建 staging 目錄...");
      this.createStagingDirectory();

      console.log("⚙️  配置環境變數...");
      await this.setupEnvironment();

      console.log("🔧 配置建置設定...");
      await this.setupBuildConfig();

      console.log("🧪 設置測試資料...");
      await this.setupTestData();

      console.log("✅ 配置監控和日誌...");
      await this.setupMonitoring();

      console.log("🎯 生成部署配置...");
      await this.generateDeploymentConfig();

      console.log("\n🎉 Staging 環境設置完成！");
      console.log("🚀 使用以下命令啟動 staging 環境:");
      console.log("   npm run build:staging");
      console.log("   npm run deploy:staging");
    } catch (error) {
      console.error("❌ Staging 環境設置失敗:", error);
      process.exit(1);
    }
  }

  createStagingDirectory() {
    if (!fs.existsSync(this.stagingDir)) {
      fs.mkdirSync(this.stagingDir, { recursive: true });
    }

    // 創建子目錄
    const subDirs = ["config", "logs", "test-data", "build-artifacts"];
    subDirs.forEach((dir) => {
      const subDirPath = path.join(this.stagingDir, dir);
      if (!fs.existsSync(subDirPath)) {
        fs.mkdirSync(subDirPath, { recursive: true });
      }
    });

    console.log("   ✅ Staging 目錄結構已創建");
  }

  async setupEnvironment() {
    // 複製 .env.staging 到 staging 配置
    const envStagingPath = path.join(__dirname, "..", ".env.staging");
    const stagingEnvPath = path.join(this.stagingDir, "config", ".env.staging");

    if (fs.existsSync(envStagingPath)) {
      const envContent = fs.readFileSync(envStagingPath, "utf8");
      fs.writeFileSync(stagingEnvPath, envContent);
      console.log("   ✅ 環境變數配置已複製");
    } else {
      // 創建預設的 staging 環境配置
      const defaultEnv = `# Staging Environment Configuration
NODE_ENV=staging
EXPO_PUBLIC_API_URL=https://api-staging.localite.ai
EXPO_PUBLIC_FIREBASE_PROJECT_ID=localite-staging
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=staging_maps_key
EXPO_PUBLIC_GOOGLE_AI_API_KEY=staging_ai_key
EXPO_PUBLIC_TTS_API_KEY=staging_tts_key

# 功能開關
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true

# 測試設定
EXPO_PUBLIC_TEST_MODE=true
EXPO_PUBLIC_MOCK_API_RESPONSES=false
EXPO_PUBLIC_ENABLE_DEBUG_LOGGING=true
`;
      fs.writeFileSync(stagingEnvPath, defaultEnv);
      console.log("   ✅ 預設 staging 環境配置已創建");
    }

    this.config.env = stagingEnvPath;
  }

  async setupBuildConfig() {
    // 創建 staging 專用的 eas.json 配置
    const easConfig = {
      build: {
        staging: {
          node: "18.18.0",
          yarn: "1.22.19",
          ios: {
            bundleIdentifier: "com.localite.mobile.staging",
            buildType: "archive",
          },
          android: {
            package: "com.localite.mobile.staging",
            buildType: "apk",
          },
          env: {
            NODE_ENV: "staging",
            EXPO_PUBLIC_ENV: "staging",
          },
        },
      },
      submit: {
        staging: {
          ios: {
            appleId: "staging@localite.ai",
            ascAppId: "1234567890",
          },
          android: {
            serviceAccountKeyPath: "./staging-service-account.json",
            track: "internal",
          },
        },
      },
    };

    const easStagingPath = path.join(
      this.stagingDir,
      "config",
      "eas.staging.json"
    );
    fs.writeFileSync(easStagingPath, JSON.stringify(easConfig, null, 2));

    console.log("   ✅ Staging 建置配置已創建");
    this.config.eas = easStagingPath;
  }

  async setupTestData() {
    // 創建測試用戶資料
    const testUsers = [
      {
        id: "staging-user-001",
        email: "test1@staging.localite.ai",
        displayName: "Staging Test User 1",
        role: "tester",
        preferences: {
          language: "zh-TW",
          theme: "light",
          notifications: true,
        },
      },
      {
        id: "staging-user-002",
        email: "test2@staging.localite.ai",
        displayName: "Staging Test User 2",
        role: "tester",
        preferences: {
          language: "en-US",
          theme: "dark",
          notifications: false,
        },
      },
    ];

    // 創建測試地點資料
    const testPlaces = [
      {
        id: "staging-place-001",
        name: "Staging Test Place 1",
        location: { latitude: 25.033, longitude: 121.5654 },
        category: "attraction",
        description: "測試地點 1",
      },
      {
        id: "staging-place-002",
        name: "Staging Test Place 2",
        location: { latitude: 25.0911, longitude: 121.5598 },
        category: "restaurant",
        description: "測試地點 2",
      },
    ];

    const testDataPath = path.join(this.stagingDir, "test-data");
    fs.writeFileSync(
      path.join(testDataPath, "users.json"),
      JSON.stringify(testUsers, null, 2)
    );
    fs.writeFileSync(
      path.join(testDataPath, "places.json"),
      JSON.stringify(testPlaces, null, 2)
    );

    console.log("   ✅ 測試資料已設置");
    this.config.testData = testDataPath;
  }

  async setupMonitoring() {
    // 創建監控配置
    const monitoringConfig = {
      logging: {
        level: "debug",
        enableRemoteLogging: true,
        logRemoteUrl: "https://logs-staging.localite.ai/api/logs",
      },
      analytics: {
        enabled: true,
        trackingId: "STAGING-ANALYTICS-ID",
      },
      crashReporting: {
        enabled: true,
        service: "sentry",
        dsn: "https://staging-sentry-dsn@sentry.io/project",
      },
      performance: {
        enabled: true,
        sampleRate: 1.0,
        metrics: [
          "app_startup_time",
          "api_response_time",
          "render_time",
          "memory_usage",
        ],
      },
    };

    const monitoringPath = path.join(
      this.stagingDir,
      "config",
      "monitoring.json"
    );
    fs.writeFileSync(monitoringPath, JSON.stringify(monitoringConfig, null, 2));

    console.log("   ✅ 監控配置已設置");
    this.config.monitoring = monitoringPath;
  }

  async generateDeploymentConfig() {
    // 生成部署腳本
    const deployScript = `#!/bin/bash

# Staging 環境部署腳本

echo "🚀 開始 Staging 環境部署..."

# 載入環境變數
export $(cat .staging/config/.env.staging | xargs)

# 建置應用
echo "📦 建置 Staging 版本..."
npm run build:staging

# 運行測試
echo "🧪 運行 Staging 測試..."
npm run test:staging

# 部署到測試服務器
echo "🌐 部署到 Staging 服務器..."
npm run deploy:staging

echo "✅ Staging 部署完成！"
echo "🔗 Staging 應用 URL: https://staging.localite.ai"
`;

    const deployScriptPath = path.join(this.stagingDir, "deploy-staging.sh");
    fs.writeFileSync(deployScriptPath, deployScript);
    fs.chmodSync(deployScriptPath, "755");

    // 生成驗證腳本
    const validationScript = `#!/bin/bash

# Staging 環境驗證腳本

echo "🔍 開始 Staging 環境驗證..."

# 檢查應用是否正常運行
echo "📱 檢查應用狀態..."
curl -f https://staging.localite.ai/health || exit 1

# 檢查 API 端點
echo "🌐 檢查 API 端點..."
curl -f https://api-staging.localite.ai/health || exit 1

# 檢查資料庫連接
echo "🗄️  檢查資料庫連接..."
curl -f https://api-staging.localite.ai/db/health || exit 1

# 運行端到端測試
echo "🧪 運行 E2E 測試..."
npm run test:e2e:staging

echo "✅ Staging 環境驗證通過！"
`;

    const validationScriptPath = path.join(
      this.stagingDir,
      "validate-staging.sh"
    );
    fs.writeFileSync(validationScriptPath, validationScript);
    fs.chmodSync(validationScriptPath, "755");

    console.log("   ✅ 部署和驗證腳本已生成");
    this.config.deployment = {
      deployScript: deployScriptPath,
      validationScript: validationScriptPath,
    };
  }

  generateSummary() {
    console.log("\n📋 Staging 環境設置摘要:");
    console.log("=".repeat(40));

    console.log("📁 創建的目錄結構:");
    console.log("  .staging/");
    console.log("    ├── config/           # 配置檔案");
    console.log("    ├── logs/            # 日誌檔案");
    console.log("    ├── test-data/       # 測試資料");
    console.log("    └── build-artifacts/ # 建置產物");

    console.log("\n🔧 配置檔案:");
    Object.entries(this.config).forEach(([key, value]) => {
      if (typeof value === "string") {
        console.log(`  ${key}: ${path.relative(process.cwd(), value)}`);
      } else if (typeof value === "object") {
        console.log(`  ${key}:`);
        Object.entries(value).forEach(([subKey, subValue]) => {
          console.log(
            `    ${subKey}: ${path.relative(process.cwd(), subValue)}`
          );
        });
      }
    });

    console.log("\n🚀 Staging 環境功能:");
    console.log("  ✅ 隔離的測試環境");
    console.log("  ✅ 完整的監控和日誌");
    console.log("  ✅ 自動化部署腳本");
    console.log("  ✅ 測試資料管理");
    console.log("  ✅ 效能監控");

    console.log("\n📊 使用方式:");
    console.log("  1. 啟動 Staging 環境:");
    console.log("     ./staging/deploy-staging.sh");
    console.log("  2. 驗證環境:");
    console.log("     ./staging/validate-staging.sh");
    console.log("  3. 查看日誌:");
    console.log("     tail -f .staging/logs/app.log");
  }
}

// 生成 package.json 的 staging 腳本
function updatePackageJson() {
  const packagePath = path.join(__dirname, "..", "package.json");

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    // 添加 staging 相關的腳本
    packageJson.scripts = {
      ...packageJson.scripts,
      "build:staging": "eas build --platform all --profile staging",
      "submit:staging": "eas submit --platform all --profile staging",
      "deploy:staging": "npm run build:staging && npm run submit:staging",
      "test:staging": "npm run test:coverage",
      "test:e2e:staging": "npm run test -- --testPathPattern=integration",
      "staging:setup": "node scripts/staging-setup.js",
      "staging:validate": "./.staging/validate-staging.sh",
      "staging:logs": "tail -f .staging/logs/app.log",
    };

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log("✅ package.json 已更新 staging 腳本");
  } catch (error) {
    console.error("❌ 更新 package.json 失敗:", error);
  }
}

// 執行設置
const setup = new StagingSetup();
setup
  .run()
  .then(() => {
    updatePackageJson();
    setup.generateSummary();
  })
  .catch((error) => {
    console.error("❌ Staging 設置失敗:", error);
    process.exit(1);
  });
