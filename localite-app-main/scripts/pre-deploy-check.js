#!/usr/bin/env node

/**
 * 部署前檢查腳本
 * 確保所有必要的配置和檔案都已準備就緒
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 執行部署前檢查...\n");

const checks = [
  {
    name: "檢查環境配置檔案",
    check: () => {
      const envFiles = [".env.production", ".env.staging", ".env.example"];
      const missing = envFiles.filter(
        (file) => !fs.existsSync(path.join(__dirname, "..", file))
      );
      return {
        passed: missing.length === 0,
        message:
          missing.length > 0
            ? `缺少環境檔案: ${missing.join(", ")}`
            : "所有環境檔案存在",
      };
    },
  },

  {
    name: "檢查 EAS 配置",
    check: () => {
      const easConfigPath = path.join(__dirname, "..", "eas.json");
      const exists = fs.existsSync(easConfigPath);

      if (!exists) {
        return { passed: false, message: "eas.json 檔案不存在" };
      }

      try {
        const config = JSON.parse(fs.readFileSync(easConfigPath, "utf8"));
        const hasProduction = config.build && config.build.production;
        const hasSubmit = config.submit && config.submit.production;

        return {
          passed: hasProduction && hasSubmit,
          message:
            hasProduction && hasSubmit
              ? "EAS 配置完整"
              : "EAS 配置不完整，缺少 production 設定檔",
        };
      } catch (error) {
        return {
          passed: false,
          message: `eas.json 格式錯誤: ${error.message}`,
        };
      }
    },
  },

  {
    name: "檢查 app.json 配置",
    check: () => {
      const appConfigPath = path.join(__dirname, "..", "app.json");
      const exists = fs.existsSync(appConfigPath);

      if (!exists) {
        return { passed: false, message: "app.json 檔案不存在" };
      }

      try {
        const config = JSON.parse(fs.readFileSync(appConfigPath, "utf8"));
        const expo = config.expo;

        const requiredFields = [
          "name",
          "slug",
          "version",
          "ios.bundleIdentifier",
          "android.package",
        ];
        const missing = requiredFields.filter((field) => {
          const value = field
            .split(".")
            .reduce((obj, key) => obj && obj[key], expo);
          return !value;
        });

        return {
          passed: missing.length === 0,
          message:
            missing.length > 0
              ? `app.json 缺少必要欄位: ${missing.join(", ")}`
              : "app.json 配置完整",
        };
      } catch (error) {
        return {
          passed: false,
          message: `app.json 格式錯誤: ${error.message}`,
        };
      }
    },
  },

  {
    name: "檢查應用商店資料",
    check: () => {
      const metadataDir = path.join(__dirname, "..", "store-metadata");
      const requiredFiles = ["app-store-metadata.md", "play-store-metadata.md"];

      if (!fs.existsSync(metadataDir)) {
        return { passed: false, message: "store-metadata 目錄不存在" };
      }

      const missing = requiredFiles.filter(
        (file) => !fs.existsSync(path.join(metadataDir, file))
      );

      return {
        passed: missing.length === 0,
        message:
          missing.length > 0
            ? `缺少應用商店資料檔案: ${missing.join(", ")}`
            : "應用商店資料完整",
      };
    },
  },

  {
    name: "檢查資產檔案",
    check: () => {
      const assetsDir = path.join(__dirname, "..", "assets");
      const logoPath = path.join(assetsDir, "logo", "logo-light.png");

      if (!fs.existsSync(logoPath)) {
        return {
          passed: false,
          message: "應用程式圖示檔案不存在: assets/logo/logo-light.png",
        };
      }

      return { passed: true, message: "資產檔案存在" };
    },
  },

  {
    name: "檢查 package.json 建置腳本",
    check: () => {
      const packagePath = path.join(__dirname, "..", "package.json");

      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
        const scripts = packageJson.scripts || {};

        const requiredScripts = [
          "build:android",
          "build:ios",
          "build:all",
          "submit:android",
          "submit:ios",
          "deploy",
        ];

        const missing = requiredScripts.filter((script) => !scripts[script]);

        return {
          passed: missing.length === 0,
          message:
            missing.length > 0
              ? `缺少建置腳本: ${missing.join(", ")}`
              : "建置腳本完整",
        };
      } catch (error) {
        return {
          passed: false,
          message: `無法讀取 package.json: ${error.message}`,
        };
      }
    },
  },

  {
    name: "檢查安全檢查清單",
    check: () => {
      const securityChecklistPath = path.join(
        __dirname,
        "..",
        "deployment",
        "security-checklist.md"
      );
      const deploymentGuidePath = path.join(
        __dirname,
        "..",
        "deployment",
        "deployment-guide.md"
      );

      const files = [securityChecklistPath, deploymentGuidePath];
      const missing = files.filter((file) => !fs.existsSync(file));

      return {
        passed: missing.length === 0,
        message: missing.length > 0 ? "缺少部署文檔" : "部署文檔完整",
      };
    },
  },
];

let allPassed = true;

checks.forEach((checkItem, index) => {
  const result = checkItem.check();
  const status = result.passed ? "✅" : "❌";

  console.log(`${index + 1}. ${status} ${checkItem.name}`);
  console.log(`   ${result.message}\n`);

  if (!result.passed) {
    allPassed = false;
  }
});

console.log("=".repeat(50));
if (allPassed) {
  console.log("🎉 所有檢查項目都通過！準備好進行部署。");
  process.exit(0);
} else {
  console.log("⚠️  有檢查項目未通過，請修正後再進行部署。");
  process.exit(1);
}

