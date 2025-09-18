import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { PLACES } from '../data/places';
import PlaceIntroCard from '../components/PlaceIntroCard';

const { width } = Dimensions.get('window');

export default function PlaceIntroScreen({ placeId, onConfirm, onChange, onBack, onNavigate }: any) {
  const place = PLACES.find(p => p.id === placeId) || PLACES[0];
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10); // 隨機初始愛心數

  // 適配 PlaceIntroCard 所需的資料格式
  const adaptedPlace = {
    ...place,
    likeCount,
    availableBadges: getAvailableBadgesForPlace(place.id),
  };

  // 根據地點 ID 獲取可用的徽章
  function getAvailableBadgesForPlace(placeId: string): string[] {
    const badgeMapping: { [key: string]: string[] } = {
      'shin-fang-chun-tea': ['B2-1', 'B3-1'],
      'xiahai-temple': ['B2-1', 'B3-2'],
      'jhongliao_lee_8': ['B7-1', 'B4-1'], // 忠寮地點有特殊徽章
      'jhongliao_bamboo_10': ['B7-1', 'B4-1'],
    };
    return badgeMapping[placeId] || ['B2-1'];
  }

  const handleLikePress = () => {
    if (isLiked) {
      setLikeCount(prev => Math.max(0, prev - 1));
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleNext = () => {
    // 處理下一步邏輯，可能是開始導覽或其他動作
    console.log('Next action for place:', place.name);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header icons */}
      <TouchableOpacity 
        style={styles.menuIcon} 
        onPress={() => onNavigate && onNavigate('drawerNavigation')}
        testID="menu-button"
      >
        <Image source={require('../assets/icons/icon_menu.png')} style={styles.topIcon} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.returnIcon} 
        onPress={onBack || (() => {})}
        testID="back-button"
      >
        <Image source={require('../assets/icons/icon_return.png')} style={styles.topIcon} />
      </TouchableOpacity>

      {/* Background image */}
      <Image source={place.image} style={styles.bgImage} />

      {/* Main content overlay */}
      <View style={styles.contentOverlay}>
        {/* PlaceIntroCard */}
        <View style={styles.cardContainer}>
          <PlaceIntroCard
            place={adaptedPlace}
            isLiked={isLiked}
            likeCount={likeCount}
            onLikePress={handleLikePress}
            onNext={handleNext}
          />
        </View>

        {/* Bottom action buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={onConfirm || (() => {})}
            testID="confirm-button"
          >
            <Text style={styles.buttonText}>確認</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={onChange || (() => {})}
            testID="change-button"
          >
            <Text style={styles.buttonText}>更換</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: 100, // 為 header icons 留出空間
    paddingBottom: 32,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 48,
    marginTop: 16,
  },
  button: {
    flex: 1,
    backgroundColor: 'rgba(35, 35, 35, 0.9)',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  menuIcon: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  returnIcon: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  topIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
});