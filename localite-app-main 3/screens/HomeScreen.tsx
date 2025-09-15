import React, { useState } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import LoginValidationModal from '../components/LoginValidationModal';

interface HomeScreenProps {
  onStart?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToGuideActivation?: () => void;
  isLoggedIn?: boolean;
}

export default function HomeScreen({ onStart, onNavigateToLogin, onNavigateToGuideActivation, isLoggedIn = false }: HomeScreenProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleStartButton = () => {
    if (isLoggedIn) {
      // 如果用戶已登入，直接進入導覽
      if (onNavigateToGuideActivation) {
        onNavigateToGuideActivation();
      }
    } else {
      // 如果用戶未登入，顯示登入驗證 modal
      setShowLoginModal(true);
    }
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    if (onNavigateToLogin) {
      onNavigateToLogin();
    }
  };

  const handleGuestMode = () => {
    setShowLoginModal(false);
    if (onNavigateToGuideActivation) {
      onNavigateToGuideActivation();
    }
  };

  return (
    <ImageBackground
      source={require('../assets/backgrounds/bg_home.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image source={require('../assets/logo/logo-light.png')} style={styles.logo} />
        <View style={styles.content}>
          <Text style={styles.title}>探索在地文化{"\n"}即時列印美好</Text>
          <Text style={styles.desc}>全新 AI 導覽體驗，讓「在地人」陪伴你儘情探索旅程</Text>
          <View style={styles.buttonGlowWrapper}>
            <View style={styles.buttonGlow} />
            <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleStartButton}>
              <Text style={styles.buttonText}>
                {isLoggedIn ? '開始探索' : '現在就開始探索'}
              </Text>
            </TouchableOpacity>
          </View>
          

          

        </View>
      </View>

      {/* Login Validation Modal */}
      <LoginValidationModal
        visible={showLoginModal}
        onLogin={handleLogin}
        onGuestMode={handleGuestMode}
        onClose={() => setShowLoginModal(false)}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  logo: {
    width: 334,
    height: 58,
    resizeMode: 'contain',
    position: 'absolute',
    top: 420,
    left: '50%',
    transform: [{ translateX: -235 }], // 167 + 28 + 40 = 235，向左偏移實現與標題左邊緣對齊並額外左移40px
  },
  content: {
    position: 'absolute',
    top: 488,
    left: '50%',
    width: 334,
    borderRadius: 24,
    padding: 28,
    alignItems: 'flex-start',
    marginBottom: 0,
    transform: [{ translateX: -167 }], // 334/2 = 167，向左偏移一半寬度實現置中
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 16,
    letterSpacing: 1,
    lineHeight: 36,
    alignSelf: 'flex-start',
  },
  desc: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'left',
    marginBottom: 28,
    lineHeight: 22,
    alignSelf: 'flex-start',
  },
  buttonGlowWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonGlow: {
    position: 'absolute',
    width: '100%',
    height: 54,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    top: 8,
    left: 0,
    zIndex: 0,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 4,
  },
  button: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 0,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    zIndex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

});
