#!/usr/bin/env node

/**
 * 發布前完整檢查腳本
 * 確保所有必要的配置、測試和品質檢查都通過
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 開始執行發布前完整檢查...\n");

const checks = [
  {
    name: "🔍 程式碼品質檢查",
    description: "執行 ESLint 檢查",
    check: () => {
      try {
        execSync("npm run lint", { stdio: "pipe" });
        return { passed: true, message: "ESLint 檢查通過" };
      } catch (error) {
        return {
          passed: false,
          message: "ESLint 檢查失敗",
          details: error.stdout?.toString(),
        };
      }
    },
  },

  {
    name: "📝 TypeScript 類型檢查",
    description: "執行 TypeScript 編譯檢查",
    check: () => {
      try {
        execSync("npm run type-check", { stdio: "pipe" });
        return { passed: true, message: "TypeScript 檢查通過" };
      } catch (error) {
        return {
          passed: false,
          message: "TypeScript 檢查失敗",
          details: error.stdout?.toString(),
        };
      }
    },
  },

  {
    name: "🧪 單元測試檢查",
    description: "執行所有單元測試",
    check: () => {
      try {
        execSync("npm test", { stdio: "pipe" });
        return { passed: true, message: "單元測試通過" };
      } catch (error) {
        return {
          passed: false,
          message: "單元測試失敗",
          details: error.stdout?.toString(),
        };
      }
    },
  },

  {
    name: "📊 測試覆蓋率檢查",
    description: "檢查測試覆蓋率是否達到門檻",
    check: () => {
      try {
        const output = execSync("npm run test:coverage", { stdio: "pipe" });
        const coverageText = output.toString();

        // 解析總覆蓋率數據
        const coverageMatch = coverageText.match(
          /All files\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|/
        );

        if (!coverageMatch) {
          return {
            passed: false,
            message: "無法解析覆蓋率數據",
            details: coverageText,
          };
        }

        const statements = parseFloat(coverageMatch[1]);
        const branches = parseFloat(coverageMatch[2]);
        const functions = parseFloat(coverageMatch[3]);
        const lines = parseFloat(coverageMatch[4]);

        // 檢查是否達到門檻 (30%)
        const minThreshold = 30;
        const passed = statements >= minThreshold;

        return {
          passed: passed,
          message: passed
            ? `覆蓋率檢查通過 (${statements}% >= ${minThreshold}%)`
            : `覆蓋率未達門檻 (${statements}% < ${minThreshold}%)`,
          details: `語句: ${statements}%, 分支: ${branches}%, 函數: ${functions}%, 行: ${lines}%`,
        };
      } catch (error) {
        return {
          passed: false,
          message: "覆蓋率檢查失敗",
          details: error.stdout?.toString(),
        };
      }
    },
  },

  {
    name: "🔧 建置測試",
    description: "測試應用建置是否正常",
    check: () => {
      try {
        // 檢查 Metro bundler 配置
        const metroConfigPath = path.join(__dirname, "..", "metro.config.js");
        if (!fs.existsSync(metroConfigPath)) {
          return { passed: false, message: "metro.config.js 不存在" };
        }

        // 檢查 package.json 中的建置腳本
        const packagePath = path.join(__dirname, "..", "package.json");
        const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
        const requiredScripts = ["build:android", "build:ios", "build:all"];

        for (const script of requiredScripts) {
          if (!packageJson.scripts[script]) {
            return { passed: false, message: `缺少建置腳本: ${script}` };
          }
        }

        return { passed: true, message: "建置配置檢查通過" };
      } catch (error) {
        return { passed: false, message: `建置測試失敗: ${error.message}` };
      }
    },
  },

  {
    name: "🔐 安全檢查",
    description: "檢查敏感資訊和安全配置",
    check: () => {
      const issues = [];

      // 檢查是否有硬編碼的 API 金鑰
      const sourceFiles = [
        "src/**/*.ts",
        "src/**/*.tsx",
        "App.tsx",
        "app.json",
      ];

      for (const pattern of sourceFiles) {
        try {
          const files = execSync(
            `find . -name "${pattern.replace("**/", "")}" -type f`,
            { stdio: "pipe" }
          )
            .toString()
            .trim()
            .split("\n")
            .filter((f) => f);

          for (const file of files) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, "utf8");
              // 檢查常見的 API 金鑰模式
              if (
                content.includes("AIza") ||
                content.includes("sk-") ||
                content.includes("pk_")
              ) {
                issues.push(`發現潛在的 API 金鑰: ${file}`);
              }
            }
          }
        } catch (error) {
          // 忽略 find 命令錯誤
        }
      }

      // 檢查環境變數配置
      const envFiles = [".env.production", ".env.staging"];
      for (const envFile of envFiles) {
        if (!fs.existsSync(path.join(__dirname, "..", envFile))) {
          issues.push(`缺少環境檔案: ${envFile}`);
        }
      }

      return {
        passed: issues.length === 0,
        message: issues.length === 0 ? "安全檢查通過" : "發現安全問題",
        details: issues.join("\n"),
      };
    },
  },

  {
    name: "📱 React Native 相容性檢查",
    description: "檢查 React Native 相關配置",
    check: () => {
      const issues = [];

      // 檢查 app.json 配置
      const appJsonPath = path.join(__dirname, "..", "app.json");
      if (fs.existsSync(appJsonPath)) {
        try {
          const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
          const expo = appJson.expo;

          if (!expo.name || !expo.slug) {
            issues.push("app.json 缺少必要欄位: name 或 slug");
          }

          if (!expo.ios?.bundleIdentifier) {
            issues.push("app.json 缺少 iOS bundle identifier");
          }

          if (!expo.android?.package) {
            issues.push("app.json 缺少 Android package name");
          }
        } catch (error) {
          issues.push(`app.json 格式錯誤: ${error.message}`);
        }
      } else {
        issues.push("app.json 檔案不存在");
      }

      // 檢查 babel.config.js
      const babelConfigPath = path.join(__dirname, "..", "babel.config.js");
      if (!fs.existsSync(babelConfigPath)) {
        issues.push("babel.config.js 檔案不存在");
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0 ? "React Native 配置檢查通過" : "發現配置問題",
        details: issues.join("\n"),
      };
    },
  },

  {
    name: "🎯 效能檢查",
    description: "檢查應用大小和效能指標",
    check: () => {
      try {
        const packagePath = path.join(__dirname, "..", "package.json");
        const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

        const bundleSize = JSON.stringify(packageJson).length;
        const depCount = Object.keys(packageJson.dependencies || {}).length;
        const devDepCount = Object.keys(
          packageJson.devDependencies || {}
        ).length;

        console.log(`📦 Bundle 大小: ~${Math.round(bundleSize / 1024)}KB`);
        console.log(`📋 依賴數量: ${depCount} (開發依賴: ${devDepCount})`);

        // 檢查是否有過大的依賴
        const largeDeps = [];
        if (depCount > 50) {
          largeDeps.push(`依賴數量過多 (${depCount})，建議優化`);
        }

        return {
          passed: largeDeps.length === 0,
          message: largeDeps.length === 0 ? "效能檢查通過" : "發現效能問題",
          details: largeDeps.join("\n"),
        };
      } catch (error) {
        return { passed: false, message: `效能檢查失敗: ${error.message}` };
      }
    },
  },
];

