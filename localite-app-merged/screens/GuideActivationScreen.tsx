import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GuideActivationScreenProps {
  onReturn?: () => void;
  onMenu?: () => void;
  onQRCode?: () => void;
  onMap?: () => void;
  onNavigate?: (screen: any) => void;
}

export default function GuideActivationScreen({ onReturn, onMenu, onQRCode, onMap, onNavigate }: GuideActivationScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => onNavigate && onNavigate('drawerNavigation')}>
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.headerIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={onReturn}>
          <Image source={require('../assets/icons/icon_left.png')} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>選擇導覽地點</Text>
        
        <View style={styles.buttonGroup}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onQRCode}>
              <Image source={require('../assets/icons/icon_qr_code.png')} style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.buttonText}>掃瞄啟動條碼</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onMap}>
              <Image source={require('../assets/icons/icon_marker.png')} style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.buttonText}>GPS偵測位置</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#232323',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  menuButton: {
    padding: 8,
  },
  backButton: {
    padding: 8,
  },
  headerIcon: {
    width: 32,
    height: 32,
    tintColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 2,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  button: {
    width: 180,
    height: 180,
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#232323',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
