/**
 * 混合註冊畫面：結合舊系統美觀UI + 新系統認證功能
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
import EmailVerificationScreen from './EmailVerificationScreen';

interface HybridRegisterScreenProps {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
  onClose?: () => void;
  onGoogleSignup?: () => void;
  onAppleSignup?: () => void;
}

export const HybridRegisterScreen: React.FC<HybridRegisterScreenProps> = ({
  navigation,
  onClose,
  onGoogleSignup,
  onAppleSignup,
}) => {
  // 新系統的狀態和認證邏輯
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // 🟢 Green：Email 驗證狀態
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const { signUp } = useAuth();

  // 新系統的註冊處理邏輯
  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('錯誤', '請填寫所有欄位');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('錯誤', '密碼確認不一致');
      return;
    }

    if (password.length < 6) {
      Alert.alert('錯誤', '密碼長度至少需要 6 個字元');
      return;
    }

    try {
      setLoading(true);
      // 🟢 Green：處理新的 signUp 返回值
      const result = await signUp(email.trim(), password);
      
      if (result.needsEmailVerification) {
        // 需要 email 驗證，顯示驗證畫面
        setRegisteredEmail(result.email);
        setNeedsEmailVerification(true);
        Alert.alert(
          '註冊成功', 
          `驗證信已發送到 ${result.email}，請檢查您的信箱並點擊驗證連結`,
          [{ text: '確定' }]
        );
      } else {
        // Email 已驗證，直接完成註冊（由 AuthContext 自動處理導航）
        Alert.alert('註冊成功', '歡迎加入 Localite！');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('註冊失敗', error.message || '註冊過程中發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (onClose) {
      onClose();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleLoginPress = () => {
    navigation?.navigate('Login');
  };

  // 🟢 Green：Email 驗證完成處理
  const handleVerificationComplete = () => {
    setNeedsEmailVerification(false);
    // 驗證完成後會由 AuthContext.reloadUser 自動設置用戶狀態並導航
  };

  // 🟢 Green：根據驗證狀態決定顯示的畫面
  if (needsEmailVerification) {
    return (
      <EmailVerificationScreen
        email={registeredEmail}
        onClose={handleBackPress}
        onVerificationComplete={handleVerificationComplete}
      />
    );
  }

  return (
    <LinearGradient
      colors={AuthGradientColors}
      style={SharedAuthStyles.container}
    >
      <SafeAreaView style={SharedAuthStyles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={SharedAuthStyles.keyboardView}
        >
          <View style={SharedAuthStyles.content}>
            {/* Back Button - 保留舊系統設計 */}
            {onClose && (
              <TouchableOpacity 
                style={SharedAuthStyles.backButton} 
                onPress={handleBackPress}
              >
                <Text style={SharedAuthStyles.backButtonText}>← 返回</Text>
              </TouchableOpacity>
            )}
            
            {/* Logo Container - 舊系統的漂亮設計 */}
            <View style={SharedAuthStyles.logoContainer}>
              <Image 
                source={require('../../../assets/logo/logo-light.png')} 
                style={SharedAuthStyles.logoImage} 
              />
            </View>

            {/* Tagline - 舊系統設計 */}
            <Text style={SharedAuthStyles.tagline}>探索在地文化 即時列印美好</Text>

            {/* Welcome Text - 舊系統設計 */}
            <Text style={SharedAuthStyles.welcomeText}>歡迎光臨!</Text>
            <Text style={SharedAuthStyles.subtitleText}>輸入你的資訊建立Localite.ai 帳號</Text>

            {/* Email Input - 舊系統UI風格 */}
            <TextInput
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
              style={SharedAuthStyles.passwordInput}
              placeholder="輸入你的密碼"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Confirm Password Input - 新增確認密碼 */}
            <TextInput
              style={SharedAuthStyles.passwordInput}
              placeholder="確認你的密碼"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Register Button - 舊UI + 新系統loading功能 */}
            <TouchableOpacity 
              style={[SharedAuthStyles.primaryButton, loading && SharedAuthStyles.disabledButton]} 
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={SharedAuthStyles.primaryButtonText}>註冊</Text>
              )}
            </TouchableOpacity>

            {/* Divider - 舊系統設計 */}
            <View style={SharedAuthStyles.dividerContainer}>
              <View style={SharedAuthStyles.dividerLine} />
              <Text style={SharedAuthStyles.dividerText}>Or</Text>
              <View style={SharedAuthStyles.dividerLine} />
            </View>

            {/* Google Signup Button - 舊系統設計 */}
            <TouchableOpacity 
              style={SharedAuthStyles.socialButton} 
              onPress={onGoogleSignup}
              activeOpacity={0.8}
            >
              <Image 
                source={require('../../../assets/icons/icon_google.png')} 
                style={SharedAuthStyles.socialIcon} 
              />
              <Text style={SharedAuthStyles.socialButtonText}>用 Google 註冊</Text>
            </TouchableOpacity>

            {/* Apple Signup Button - 舊系統設計 */}
            <TouchableOpacity 
              style={SharedAuthStyles.socialButton} 
              onPress={onAppleSignup}
              activeOpacity={0.8}
            >
              <Image 
                source={require('../../../assets/icons/icon_apple.png')} 
                style={SharedAuthStyles.socialIcon} 
              />
              <Text style={SharedAuthStyles.socialButtonText}>用 Apple 註冊</Text>
            </TouchableOpacity>

            {/* Login Link - 舊系統設計 */}
            <TouchableOpacity 
              style={SharedAuthStyles.footerContainer} 
              onPress={handleLoginPress}
            >
              <Text style={SharedAuthStyles.footerText}>
                已經有帳號了嗎? <Text style={SharedAuthStyles.footerLink}>登入</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// 樣式已重構至共用文件 SharedAuthStyles

export default HybridRegisterScreen;
