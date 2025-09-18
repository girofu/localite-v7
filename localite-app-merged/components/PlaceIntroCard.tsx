import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { getBadgeById } from '../data/badges';

const { width } = Dimensions.get('window');

interface PlaceIntroCardProps {
  place: {
    id: string;
    name: string;
    description: string;
    image: any;
    likeCount: number;
    availableBadges: string[];
  };
  isLiked: boolean;
  likeCount: number;
  onLikePress: () => void;
  onNext: () => void;
}

export default function PlaceIntroCard({ place, isLiked, likeCount, onLikePress, onNext }: PlaceIntroCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const getAvailableBadges = () => {
    return place.availableBadges.map(badgeId => getBadgeById(badgeId.toUpperCase())).filter(Boolean);
  };

  const getBadgeImage = (badgeId: string) => {
    const imageMap: { [key: string]: any } = {
      'B2-1': require('../assets/badges/b2-1.png'),
      'B3-1': require('../assets/badges/b3-1.png'),
      'B3-2': require('../assets/badges/b3-2.png'),
      'B3-3': require('../assets/badges/b3-3.png'),
    };
    return imageMap[badgeId] || require('../assets/badges/b2-1.png');
  };

  return (
    <View style={styles.cardContainer} testID="card-container">
      {/* 愛心按鈕 - 只在正面顯示 */}
      {!isFlipped && (
        <TouchableOpacity 
          style={styles.heartOverlay} 
          onPress={() => {
            console.log('Heart button pressed!');
            onLikePress();
          }}
          activeOpacity={0.7}
          testID="heart-button"
        >
          <View style={styles.heartContainer}>
            <Image 
              source={isLiked ? require('../assets/icons/icon_heart_filled.png') : require('../assets/icons/icon_heart.png')} 
              style={[styles.heartIcon, { tintColor: isLiked ? '#F44336' : '#fff' }]} 
            />
            <Text style={styles.likeCount}>{likeCount}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* 正面 - 地點資訊 */}
      {!isFlipped && (
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Image source={place.image} style={styles.placeImage} testID="place-image" />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.placeTitle}>{place.name}</Text>
            <Text style={styles.placeDescription}>{place.description}</Text>
            
            {/* 可取得成就徽章按鈕 */}
            <TouchableOpacity style={styles.badgeButton} onPress={flipCard}>
              <Text style={styles.badgeButtonText}>可取得任務成就徽章</Text>
              <Image source={require('../assets/icons/icon_arrow_right.png')} style={styles.arrowIcon} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 背面 - 徽章列表 */}
      {isFlipped && (
        <View style={[styles.card, styles.backCard]}>
          <View style={styles.badgeHeader}>
            <Text style={styles.badgeTitle}>相關成就徽章</Text>
          </View>

          <View style={styles.badgeList}>
            {getAvailableBadges().map((badge, index) => (
              <View key={badge?.id || index} style={styles.badgeItem} testID="badge-item">
                <View style={styles.badgeIconContainer}>
                  <Image 
                    source={getBadgeImage(badge?.id || '')} 
                    style={styles.badgeIcon}
                  />
                  <Text style={styles.badgeLabel}>{badge?.name}</Text>
                </View>
                <Text style={styles.badgeDescription}>{badge?.condition}</Text>
              </View>
            ))}
          </View>

          {/* 回到地點簡介按鈕 */}
          <TouchableOpacity style={styles.backButton} onPress={flipCard}>
            <Image source={require('../assets/icons/icon_arrow_left.png')} style={styles.backArrowIcon} />
            <Text style={styles.backButtonText}>地點簡介</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: width - 48, // 與按鈕一樣寬 (螢幕寬度 - 左右各24px)
    height: 550,
    alignSelf: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    backfaceVisibility: 'hidden',
    pointerEvents: 'auto',
  },
  backCard: {
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  placeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    minWidth: 50,
    minHeight: 30,
    justifyContent: 'center',
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
    resizeMode: 'contain',
  },
  likeCount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  placeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  placeDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'left',
    flex: 1,
  },
  badgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  badgeButtonText: {
    fontSize: 14,
    color: '#000',
    marginRight: 4,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  badgeHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  badgeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  badgeList: {
    flex: 0,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    minHeight: 70,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  badgeIconContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
    justifyContent: 'center',
  },
  badgeIcon: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  badgeLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  badgeDescription: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'left',
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  backArrowIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginRight: 4,
  },
  backButtonText: {
    fontSize: 14,
    color: '#000',
  },
});