import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Animated
} from 'react-native';

interface LoginValidationModalProps {
  visible: boolean;
  onLogin: () => void;
  onGuestMode: () => void;
  onClose?: () => void;
}

export default function LoginValidationModal({ 
  visible, 
  onLogin, 
  onGuestMode, 
  onClose 
}: LoginValidationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Content Container */}
          <View style={styles.contentContainer}>
            {/* Icon and Text Section */}
            <View style={styles.iconTextSection}>
              <Image 
                source={require('../assets/icons/icon_sparkles.png')} 
                style={styles.sparklesIcon} 
              />
              <Text style={styles.descriptionText}>
                登入 Localite 帳號可記錄您的旅程，並累積成就獲得徽章
              </Text>
            </View>

            {/* Buttons Section */}
            <View style={styles.buttonsSection}>
              {/* Login Button */}
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={onLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>登入帳號開始探索</Text>
              </TouchableOpacity>

              {/* Guest Mode Button */}
              <TouchableOpacity 
                style={styles.guestButton} 
                onPress={onGuestMode}
                activeOpacity={0.8}
              >
                <Text style={styles.guestButtonText}>繼續使用訪客模式</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface JourneyValidationModalProps {
  visible: boolean;
  onLogin: () => void;
  onCancel: () => void;
  onClose?: () => void;
}

export function JourneyValidationModal({ 
  visible, 
  onLogin, 
  onCancel, 
  onClose 
}: JourneyValidationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Content Container */}
          <View style={styles.contentContainer}>
            {/* Icon and Text Section */}
            <View style={styles.iconTextSection}>
              <Image 
                source={require('../assets/icons/icon_sparkles.png')} 
                style={styles.sparklesIcon} 
              />
              <Text style={styles.descriptionText}>
                登入 Localite 帳號可記錄您的旅程，並累積成就獲得徽章
              </Text>
            </View>

            {/* Buttons Section */}
            <View style={styles.buttonsSection}>
              {/* Login Button */}
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={onLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>登入</Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity 
                style={styles.guestButton} 
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.guestButtonText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // 80% 透明度的黑色背景
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1E1E1E', // 深色背景
    borderRadius: 16,
    borderWidth: 0, // 去除描邊
    width: 360,
    height: 360,
    shadowColor: '#FFFFFF', // 白色光芒
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75, // 75% 透明度
    shadowRadius: 5, // 光芒範圍
    elevation: 8, // Android 陰影
  },
  contentContainer: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconTextSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    justifyContent: 'center',
    width: 300,
  },
  sparklesIcon: {
    width: 20.4, // 24 * 0.85 = 20.4 (縮小15%)
    height: 20.4, // 24 * 0.85 = 20.4 (縮小15%)
    marginRight: 12,
    marginTop: 2,
    tintColor: '#FFFFFF',
  },
  descriptionText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'left',
  },
  buttonsSection: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#4B5563', // 深灰色按鈕
    borderRadius: 12,
    width: 300,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // 細微的白色邊框
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    backgroundColor: '#4B5563', // 深灰色按鈕，與登入按鈕一致
    borderRadius: 12,
    width: 300,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // 細微的白色邊框
  },
  guestButtonText: {
    color: '#FFFFFF', // 白色文字，與登入按鈕一致
    fontSize: 16,
    fontWeight: '600',
  },
});
