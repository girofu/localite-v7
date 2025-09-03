module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  testMatch: [
    "**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)",
    "!**/__tests__/setup.ts",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        isolatedModules: true,
        tsconfig: {
          jsx: "react-jsx",
        },
      },
    ],
    "^.+\\.(js|jsx|mjs)$": [
      "babel-jest",
      {
        presets: ["babel-preset-expo"],
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(firebase|@firebase|react-native|@react-native|expo|@expo|@google|@react-navigation)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "mjs"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
  moduleNameMapper: {
    // 處理 assets 路徑映射 (優先級最高)
    "^../assets/(.*)$": "<rootDir>/assets/$1",
    "^../../assets/(.*)$": "<rootDir>/assets/$1",
    // 處理圖片資源
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "identity-obj-proxy",
    // 模塊路徑映射
    "^@/(.*)$": "<rootDir>/src/$1",
    "^react-native$": "<rootDir>/node_modules/react-native",
    "^@react-native/(.*)$": "<rootDir>/node_modules/@react-native/$1",
    "^@react-navigation/(.*)$": "<rootDir>/node_modules/@react-navigation/$1",
    // 解決 React Native 內部模組解析問題
    "^react-native/Libraries/Utilities/Platform$":
      "<rootDir>/node_modules/react-native/Libraries/Utilities/Platform.ios.js",
    "^react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo$":
      "<rootDir>/node_modules/react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo",
    "^../../Utilities/Platform$":
      "<rootDir>/node_modules/react-native/Libraries/Utilities/Platform.ios.js",
    "^../Utilities/Platform$":
      "<rootDir>/node_modules/react-native/Libraries/Utilities/Platform.ios.js",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/ios/",
    "<rootDir>/android/",
  ],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  globals: {
    __DEV__: true,
    __REACT_DEVTOOLS_GLOBAL_HOOK__: {},
  },
};
