import { getDefaultConfig } from "@expo/metro-config";

const config = getDefaultConfig(import.meta.dirname || __dirname);

// 自定義配置 - 增強資源處理
config.resolver = {
  ...config.resolver,
  alias: {
    "@": "./src",
    "@components": "./components",
    "@screens": "./screens",
    "@services": "./src/services",
    "@types": "./src/types",
    "@config": "./src/config",
  },
  // 確保正確處理圖片資源
  assetExts: [
    ...config.resolver.assetExts,
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
  ],
  // 排除不需要打包的檔案
  blockList: [/node_modules\/.*\/node_modules/],
};

export default config;
