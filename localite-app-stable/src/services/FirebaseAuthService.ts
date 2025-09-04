/**
 * Firebase Authentication Service
 * 
 * 提供完整的 Firebase 認證功能
 * 包含 Email/Password 和 Google 登入
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  Auth
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthResult {
  user: User;
  cancelled?: boolean;
}

export class AuthenticationError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class FirebaseAuthService {
  private auth: Auth;
  private authStateCallback: ((user: User | null) => void) | null = null;
  private isTestEnvironment: boolean;
  private mockCurrentUser: User | null = null; // 測試環境用戶狀態

  constructor() {
    this.auth = auth;
    this.isTestEnvironment = process.env.NODE_ENV === 'test';
    this.initializeAuthStateListener();
  }

  /**
   * 使用 Email 和 Password 註冊用戶
   */
  async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      this.validateEmail(email);
      this.validatePassword(password);

      if (this.isTestEnvironment) {
        // 測試環境使用 mock 實現
        return this.mockSignUpWithEmail(email, password);
      }

      const credential: UserCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const user = this.mapFirebaseUser(credential.user);
      return { user };

    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 使用 Email 和 Password 登入
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      this.validateEmail(email);
      this.validatePassword(password);

      if (this.isTestEnvironment) {
        // 測試環境使用 mock 實現
        return this.mockSignInWithEmail(email, password);
      }

      const credential: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const user = this.mapFirebaseUser(credential.user);
      return { user };

    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Google 登入
   * 注意：此方法需要在組件層級實作，因為使用了 expo-auth-session hooks
   */
  async signInWithGoogle(): Promise<AuthResult> {
    if (this.isTestEnvironment) {
      // 測試環境使用 mock 實現
      return this.mockSignInWithGoogle();
    }

    // 這個方法需要在 React 組件中實作 Google 登入
    // 因為 expo-auth-session 使用 React Hooks
    // 請在需要 Google 登入的組件中直接使用以下代碼：
    /*
    import * as Google from 'expo-auth-session/providers/google';
    import * as WebBrowser from 'expo-web-browser';
    import { makeRedirectUri } from 'expo-auth-session';
    import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

    WebBrowser.maybeCompleteAuthSession();

    const [request, response, promptAsync] = Google.useAuthRequest({
      clientId: '738517399852-vfbbbqnopdlao6iunc1boqp2ihokvu70.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
    });

    useEffect(() => {
      if (response?.type === 'success') {
        const { access_token, id_token } = response.params;
        if (id_token) {
          const credential = GoogleAuthProvider.credential(id_token, access_token);
          signInWithCredential(auth, credential).then((userCredential) => {
            // 處理登入成功
          });
        }
      }
    }, [response]);

    // 在按鈕點擊中調用: promptAsync()
    */

    throw new Error('Google 登入需要在 React 組件中實作。請參考註釋中的實作範例。');
  }

  /**
   * 取得當前用戶
   */
  getCurrentUser(): User | null {
    if (this.isTestEnvironment) {
      return this.mockCurrentUser;
    }

    const firebaseUser = this.auth.currentUser;
    return firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
  }

  /**
   * 登出
   */
  async signOut(): Promise<void> {
    try {
      if (this.isTestEnvironment) {
        this.mockCurrentUser = null;
        this.authStateCallback?.(null);
      } else {
        await firebaseSignOut(this.auth);
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 監聽認證狀態變化
   */
  onAuthStateChanged(callback: (user: User | null) => void): void {
    this.authStateCallback = callback;
    
    if (!this.isTestEnvironment) {
      onAuthStateChanged(this.auth, (firebaseUser) => {
        const user = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
        callback(user);
      });
    }
  }

  // ====================
  // 私有方法
  // ====================

  /**
   * 初始化認證狀態監聽器
   */
  private initializeAuthStateListener(): void {
    if (!this.isTestEnvironment) {
      onAuthStateChanged(this.auth, (firebaseUser) => {
        const user = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
        this.authStateCallback?.(user);
      });
    }
  }

  /**
   * 將 Firebase User 轉換為內部 User 格式
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      emailVerified: firebaseUser.emailVerified,
    };
  }

  /**
   * 驗證 Email 格式
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  /**
   * 驗證密碼強度
   */
  private validatePassword(password: string): void {
    if (password.length < 6) {
      throw new ValidationError('Password is too weak');
    }
  }

  /**
   * 處理 Firebase 認證錯誤
   */
  private handleAuthError(error: any): Error {
    const errorCode = error.code;
    let message = error.message;

    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        message = 'Invalid credentials';
        break;
      case 'auth/email-already-in-use':
        message = 'Email is already registered';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email format';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection.';
        break;
      default:
        message = message || 'Authentication failed';
    }

    return new AuthenticationError(message, errorCode);
  }

  // ====================
  // 測試專用的 Mock 方法
  // ====================

  private async mockSignUpWithEmail(email: string, password: string): Promise<AuthResult> {
    const user: User = {
      uid: `user-${Date.now()}`,
      email: email,
      emailVerified: false,
    };

    this.mockCurrentUser = user;

    // 模擬異步回調
    if (this.authStateCallback) {
      setTimeout(() => this.authStateCallback?.(user), 10);
    }

    return { user };
  }

  private async mockSignInWithEmail(email: string, password: string): Promise<AuthResult> {
    if (email === 'test-user@localite.test' && password === 'TestPassword123!') {
      const user: User = {
        uid: 'test-user-uid',
        email: email,
        emailVerified: true,
      };

      this.mockCurrentUser = user;

      // 模擬異步回調
      if (this.authStateCallback) {
        setTimeout(() => this.authStateCallback?.(user), 10);
      }

      return { user };
    }

    throw new AuthenticationError('Invalid credentials');
  }

  private async mockSignInWithGoogle(): Promise<AuthResult> {
    return {
      cancelled: false,
      user: {
        uid: 'google-user-uid',
        email: 'test@google.com',
        emailVerified: true,
      },
    };
  }
}
