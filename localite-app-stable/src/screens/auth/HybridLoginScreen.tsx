/**
 * 混合登入畫面：結合舊系統美觀UI + 新系統認證功能
 * TDD Green Phase: 實作讓測試通過的最少程式碼
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { SharedAuthStyles, AuthGradientColors } from './shared/AuthStyles';

interface HybridLoginScreenProps {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
  onClose?: () => void;
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  returnToChat?: boolean;
}

export const HybridLoginScreen: React.FC<HybridLoginScreenProps> = ({
  navigation,
  onClose,
  onGoogleLogin,
  onAppleLogin,
  returnToChat,
}) => {
  // 新系統的狀態和認證邏輯
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  // 新系統的認證處理邏輯
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('錯誤', '請輸入 Email 和密碼');
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password.trim());
      // 認證成功後會由 AuthContext 自動處理導航
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('登入失敗', error.message || '請檢查您的 Email 和密碼');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (returnToChat && onClose) {
      onClose();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleRegisterPress = () => {
    navigation?.navigate('Register');
  };

  return (
    <LinearGradient
      testID="linear-gradient-container"
      colors={AuthGradientColors}
      style={SharedAuthStyles.container}
    >
      <SafeAreaView testID="safe-area-view" style={SharedAuthStyles.safeArea}>
        <KeyboardAvoidingView 
          testID="keyboard-avoiding-view"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={SharedAuthStyles.keyboardView}
        >
          <View style={SharedAuthStyles.content}>
            {/* Back Button - 保留舊系統設計 */}
            {(onClose || returnToChat) && (
              <TouchableOpacity 
                testID="back-button"
                style={SharedAuthStyles.backButton} 
                onPress={handleBackPress}
              >
                <Text style={SharedAuthStyles.backButtonText}>← 返回</Text>
              </TouchableOpacity>
            )}
            
            {/* Logo Container - 舊系統的漂亮設計 */}
            <View testID="logo-container" style={SharedAuthStyles.logoContainer}>
              <Image 
                source={require('../../../assets/logo/logo-light.png')} 
                style={SharedAuthStyles.logoImage} 
              />
            </View>

            {/* Tagline - 舊系統設計 */}
            <Text style={SharedAuthStyles.tagline}>探索在地文化 即時列印美好</Text>

            {/* Welcome Text - 舊系統設計 */}
            <Text style={SharedAuthStyles.welcomeText}>歡迎回來!</Text>
            <Text style={SharedAuthStyles.subtitleText}>輸入你的資訊登入Localite.ai</Text>

            {/* Email Input - 舊系統UI風格 */}
            <TextInput
              testID="email-input"
              style={SharedAuthStyles.emailInput}
              placeholder="輸入你的EMAIL"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password Input - 舊系統UI風格 */}
            <TextInput
              testID="password-input"
              style={SharedAuthStyles.passwordInput}
              placeholder="輸入你的密碼"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Login Button - 舊UI + 新系統loading功能 */}
            <TouchableOpacity 
              testID="login-button"
              style={[SharedAuthStyles.primaryButton, loading && SharedAuthStyles.disabledButton]} 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator testID="login-loading-indicator" color="#FFFFFF" />
              ) : (
                <Text style={SharedAuthStyles.primaryButtonText}>登入</Text>
              )}
            </TouchableOpacity>

            {/* Divider - 舊系統設計 */}
            <View style={SharedAuthStyles.dividerContainer}>
              <View style={SharedAuthStyles.dividerLine} />
              <Text style={SharedAuthStyles.dividerText}>Or</Text>
              <View style={SharedAuthStyles.dividerLine} />
            </View>

            {/* Google Login Button - 舊系統設計 */}
            <TouchableOpacity 
              testID="google-login-button"
              style={SharedAuthStyles.socialButton} 
              onPress={onGoogleLogin}
              activeOpacity={0.8}
            >
              <Image 
                source={require('../../../assets/icons/icon_google.png')} 
                style={SharedAuthStyles.socialIcon} 
              />
              <Text style={SharedAuthStyles.socialButtonText}>用 Google 登入</Text>
            </TouchableOpacity>

            {/* Apple Login Button - 舊系統設計 */}
            <TouchableOpacity 
              testID="apple-login-button"
              style={SharedAuthStyles.socialButton} 
              onPress={onAppleLogin}
              activeOpacity={0.8}
            >
              <Image 
                source={require('../../../assets/icons/icon_apple.png')} 
                style={SharedAuthStyles.socialIcon} 
              />
              <Text style={SharedAuthStyles.socialButtonText}>用 Apple 登入</Text>
            </TouchableOpacity>

            {/* Register Link - 舊系統設計 */}
            <TouchableOpacity 
              testID="register-link"
              style={SharedAuthStyles.footerContainer} 
              onPress={handleRegisterPress}
            >
              <Text style={SharedAuthStyles.footerText}>
                還沒有帳號嗎? <Text style={SharedAuthStyles.footerLink}>建立一個帳號</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// 樣式已重構至共用文件 SharedAuthStyles

export default HybridLoginScreen;
