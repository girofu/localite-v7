/**
 * Jest 測試環境設置
 */

// 設置測試環境變數
process.env.NODE_ENV = "test";

// 抑制不必要的 console.log (除了錯誤)
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  error: originalConsole.error,
};
