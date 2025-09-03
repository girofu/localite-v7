/**
 * 場域進入上下文
 *
 * 提供應用級別的場域進入狀態管理
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useVenueEntry } from '../hooks/useVenueEntry';
import { VenueEntryData } from '../services/VenueEntryService';

interface VenueEntryContextType {
  // 狀態
  currentVenue: VenueEntryData | null;
  entryHistory: VenueEntryData[];
  isLoading: boolean;
  error: string | null;

  // 方法
  enterVenueByGPS: (venueId: string, userLocation: { lat: number; lng: number }) => Promise<VenueEntryData>;
  enterVenueByQR: (qrData: string) => Promise<VenueEntryData>;
  enterVenueDirect: (venueId: string) => Promise<VenueEntryData>;
  clearCurrentVenue: () => void;
  clearHistory: () => void;
  getRecentVenues: (limit?: number) => VenueEntryData[];
}

const VenueEntryContext = createContext<VenueEntryContextType | undefined>(undefined);

interface VenueEntryProviderProps {
  children: ReactNode;
}

export const VenueEntryProvider: React.FC<VenueEntryProviderProps> = ({ children }) => {
  const venueEntry = useVenueEntry();

  const value: VenueEntryContextType = {
    ...venueEntry,
  };

  return (
    <VenueEntryContext.Provider value={value}>
      {children}
    </VenueEntryContext.Provider>
  );
};

export const useVenueEntryContext = (): VenueEntryContextType => {
  const context = useContext(VenueEntryContext);
  if (context === undefined) {
    throw new Error('useVenueEntryContext must be used within a VenueEntryProvider');
  }
  return context;
};
