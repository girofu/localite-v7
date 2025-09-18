/**
 * 🟢 Green Phase: UserVerificationBanner
 * 
 * 顯示用戶email驗證狀態的橫幅組件
 * 為待認證用戶提供驗證提醒和快速操作
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

interface UserVerificationBannerProps {
  onNavigateToVerification?: () => void;
}

export default function UserVerificationBanner({ 
  onNavigateToVerification 
}: UserVerificationBannerProps) {
  const [loading, setLoading] = useState(false);
  
  const { 
    user, 
    verificationState,
    sendEmailVerification,
    canAccessFeature 
  } = useAuth();

  // 只對待認證用戶顯示橫幅
  if (verificationState !== 'pending_verification' || !user) {
    return null;
  }

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      const result = await sendEmailVerification({
        languageCode: 'zh-TW'
      });
      
      if (result.success) {
        Alert.alert('發送成功', '驗證信已重新發送，請檢查您的信箱');
      } else {
        Alert.alert('發送失敗', result.error?.message || '發送失敗');
      }
    } catch (error: any) {
      Alert.alert('發送失敗', error.message || '網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.banner}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>帳號待認證</Text>
        <Text style={styles.message}>
          請到 {user.email} 確認驗證信，完成帳號認證後才能使用完整功能
        </Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, loading && styles.disabledButton]}
          onPress={handleResendEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#4299E1" size="small" />
          ) : (
            <Text style={styles.actionButtonText}>重發</Text>
          )}
        </TouchableOpacity>
        
        {onNavigateToVerification && (
          <TouchableOpacity 
            style={styles.primaryActionButton}
            onPress={onNavigateToVerification}
          >
            <Text style={styles.primaryActionButtonText}>確認</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEF3CD', // 淺黃色背景
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B', // 橙色邊框
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4299E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#4299E1',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryActionButton: {
    backgroundColor: '#4299E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
