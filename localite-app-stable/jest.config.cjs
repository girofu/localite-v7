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
    "node_modules/(?!(firebase|@firebase|react-native|@react-native|expo|@expo|@google|@react-navigation|expo-speech|expo-image-picker)/)",
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
    // 處理圖片資源
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "identity-obj-proxy",
    // React Native 模組映射
    "^react-native/Libraries/Utilities/Platform$":
      "<rootDir>/__tests__/mocks/Platform.ts",
    "^expo-speech$": "<rootDir>/__tests__/mocks/expo-speech.ts",
    "^expo-image-picker$": "<rootDir>/__tests__/mocks/expo-image-picker.ts",
    // React Navigation 模組映射
    "^@react-navigation/native$":
      "<rootDir>/__tests__/mocks/react-navigation/native.ts",
    "^@react-navigation/stack$":
      "<rootDir>/__tests__/mocks/react-navigation/stack.ts",
    "^@react-navigation/bottom-tabs$":
      "<rootDir>/__tests__/mocks/react-navigation/bottom-tabs.ts",
    // 模塊路徑映射 - 使用相對路徑
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@screens/(.*)$": "<rootDir>/screens/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
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
