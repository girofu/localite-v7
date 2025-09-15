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

interface BadgeScreenProps {
  onClose: () => void;
  onNavigate: (screen: 'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'journeyGen' | 'learningSheetsList' | 'badge' | 'aboutLocalite' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation' | 'previewBadge' | 'badgeType' | 'badgeDetail' | 'profile', badgeType?: string, badge?: Badge) => void;
  isLoggedIn?: boolean;
}

export default function BadgeScreen({ onClose, onNavigate, isLoggedIn = false }: BadgeScreenProps) {
  // 模擬用戶已獲得的徽章（實際應用中這會來自用戶數據）
  const userBadges = ['B2-1']; // 假設用戶已獲得「綠芽初登場」徽章

  // 自定義徽章分組，修改標題名稱並合併特別限定
  const getCustomBadgeGroups = () => {
    const groups: { [key: string]: Badge[] } = {};
    
    Object.entries(BADGES_BY_TYPE).forEach(([type, badges]) => {
      if (type === '社群分享成就') {
        groups['分享成就'] = badges;
      } else if (type === '特別活動限定' || type === '特別地點限定') {
        if (!groups['特別限定']) {
          groups['特別限定'] = [];
        }
        groups['特別限定'] = [...groups['特別限定'], ...badges];
      } else {
        groups[type] = badges;
      }
    });
    
    return groups;
  };

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
          <View style={styles.badgeLockIconContainer}>
            <Image source={require('../assets/icons/icon_lock.png')} style={styles.badgeLockIcon} />
          </View>
        )}
      </View>
      {isUnlocked && (
        <Text style={styles.badgeName}>{badge.name}</Text>
      )}
    </TouchableOpacity>
  );

  const renderBadgeSection = (type: string, badges: Badge[]) => (
    <View key={type} style={styles.badgeSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{type}</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => onNavigate('badgeType', type)}
        >
          <Image source={require('../assets/icons/icon_folder.png')} style={styles.folderIcon} />
          <Text style={styles.viewAllText}>看全部</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.badgeGrid}>
        {badges.slice(0, 4).map(badge => 
          renderBadgeItem(badge, userBadges.includes(badge.id))
        )}
        {/* 如果徽章數量不足4個，顯示空的鎖定位置 */}
        {badges.length < 4 && Array.from({ length: 4 - badges.length }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.badgeItem}>
            <View style={styles.badgeImageContainer}>
              <View style={styles.badgeLockIconContainer}>
                <Image source={require('../assets/icons/icon_lock.png')} style={styles.badgeLockIcon} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => {
            console.log('漢堡圖示被點擊');
            onNavigate('drawerNavigation');
          }}
        >
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的徽章</Text>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Image source={require('../assets/icons/icon_angle-left.png')} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      {!isLoggedIn ? (
        // 未登入狀態
        <View style={styles.contentContainer}>
          {/* Lock Icon */}
          <View style={styles.lockIconContainer}>
            <Image 
              source={require('../assets/icons/icon_lockman.png')} 
              style={styles.lockIcon}
              resizeMode="contain"
            />
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
            {Object.entries(getCustomBadgeGroups()).map(([type, badges]) => 
              renderBadgeSection(type, badges)
            )}
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
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
    tintColor: undefined, // 確保不使用 tintColor
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
    alignItems: 'center',
    width: '100%',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    width: '100%',
    gap: 16,
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
  // 已登入狀態樣式
  scrollContainer: {
    flex: 1,
  },
  badgeContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  badgeSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
    marginRight: 4,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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
  badgeLockIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D3D3D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeLockIcon: {
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
