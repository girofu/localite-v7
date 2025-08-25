import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { PLACES } from '../data/places';

const { width } = Dimensions.get('window');

export default function PlaceIntroScreen({ placeId, onConfirm, onChange }: any) {
  const place = PLACES.find(p => p.id === placeId) || PLACES[0];

  return (
    <View style={styles.container}>
      {/* Header icons */}
      <TouchableOpacity style={styles.menuIcon} onPress={() => {}}>
        <Image source={require('../assets/icons/icon_menu.png')} style={styles.topIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.returnIcon} onPress={() => {}}>
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
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  bottomOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    bottom: 0,
    height: 630,
    left: 0,
    paddingBottom: 32,
    paddingTop: 36,
    position: 'absolute',
    right: 0,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#232323',
    borderColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
    width: width - 48,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  container: { flex: 1 },
  content: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    width: '100%',
  },
  desc: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  menuIcon: {
    left: 16,
    position: 'absolute',
    top: 46,
    zIndex: 10,
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
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  topIcon: {
    height: 32,
    resizeMode: 'contain',
    width: 32,
  },
});
