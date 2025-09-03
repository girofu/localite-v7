import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MerchantStackParamList } from '../../types/navigation.types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import { FirestoreService } from '../../services/FirestoreService';
import { Place, Merchant } from '../../types/firestore.types';

const firestoreService = new FirestoreService();

interface DashboardStats {
  totalPlaces: number;
  activePlaces: number;
  totalViews: number;
  averageRating: number;
}

export default function MerchantDashboardScreen() {
  const navigation = useNavigation<StackNavigationProp<MerchantStackParamList>>();
  const { user } = useAuth();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPlaces: 0,
    activePlaces: 0,
    totalViews: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMerchantData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // 載入商戶基本資料
      const merchantData = await firestoreService.getMerchantById(user.uid);
      if (!merchantData) {
        Alert.alert('錯誤', '找不到商戶資料，請重新註冊', [
          {
            text: '前往註冊',
            onPress: () => navigation.navigate('MerchantRegister'),
          },
        ]);
        return;
      }
      
      setMerchant(merchantData);

      // 載入商戶的地點資料
      const placesData = await firestoreService.getMerchantPlaces(user.uid);
      setPlaces(placesData);

      // 計算統計數據
      const activePlaces = placesData.filter(place => place.isActive && place.isPublic);
      const totalViews = merchantData.stats?.totalViews || 0;
      const averageRating = merchantData.stats?.averageRating || 0;

      setStats({
        totalPlaces: placesData.length,
        activePlaces: activePlaces.length,
        totalViews,
        averageRating,
      });
    } catch (error) {
      console.error('Error loading merchant data:', error);
      Alert.alert('載入失敗', '請檢查網路連線並重試');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMerchantData();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMerchantData();
    }, [user])
  );

  const handleAddPlace = () => {
    navigation.navigate('AddPlace');
  };

  const handleEditPlace = (place: Place) => {
    navigation.navigate('EditPlace', { placeId: place.id });
  };

  const handleDeletePlace = (place: Place) => {
    Alert.alert(
      '刪除地點',
      `確定要刪除「${place.name}」嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user) {
                await firestoreService.deleteMerchantPlace(place.id, user.uid);
                await loadMerchantData(); // 重新載入資料
                Alert.alert('成功', '地點已刪除');
              }
            } catch (error) {
              console.error('Error deleting place:', error);
              Alert.alert('刪除失敗', '請稍後再試');
            }
          },
        },
      ]
    );
  };

  const renderPlace = ({ item }: { item: Place }) => (
    <View style={styles.placeCard}>
      <View style={styles.placeHeader}>
        <Text style={styles.placeName}>{item.name}</Text>
        <View style={styles.placeStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.isActive && item.isPublic ? '#4CAF50' : '#FF9800' }
            ]}
          />
          <Text style={styles.statusText}>
            {item.isActive && item.isPublic ? '公開' : '未公開'}
          </Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.placeDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.placeMeta}>
        <Text style={styles.placeCategory}>{item.category}</Text>
        <Text style={styles.placeDate}>
          {new Date(item.updatedAt).toLocaleDateString('zh-TW')}
        </Text>
      </View>

      <View style={styles.placeActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditPlace(item)}
        >
          <Text style={styles.editButtonText}>編輯</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePlace(item)}
        >
          <Text style={styles.deleteButtonText}>刪除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  if (!merchant) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>無法載入商戶資料</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 商戶資訊卡片 */}
      <View style={styles.merchantCard}>
        <View style={styles.merchantHeader}>
          <Text style={styles.merchantName}>{merchant.businessName}</Text>
          <View style={styles.verificationBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: merchant.isVerified ? '#4CAF50' : '#FF9800' }
              ]}
            />
            <Text style={styles.verificationText}>
              {merchant.isVerified ? '已驗證' : '待驗證'}
            </Text>
          </View>
        </View>
        
        {merchant.businessDescription && (
          <Text style={styles.merchantDescription}>{merchant.businessDescription}</Text>
        )}
      </View>

      {/* 統計卡片 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalPlaces}</Text>
          <Text style={styles.statLabel}>總地點數</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activePlaces}</Text>
          <Text style={styles.statLabel}>已發布</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalViews}</Text>
          <Text style={styles.statLabel}>總瀏覽</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>平均評分</Text>
        </View>
      </View>

      {/* 地點列表 */}
      <View style={styles.placesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>我的地點</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPlace}>
            <Text style={styles.addButtonText}>+ 新增地點</Text>
          </TouchableOpacity>
        </View>

        {places.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>尚未建立任何地點</Text>
            <Text style={styles.emptyStateSubtext}>開始新增地點來推廣您的業務</Text>
          </View>
        ) : (
          <FlatList
            data={places}
            keyExtractor={(item) => item.id}
            renderItem={renderPlace}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  merchantCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  merchantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  merchantDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  placesSection: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  placeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  placeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  placeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  placeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  placeCategory: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  placeDate: {
    fontSize: 12,
    color: '#999',
  },
  placeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
