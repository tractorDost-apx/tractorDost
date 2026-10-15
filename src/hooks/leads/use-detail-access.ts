'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/store/AuthContext';
import { leadAPI, type DetailAccessGrant, type DetailTargetType } from '@/lib/api/leads';
import { captureLocation, clearDetailAccess } from '@/lib/utils/detail-access';

export type DetailAccessState<T> =
  | { status: 'loading' }
  | { status: 'granted'; data: T }
  | { status: 'locked' }
  | { status: 'unavailable' }
  | { status: 'error' };

type DetailFetcher<T> = (id: number, detailAccessToken?: string) => Promise<{ success: boolean; data: T }>;

/**
 * Loads a detail page through the API:
 * 1. Logged-in users: Automatically submit the lead information in the background using their
 *    existing access token. Location (latitude & longitude) is captured non-blockingly via
 *    the Geolocation API. Lead form is never displayed. Details unlock directly after submission.
 * 2. Guest users (not logged in): Must fill out the lead form modal every time they click a
 *    tractor or implement card to view its details.
 */
export function useDetailAccess<T>(
  targetId: number,
  fetchDetail: DetailFetcher<T>,
  targetType: DetailTargetType = 'TRACTOR'
) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<DetailAccessState<T>>({ status: 'loading' });
  const requestRef = useRef(0);
  const autoSubmittedRef = useRef<number | null>(null);

  const load = useCallback(
    (token?: string) => {
      const requestId = ++requestRef.current;
      return fetchDetail(targetId, token).then(
        (res) => {
          if (requestId === requestRef.current) setState({ status: 'granted', data: res.data });
          return res;
        },
        (error: unknown) => {
          if (requestId !== requestRef.current) return;
          const status = axios.isAxiosError(error) ? error.response?.status : undefined;
          if (status === 401 || status === 403) {
            clearDetailAccess();
            setState({ status: 'locked' });
          } else if (status === 404) {
            setState({ status: 'unavailable' });
          } else {
            setState({ status: 'error' });
          }
          throw error;
        }
      );
    },
    [fetchDetail, targetId]
  );

  useEffect(() => {
    if (authLoading) {
      setState({ status: 'loading' });
      return;
    }

    if (isAuthenticated) {
      // Scenario 1: Logged-in user -> background lead submission via existing accessToken
      if (autoSubmittedRef.current === targetId) return;
      autoSubmittedRef.current = targetId;

      setState({ status: 'loading' });

      (async () => {
        let grantToken: string | undefined;
        try {
          // Attempt non-blocking GPS capture (2s timeout, never mandatory)
          const coords = await captureLocation(2000);
          const payload: any = {
            targetType,
            targetId,
          };
          if (coords?.latitude !== undefined && coords?.longitude !== undefined) {
            payload.latitude = coords.latitude;
            payload.longitude = coords.longitude;
          }

          // Automatically submit lead with user's access token
          const res = await leadAPI.createDetailAccessLead(payload);
          grantToken = res.data?.detailAccess?.token;
        } catch (err) {
          console.warn('Background lead capture completed with fallback:', err);
        }

        // Redirect / display details directly
        load(grantToken).catch(() => {});
      })();
    } else {
      // Scenario 2: Guest user -> locked, lead form modal required
      setState({ status: 'locked' });
    }
  }, [authLoading, isAuthenticated, load, targetId, targetType]);

  const unlock = useCallback(
    (grant: DetailAccessGrant) => {
      setState({ status: 'loading' });
      load(grant.token);
    },
    [load]
  );

  return { state, unlock };
}
