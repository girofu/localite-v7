import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image
} from 'react-native';

interface LearningSheetScreenProps {
  onClose: () => void;
  onNavigate: (screen: 'home' | 'guide' | 'qr' | 'map' | 'mapLocation' | 'placeIntro' | 'guideSelect' | 'chat' | 'learningSheet' | 'journeyDetail' | 'journeyMain' | 'journeyGen' | 'learningSheetsList' | 'badge' | 'aboutLocalite' | 'miniCardPreview' | 'buttonOptionPreview' | 'buttonCameraPreview' | 'exhibitCardPreview' | 'login' | 'signup' | 'chatEnd' | 'drawerNavigation') => void;
}

export default function LearningSheetScreen({ onClose, onNavigate }: LearningSheetScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => onNavigate('drawerNavigation')}>
          <Image source={require('../assets/icons/icon_menu.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Image source={require('../assets/icons/icon_angle-left.png')} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <View style={styles.dashedBox}>
          <Text style={styles.noLearningSheetsText}>目前尚無學習記錄</Text>
        </View>
        
        {/* Call to Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => onNavigate('guide')}
          >
            <Text style={styles.exploreButtonText}>探索更多地點</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F', // 深灰色背景
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 24,
  },
  dashedBox: {
    width: '100%',
    height: 180,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noLearningSheetsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    width: '100%',
  },
  exploreButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
