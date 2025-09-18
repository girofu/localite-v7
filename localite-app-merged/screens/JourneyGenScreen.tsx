import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenType } from '../src/types/navigation.types';

interface JourneyGenScreenProps {
  onClose: () => void;
  onNavigate: (screen: ScreenType, data?: any) => void;
  placeName?: string;
  source?: 'chatEnd' | 'chat' | null;
}

export default function JourneyGenScreen({ onClose, onNavigate, placeName = '新芳春茶行', source }: JourneyGenScreenProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(placeName);
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);
  const [isManualWriting, setIsManualWriting] = useState(false);
  const [manualText, setManualText] = useState('');

  // 根據來源決定回退行為
  const handleBack = () => {
    if (source === 'chatEnd') {
      // 從 ChatEndScreen 進入，回退到 HomeScreen
      onNavigate('home');
    } else if (source === 'chat') {
      // 從 ChatScreen 進入，回退到 ChatScreen
      onNavigate('chat');
    } else {
      // 預設回退行為
      onClose();
    }
  };

  const weatherIcons = [
    { key: 'sun', icon: require('../assets/icons/icon_sun.png') },
    { key: 'rain', icon: require('../assets/icons/icon_rain.png') },
    { key: 'cloud', icon: require('../assets/icons/icon_cloud.png') },
    { key: 'suncloud', icon: require('../assets/icons/icon_cloudsun.png') },
    { key: 'snow', icon: require('../assets/icons/icon_snow.png') },
  ];

  const handleAddPhoto = async () => {
    try {
      // 請求相簿權限
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          '需要權限', 
          '需要相簿權限才能選擇照片。請在設定中開啟權限。',
          [
            { text: '取消', style: 'cancel' },
            { text: '去設定', onPress: () => {
              // 在實際應用中，這裡可以導向設定頁面
              Alert.alert('提示', '請前往設定 > 隱私權與安全性 > 照片，開啟 Localite 的權限');
            }}
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 3,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        // 如果已經有選中的照片，只添加新的照片，不超過3張
        const currentCount = selectedPhotos.length;
        const availableSlots = 3 - currentCount;
        const photosToAdd = result.assets.slice(0, availableSlots);
        
        setSelectedPhotos([...selectedPhotos, ...photosToAdd.map(asset => asset.uri)]);
      }
    } catch (error) {
      console.error('ImagePicker error:', error);
      Alert.alert('錯誤', '無法打開相簿，請檢查權限設定');
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = selectedPhotos.filter((_, i) => i !== index);
    setSelectedPhotos(newPhotos);
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
  };

  const handleWeatherSelect = (weatherKey: string) => {
    setSelectedWeather(selectedWeather === weatherKey ? null : weatherKey);
  };

  const handleManualWriting = () => {
    setIsManualWriting(true);
  };

  const handleGenerateJourney = () => {
    // 準備要傳遞的數據
    const journeyData = {
      title: editedTitle,
      photos: selectedPhotos,
      weather: selectedWeather,
      placeName: placeName,
      generatedContent: generateJourneyContent(editedTitle, selectedWeather)
    };
    
    // 導航到旅程詳情頁面並傳遞數據
    onNavigate('journeyDetail', journeyData);
  };

  // 生成旅程內容的函數
  const generateJourneyContent = (title: string, weather: string | null) => {
    const weatherText = weather ? getWeatherText(weather) : '晴朗';
    return `探索${title}，在${weatherText}的天氣下開始了這段美好的旅程。首先欣賞建築外觀，感受歷史的厚重感。接著走進內部，聆聽導覽員講解這座建築的歷史故事，了解其文化價值。最後，在紀念品區選購了心儀的紀念品，為這次旅程留下美好回憶。今日在${weatherText}的天氣中，進行了一場知性與趣味兼具的導覽之旅。`;
  };

  // 根據天氣鍵值返回對應文字
  const getWeatherText = (weatherKey: string) => {
    const weatherMap: { [key: string]: string } = {
      sun: '晴朗',
      rain: '雨天',
      cloud: '多雲',
      suncloud: '陰晴不定',
      snow: '下雪'
    };
    return weatherMap[weatherKey] || '晴朗';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => onNavigate('drawerNavigation')}>
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.headerIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image source={require('../assets/icons/icon_left.png')} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Photo Upload Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {selectedPhotos.length === 0 ? (
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <Image source={require('../assets/icons/icon_addimage.png')} style={styles.addPhotoIcon} />
                <Text style={styles.addPhotoText}>添加照片</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.photosGrid}>
                {selectedPhotos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    {/* 藍色勾勾 */}
                    <View style={styles.checkmarkContainer}>
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Image source={require('../assets/icons/icon_close.png')} style={styles.removeIcon} />
                    </TouchableOpacity>
                  </View>
                ))}
                {selectedPhotos.length < 3 && (
                  <TouchableOpacity style={styles.addMoreButton} onPress={handleAddPhoto}>
                    <Image source={require('../assets/icons/icon_addimage.png')} style={styles.addMoreIcon} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Title Section */}
        <View style={styles.titleSection}>
          {isEditingTitle ? (
            <View style={styles.titleEditContainer}>
              <TextInput
                style={styles.titleInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="輸入景點名稱"
                placeholderTextColor="#999"
                autoFocus
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleTitleSave}>
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.titleDisplayContainer}>
              <Text style={styles.titleText}>{editedTitle}</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleTitleEdit}>
                <Image source={require('../assets/icons/icon_pen.png')} style={styles.editIcon} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Weather Icons */}
        <View style={styles.weatherSection}>
          <View style={styles.weatherIconsContainer}>
            {weatherIcons.map((weather) => (
              <TouchableOpacity
                key={weather.key}
                style={[
                  styles.weatherIconButton,
                  selectedWeather === weather.key && styles.weatherIconSelected
                ]}
                onPress={() => handleWeatherSelect(weather.key)}
              >
                <Image
                  source={weather.icon}
                  style={[
                    styles.weatherIcon,
                    selectedWeather === weather.key && styles.weatherIconTinted
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Action Section */}
        {!isManualWriting ? (
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.generateButton} onPress={handleGenerateJourney}>
              <Image source={require('../assets/icons/icon_gen.png')} style={styles.generateIcon} />
              <Text style={styles.generateButtonText}>由 Localite 生成旅程</Text>
            </TouchableOpacity>
            
            <Text style={styles.orText}>或</Text>
            
            <TouchableOpacity style={styles.manualWritingButton} onPress={handleManualWriting}>
              <Text style={styles.manualWritingText}>自己撰寫旅程記錄</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.manualWritingSection}>
            <TextInput
              style={styles.manualTextInput}
              value={manualText}
              onChangeText={setManualText}
              placeholder="請輸入您的旅程記錄..."
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
            />
            <View style={styles.manualWritingActions}>
              <TouchableOpacity
                style={styles.cancelManualButton}
                onPress={() => setIsManualWriting(false)}
              >
                <Text style={styles.cancelManualText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveManualButton}
                onPress={() => {
                  const journeyData = {
                    title: editedTitle,
                    photos: selectedPhotos,
                    weather: selectedWeather,
                    placeName: placeName,
                    generatedContent: manualText
                  };
                  onNavigate('journeyDetail', journeyData);
                }}
              >
                <Text style={styles.saveManualText}>保存記錄</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  photoSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  photoContainer: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  addPhotoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  addPhotoIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
    marginBottom: 12,
  },
  addPhotoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: 12,
    height: 12,
    tintColor: '#FFFFFF',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addMoreButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#444444',
    marginHorizontal: 16,
    marginVertical: 20,
  },
  titleSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  titleDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButton: {
    marginLeft: 12,
    padding: 4,
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  titleEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    paddingVertical: 8,
  },
  saveButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  weatherSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  weatherIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  weatherIconButton: {
    padding: 8,
  },
  weatherIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  weatherIconSelected: {
    backgroundColor: 'rgba(255, 218, 96, 0.2)',
    borderRadius: 20,
  },
  weatherIconTinted: {
    tintColor: '#FFDA60',
  },
  actionSection: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  generateIcon: {
    width: 18,
    height: 19,
    tintColor: '#FFFFFF',
    marginRight: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  orText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  manualWritingButton: {
    alignItems: 'center',
  },
  manualWritingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  manualWritingSection: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  manualTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  manualWritingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelManualButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelManualText: {
    color: '#999999',
    fontSize: 16,
  },
  saveManualButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  saveManualText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
