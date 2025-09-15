import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import Constants from 'expo-constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const frameSize = 220;
const cornerLen = 32;
const cornerWidth = 6;

type ScreenType = 'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'learningSheetsList' | 'badge' | 'aboutLocalite' | 'news' | 'privacy' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation' | 'profile';

type QRCodeScannerScreenProps = {
  onClose: () => void;
  setSelectedPlaceId?: (placeId: string) => void;
  navigateToScreen?: (screen: ScreenType) => void;
};

export default function QRCodeScannerScreen({ onClose, setSelectedPlaceId, navigateToScreen }: QRCodeScannerScreenProps) {
  const handleDemoClick = () => {
    if (setSelectedPlaceId && navigateToScreen) {
      // 設定忠寮李舉人宅為示例地點
      setSelectedPlaceId('jhongliao_lee_8');
      // 跳轉到地點介紹頁面
      navigateToScreen('placeIntro');
    }
  };

  return (
    <View style={styles.container}>
      {/* 右上關閉按鈕 */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Image source={require('../assets/icons/icon_close.png')} style={styles.closeIcon} />
      </TouchableOpacity>
      {/* 掃描框區域 */}
      <View style={styles.scannerArea}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />
      </View>
      {/* Demo 按鈕 */}
      {setSelectedPlaceId && navigateToScreen && (
        <TouchableOpacity style={styles.demoButton} onPress={handleDemoClick}>
          <Text style={styles.demoButtonText}>Demo: 忠寮社區</Text>
        </TouchableOpacity>
      )}
      {/* 底部說明 */}
      <View style={styles.bottomBar}>
        <Text style={styles.desc}>掃瞄場域條碼， 輕鬆開啟導覽功能</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#757575',
  },
  closeBtn: {
    position: 'absolute',
    top: 32,
    right: 20,
    zIndex: 10,
  },
  closeIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  scannerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: '35%',
    left: '18%',
    width: 32,
    height: 32,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderColor: '#fff',
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: 'absolute',
    top: '35%',
    right: '18%',
    width: 32,
    height: 32,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderColor: '#fff',
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: 'absolute',
    bottom: '23%',
    left: '18%',
    width: 32,
    height: 32,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderColor: '#fff',
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: 'absolute',
    bottom: '23%',
    right: '18%',
    width: 32,
    height: 32,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderColor: '#fff',
    borderBottomRightRadius: 8,
  },
  bottomBar: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 24,
    alignItems: 'center',
  },
  desc: {
    color: '#232323',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 1,
  },
  demoButton: {
    position: 'absolute',
    bottom: 120,
    left: '50%',
    transform: [{ translateX: -80 }],
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
