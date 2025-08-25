/**
 * Jest Test Setup Configuration
 * 設置測試環境和 Mock
 */

// Mock Firebase App 初始化
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({
    name: 'test-app',
    options: {}
  }))
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null
  })),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn()
}));

// Mock Expo Google Sign In
jest.mock('expo-google-app-auth', () => ({
  logInAsync: jest.fn(() => 
    Promise.resolve({
      type: 'success',
      user: {
        email: 'test@google.com',
        name: 'Test User'
      }
    })
  )
}));

// Suppress console warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Firebase')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
