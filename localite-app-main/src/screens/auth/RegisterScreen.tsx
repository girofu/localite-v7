/**
 * 註冊畫面
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { NavigationProps } from '../../types/navigation.types';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterScreenProps extends NavigationProps {}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
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
      await signUp(email, password);
      // 註冊成功後會自動導航到主畫面（由 AuthContext 處理）
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('註冊失敗', error.message || '註冊過程中發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={styles.backButton}>← 返回</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>建立新帳號</Text>
        <Text style={styles.subtitle}>歡迎加入在地人 AI 導覽</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="請輸入您的 Email"
              placeholderTextColor="#718096"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>密碼</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="請輸入密碼（至少 6 個字元）"
              placeholderTextColor="#718096"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>確認密碼</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="請再次輸入密碼"
              placeholderTextColor="#718096"
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.disabledButton]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>註冊</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>已經有帳號了？</Text>
          <TouchableOpacity onPress={handleLoginPress}>
            <Text style={styles.linkText}>立即登入</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D3748',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    color: '#4299E1',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0AEC0',
    marginBottom: 40,
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#4A5568',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#4299E1',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  linkText: {
    color: '#4299E1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default RegisterScreen;
