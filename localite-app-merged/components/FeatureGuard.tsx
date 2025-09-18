/**
 * 🟢 Green Phase: FeatureGuard
 * 
 * 功能權限守衛組件
 * 根據用戶驗證狀態控制功能存取權限
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export default function FeatureGuard({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true 
}: FeatureGuardProps) {
  const { canAccessFeature, verificationState, sendEmailVerification } = useAuth();

  const handleUpgradePrompt = () => {
    if (verificationState === 'pending_verification') {
      Alert.alert(
        '需要驗證信箱',
        '此功能需要完成信箱驗證才能使用',
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '重新發送驗證信', 
            onPress: async () => {
              try {
                const result = await sendEmailVerification();
                if (result.success) {
                  Alert.alert('發送成功', '驗證信已重新發送，請檢查您的信箱');
                } else {
                  Alert.alert('發送失敗', result.error?.message || '發送失敗');
                }
              } catch (error: any) {
                Alert.alert('發送失敗', '網路錯誤，請稍後再試');
              }
            }
          }
        ]
      );
    } else if (verificationState === 'none' || verificationState === 'guest') {
      Alert.alert(
        '需要登入',
        '此功能需要登入帳號才能使用',
        [
          { text: '取消', style: 'cancel' },
          { text: '前往登入', onPress: () => {
            // TODO: 導航到登入頁面
          }}
        ]
      );
    }
  };

  // 如果有權限，直接顯示內容
  if (canAccessFeature(feature)) {
    return <>{children}</>;
  }

  // 沒有權限時的處理
  if (fallback) {
    return <>{fallback}</>;
  }

  // 顯示升級提示
  if (showUpgradePrompt) {
    return (
      <TouchableOpacity 
        style={styles.upgradePrompt}
        onPress={handleUpgradePrompt}
      >
        <Text style={styles.upgradeIcon}>🔒</Text>
        <View style={styles.upgradeContent}>
          <Text style={styles.upgradeTitle}>功能已鎖定</Text>
          <Text style={styles.upgradeMessage}>
            {verificationState === 'pending_verification' 
              ? '完成信箱驗證後可使用' 
              : '登入帳號後可使用'}
          </Text>
        </View>
        <Text style={styles.upgradeArrow}>→</Text>
      </TouchableOpacity>
    );
  }

  // 預設隱藏內容
  return null;
}

const styles = StyleSheet.create({
  upgradePrompt: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  upgradeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  upgradeMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  upgradeArrow: {
    fontSize: 18,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});
