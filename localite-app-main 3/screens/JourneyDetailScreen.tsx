import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  TextInput,
  Alert,
  Modal,
  Share
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useJourney, JourneyRecord } from '../contexts/JourneyContext';

const { width: screenWidth } = Dimensions.get('window');

interface JourneyDetailScreenProps {
  onClose: () => void;
  onNavigate: (screen: string, params?: any) => void;
  journeyData?: {
    title: string;
    photos: string[];
    weather: string | null;
    placeName: string;
    generatedContent: string;
  };
  onSaveJourney?: () => void;
}

export default function JourneyDetailScreen({ onClose, onNavigate, journeyData, onSaveJourney }: JourneyDetailScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { addJourneyRecord, startTime, endTime } = useJourney();
  // 使用傳入的數據或預設值
  const [selectedWeather, setSelectedWeather] = useState(journeyData?.weather || 'sun');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const shareCardRefs = useRef<(View | null)[]>([]);
  const [journeyContent, setJourneyContent] = useState(
    journeyData?.generatedContent || '走近新芳春茶行，首先探索大門門聯，細品「芳春」對聯的茶鄉淵源。接著走進大廳，聆聽新芳春茶行的歷史故事，見證這座融中西風格的古蹟。最後，參觀一樓帳房，了解當年茶葉交易的細節，並選購了自己喜愛的茶具，感受時光流轉中的茶商風華。今日輕鬆穿梭近百年古蹟，進行了一場知性與趣味兼具的茶行導覽之旅。'
  );

  // 使用傳入的照片數據或預設照片
  const photos = journeyData?.photos && journeyData.photos.length > 0 
    ? journeyData.photos.map(uri => ({ uri }))
    : [
        require('../assets/places/shinfang.jpg'),
        require('../assets/places/lee_maison_de_Tamsui.jpg'),
        require('../assets/places/lee_swallow_de_Tamsui.jpg'),
      ];

  // 使用傳入的標題或預設標題
  const placeTitle = journeyData?.title || journeyData?.placeName || '新芳春茶行';

  // 獲取當天日期
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const weekday = weekdays[now.getDay()];
    
    return `${year}/${month}/${day} ${weekday}`;
  };

  const currentDate = getCurrentDate();

  // 天氣圖示映射
  const weatherIcons = {
    sun: require('../assets/icons/icon_sun.png'),
    rain: require('../assets/icons/icon_rain.png'),
    cloud: require('../assets/icons/icon_cloud.png'),
    suncloud: require('../assets/icons/icon_cloudsun.png'),
    snow: require('../assets/icons/icon_snow.png'),
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('保存成功', '旅程記錄已更新');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleShare = () => {
    setSelectedCards([]);
    setShowShareModal(true);
  };

  const captureShareCard = async (cardIndex: number) => {
    if (!shareCardRefs.current[cardIndex]) {
      throw new Error(`ShareCard ref not found for index ${cardIndex}`);
    }
    
    const uri = await captureRef(shareCardRefs.current[cardIndex], {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    
    return uri;
  };

  const handleCardSelect = (cardIndex: number) => {
    setSelectedCards(prev => {
      if (prev.includes(cardIndex)) {
        return prev.filter(index => index !== cardIndex);
      } else {
        return [...prev, cardIndex];
      }
    });
  };

  const handleShareImage = async () => {
    if (isGeneratingImage || selectedCards.length === 0) return;
    
    setIsGeneratingImage(true);
    
    try {
      if (selectedCards.length === 1) {
        // 單張分享
        const shareCardImageUri = await captureShareCard(selectedCards[0]);
        
        const result = await Share.share({
          url: shareCardImageUri,
          message: `我的旅程記錄 - ${placeTitle}`,
          title: '旅程分享'
        });
        
        if (result.action === Share.sharedAction) {
          setShowShareModal(false);
        }
      } else {
        // 多張分享
        const imageUris = await Promise.all(
          selectedCards.map(cardIndex => captureShareCard(cardIndex))
        );
        
        // 使用多個 URL 分享 - 先分享第一張，然後提示用戶可以手動分享其他張
        const result = await Share.share({
          url: imageUris[0],
          message: `我的旅程記錄 - ${placeTitle} (${selectedCards.length}張照片)`,
          title: '旅程分享'
        });
        
        if (result.action === Share.sharedAction) {
          setShowShareModal(false);
        }
      }
    } catch (error) {
      console.error('分享失敗:', error);
      Alert.alert('分享失敗', '無法生成或分享圖片，請稍後再試');
    } finally {
      setIsGeneratingImage(false);
    }
  };


  const handleMoreOptions = () => {
    setShowMoreOptions(true);
  };

  const handleSaveJourney = () => {
    // 格式化時間戳
    const formatTime = (date: Date | null) => {
      if (!date) return '09:23'; // 預設時間
      return date.toLocaleTimeString('zh-TW', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    };

    // 生成旅程記錄
    const journeyRecord: JourneyRecord = {
      id: `journey_${Date.now()}`,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      title: placeTitle,
      placeName: placeTitle,
      photos: photos.map(photo => photo.uri || ''),
      weather: selectedWeather,
      generatedContent: journeyContent,
      timeRange: {
        start: formatTime(startTime),
        end: formatTime(endTime)
      }
    };

    // 保存到 context
    addJourneyRecord(journeyRecord);
    
    // 呼叫父組件的保存回調
    if (onSaveJourney) {
      onSaveJourney();
    }
    
    // 導航回 JourneyMainScreen，並設定 fromJourneyDetail 為 true
    onNavigate('journeyMain', { fromJourneyDetail: true });
  };


  const handlePrintJourney = () => {
    setShowMoreOptions(false);
    Alert.alert('列印功能', '列印功能開發中');
  };

  const handleEditJourney = () => {
    setShowMoreOptions(false);
    setIsEditing(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Photo Carousel Section */}
        <View style={styles.photoSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            style={styles.photoCarousel}
            contentContainerStyle={styles.photoCarouselContent}
          >
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={photo} style={styles.photo} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Place Title and Date Section */}
        <View style={styles.titleSection}>
          <Text style={styles.placeTitle}>{placeTitle}</Text>
          <View style={styles.dateWeatherContainer}>
            <Text style={styles.dateText}>{currentDate}</Text>
            <Image source={weatherIcons[selectedWeather]} style={styles.weatherIcon} />
          </View>
        </View>

        {/* Journey Content Section */}
        <View style={styles.contentSection}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={journeyContent}
                onChangeText={setJourneyContent}
                multiline
                textAlignVertical="top"
                placeholder="請輸入您的旅程記錄..."
                placeholderTextColor="#999"
              />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editSaveButton} onPress={handleSave}>
                  <Text style={styles.saveText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.journeyTextContainer}>
              <Text style={styles.journeyText}>{journeyContent}</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Image source={require('../assets/icons/icon_pen.png')} style={styles.editIcon} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

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
        >
          <TouchableOpacity 
            style={styles.moreOptionsMenu}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity 
              style={styles.moreOptionsItem}
              onPress={handlePrintJourney}
            >
              <Image source={require('../assets/icons/icon_printer.png')} style={styles.moreOptionsIcon} />
              <Text style={styles.moreOptionsText}>列印旅程</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.moreOptionsItem}
              onPress={handleEditJourney}
            >
              <Image source={require('../assets/icons/icon_pen.png')} style={styles.moreOptionsIcon} />
              <Text style={styles.moreOptionsText}>編輯旅程</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={handleMoreOptions}
          activeOpacity={0.7}
        >
          <Image source={require('../assets/icons/icon_more.png')} style={styles.moreIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Image source={require('../assets/icons/icon_sharejourney.png')} style={styles.shareIcon} />
          <Text style={styles.shareText}>分享旅程</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleSaveJourney}>
          <View style={styles.saveIconContainer}>
            <Image source={require('../assets/icons/icon_save.png')} style={styles.saveIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* ShareCard Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.shareCardContainer}>
            {/* ShareCard Previews */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.shareCardsScrollView}
              contentContainerStyle={styles.shareCardsContainer}
            >
              {photos.slice(0, 3).map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.shareCardWrapper,
                    selectedCards.includes(index) && styles.shareCardWrapperSelected
                  ]}
                  onPress={() => handleCardSelect(index)}
                  activeOpacity={0.8}
                >
                  <View ref={ref => { shareCardRefs.current[index] = ref; }} style={styles.shareCard}>
                    <Image source={photo} style={styles.shareCardImage} />
                    <View style={styles.shareCardOverlay}>
                      <Text style={styles.shareCardTitle}>{placeTitle}</Text>
                      <View style={styles.shareCardDateContainer}>
                        <Text style={styles.shareCardDate}>{currentDate}</Text>
                        <Image source={weatherIcons[selectedWeather]} style={styles.shareCardWeatherIcon} />
                      </View>
                      <Text style={styles.shareCardContent} numberOfLines={3}>
                        {journeyContent}
                      </Text>
                      <View style={styles.shareCardFooter}>
                        <Image source={require('../assets/logo/logo-light.png')} style={styles.shareCardAppIcon} />
                      </View>
                    </View>
                  </View>
                  
                  {/* Selection Indicator */}
                  {selectedCards.includes(index) && (
                    <View style={styles.selectionIndicator}>
                      <Text style={styles.selectionText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Selection Info */}
            {selectedCards.length > 0 && (
              <Text style={styles.selectionInfo}>
                已選擇 {selectedCards.length} 張卡片
              </Text>
            )}
            
            {/* Action Buttons */}
            <View style={styles.shareCardActions}>
              <TouchableOpacity 
                style={[
                  styles.shareActionButton, 
                  (isGeneratingImage || selectedCards.length === 0) && styles.disabledButton
                ]} 
                onPress={handleShareImage}
                disabled={isGeneratingImage || selectedCards.length === 0}
              >
                <Text style={styles.actionText}>
                  {isGeneratingImage ? '生成中...' : 
                   selectedCards.length === 0 ? '請選擇卡片' :
                   `分享${selectedCards.length}張卡片`}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#232323' 
  },
  header: {
    height: 60, // 保留 header 空間
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 100, // 增加底部空間以配合新的導航欄高度
  },
  photoSection: {
    height: 240,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  photoCarousel: {
    flex: 1,
  },
  photoCarouselContent: {
    paddingRight: 16, // 讓右方可以看到第二張照片的預覽
  },
  photoContainer: {
    width: 300,
    height: 240,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 300,
    height: 240,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  placeTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateWeatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
  },
  weatherIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  journeyTextContainer: {
    position: 'relative',
  },
  journeyText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'justify',
    marginBottom: 16,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
  },
  editIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  editContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  editInput: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 26,
    textAlignVertical: 'top',
    minHeight: 200,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#999999',
    fontSize: 16,
  },
  editSaveButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
  // Modal Styles
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
    width: screenWidth - 40,
    alignItems: 'center',
    maxHeight: '80%',
  },
  // Share Cards Scroll View
  shareCardsScrollView: {
    marginBottom: 16,
  },
  shareCardsContainer: {
    paddingHorizontal: 10,
    paddingRight: 120, // 讓第二張卡片部分可見
  },
  shareCardWrapper: {
    marginHorizontal: 8,
    position: 'relative',
  },
  shareCardWrapperSelected: {
    transform: [{ scale: 1.05 }],
  },
  shareCard: {
    width: 240,
    height: 427,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  selectionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectionInfo: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  shareCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shareCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  shareCardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shareCardDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareCardDate: {
    color: '#CCCCCC',
    fontSize: 14,
    marginRight: 8,
  },
  shareCardWeatherIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  shareCardContent: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  shareCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareCardAppIcon: {
    width: 80,
    height: 30,
    resizeMode: 'contain',
  },
  shareCardActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  shareActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  cancelActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  disabledButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.5)',
    opacity: 0.6,
  },
  actionIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelModalButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelModalText: {
    color: '#999999',
    fontSize: 16,
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
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginLeft: -5,
    marginBottom: 5,
  },
  moreOptionsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
});
