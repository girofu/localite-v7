/**
 * 探索畫面 - 重構自原本的導覽功能
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationProps } from '../../types/navigation.types';

interface ExploreScreenProps extends NavigationProps {}

const ExploreScreen: React.FC<ExploreScreenProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>探索</Text>
      <Text style={styles.subtitle}>發現附近的有趣景點</Text>
      {/* TODO: 整合原本的地圖、QR 掃描和導覽功能 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
});

export default ExploreScreen;
