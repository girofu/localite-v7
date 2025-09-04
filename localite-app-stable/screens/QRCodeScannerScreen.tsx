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
});
