import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { BADGES_BY_TYPE, Badge } from '../data/badges';

const { width: screenWidth } = Dimensions.get('window');
const badgeItemWidth = (screenWidth - 48) / 2; // 兩列佈局，考慮間距

interface BadgeTypeScreenProps {
  onClose: () => void;
  onNavigate: (screen: 'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'journeyGen' | 'learningSheetsList' | 'badge' | 'aboutLocalite' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation' | 'previewBadge' | 'badgeType' | 'badgeDetail', badgeType?: string, badge?: Badge) => void;
  badgeType: string;
  isLoggedIn?: boolean;
}

export default function BadgeTypeScreen({ onClose, onNavigate, badgeType, isLoggedIn = false }: BadgeTypeScreenProps) {
  // 模擬用戶已獲得的徽章（實際應用中這會來自用戶數據）
  const userBadges = ['B2-1']; // 假設用戶已獲得「綠芽初登場」徽章

  // 根據 badgeType 獲取對應的徽章
  const getBadgesForType = () => {
    if (badgeType === '分享成就') {
      return BADGES_BY_TYPE['社群分享成就'] || [];
    } else if (badgeType === '特別限定') {
      return [
        ...(BADGES_BY_TYPE['特別活動限定'] || []),
        ...(BADGES_BY_TYPE['特別地點限定'] || [])
      ];
    } else {
      return BADGES_BY_TYPE[badgeType] || [];
    }
  };

  const badges = getBadgesForType();

  const getBadgeImage = (badgeId: string) => {
    const badgeImages: { [key: string]: any } = {
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
    return badgeImages[badgeId] || require('../assets/badges/b2-1.png');
  };

  const renderBadgeItem = (badge: Badge, isUnlocked: boolean) => (
    <TouchableOpacity 
      key={badge.id} 
      style={styles.badgeItem}
      onPress={() => {
        if (isUnlocked) {
          onNavigate('badgeDetail', undefined, badge);
        }
      }}
      activeOpacity={isUnlocked ? 0.8 : 1}
    >
      <View style={styles.badgeImageContainer}>
        {isUnlocked ? (
          <Image 
            source={getBadgeImage(badge.id)} 
            style={styles.badgeImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.lockIconContainer}>
            <Image source={require('../assets/icons/icon_lock.png')} style={styles.lockIcon} />
          </View>
        )}
      </View>
      {isUnlocked && (
        <Text style={styles.badgeName}>{badge.name}</Text>
      )}
    </TouchableOpacity>
  );

  const renderBadgeGrid = () => {
    const items = [];
    
    // 添加實際徽章
    badges.forEach(badge => {
      items.push(renderBadgeItem(badge, userBadges.includes(badge.id)));
    });
    
    // 如果徽章數量不足4個，添加空的鎖定位置
    const remainingSlots = 4 - (badges.length % 4);
    if (remainingSlots < 4) {
      for (let i = 0; i < remainingSlots; i++) {
        items.push(
          <View key={`empty-${i}`} style={styles.badgeItem}>
            <View style={styles.badgeImageContainer}>
              <View style={styles.lockIconContainer}>
                <Image source={require('../assets/icons/icon_lock.png')} style={styles.lockIcon} />
              </View>
            </View>
          </View>
        );
      }
    }
    
    return items;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => onNavigate('drawerNavigation')}>
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{badgeType}</Text>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Image source={require('../assets/icons/icon_angle-left.png')} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      {!isLoggedIn ? (
        // 未登入狀態
        <View style={styles.contentContainer}>
          {/* Lock Icon */}
          <View style={styles.lockIconContainer}>
            <Image source={require('../assets/icons/icon_lockman.png')} style={styles.lockIcon} />
          </View>
          
          {/* Login Message */}
          <View style={styles.messageContainer}>
            <View style={styles.messageRow}>
              <Image source={require('../assets/icons/icon_sparkles.png')} style={styles.sparklesIcon} />
              <Text style={styles.loginMessage}>登入 Localite 帳號查看你的徽章</Text>
            </View>
          </View>
          
          {/* Call to Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => onNavigate('login')}
            >
              <Text style={styles.loginButtonText}>登入</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => onNavigate('guide')}
            >
              <Text style={styles.exploreButtonText}>探索更多地點</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // 已登入狀態
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.badgeContent}>
            <View style={styles.badgeGrid}>
              {renderBadgeGrid()}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F', // 深灰色背景
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
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  // 未登入狀態樣式
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  lockIconContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  lockIcon: {
    width: 120,
    height: 120,
  },
  messageContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparklesIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#FFFFFF',
  },
  loginMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#4B5563',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 40,
    width: '100%',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    width: '100%',
    gap: 16,
  },
  // 已登入狀態樣式
  scrollContainer: {
    flex: 1,
  },
  badgeContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: badgeItemWidth,
    height: badgeItemWidth, // 讓高度等於寬度，形成正方形
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center', // 垂直置中
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeImageContainer: {
    width: 60,
    height: 60,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
  lockIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D3D3D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    width: 24,
    height: 24,
    tintColor: '#666666',
  },
  badgeName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
});
