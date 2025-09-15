/**
 * 共用認證畫面樣式
 * TDD Refactor Phase: 消除重複的樣式程式碼
 */

import { StyleSheet } from 'react-native';

export const SharedAuthStyles = StyleSheet.create({
  // 容器樣式
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },

  // 導航元素
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Logo 和品牌元素
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 334,
    height: 58,
    resizeMode: 'contain',
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },

  // 文字元素
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.9,
  },

  // 輸入欄位
  textInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1F2937',
  },
  emailInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1F2937',
  },
  passwordInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1F2937',
  },

  // 按鈕樣式
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // 分隔線
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  dividerText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginHorizontal: 16,
    opacity: 0.9,
  },

  // 社交登入按鈕
  socialButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  socialButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },

  // 頁腳連結
  footerContainer: {
    marginTop: 24,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  footerLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

// 漸層色彩常數
export const AuthGradientColors = ['#1E1E1E', '#434343'] as const;

// 共用的色彩主題
export const AuthColors = {
  primary: '#000000',
  secondary: '#FFFFFF', 
  text: '#1F2937',
  placeholder: '#9CA3AF',
  background: '#FFFFFF',
  gradientStart: '#1E1E1E',
  gradientEnd: '#434343',
} as const;
