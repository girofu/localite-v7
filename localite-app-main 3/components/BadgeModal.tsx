import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Dimensions
} from 'react-native';
import { Badge } from '../data/badges';

interface BadgeModalProps {
  visible: boolean;
  badge: Badge | null;
  onContinue: () => void;
  onClose?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function BadgeModal({ 
  visible, 
  badge, 
  onContinue, 
  onClose 
}: BadgeModalProps) {
  if (!badge) return null;

  // 根據 badge ID 動態載入對應的圖片
  const getBadgeImage = (badgeId: string) => {
    const imageMap: { [key: string]: any } = {
      'B2-1': require('../assets/badges/b2-1.png'),
      'B2-2': require('../assets/badges/b2-2.png'),
      'B2-3': require('../assets/badges/b2-3.png'),
      'B2-4': require('../assets/badges/b2-4.png'),
      'B2-5': require('../assets/badges/b2-5.png'),
      'B3-1': require('../assets/badges/b3-1.png'),
      'B3-2': require('../assets/badges/b3-2.png'),
      'B3-3': require('../assets/badges/b3-3.png'),
      'B4-1': require('../assets/badges/b4-1.png'),
      'B5-1': require('../assets/badges/b5-1.png'),
      'B5-2': require('../assets/badges/b5-2.png'),
      'B5-3': require('../assets/badges/b5-3.png'),
      'B6-1': require('../assets/badges/b6-1.png'),
      'B6-2': require('../assets/badges/b6-2.png'),
      'B6-3': require('../assets/badges/b6-3.png'),
      'B7-1': require('../assets/badges/b7-1.png'),
    };
    return imageMap[badgeId] || require('../assets/badges/b2-1.png');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 描述文字 */}
          <Text style={styles.descriptionText}>
            {badge.description}
          </Text>

          {/* 徽章圖示 */}
          <View style={styles.badgeContainer}>
            <Image 
              source={getBadgeImage(badge.id)} 
              style={styles.badgeImage} 
              resizeMode="contain"
            />
          </View>

          {/* 繼續按鈕 */}
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={onContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>繼續</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // 90% 透明度的黑色背景
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A', // 深灰色背景，比現有 modal 更深
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // 細緻的白色描邊
    width: 360,
    height: 500,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  descriptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '400',
  },
  badgeContainer: {
    width: 250,
    height: 250,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
  continueButton: {
    backgroundColor: 'transparent', // 無背景色
    borderRadius: 30,
    width: 300, // 佔據彈出框的大部分寬度
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // 細緻的白色描邊
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
