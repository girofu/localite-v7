import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import { useVenueEntryContext } from '../src/contexts/VenueEntryContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const frameSize = 220;
const cornerLen = 32;
const cornerWidth = 6;

export default function QRCodeScannerScreen({ onClose, onVenueEntered }: { onClose: () => void; onVenueEntered?: (venueId: string) => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const { enterVenueByQR, isLoading } = useVenueEntryContext();

  const handleMockScan = async () => {
    setIsScanning(true);

    // 模擬掃描延遲
    setTimeout(async () => {
      try {
        // 模擬掃描到的 QR 碼數據
        const mockQRData = 'localite://venue/shinfang';

        const venueData = await enterVenueByQR(mockQRData);

        Alert.alert(
          '掃描成功',
          `已進入場域：${venueData.name}`,
          [
            {
              text: '確定',
              onPress: () => {
                onVenueEntered?.(venueData.id);
                onClose();
              },
            },
          ]
        );
      } catch (error) {
        Alert.alert('掃描失敗', '請確認 QR 碼正確性');
      } finally {
        setIsScanning(false);
      }
    }, 2000);
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
      {/* 底部說明和按鈕 */}
      <View style={styles.bottomBar}>
        <Text style={styles.desc}>掃瞄場域條碼， 輕鬆開啟導覽功能</Text>
        <TouchableOpacity
          style={[styles.scanButton, (isScanning || isLoading) && styles.scanButtonDisabled]}
          onPress={handleMockScan}
          disabled={isScanning || isLoading}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? '掃描中...' : isLoading ? '處理中...' : '模擬掃描'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.note}>
          * 這是一個模擬掃描功能，用於展示統一進入體驗
        </Text>
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
  scanButton: {
    backgroundColor: '#4299E1',
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  scanButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  note: {
    color: '#718096',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
