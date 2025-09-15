import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function QRCodeScannerScreen({ onClose }: { onClose: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* 頂部標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Image source={require('../assets/icons/icon_left.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>掃瞄啟動條碼</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* 分隔線 */}
      <View style={styles.separator} />
      
      {/* 掃描框區域 */}
      <View style={styles.scannerArea}>
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        
        {/* 說明文字 - 位於掃描框下方 */}
        <View style={styles.instructionContainer}>
          <Image source={require('../assets/icons/icon_scan.png')} style={styles.iconImage} />
          <Text style={styles.instructionText}>掃瞄場域條碼,輕鬆開啟導覽功能</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#ffffff',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // 平衡左側按鈕的寬度
  },
  separator: {
    height: 1,
    backgroundColor: '#333333',
    marginHorizontal: 20,
  },
  scannerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#ffffff',
    borderWidth: 4,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  iconImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#ffffff',
    marginRight: 12,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
