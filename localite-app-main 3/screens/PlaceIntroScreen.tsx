import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { PLACES } from '../data/places';

const { width } = Dimensions.get('window');

export default function PlaceIntroScreen({ placeId, onConfirm, onChange, onBack, onNavigate }: any) {
  const place = PLACES.find(p => p.id === placeId) || PLACES[0];

  return (
    <View style={styles.container}>
      {/* Header icons */}
      <TouchableOpacity style={styles.menuIcon} onPress={() => onNavigate && onNavigate('drawerNavigation')}>
        <Image source={require('../assets/icons/icon_menu.png')} style={styles.topIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.returnIcon} onPress={onBack || (() => {})}>
        <Image source={require('../assets/icons/icon_return.png')} style={styles.topIcon} />
      </TouchableOpacity>
      <Image source={place.image} style={styles.bgImage} />
      <View style={styles.bottomOverlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{place.name}</Text>
          <Text style={styles.desc}>{place.description}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onConfirm || (() => {})}>
              <Text style={styles.buttonText}>確認</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onChange || (() => {})}>
              <Text style={styles.buttonText}>更換</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 630,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: 36,
    paddingBottom: 32,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  desc: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 32,
    textAlign: 'left',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 48,
    marginTop: 0,
  },
  button: {
    flex: 1,
    backgroundColor: '#232323',
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
    zIndex: 10,
  },
  returnIcon: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
  },
  topIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
