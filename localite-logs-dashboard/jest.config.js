/**
 * Jest 配置
 */

module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: [
    "server/services/**/*.js",
    "!**/__tests__/**",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFiles: ["<rootDir>/jest.setup.js"],
};
