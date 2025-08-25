import React from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';

interface HomeScreenProps {
  onStart?: () => void;
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <ImageBackground
      source={require('../assets/backgrounds/bg_home.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image source={require('../assets/logo/logo-light.png')} style={styles.logo} />
        <View style={styles.content}>
          <Text style={styles.title}>探索在地文化{'\n'}即時列印美好</Text>
          <Text style={styles.desc}>全新 AI 導覽體驗，讓「在地人」陪伴你儘情探索旅程</Text>
          <View style={styles.buttonGlowWrapper}>
            <View style={styles.buttonGlow} />
            <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={onStart}>
              <Text style={styles.buttonText}>現在就開始探索</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 0,
    paddingVertical: 14,
    width: '100%',
    zIndex: 1,
  },
  buttonGlow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    elevation: 4,
    height: 54,
    left: 0,
    position: 'absolute',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    top: 8,
    width: '100%',
    zIndex: 0,
  },
  buttonGlowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  content: {
    alignItems: 'flex-start',
    borderRadius: 24,
    left: 50,
    marginBottom: 0,
    padding: 28,
    position: 'absolute',
    top: 488,
    width: 334,
  },
  desc: {
    alignSelf: 'flex-start',
    color: '#fff',
    fontSize: 20,
    lineHeight: 22,
    marginBottom: 28,
    textAlign: 'left',
  },
  logo: {
    height: 58,
    left: 0,
    position: 'absolute',
    resizeMode: 'contain',
    top: 420,
    width: 334,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  title: {
    alignSelf: 'flex-start',
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
    lineHeight: 36,
    marginBottom: 16,
    textAlign: 'left',
  },
});
