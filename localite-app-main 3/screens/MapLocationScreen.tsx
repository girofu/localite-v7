import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { PLACES } from '../data/places';
import { getDistance } from '../utils/distance';

const { width, height } = Dimensions.get('window');
const DISTANCE_LIMIT = 500; // 公尺

export default function MapLocationScreen({ onBack }: { onBack?: () => void }) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [visiblePlaces, setVisiblePlaces] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('未取得定位權限');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      const filtered = PLACES.map(place => {
        const distance = getDistance(
          location.coords.latitude,
          location.coords.longitude,
          place.lat,
          place.lng
        );
        return { ...place, distance };
      }).filter(place => place.distance <= DISTANCE_LIMIT);

      setVisiblePlaces(filtered);
      setModalVisible(filtered.length === 0);
    }
  }, [location]);

  // 處理地點選擇，生成路線指引
  const handlePlaceSelect = (place: any) => {
    setSelectedPlace(place);
    
    if (location) {
      // 生成從目前位置到選中地點的直線路徑
      const coordinates = [
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        {
          latitude: place.lat,
          longitude: place.lng,
        }
      ];
      setRouteCoordinates(coordinates);
    }
  };

  if (!location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>正在取得定位...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={onBack}>
          <Image source={require('../assets/icons/icon_left.png')} style={styles.headerIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>查看地圖</Text>
      </View>
      {/* MapView */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation
      >
        {/* 路線指引虛線 */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#000000"
            strokeWidth={1}
            strokePattern={[2, 2]} // 虛線樣式
            lineDashPattern={[2, 2]}
          />
        )}
        
        {visiblePlaces.map(place => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            onPress={() => handlePlaceSelect(place)}
          >
            <View style={{ alignItems: 'center' }}>
              <Image
                source={require('../assets/icons/icon_3dpin.png')}
                style={{ 
                  width: 40, 
                  height: 48, 
                  resizeMode: 'contain',
                  opacity: selectedPlace?.id === place.id ? 1 : 0.7
                }}
              />
              <Text
                style={{
                  marginTop: 2,
                  backgroundColor: selectedPlace?.id === place.id ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.85)',
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  fontWeight: 'bold',
                  fontSize: 14,
                  color: selectedPlace?.id === place.id ? '#fff' : '#232323',
                  overflow: 'hidden',
                }}
              >
                {place.name}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>附近沒有可導覽地點</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
              <Text>關閉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.cardContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {visiblePlaces.map(place => (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.card,
                selectedPlace?.id === place.id && styles.selectedCard
              ]}
              onPress={() => handlePlaceSelect(place)}
            >
              <Image source={place.image} style={styles.cardImage} />
              <Text style={[
                styles.cardTitle,
                selectedPlace?.id === place.id && styles.selectedCardTitle
              ]}>
                {place.name}
              </Text>
              <Text style={styles.cardDistance}>{Math.round(place.distance)}m</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    zIndex: 20,
    alignItems: 'center',
  },
  card: {
    width: 180,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#FFDA60',
    borderWidth: 2,
    borderColor: '#FFDA60',
  },
  cardImage: {
    width: 160,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  selectedCardTitle: {
    color: '#000000',
  },
  cardDistance: {
    color: '#888',
    fontSize: 14,
  },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)'
  },
  modalContent: {
    backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center'
  },
  modalButton: {
    marginTop: 16, padding: 8, backgroundColor: '#eee', borderRadius: 8
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  headerLeft: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#232323',
    letterSpacing: 2,
    marginRight: 48,
  },
});
