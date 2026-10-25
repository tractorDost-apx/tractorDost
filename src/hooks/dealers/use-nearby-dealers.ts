'use client';

import { useState, useEffect } from 'react';
import { dealerAPI, Dealer } from '@/lib/api/dealers';
import { calculateHaversineDistance, Coordinates } from '@/lib/utils/geo';

export interface DealerWithDistance extends Dealer {
  distanceKm?: number;
}

export function useNearbyDealers(userCoords?: Coordinates | null, maxDistanceKm = 100) {
  const [dealers, setDealers] = useState<DealerWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNearby() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await dealerAPI.getAllDealers({ limit: 50, isActive: true });
        if (res.success && res.data) {
          const list: DealerWithDistance[] = res.data.dealers || res.data.data || [];

          if (userCoords?.latitude && userCoords?.longitude) {
            const mapped = list
              .map((d) => {
                if (d.latitude && d.longitude) {
                  const dist = calculateHaversineDistance(userCoords, {
                    latitude: Number(d.latitude),
                    longitude: Number(d.longitude),
                  });
                  return { ...d, distanceKm: dist };
                }
                return { ...d, distanceKm: undefined };
              })
              .filter((d) => d.distanceKm === undefined || d.distanceKm <= maxDistanceKm)
              .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

            setDealers(mapped);
          } else {
            setDealers(list);
          }
        } else {
          setError(res.message || 'Failed to load nearby dealers');
        }
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to fetch nearby dealers');
      } finally {
        setIsLoading(false);
      }
    }

    fetchNearby();
  }, [userCoords?.latitude, userCoords?.longitude, maxDistanceKm]);

  return { dealers, isLoading, error };
}
