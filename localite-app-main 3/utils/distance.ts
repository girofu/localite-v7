import { getDistance as geolibGetDistance } from 'geolib';

export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return geolibGetDistance(
    { latitude: lat1, longitude: lng1 },
    { latitude: lat2, longitude: lng2 }
  );
} 