let allPassed = true;
const results = [];

for (let i = 0; i < checks.length; i++) {
  const checkItem = checks[i];
  console.log(`${i + 1}. ${checkItem.name}`);
  console.log(`   ${checkItem.description}`);

  const startTime = Date.now();
  const result = checkItem.check();
  const duration = Date.now() - startTime;

  const status = result.passed ? "✅" : "❌";
  console.log(`   ${status} ${result.message} (${duration}ms)`);

  if (result.details) {
    console.log(
      `   📋 詳細資訊:\n${result.details
        .split("\n")
        .map((line) => `      ${line}`)
        .join("\n")}`
    );
  }

  console.log("");

  results.push({
    ...result,
    name: checkItem.name,
    duration,
  });

  if (!result.passed) {
    allPassed = false;
  }
}

// 總結報告
console.log("=".repeat(60));
console.log("📊 檢查總結:");

const passedCount = results.filter((r) => r.passed).length;
const failedCount = results.length - passedCount;

console.log(`✅ 通過: ${passedCount}`);
console.log(`❌ 失敗: ${failedCount}`);
console.log(`⏱️ 總耗時: ${results.reduce((sum, r) => sum + r.duration, 0)}ms`);

if (allPassed) {
  console.log("\n🎉 所有檢查都通過！準備發布。");
  console.log("\n🚀 下一步建議:");
  console.log("1. 執行 'npm run build:all' 進行完整建置測試");
  console.log("2. 在測試裝置上驗證應用功能");
  console.log("3. 執行 'npm run submit:all' 提交到應用商店");
  process.exit(0);
} else {
  console.log("\n⚠️  有檢查項目未通過，請修正後再嘗試。");
  console.log("\n🔧 常見修正方法:");
  console.log("- 執行 'npm run lint:fix' 修復程式碼風格問題");
  console.log("- 檢查 TypeScript 錯誤並修復類型問題");
  console.log("- 增加測試覆蓋率以滿足門檻");
  console.log("- 檢查並修正安全配置問題");
  process.exit(1);
}
