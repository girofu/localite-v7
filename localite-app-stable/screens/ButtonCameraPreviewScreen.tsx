import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ButtonCamera from '../components/button_camera';

export default function ButtonCameraPreviewScreen({ onClose }: { onClose: () => void }) {
  const handleButtonPress = (action: string) => {
    console.log('相機按鈕被點擊:', action);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={onClose}>
          <Text style={styles.headerIconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ButtonCamera 預覽</Text>
        <View style={styles.headerIcon} />
      </View>

      {/* 預覽內容 */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>ButtonCamera 元件預覽</Text>
        
        {/* 基本相機按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>基本相機按鈕</Text>
          <View style={styles.buttonContainer}>
            <ButtonCamera 
              title="拍下照片"
              onPress={() => handleButtonPress('拍下照片')}
            />
            <ButtonCamera 
              title="拍攝照片"
              onPress={() => handleButtonPress('拍攝照片')}
            />
            <ButtonCamera 
              title="拍照"
              onPress={() => handleButtonPress('拍照')}
            />
          </View>
        </View>

        {/* 自訂樣式相機按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>自訂樣式相機按鈕</Text>
          <View style={styles.buttonContainer}>
            <ButtonCamera 
              title="主要拍照"
              onPress={() => handleButtonPress('主要拍照')}
              containerStyle={styles.primaryButton}
              textStyle={styles.primaryText}
              iconStyle={styles.primaryIcon}
            />
            <ButtonCamera 
              title="次要拍照"
              onPress={() => handleButtonPress('次要拍照')}
              containerStyle={styles.secondaryButton}
              textStyle={styles.secondaryText}
              iconStyle={styles.secondaryIcon}
            />
            <ButtonCamera 
              title="緊急拍照"
              onPress={() => handleButtonPress('緊急拍照')}
              containerStyle={styles.emergencyButton}
              textStyle={styles.emergencyText}
              iconStyle={styles.emergencyIcon}
            />
          </View>
        </View>

        {/* 禁用狀態相機按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>禁用狀態相機按鈕</Text>
          <View style={styles.buttonContainer}>
            <ButtonCamera 
              title="禁用拍照"
              onPress={() => handleButtonPress('禁用拍照')}
              disabled={true}
            />
            <ButtonCamera 
              title="正常拍照"
              onPress={() => handleButtonPress('正常拍照')}
            />
          </View>
        </View>

        {/* 聊天氣泡中的相機按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>聊天氣泡中的相機按鈕</Text>
          <View style={styles.chatBubble}>
            <Text style={styles.chatText}>
              請拍下你在新芳春茶行最喜愛的照片一張!
            </Text>
            <ButtonCamera 
              title="拍下照片"
              onPress={() => handleButtonPress('拍下照片')}
            />
          </View>
        </View>

        {/* 不同圖示大小的相機按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>不同圖示大小的相機按鈕</Text>
          <View style={styles.buttonContainer}>
            <ButtonCamera 
              title="小圖示"
              onPress={() => handleButtonPress('小圖示')}
              iconStyle={styles.smallIcon}
            />
            <ButtonCamera 
              title="中圖示"
              onPress={() => handleButtonPress('中圖示')}
              iconStyle={styles.mediumIcon}
            />
            <ButtonCamera 
              title="大圖示"
              onPress={() => handleButtonPress('大圖示')}
              iconStyle={styles.largeIcon}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#232323',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
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
  buttonContainer: {
    gap: 12,
  },
  chatBubble: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  chatText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  primaryText: {
    color: '#fff',
  },
  primaryIcon: {
    tintColor: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  secondaryText: {
    color: '#fff',
  },
  secondaryIcon: {
    tintColor: '#fff',
  },
  emergencyButton: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  emergencyText: {
    color: '#fff',
  },
  emergencyIcon: {
    tintColor: '#fff',
  },
  smallIcon: {
    width: 16,
    height: 16,
  },
  mediumIcon: {
    width: 24,
    height: 24,
  },
  largeIcon: {
    width: 28,
    height: 28,
  },
}); 