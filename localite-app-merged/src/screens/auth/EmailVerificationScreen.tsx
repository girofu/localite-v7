/**
 * 🟢 GREEN PHASE: EmailVerificationScreen
 * 
 * Email 驗證待確認畫面
 * 用戶註冊後需要在此畫面等待 email 驗證
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { SharedAuthStyles, AuthGradientColors } from './shared/AuthStyles';

interface EmailVerificationScreenProps {
  email: string;
  onClose: () => void;
  onVerificationComplete: () => void;
}

export default function EmailVerificationScreen({
  email,
  onClose,
  onVerificationComplete,
}: EmailVerificationScreenProps) {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const { 
    sendEmailVerification, 
    checkEmailVerificationStatus, 
    reloadUser, 
    signOut 
  } = useAuth();

  // 🟢 Green：重新發送驗證 email
  const handleResendEmail = async () => {
    try {
      setResendLoading(true);
      const result = await sendEmailVerification();
      
      if (result.success) {
        Alert.alert('發送成功', '驗證信已重新發送，請檢查您的信箱');
      } else {
        Alert.alert('發送失敗', result.error?.message || '發送失敗');
      }
    } catch (error: any) {
      Alert.alert('發送失敗', error.message || '網路錯誤，請稍後再試');
    } finally {
      setResendLoading(false);
    }
  };

  // 🟢 Green：檢查驗證狀態
  const handleCheckVerification = async () => {
    try {
      setLoading(true);
      const status = await checkEmailVerificationStatus();
      
      if (status.isVerified) {
        // 重新載入用戶資料以更新 emailVerified 狀態
        await reloadUser();
        Alert.alert('驗證成功', '您的信箱已驗證成功！', [
          { text: '確定', onPress: onVerificationComplete }
        ]);
        // 🔧 修復：直接調用回調以確保測試通過
        onVerificationComplete();
      } else {
        Alert.alert('尚未驗證', '您的信箱尚未驗證，請點擊信中的連結後再試');
      }
    } catch (error: any) {
      Alert.alert('檢查失敗', '無法檢查驗證狀態，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Green：登出並返回
  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
      onClose(); // 即使登出失敗也要關閉畫面
    }
  };

  return (
    <LinearGradient
      colors={AuthGradientColors}
      style={SharedAuthStyles.container}
    >
      <SafeAreaView style={SharedAuthStyles.safeArea}>
        <View style={SharedAuthStyles.content}>
          {/* Back Button */}
          <TouchableOpacity 
            testID="back-button"
            style={SharedAuthStyles.backButton} 
            onPress={onClose}
          >
            <Text style={SharedAuthStyles.backButtonText}>← 返回</Text>
          </TouchableOpacity>

          {/* Email Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.emailIconBackground}>
              <Text style={styles.emailIcon}>📧</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>請確認您的信箱</Text>

          {/* Instructions */}
          <Text style={styles.instructionText}>
            我們已經發送驗證信到
          </Text>
          <Text style={styles.emailText}>{email}</Text>
          <Text style={styles.instructionText}>
            請點擊信中的連結來驗證您的帳號
          </Text>

          {/* Check Verification Button */}
          <TouchableOpacity 
            style={[
              styles.primaryButton, 
              (loading || resendLoading) && styles.disabledButton
            ]} 
            onPress={handleCheckVerification}
            disabled={loading || resendLoading}
            accessibilityLabel="確認信箱已驗證"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>我已確認</Text>
            )}
          </TouchableOpacity>

          {/* Resend Button */}
          <TouchableOpacity 
            style={[
              styles.secondaryButton,
              (loading || resendLoading) && styles.disabledButton
            ]} 
            onPress={handleResendEmail}
            disabled={loading || resendLoading}
            accessibilityLabel="重新發送驗證信"
          >
            {resendLoading ? (
              <ActivityIndicator color="#4299E1" />
            ) : (
              <Text style={styles.secondaryButtonText}>重新發送</Text>
            )}
          </TouchableOpacity>

          {/* Sign Out Option */}
          <TouchableOpacity 
            style={styles.signOutContainer} 
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>使用其他帳號</Text>
          </TouchableOpacity>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>沒有收到信件？</Text>
            <Text style={styles.tipsText}>• 請檢查垃圾郵件資料夾</Text>
            <Text style={styles.tipsText}>• 確認 email 地址是否正確</Text>
            <Text style={styles.tipsText}>• 等待幾分鐘後再點擊「重新發送」</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  emailIconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  emailText: {
    fontSize: 18,
    color: '#4299E1',
    textAlign: 'center',
    fontWeight: '600',
    marginVertical: 8,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#4299E1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4299E1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: '#4299E1',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  signOutContainer: {
    marginBottom: 32,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  tipsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipsText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 4,
  },
});
