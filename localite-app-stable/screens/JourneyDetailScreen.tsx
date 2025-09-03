import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

export default function JourneyDetailScreen({ onClose }) {
  const { shouldPromptLogin, isGuestMode } = useAuth();

  const handleCreateJourneyRecord = () => {
    if (shouldPromptLogin('create_journey_record')) {
      Alert.alert(
        '需要登入',
        '製作個人化旅程記錄需要登入帳號。您想要現在登入嗎？',
        [
          {
            text: '稍後',
            style: 'cancel',
          },
          {
            text: '登入',
            onPress: () => {
              // TODO: 導航到登入畫面
              Alert.alert('提示', '請重新啟動應用並選擇登入');
            },
          },
        ]
      );
    } else {
      // 製作旅程記錄的邏輯
      Alert.alert('功能開發中', '旅程記錄製作功能正在開發中');
    }
  };

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
        <Text style={styles.text}>導覽已結束</Text>

        <TouchableOpacity
          style={styles.createRecordButton}
          onPress={handleCreateJourneyRecord}
        >
          <Text style={styles.createRecordButtonText}>
            {isGuestMode ? '登入後製作旅程記錄' : '製作旅程記錄'}
          </Text>
        </TouchableOpacity>

        {isGuestMode && (
          <Text style={styles.guestNote}>
            註冊帳號即可保存個人化旅程記錄和獲得成就徽章
          </Text>
        )}
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
  createRecordButton: {
    backgroundColor: '#4299E1',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 30,
    alignItems: 'center',
    minWidth: 200,
  },
  createRecordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  guestNote: {
    color: '#A0AEC0',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
