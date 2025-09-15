import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  addJourneyRecord: (record: JourneyRecord) => void;
  deleteJourneyRecord: (id: string) => void;
  getJourneyRecordsByDate: (date: string) => JourneyRecord[];
  hasJourneyRecord: (date: string) => boolean;
  getJourneyRecordById: (id: string) => JourneyRecord | undefined;
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

export const JourneyProvider: React.FC<JourneyProviderProps> = ({ children }) => {
  const [journeyRecords, setJourneyRecords] = useState<JourneyRecord[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const addJourneyRecord = (record: JourneyRecord) => {
    setJourneyRecords(prev => {
      // 檢查是否已存在相同日期和地點的記錄
      const existingIndex = prev.findIndex(r => 
        r.date === record.date && r.placeName === record.placeName
      );
      
      let newRecords;
      if (existingIndex >= 0) {
        // 如果存在相同日期和地點的記錄，則更新該記錄
        // 這樣同一個地點只會顯示一張卡片，但內容會被更新
        newRecords = [...prev];
        newRecords[existingIndex] = record;
      } else {
        // 如果不存在，則新增記錄
        newRecords = [...prev, record];
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
  };

  const deleteJourneyRecord = (id: string) => {
    setJourneyRecords(prev => prev.filter(record => record.id !== id));
  };

  const getJourneyRecordsByDate = (date: string) => {
    return journeyRecords
      .filter(record => record.date === date)
      .sort((a, b) => b.timeRange.start.localeCompare(a.timeRange.start)); // 按開始時間降序排列，新的在前
  };

  const hasJourneyRecord = (date: string) => {
    return journeyRecords.some(record => record.date === date);
  };

  const getJourneyRecordById = (id: string) => {
    return journeyRecords.find(record => record.id === id);
  };

  const value: JourneyContextType = {
    journeyRecords,
    addJourneyRecord,
    deleteJourneyRecord,
    getJourneyRecordsByDate,
    hasJourneyRecord,
    getJourneyRecordById,
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
