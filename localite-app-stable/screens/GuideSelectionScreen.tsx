import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GUIDES } from '../data/guide';
import { PLACES } from '../data/places';

const { width } = Dimensions.get('window');

type PlaceWithGuide = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  image: any;
  recommendedGuide?: string;
};

export default function GuideSelectionScreen({ placeId, onBack, onConfirm }: any) {
  const place = PLACES.find(p => p.id === placeId) as PlaceWithGuide | undefined;
  const recommendedGuideId = place?.recommendedGuide;
  let guides = [...GUIDES];
  if (recommendedGuideId) {
    const idx = guides.findIndex(g => g.id === recommendedGuideId);
    if (idx > -1) {
      const [rec] = guides.splice(idx, 1);
      guides = [rec, ...guides];
    }
  }

  const [current, setCurrent] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const guide = guides[current];

  return (
    <LinearGradient
      colors={['#1E1E1E', '#434343']}
      style={styles.container}
    >
      {/* Header */}
      <TouchableOpacity style={styles.menuIcon} onPress={onBack}>
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
              <Image source={require('../assets/icons/recom.png')} style={styles.recomIcon} />
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
  angleIcon: {
    height: 40,
    resizeMode: 'contain',
    tintColor: '#fff',
    width: 40,
  },
  confirmBtn: {
    alignItems: 'center',
    backgroundColor: '#232323',
    borderColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    marginTop: 12,
    paddingHorizontal: 48,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 48,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 200,
    width: '100%',
  },
  guideBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    position: 'relative',
  },
  guideDesc: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 24,
    marginTop: 16,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  guideImage: {
    height: 180,
    resizeMode: 'contain',
    width: 180,
  },
  guideName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  guideRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  menuIcon: {
    left: 16,
    position: 'absolute',
    top: 46,
    zIndex: 10,
  },
  recomIcon: {
    height: 32,
    left: '50%',
    marginLeft: -32,
    position: 'absolute',
    resizeMode: 'contain',
    top: -32,
    width: 64,
    zIndex: 2,
  },
  returnIcon: {
    position: 'absolute',
    right: 16,
    top: 46,
    zIndex: 10,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    left: 0,
    letterSpacing: 2,
    marginBottom: 0,
    marginTop: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: 135,
    zIndex: 1,
  },
  topIcon: {
    height: 32,
    resizeMode: 'contain',
    width: 32,
  },
});
