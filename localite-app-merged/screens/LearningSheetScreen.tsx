import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function LearningSheetScreen({ onClose, onNavigate }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => onNavigate && onNavigate('drawerNavigation')}>
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
  container: { flex: 1, backgroundColor: '#232323' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  headerIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  icon: { width: 28, height: 28, resizeMode: 'contain' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});
