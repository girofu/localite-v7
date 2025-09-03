import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QRCodeScannerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scannerContainer}>
        {/* Mock Scanner View */}
        <View style={styles.scannerView}>
          <View style={styles.scannerCorner} />
          <View style={[styles.scannerCorner, styles.topRight]} />
          <View style={[styles.scannerCorner, styles.bottomLeft]} />
          <View style={[styles.scannerCorner, styles.bottomRight]} />
        </View>
        
        {/* Mock Camera Overlay */}
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>相機權限未啟用</Text>
          <Text style={styles.overlaySubText}>請在設定中啟用相機權限</Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>開啟相機</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomLeft: {
    borderBottomWidth: 3,
    borderTopWidth: 0,
    bottom: -2,
    top: 'auto',
  },
  bottomRight: {
    borderBottomWidth: 3,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderTopWidth: 0,
    bottom: -2,
    left: 'auto',
    right: -2,
    top: 'auto',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#00ff00',
    borderRadius: 8,
    padding: 15,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  controlsContainer: {
    backgroundColor: '#000',
    padding: 20,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  overlaySubText: {
    color: '#fff',
    fontSize: 14,
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scannerContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scannerCorner: {
    borderColor: '#00ff00',
    borderLeftWidth: 3,
    borderTopWidth: 3,
    height: 20,
    left: -2,
    position: 'absolute',
    top: -2,
    width: 20,
  },
  scannerView: {
    borderColor: '#fff',
    borderWidth: 2,
    height: 250,
    position: 'relative',
    width: 250,
  },
  topRight: {
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderTopWidth: 3,
    left: 'auto',
    right: -2,
  },
}); 