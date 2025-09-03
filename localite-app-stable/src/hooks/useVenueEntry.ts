/**
 * 場域進入鉤子
 *
 * 提供統一的場域進入體驗
 */

import { useState, useEffect } from 'react';
import { VenueEntryService, VenueEntryData, VenueEntryState } from '../services/VenueEntryService';

const venueEntryService = new VenueEntryService();

export const useVenueEntry = () => {
  const [state, setState] = useState<VenueEntryState>(venueEntryService.getState());

  useEffect(() => {
    const unsubscribe = venueEntryService.subscribe(setState);
    return unsubscribe;
  }, []);

  const enterVenueByGPS = async (venueId: string, userLocation: { lat: number; lng: number }) => {
    return venueEntryService.enterVenueByGPS(venueId, userLocation);
  };

  const enterVenueByQR = async (qrData: string) => {
    return venueEntryService.enterVenueByQR(qrData);
  };

  const enterVenueDirect = async (venueId: string) => {
    return venueEntryService.enterVenueDirect(venueId);
  };

  const clearCurrentVenue = () => {
    venueEntryService.clearCurrentVenue();
  };

  const clearHistory = () => {
    venueEntryService.clearHistory();
  };

  const getRecentVenues = (limit?: number) => {
    return venueEntryService.getRecentVenues(limit);
  };

  return {
    // 狀態
    currentVenue: state.currentVenue,
    entryHistory: state.entryHistory,
    isLoading: state.isLoading,
    error: state.error,

    // 方法
    enterVenueByGPS,
    enterVenueByQR,
    enterVenueDirect,
    clearCurrentVenue,
    clearHistory,
    getRecentVenues,
  };
};
