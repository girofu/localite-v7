/**
 * 統一場域進入服務
 *
 * 提供統一的場域進入體驗，支援 GPS 地圖和 QR 掃描兩種方式
 * 確保資訊同步和一致的用戶體驗
 */

export interface VenueEntryData {
  id: string;
  name: string;
  description: string;
  image: any;
  lat: number;
  lng: number;
  entryMethod: 'gps' | 'qr' | 'direct';
  entryTimestamp: Date;
  distance?: number;
  qrData?: string;
}

export interface VenueEntryState {
  currentVenue: VenueEntryData | null;
  entryHistory: VenueEntryData[];
  isLoading: boolean;
  error: string | null;
}

export class VenueEntryService {
  private state: VenueEntryState = {
    currentVenue: null,
    entryHistory: [],
    isLoading: false,
    error: null,
  };

  private listeners: ((state: VenueEntryState) => void)[] = [];

  /**
   * 訂閱狀態變化
   */
  subscribe(listener: (state: VenueEntryState) => void): () => void {
    this.listeners.push(listener);

    // 返回取消訂閱函數
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有監聽器狀態變化
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * 通過 GPS 進入場域
   */
  async enterVenueByGPS(venueId: string, userLocation: { lat: number; lng: number }): Promise<VenueEntryData> {
    this.setLoading(true);
    this.setError(null);

    try {
      // 模擬從資料庫獲取場域資訊
      const venueData = await this.fetchVenueData(venueId);

      // 計算距離
      const distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        venueData.lat,
        venueData.lng
      );

      const entryData: VenueEntryData = {
        ...venueData,
        entryMethod: 'gps',
        entryTimestamp: new Date(),
        distance,
      };

      this.setCurrentVenue(entryData);
      this.addToHistory(entryData);

      return entryData;
    } catch (error) {
      this.setError('無法進入場域，請稍後再試');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 通過 QR 掃描進入場域
   */
  async enterVenueByQR(qrData: string): Promise<VenueEntryData> {
    this.setLoading(true);
    this.setError(null);

    try {
      // 解析 QR 碼數據
      const venueId = this.parseQRData(qrData);

      // 獲取場域資訊
      const venueData = await this.fetchVenueData(venueId);

      const entryData: VenueEntryData = {
        ...venueData,
        entryMethod: 'qr',
        entryTimestamp: new Date(),
        qrData,
      };

      this.setCurrentVenue(entryData);
      this.addToHistory(entryData);

      return entryData;
    } catch (error) {
      this.setError('無效的 QR 碼，請確認掃描正確的場域條碼');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 直接進入場域（用於測試或其他入口）
   */
  async enterVenueDirect(venueId: string): Promise<VenueEntryData> {
    this.setLoading(true);
    this.setError(null);

    try {
      const venueData = await this.fetchVenueData(venueId);

      const entryData: VenueEntryData = {
        ...venueData,
        entryMethod: 'direct',
        entryTimestamp: new Date(),
      };

      this.setCurrentVenue(entryData);
      this.addToHistory(entryData);

      return entryData;
    } catch (error) {
      this.setError('無法進入場域，請稍後再試');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 獲取當前場域
   */
  getCurrentVenue(): VenueEntryData | null {
    return this.state.currentVenue;
  }

  /**
   * 獲取進入歷史
   */
  getEntryHistory(): VenueEntryData[] {
    return [...this.state.entryHistory];
  }

  /**
   * 清除當前場域
   */
  clearCurrentVenue(): void {
    this.state.currentVenue = null;
    this.notifyListeners();
  }

  /**
   * 清除歷史記錄
   */
  clearHistory(): void {
    this.state.entryHistory = [];
    this.notifyListeners();
  }

  /**
   * 獲取最近訪問的場域
   */
  getRecentVenues(limit: number = 5): VenueEntryData[] {
    return this.state.entryHistory.slice(-limit).reverse();
  }

  // ====================
  // 私有方法
  // ====================

  private setLoading(loading: boolean): void {
    this.state.isLoading = loading;
    this.notifyListeners();
  }

  private setError(error: string | null): void {
    this.state.error = error;
    this.notifyListeners();
  }

  private setCurrentVenue(venue: VenueEntryData): void {
    this.state.currentVenue = venue;
    this.notifyListeners();
  }

  private addToHistory(venue: VenueEntryData): void {
    // 避免重複添加相同的場域
    const existingIndex = this.state.entryHistory.findIndex(v => v.id === venue.id);
    if (existingIndex > -1) {
      this.state.entryHistory.splice(existingIndex, 1);
    }

    this.state.entryHistory.push(venue);

    // 限制歷史記錄數量
    if (this.state.entryHistory.length > 10) {
      this.state.entryHistory.shift();
    }

    this.notifyListeners();
  }

  /**
   * 模擬從資料庫獲取場域資料
   */
  private async fetchVenueData(venueId: string): Promise<Omit<VenueEntryData, 'entryMethod' | 'entryTimestamp' | 'distance' | 'qrData'>> {
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 500));

    // 這裡應該從實際的資料來源獲取資料
    // 目前使用模擬資料
    const mockVenues: Record<string, any> = {
      'shinfang': {
        id: 'shinfang',
        name: '新芳里',
        description: '充滿歷史文化的新芳里，帶您探索當地特色景點',
        image: require('../../assets/places/shinfang.jpg'),
        lat: 24.9934,
        lng: 121.4474,
      },
      'xiahai': {
        id: 'xiahai',
        name: '霞海城隍廟',
        description: '歷史悠久的城隍廟，見證地方信仰文化',
        image: require('../../assets/places/xiahai.png'),
        lat: 24.9956,
        lng: 121.4498,
      },
    };

    const venue = mockVenues[venueId];
    if (!venue) {
      throw new Error(`場域 ${venueId} 不存在`);
    }

    return venue;
  }

  /**
   * 解析 QR 碼數據
   */
  private parseQRData(qrData: string): string {
    // 簡單的 QR 碼解析邏輯
    // 實際應用中可能需要更複雜的解析邏輯
    if (qrData.startsWith('localite://venue/')) {
      return qrData.replace('localite://venue/', '');
    }

    // 如果是純場域 ID
    if (qrData.length > 0) {
      return qrData;
    }

    throw new Error('無效的 QR 碼格式');
  }

  /**
   * 計算兩點間距離（公里）
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 地球半徑（公里）
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance * 1000; // 轉換為公尺
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 獲取當前狀態
   */
  getState(): VenueEntryState {
    return { ...this.state };
  }
}
