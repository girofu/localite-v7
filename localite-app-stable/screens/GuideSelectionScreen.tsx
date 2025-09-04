import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GUIDES } from '../data/guide';
import { PLACES } from '../data/places';

const { width } = Dimensions.get('window');

type PlaceWithGuide = {
  id: string;
  id_no: string; // 添加 id_no 屬性
  name: string;
  lat: number;
  lng: number;
  description: string;
  image: any;
  recommendedGuide?: string;
};

export default function GuideSelectionScreen({ placeId, onBack, onConfirm, onNavigate }: any) {
  const place = PLACES.find(p => p.id === placeId) as PlaceWithGuide | undefined;
  const recommendedGuideId = place?.recommendedGuide;
  
  // 根據地點過濾可用的導覽員
  let guides = GUIDES.filter(guide => {
    // 如果導覽員有地點限制，檢查當前地點的 id_no 是否在允許清單中
    if (guide.limitedPlaces) {
      return guide.limitedPlaces.includes(place?.id_no || '');
    }
    // 沒有地點限制的導覽員在所有地點都可以選擇
    return true;
  });
  
  // 如果有推薦導覽員且該導覽員在過濾後的清單中，將其排在最前面
  if (recommendedGuideId) {
    const recommendedGuide = guides.find(g => g.id === recommendedGuideId);
    if (recommendedGuide) {
      guides = guides.filter(g => g.id !== recommendedGuideId);
      guides = [recommendedGuide, ...guides];
    }
  }

  const [current, setCurrent] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const guide = guides[current];

  // 閃爍動畫效果
  useEffect(() => {
    if (recommendedGuideId && guide.id === recommendedGuideId) {
      const startFadeAnimation = () => {
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]).start(() => startFadeAnimation()); // 循環播放
      };
      
      startFadeAnimation();
    }
  }, [recommendedGuideId, guide.id, fadeAnim]);

  return (
    <LinearGradient
      colors={['#1E1E1E', '#434343']}
      style={styles.container}
    >
      {/* Header */}
      <TouchableOpacity style={styles.menuIcon} onPress={() => onNavigate && onNavigate('drawerNavigation')}>
        <Image source={require('../assets/icons/icon_menu.png')} style={styles.topIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.returnIcon} onPress={onBack}>
        <Image source={require('../assets/icons/icon_return.png')} style={styles.topIcon} />
      </TouchableOpacity>
      <Text style={styles.title}>選擇導覽員</Text>
      <View style={styles.content}>
        <View style={styles.guideRow}>
          <TouchableOpacity onPress={() => setCurrent((current - 1 + guides.length) % guides.length)}>
            <Image source={require('../assets/icons/icon_angle-left.png')} style={styles.angleIcon} />
          </TouchableOpacity>
          <View style={styles.guideBox}>
            {recommendedGuideId && guide.id === recommendedGuideId && (
              <Animated.View style={[styles.recommendedContainer, { opacity: fadeAnim }]}>
                <Image source={require('../assets/icons/icon_sparkles.png')} style={styles.sparklesIcon} />
                <Text style={styles.recommendedText}>地點限定</Text>
              </Animated.View>
            )}
            <Image source={guide.image} style={styles.guideImage} />
          </View>
          <TouchableOpacity onPress={() => setCurrent((current + 1) % guides.length)}>
            <Image source={require('../assets/icons/icon_angle-right.png')} style={styles.angleIcon} />
          </TouchableOpacity>
        </View>
        <Text style={styles.guideName}>{guide.name}</Text>
        <Text style={styles.guideDesc}>{guide.description}</Text>
        <TouchableOpacity style={styles.confirmBtn} onPress={() => onConfirm && onConfirm(guide.id)}>
          <Text style={styles.confirmBtnText}>確認</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  menuIcon: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 10,
  },
  returnIcon: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
  },
  topIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 200,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center',
    letterSpacing: 2,
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guideBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    position: 'relative',
  },

  guideImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  guideName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  guideDesc: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 26,
    paddingHorizontal: 24,
  },
  confirmBtn: {
    backgroundColor: '#232323',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  angleIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  recommendedContainer: {
    position: 'absolute',
    top: -32,
    left: '50%',
    transform: [{ translateX: -50 }], // 使用 transform 來置中，比 marginLeft 更準確
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 2,
  },
  sparklesIcon: {
    width: 20.4,
    height: 20.4,
    marginRight: 4,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
