import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ButtonOption from '../components/button_option';

export default function ButtonOptionPreviewScreen({ onClose }: { onClose: () => void }) {
  const handleButtonPress = (action: string) => {
    console.log('按鈕被點擊:', action);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={onClose}>
          <Text style={styles.headerIconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ButtonOption 預覽</Text>
        <View style={styles.headerIcon} />
      </View>

      {/* 預覽內容 */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>ButtonOption 元件預覽</Text>
        
        {/* 基本按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>基本按鈕</Text>
          <View style={styles.buttonContainer}>
            <ButtonOption 
              title="製作學習單"
              onPress={() => handleButtonPress('製作學習單')}
            />
            <ButtonOption 
              title="繼續導覽"
              onPress={() => handleButtonPress('繼續導覽')}
            />
            <ButtonOption 
              title="直接結束導覽"
              onPress={() => handleButtonPress('直接結束導覽')}
            />
          </View>
        </View>

        {/* 自訂樣式按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>自訂樣式按鈕</Text>
          <View style={styles.buttonContainer}>
            <ButtonOption 
              title="主要按鈕"
              onPress={() => handleButtonPress('主要按鈕')}
              containerStyle={styles.primaryButton}
              textStyle={styles.primaryText}
            />
            <ButtonOption 
              title="次要按鈕"
              onPress={() => handleButtonPress('次要按鈕')}
              containerStyle={styles.secondaryButton}
              textStyle={styles.secondaryText}
            />
            <ButtonOption 
              title="危險按鈕"
              onPress={() => handleButtonPress('危險按鈕')}
              containerStyle={styles.dangerButton}
              textStyle={styles.dangerText}
            />
          </View>
        </View>

        {/* 禁用狀態按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>禁用狀態按鈕</Text>
          <View style={styles.buttonContainer}>
            <ButtonOption 
              title="禁用按鈕"
              onPress={() => handleButtonPress('禁用按鈕')}
              disabled={true}
            />
            <ButtonOption 
              title="正常按鈕"
              onPress={() => handleButtonPress('正常按鈕')}
            />
          </View>
        </View>

        {/* 聊天氣泡中的按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>聊天氣泡中的按鈕</Text>
          <View style={styles.chatBubble}>
            <Text style={styles.chatText}>
              你想要結束導覽了嗎？是否要：
            </Text>
            <ButtonOption 
              title="製作學習單"
              onPress={() => handleButtonPress('製作學習單')}
            />
            <ButtonOption 
              title="繼續導覽"
              onPress={() => handleButtonPress('繼續導覽')}
            />
            <ButtonOption 
              title="直接結束導覽"
              onPress={() => handleButtonPress('直接結束導覽')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    gap: 12,
  },
  chatBubble: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginTop: 8,
    padding: 16,
  },
  chatText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  container: {
    backgroundColor: '#232323',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  dangerButton: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  dangerText: {
    color: '#fff',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  headerIcon: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerIconText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  primaryButton: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  secondaryText: {
    color: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
}); 