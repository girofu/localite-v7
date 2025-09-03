import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function LearningSheetScreen({ onClose }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.icon} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.headerIcon} onPress={onClose}>
          <Image source={require('../assets/icons/icon_explore.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.centerContent}>
        <Text style={styles.text}>學習單製作中...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  container: { backgroundColor: '#232323', flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  headerIcon: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  icon: { height: 28, resizeMode: 'contain', width: 28 },
  text: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});
