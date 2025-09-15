const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// 修復 react-native-maps 在 Web 平台的衝突
config.resolver.platforms = ["ios", "android", "native", "web"];
config.resolver.alias = {
  ...config.resolver.alias,
  // 在 Web 平台上將 react-native-maps 替換為空模組
  ...(process.env.EXPO_PLATFORM === "web" && {
    "react-native-maps": require.resolve(
      "./src/mocks/react-native-maps-web.js"
    ),
  }),
};

module.exports = config;
