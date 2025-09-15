import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image 
} from 'react-native';

interface NewsProps {
  onBack: () => void;
}

export default function News({ onBack }: NewsProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Image source={require('../assets/icons/icon_left.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>最新消息</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Character Image */}
        <View style={styles.imageContainer}>
          <Image source={require('../assets/scenario/kuron_play.png')} style={styles.characterImage} />
        </View>

        {/* No Content Message */}
        <Text style={styles.noContentText}>目前沒有內容</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    marginBottom: 32,
  },
  characterImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  noContentText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});
