'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/store/AuthContext';
import { leadAPI, type DetailAccessGrant, type DetailTargetType } from '@/lib/api/leads';
import {
  captureLocation,
  clearDetailAccess,
  geocodeLocationText,
  getDetailAccessToken,
  saveDetailAccess,
} from '@/lib/utils/detail-access';

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
 * 2. Guest users (not logged in): Must fill out the lead form to view details. Once submitted,
 *    their unlock grant is preserved so they can view the details without interruption.
 */
export function useDetailAccess<T>(
  targetId: number,
  fetchDetail: DetailFetcher<T>,
  targetType: DetailTargetType = 'TRACTOR'
) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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
            clearDetailAccess(targetType, targetId);
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
    [fetchDetail, targetId, targetType]
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
          // Attempt high-accuracy GPS capture (5s timeout)
          let coords = await captureLocation(5000);

          // If GPS is unavailable/denied, fallback to geocoding user's saved city & state
          if (!coords && (user?.villageCity || user?.state)) {
            coords = await geocodeLocationText(user.villageCity || undefined, user.state || undefined);
          }

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
      // Scenario 2: Guest user (not logged in)
      const existingToken = getDetailAccessToken(targetType, targetId);
      if (existingToken) {
        setState({ status: 'loading' });
        load(existingToken).catch(() => {
          clearDetailAccess(targetType, targetId);
          setState({ status: 'locked' });
        });
      } else {
        setState({ status: 'locked' });
      }
    }
  }, [authLoading, isAuthenticated, load, targetId, targetType]);

  const unlock = useCallback(
    (grant: DetailAccessGrant) => {
      saveDetailAccess(grant, targetType, targetId);
      setState({ status: 'loading' });
      load(grant.token);
    },
    [load, targetId, targetType]
  );

  return { state, unlock };
}
