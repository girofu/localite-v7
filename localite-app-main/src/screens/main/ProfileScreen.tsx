/**
 * 個人資料畫面
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NavigationProps } from '../../types/navigation.types';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileScreenProps extends NavigationProps {}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      '登出',
      '確定要登出嗎？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('錯誤', '登出失敗，請稍後再試');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container} testID="profile-screen">
      <View style={styles.header}>
        <Text style={styles.title}>個人資料</Text>
      </View>

      <View style={styles.content}>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
            
            <Text style={styles.label}>用戶 ID</Text>
            <Text style={styles.value}>{user.uid}</Text>
            
            <Text style={styles.label}>認證狀態</Text>
            <Text style={styles.value}>
              {user.emailVerified ? '已驗證' : '未驗證'}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleSignOut}
          testID="logout-button"
        >
          <Text style={styles.logoutButtonText}>登出</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#4299E1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userInfo: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 4,
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    color: '#2D3748',
  },
  logoutButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
