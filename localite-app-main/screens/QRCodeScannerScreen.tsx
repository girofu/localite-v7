import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import Constants from 'expo-constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const frameSize = 220;
const cornerLen = 32;
const cornerWidth = 6;

export default function QRCodeScannerScreen({ onClose }: { onClose: () => void }) {
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
      {/* 底部說明 */}
      <View style={styles.bottomBar}>
        <Text style={styles.desc}>掃瞄場域條碼， 輕鬆開啟導覽功能</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 24,
    width: '100%',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    top: 32,
    zIndex: 10,
  },
  closeIcon: {
    height: 36,
    resizeMode: 'contain',
    width: 36,
  },
  container: {
    backgroundColor: '#757575',
    flex: 1,
  },
  cornerBL: {
    borderBottomLeftRadius: 8,
    borderBottomWidth: 6,
    borderColor: '#fff',
    borderLeftWidth: 6,
    bottom: '23%',
    height: 32,
    left: '18%',
    position: 'absolute',
    width: 32,
  },
  cornerBR: {
    borderBottomRightRadius: 8,
    borderBottomWidth: 6,
    borderColor: '#fff',
    borderRightWidth: 6,
    bottom: '23%',
    height: 32,
    position: 'absolute',
    right: '18%',
    width: 32,
  },
  cornerTL: {
    borderColor: '#fff',
    borderLeftWidth: 6,
    borderTopLeftRadius: 8,
    borderTopWidth: 6,
    height: 32,
    left: '18%',
    position: 'absolute',
    top: '35%',
    width: 32,
  },
  cornerTR: {
    borderColor: '#fff',
    borderRightWidth: 6,
    borderTopRightRadius: 8,
    borderTopWidth: 6,
    height: 32,
    position: 'absolute',
    right: '18%',
    top: '35%',
    width: 32,
  },
  desc: {
    color: '#232323',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
  },
  scannerArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
