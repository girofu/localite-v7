import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  Share,
  Alert,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Badge } from '../src/types/badge.types';

interface BadgeDetailScreenProps {
  onClose: () => void;
  onNavigate: (screen: 'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'journeyGen' | 'learningSheetsList' | 'badge' | 'badgeType' | 'badgeDetail' | 'aboutLocalite' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation' | 'previewBadge') => void;
  badge: Badge;
  isLoggedIn?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export default function BadgeDetailScreen({ onClose, onNavigate, badge, isLoggedIn = false }: BadgeDetailScreenProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const shareCardRef = useRef<ViewShot>(null);

  // 根據 badge ID 動態載入對應的分享圖片
  const getBadgeShareImage = (badgeId: string) => {
    const shareImageMap: { [key: string]: any } = {
      'B2-1': require('../assets/badges/b2-1-share.png'),
      'B2-2': require('../assets/badges/b2-2-share.png'),
      'B2-3': require('../assets/badges/b2-3-share.png'),
      'B2-4': require('../assets/badges/b2-4-share.png'),
      'B2-5': require('../assets/badges/b2-5-share.png'),
      'B3-1': require('../assets/badges/b3-1-share.png'),
      'B3-2': require('../assets/badges/b3-2-share.png'),
      'B3-3': require('../assets/badges/b3-3-share.png'),
      'B4-1': require('../assets/badges/b4-1-share.png'),
      'B5-1': require('../assets/badges/b5-1-share.png'),
      'B5-2': require('../assets/badges/b5-2-share.png'),
      'B5-3': require('../assets/badges/b5-3-share.png'),
      'B6-1': require('../assets/badges/b6-1-share.png'),
      'B6-2': require('../assets/badges/b6-2-share.png'),
      'B6-3': require('../assets/badges/b6-3-share.png'),
      'B7-1': require('../assets/badges/b7-1-share.png'),
    };
    return shareImageMap[badgeId] || require('../assets/badges/b2-1-share.png');
  };

  const captureShareCard = async () => {
    try {
      if (shareCardRef.current && shareCardRef.current.capture) {
        const uri = await shareCardRef.current.capture();
        return uri;
      }
      return null;
    } catch (error) {
      console.error('生成分享卡片失敗:', error);
      return null;
    }
  };

  const handleShare = async () => {
    setIsGeneratingImage(true);
    
    try {
      const shareCardImageUri = await captureShareCard();
      
      if (shareCardImageUri) {
        const result = await Share.share({
          url: shareCardImageUri,
          message: `我獲得了「${badge.name}」徽章！`,
          title: '徽章分享'
        });
        
        if (result.action === Share.sharedAction) {
          setShowShareModal(false);
        }
      } else {
        Alert.alert('分享失敗', '無法生成分享卡片');
      }
    } catch (error) {
      console.error('分享失敗:', error);
      Alert.alert('分享失敗', '無法分享徽章，請稍後再試');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleMoreOptions = () => {
    setShowMoreOptions(true);
  };

  const handlePrintBadge = () => {
    setShowMoreOptions(false);
    Alert.alert('列印功能', '列印徽章功能開發中');
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        </View>

        {/* 未登入內容 */}
        <View style={styles.contentContainer}>
          <View style={styles.lockIconContainer}>
            <Image source={require('../assets/icons/icon_lockman.png')} style={styles.lockIcon} />
          </View>
          
          <View style={styles.messageContainer}>
            <View style={styles.messageRow}>
              <Image source={require('../assets/icons/icon_sparkles.png')} style={styles.sparklesIcon} />
              <Text style={styles.loginMessage}>登入 Localite 帳號查看徽章詳情</Text>
            </View>
          </View>
          
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* 徽章圖片 */}
        <View style={styles.badgeImageContainer}>
          <Image 
            source={getBadgeShareImage(badge.id)} 
            style={styles.badgeImage}
            resizeMode="contain"
            testID="badge-image"
          />
        </View>

        {/* 徽章名稱 */}
        <Text style={styles.badgeName}>{badge.name}</Text>

        {/* 徽章描述 */}
        <Text style={styles.badgeDescription}>{badge.description}</Text>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={handleMoreOptions}
          activeOpacity={0.7}
          testID="more-options-button"
        >
          <Image source={require('../assets/icons/icon_more.png')} style={styles.moreIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton} onPress={() => setShowShareModal(true)}>
          <Image source={require('../assets/icons/icon_badge.png')} style={styles.shareIcon} />
          <Text style={styles.shareText}>分享徽章</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={onClose}
          testID="close-button"
        >
          <View style={styles.saveIconContainer}>
            <Image source={require('../assets/icons/icon_close.png')} style={styles.saveIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Share Badge Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
        testID="share-modal"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.shareCardContainer}>
            {/* Share Card Preview */}
            <ScrollView 
              horizontal={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.shareCardScrollContent}
            >
              <ViewShot
                ref={shareCardRef}
                options={{ format: 'jpg', quality: 0.9 }}
                style={styles.shareCard}
              >
                <View style={styles.shareCardContent} testID="share-card">
                  {/* 徽章圖片 */}
                  <View style={styles.shareCardImageContainer}>
                    <Image 
                      source={getBadgeShareImage(badge.id)} 
                      style={styles.shareCardImage}
                      resizeMode="contain"
                    />
                  </View>

                  {/* 徽章名稱 */}
                  <Text style={styles.shareCardTitle}>{badge.name}</Text>

                  {/* 徽章描述 */}
                  <Text style={styles.shareCardDescription}>{badge.description}</Text>

                  {/* Localite Logo */}
                  <View style={styles.shareCardLogoContainer}>
                    <Image 
                      source={require('../assets/logo/logo-color.png')} 
                      style={styles.shareCardLogo}
                      testID="share-card-logo"
                    />
                  </View>
                </View>
              </ViewShot>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.shareCardActions}>
              <TouchableOpacity 
                style={styles.shareActionButton}
                onPress={handleShare}
                disabled={isGeneratingImage}
              >
                <Text style={styles.actionText}>
                  {isGeneratingImage ? '生成中...' : '分享'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelActionButton}
                onPress={() => setShowShareModal(false)}
              >
                <Text style={styles.cancelActionText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* More Options Modal */}
      <Modal
        visible={showMoreOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMoreOptions(false)}
      >
        <TouchableOpacity 
          style={styles.moreOptionsOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreOptions(false)}
          testID="more-options-overlay"
        >
          <TouchableOpacity 
            style={styles.moreOptionsMenu}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            testID="more-options-menu"
          >
            <TouchableOpacity 
              style={styles.moreOptionsItem}
              onPress={handlePrintBadge}
            >
              <Image source={require('../assets/icons/icon_printer.png')} style={styles.moreOptionsIcon} />
              <Text style={styles.moreOptionsText}>列印徽章</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
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
  closeIcon: {
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 100, // 為底部選單留出空間
  },
  badgeImageContainer: {
    width: 200,
    height: 200,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
  badgeName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  badgeDescription: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    paddingHorizontal: 16,
  },
  // Bottom Navigation Bar Styles
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34, // 增加底部 padding 以適應安全區域
    backgroundColor: '#232323',
    borderTopWidth: 1,
    borderTopColor: '#444444',
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  shareIcon: {
    width: 18,
    height: 18,
    tintColor: '#232323',
  },
  shareText: {
    color: '#232323',
    fontSize: 16,
    fontWeight: '500',
  },
  saveIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  // More Options Modal Styles
  moreOptionsOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 40,
    paddingBottom: 60,
  },
  moreOptionsMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    width: 160,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginLeft: -5,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreOptionsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: '100%',
  },
  moreOptionsIcon: {
    width: 20,
    height: 20,
    tintColor: '#232323',
  },
  moreOptionsText: {
    fontSize: 16,
    color: '#232323',
    fontWeight: '500',
  },
  // Share Card Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareCardContainer: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 20,
    width: screenWidth * 0.9,
    maxHeight: '80%',
  },
  shareCardScrollContent: {
    alignItems: 'center',
  },
  shareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: 300,
    height: 533,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCardContent: {
    alignItems: 'center',
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
  },
  shareCardImageContainer: {
    width: 180,
    height: 180,
    marginTop: 40,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareCardImage: {
    width: '100%',
    height: '100%',
  },
  shareCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: 12,
  },
  shareCardDescription: {
    fontSize: 14,
    color: '#1E1E1E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    flex: 1,
  },
  shareCardLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCardLogo: {
    width: 83,
    height: 14,
    resizeMode: 'contain',
  },
  shareCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 16,
  },
  shareActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#232323',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelActionButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  cancelActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
