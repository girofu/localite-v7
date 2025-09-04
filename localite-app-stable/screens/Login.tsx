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
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LoginScreenProps {
  onLogin?: (email: string) => void;
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  onCreateAccount?: () => void;
  onClose?: () => void;
  onNavigateToSignup?: () => void;
  returnToChat?: boolean;
  showJourneyValidation?: boolean;
}

export default function LoginScreen({ 
  onLogin, 
  onGoogleLogin, 
  onAppleLogin, 
  onCreateAccount,
  onClose,
  onNavigateToSignup,
  returnToChat,
  showJourneyValidation
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
    if (email.trim() && password.trim() && onLogin) {
      onLogin(email.trim());
    }
  };

  return (
    <LinearGradient
      colors={['#1E1E1E', '#434343']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
          {/* Back Button */}
          {(onClose || returnToChat) && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                if (returnToChat && onClose) {
                  // 如果是要返回 ChatScreen，先導航回去，然後恢復 showJourneyValidation 狀態
                  onClose();
                } else if (onClose) {
                  onClose();
                }
              }}
            >
              <Text style={styles.backButtonText}>← 返回</Text>
            </TouchableOpacity>
          )}
          
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo/logo-light.png')} 
              style={styles.logoImage} 
            />
          </View>

          {/* Tagline */}
          <Text style={styles.tagline}>探索在地文化 即時列印美好</Text>

          {/* Welcome Text */}
          <Text style={styles.welcomeText}>歡迎回來!</Text>
          <Text style={styles.subtitleText}>輸入你的資訊登入Localite.ai</Text>

          {/* Email Input */}
          <TextInput
            style={styles.emailInput}
            placeholder="輸入你的EMAIL"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password Input */}
          <TextInput
            style={styles.passwordInput}
            placeholder="輸入你的密碼"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Continue Button */}
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>登入</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={onGoogleLogin}
            activeOpacity={0.8}
          >
            <Image 
              source={require('../assets/icons/icon_google.png')} 
              style={styles.socialIcon} 
            />
            <Text style={styles.socialButtonText}>用 Google 登入</Text>
          </TouchableOpacity>

          {/* Apple Login Button */}
          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={onAppleLogin}
            activeOpacity={0.8}
          >
            <Image 
              source={require('../assets/icons/icon_apple.png')} 
              style={styles.socialIcon} 
            />
            <Text style={styles.socialButtonText}>用 Apple 登入</Text>
          </TouchableOpacity>

          {/* Create Account Link */}
          <TouchableOpacity 
            style={styles.createAccountContainer} 
            onPress={onNavigateToSignup}
          >
            <Text style={styles.createAccountText}>
              還沒有帳號嗎? <Text style={styles.createAccountLink}>建立一個帳號</Text>
            </Text>
          </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 24,
    color: '#1F2937',
  },
  continueButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
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
  createAccountContainer: {
    marginTop: 24,
  },
  createAccountText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  createAccountLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
