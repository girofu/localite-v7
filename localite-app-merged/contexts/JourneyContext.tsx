import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { ServiceManager } from '../src/services/ServiceManager';

export interface JourneyRecord {
  id: string;
  date: string; // YYYY-MM-DD format
  title: string;
  placeName: string;
  photos: string[];
  weather: string;
  generatedContent: string;
  timeRange: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

interface JourneyContextType {
  journeyRecords: JourneyRecord[];
  loading: boolean;
  error: string | null;
  addJourneyRecord: (record: JourneyRecord) => Promise<void>;
  deleteJourneyRecord: (id: string) => Promise<void>;
  getJourneyRecordsByDate: (date: string) => JourneyRecord[];
  hasJourneyRecord: (date: string) => boolean;
  getJourneyRecordById: (id: string) => JourneyRecord | undefined;
  refreshJourneyRecords: () => Promise<void>;
  startTime: Date | null;
  setStartTime: (time: Date | null) => void;
  endTime: Date | null;
  setEndTime: (time: Date | null) => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};

interface JourneyProviderProps {
  children: ReactNode;
}

// 將 Firebase journey 資料轉換為 JourneyRecord 格式 (優化版)
const convertFirebaseToJourneyRecord = (firebaseData: any): JourneyRecord => {
  // 安全的日期轉換函數 (簡化版)
  const getSafeDate = (timestamp: any): string => {
    try {
      if (!timestamp) {
        return new Date().toISOString().split('T')[0];
      }

      let dateValue: number;

      if (timestamp.seconds !== undefined) {
        // Firebase Timestamp 格式
        dateValue = timestamp.seconds * 1000;
      } else if (typeof timestamp === 'string' && timestamp.includes('T')) {
        // ISO 字符串格式
        dateValue = new Date(timestamp).getTime();
      } else if (typeof timestamp === 'number') {
        // Unix timestamp
        dateValue = timestamp > 9999999999 ? timestamp : timestamp * 1000;
      } else if (timestamp instanceof Date) {
        // Date 對象
        dateValue = timestamp.getTime();
      } else {
        // 嘗試直接解析
        dateValue = new Date(timestamp).getTime();
      }

      // 檢查日期有效性
      if (isNaN(dateValue) || dateValue < 0 || dateValue > 4102444800000) {
        console.warn('⚠️ Invalid timestamp:', timestamp);
        return new Date().toISOString().split('T')[0];
      }

      return new Date(dateValue).toISOString().split('T')[0];
    } catch (error) {
      console.error('❌ Timestamp conversion error:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  return {
    id: firebaseData.id,
    date: getSafeDate(firebaseData.createdAt),
    title: firebaseData.title || firebaseData.placeName || 'Untitled Journey',
    placeName: firebaseData.placeName || firebaseData.title || 'Unknown Place',
    photos: firebaseData.photos || [],
    weather: firebaseData.weather || 'sun',
    generatedContent: firebaseData.summary || firebaseData.generatedContent || '',
    timeRange: {
      start: firebaseData.timeRange?.start || '09:00',
      end: firebaseData.timeRange?.end || '17:00'
    }
  };
};

// 將 JourneyRecord 轉換為 Firebase 格式
const convertJourneyRecordToFirebase = (journeyRecord: JourneyRecord, userId: string) => {
  return {
    id: journeyRecord.id,
    userId: userId,
    title: journeyRecord.title,
    placeName: journeyRecord.placeName,
    summary: journeyRecord.generatedContent,
    generatedContent: journeyRecord.generatedContent,
    photos: journeyRecord.photos,
    weather: journeyRecord.weather,
    timeRange: {
      start: journeyRecord.timeRange.start,
      end: journeyRecord.timeRange.end
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const JourneyProvider: React.FC<JourneyProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [journeyRecords, setJourneyRecords] = useState<JourneyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const serviceManager = ServiceManager.getInstance();
  const firestoreService = serviceManager.firestoreService;

  // 載入用戶的旅程記錄 (優化版 - 使用 Subcollections)
  const loadJourneyRecords = async (userId: string) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading journey records from subcollection for user:', userId);
      
      // 直接從用戶的子集合查詢，效率更高
      const firebaseJourneys = await firestoreService.getUserJourneyRecords(userId);
      
      console.log(`📊 Loaded ${firebaseJourneys.length} journey records from subcollection`);
      
      const journeyRecords = firebaseJourneys.map(convertFirebaseToJourneyRecord);
      
      // Firestore 已經做好排序，但我們仍然做一次客戶端排序以確保一致性
      const sortedRecords = journeyRecords.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.timeRange.start.localeCompare(a.timeRange.start);
      });
      
      setJourneyRecords(sortedRecords);
      console.log(`✅ Successfully loaded ${sortedRecords.length} journey records`);
    } catch (error: any) {
      console.error('❌ Failed to load journey records:', error);
      setError(error?.message || 'Failed to load journey records');
    } finally {
      setLoading(false);
    }
  };

  // 刷新旅程記錄
  const refreshJourneyRecords = async () => {
    if (user?.uid) {
      await loadJourneyRecords(user.uid);
    }
  };

  // 當用戶狀態變化時載入旅程記錄
  useEffect(() => {
    if (user?.uid) {
      loadJourneyRecords(user.uid);
    } else {
      // 用戶登出時清空記錄
      setJourneyRecords([]);
      setError(null);
    }
  }, [user?.uid]);

  const addJourneyRecord = async (record: JourneyRecord) => {
    if (!user?.uid) {
      throw new Error('User must be logged in to add journey records');
    }

    setLoading(true);
    setError(null);

    try {
      // 保存到 Firebase
      const firebaseData = convertJourneyRecordToFirebase(record, user.uid);
      const journeyId = await firestoreService.saveJourneyRecord(firebaseData);
      
      // 更新本地狀態
      const newRecord = { ...record, id: journeyId };
      setJourneyRecords(prev => {
        // 檢查是否已存在相同日期和地點的記錄
        const existingIndex = prev.findIndex(r => 
          r.date === record.date && r.placeName === record.placeName
        );
        
        let newRecords;
        if (existingIndex >= 0) {
          // 如果存在相同日期和地點的記錄，則更新該記錄
          newRecords = [...prev];
          newRecords[existingIndex] = newRecord;
        } else {
          // 如果不存在，則新增記錄
          newRecords = [...prev, newRecord];
        }
        
        // 按照日期和時間排序，新的旅程排在前面
        return newRecords.sort((a, b) => {
          // 先按日期排序（新的日期在前）
          if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
          }
          // 同一天內按開始時間排序（新的時間在前）
          return b.timeRange.start.localeCompare(a.timeRange.start);
        });
      });

      console.log('Journey record added successfully:', newRecord);
    } catch (error: any) {
      console.error('Failed to add journey record:', error);
      setError(error?.message || 'Failed to add journey record');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteJourneyRecord = async (id: string) => {
    if (!user?.uid) {
      throw new Error('User must be logged in to delete journey records');
    }

    setLoading(true);
    setError(null);

    try {
      // 從 Firebase 刪除
      await firestoreService.deleteJourneyRecord(id, user.uid);
      
      // 更新本地狀態
      setJourneyRecords(prev => prev.filter(record => record.id !== id));
      
      console.log('Journey record deleted successfully:', id);
    } catch (error: any) {
      console.error('Failed to delete journey record:', error);
      setError(error?.message || 'Failed to delete journey record');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getJourneyRecordsByDate = (date: string) => {
    const filtered = journeyRecords
      .filter(record => record.date === date)
      .sort((a, b) => b.timeRange.start.localeCompare(a.timeRange.start));
      
    console.log(`📅 Found ${filtered.length} journey(s) for ${date}`);
    return filtered;
  };

  const hasJourneyRecord = (date: string) => {
    return journeyRecords.some(record => record.date === date);
  };

  const getJourneyRecordById = (id: string) => {
    return journeyRecords.find(record => record.id === id);
  };

  const value: JourneyContextType = {
    journeyRecords,
    loading,
    error,
    addJourneyRecord,
    deleteJourneyRecord,
    getJourneyRecordsByDate,
    hasJourneyRecord,
    getJourneyRecordById,
    refreshJourneyRecords,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
  };

  return (
    <JourneyContext.Provider value={value}>
      {children}
    </JourneyContext.Provider>
  );
};
