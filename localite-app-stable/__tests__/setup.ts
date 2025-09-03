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

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: 13,
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((styles) => styles),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
  AsyncStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },
  Clipboard: {
    setString: jest.fn(),
    getString: jest.fn(),
  },
  Vibration: {
    vibrate: jest.fn(),
  },
  BackHandler: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    exitApp: jest.fn(),
  },
  Keyboard: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dismiss: jest.fn(),
  },
  TouchableOpacity: 'TouchableOpacity',
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  ScrollView: 'ScrollView',
  TextInput: 'TextInput',
  SafeAreaView: 'SafeAreaView',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Modal: 'Modal',
  ActivityIndicator: 'ActivityIndicator',
}));

// Mock Expo modules
jest.mock('expo-constants', () => ({
  Constants: {
    expoVersion: '49.0.0',
    deviceName: 'Test Device',
    platform: {
      ios: { buildNumber: '1.0.0', model: 'iPhone' },
    },
  },
}));

jest.mock('expo-camera', () => ({
  Camera: 'Camera',
  CameraView: 'CameraView',
  useCameraPermissions: jest.fn(() => [false, jest.fn()]),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 25.0330,
      longitude: 121.5654,
      altitude: 0,
      accuracy: 5,
      altitudeAccuracy: 0,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  })),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock Expo Image Picker
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: false })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: false })),
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

// Mock data files to avoid asset path issues
jest.mock('../data/guide', () => ({
  GUIDES: [
    {
      id: 'kuron',
      name: 'KURON',
      image: 'mock-kuron-image',
      description: '急驚風，超想幫忙，方向感超強的小夥伴。有全方位的知識，擅長「指引」。',
    },
    {
      id: 'pururu', 
      name: 'PURURU',
      image: 'mock-pururu-image',
      description: '慢悠悠，厭世但溫和的暖男小夥伴。最了解景點周邊的美食、飲品、和休息的地方。擅長「陪伴」。',
    },
    {
      id: 'popo',
      name: 'POPO', 
      image: 'mock-popo-image',
      description: '活潑可愛，喜歡嚐鮮的小夥伴。對於新奇有趣的事物非常敏感，擅長「發現」。',
    },
  ],
}));

jest.mock('../data/places', () => ({
  PLACES: [
    {
      id: 'shinfang',
      name: '新芳春茶行',
      lat: 25.056789,
      lng: 121.516789,
      description: '新芳春茶行測試描述',
      image: 'mock-shinfang-image',
    },
    {
      id: 'xiahai-temple',
      name: '霞海城隍廟',
      lat: 25.055698,
      lng: 121.510374,
      description: '霞海城隍廟測試描述',
      image: 'mock-xiahai-image',
    },
  ],
}));

// Mock assets directory to avoid require path issues
jest.mock('../assets/places/shinfang.png', () => 'mock-shinfang-image');
jest.mock('../assets/places/shinfang.jpg', () => 'mock-shinfang-image');
jest.mock('../assets/places/xiahai.png', () => 'mock-xiahai-image');
jest.mock('../assets/backgrounds/bg_home.png', () => 'mock-bg-home-image');
jest.mock('../assets/logo/logo-light.png', () => 'mock-logo-image');

// Mock icon assets
jest.mock('../assets/icons/icon_mini_set.png', () => 'mock-mini-set-icon');
jest.mock('../assets/icons/icon_mini_free.png', () => 'mock-mini-free-icon');
jest.mock('../assets/icons/icon_menu.png', () => 'mock-menu-icon');
jest.mock('../assets/icons/icon_close.png', () => 'mock-close-icon');
jest.mock('../assets/icons/icon_arrow-down.png', () => 'mock-arrow-down-icon');
jest.mock('../assets/icons/icon_add_btn.png', () => 'mock-add-btn-icon');
jest.mock('../assets/icons/icon_sendmessage_btn.png', () => 'mock-send-btn-icon');
jest.mock('../assets/icons/icon_OCR.png', () => 'mock-ocr-icon');
jest.mock('../assets/icons/icon_photo.png', () => 'mock-photo-icon');
jest.mock('../assets/icons/icon_camera.png', () => 'mock-camera-icon');
