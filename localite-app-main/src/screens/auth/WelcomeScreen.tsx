/**
 * 歡迎畫面 - 未認證用戶的第一個畫面
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { NavigationProps } from '../../types/navigation.types';

interface WelcomeScreenProps extends NavigationProps {}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container} testID="welcome-screen">
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../../assets/logo/logo-light.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>在地人 AI 導覽</Text>
        <Text style={styles.subtitle}>讓在地人 AI 帶你探索城市的每個角落</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={handleLoginPress}
          testID="login-button"
        >
          <Text style={styles.primaryButtonText}>登入</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={handleRegisterPress}
          testID="register-button"
        >
          <Text style={styles.secondaryButtonText}>註冊新帳號</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D3748',
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 50,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4299E1',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4299E1',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#4299E1',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
