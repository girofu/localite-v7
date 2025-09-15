/**
 * Firebase Configuration
 * Firebase 專案配置與初始化
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth, 
  Auth,
  getReactNativePersistence
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase 配置 (從環境變數載入)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "localite-demo.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "localite-demo",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "localite-demo.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
};

// 初始化 Firebase
let firebaseApp: FirebaseApp | undefined = undefined;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

try {
  firebaseApp = initializeApp(firebaseConfig);
  
  // 初始化 Auth - 使用 React Native 持久化
  if (process.env.NODE_ENV === 'test') {
    // 測試環境使用基本配置避免AsyncStorage依賴
    auth = getAuth(firebaseApp);
  } else {
    // React Native 環境使用 AsyncStorage 持久化
    auth = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
  
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
} catch (error) {
  console.warn('Firebase 服務初始化失敗，使用基本配置:', error);
  // 不重複初始化 firebaseApp，只重新初始化服務
  try {
    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig);
    }
    // 錯誤處理時也使用正確的 Auth 初始化
    if (process.env.NODE_ENV === 'test') {
      auth = getAuth(firebaseApp);
    } else {
      auth = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
  } catch (fallbackError) {
    console.error('Firebase 基本配置初始化也失敗:', fallbackError);
  }
}

export { firebaseApp, auth, firestore, storage };
export default firebaseConfig;
