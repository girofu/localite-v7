import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface GuideActivationScreenProps {
  onReturn?: () => void;
  onMenu?: () => void;
  onQRCode?: () => void;
  onMap?: () => void;
}

export default function GuideActivationScreen({ onReturn, onMenu, onQRCode, onMap }: GuideActivationScreenProps) {
  return (
    <View style={styles.container}>
      {/* 左上 menu */}
      <TouchableOpacity style={styles.menuIcon} onPress={onMenu}>
        <Image source={require('../assets/icons/icon_menu.png')} style={styles.topIcon} />
      </TouchableOpacity>
      {/* 右上 return */}
      <TouchableOpacity style={styles.returnIcon} onPress={onReturn}>
        <Image source={require('../assets/icons/icon_return.png')} style={styles.topIcon} />
      </TouchableOpacity>
      <Text style={styles.title}>選擇導覽地點</Text>
      <View style={styles.buttonGroup}>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity style={styles.button} onPress={onQRCode}>
            <Image source={require('../assets/icons/icon_qr_code.png')} style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.buttonText}>掃瞄啟動條碼</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity style={styles.button} onPress={onMap}>
            <Image source={require('../assets/icons/icon_marker.png')} style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.buttonText}>GPS偵測位置</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    borderColor: '#232323',
    borderRadius: 16,
    borderWidth: 3,
    elevation: 2,
    height: 180,
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: 180,
  },
  buttonGroup: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: 24,
    marginTop: 150,
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 0,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#232323',
    flex: 1,
    paddingTop: 80,
  },
  icon: {
    height: 100,
    marginBottom: 12,
    resizeMode: 'contain',
    width: 100,
  },
  menuIcon: {
    left: 16,
    position: 'absolute',
    top: 46,
    zIndex: 10,
  },
  returnIcon: {
    position: 'absolute',
    right: 16,
    top: 46,
    zIndex: 10,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    left: 0,
    letterSpacing: 2,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: 135,
    zIndex: 1,
  },
  topIcon: {
    height: 32,
    resizeMode: 'contain',
    width: 32,
  },
});
