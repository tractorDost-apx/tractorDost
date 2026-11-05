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
import { getCapturedLeadAttribution } from '@/lib/utils/lead-attribution';

export type DetailAccessState<T> =
  | { status: 'loading' }
  | { status: 'granted'; data: T }
  | { status: 'locked' }
  | { status: 'unavailable' }
  | { status: 'error' };

type DetailFetcher<T> = (id: number, detailAccessToken?: string) => Promise<{ success: boolean; data: T }>;

function getOrCreateGuestMobile(): string {
  if (typeof window === 'undefined') return '9823456789';
  try {
    let mobile = window.localStorage.getItem('tractordost:guest-mobile');
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      mobile = '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
      window.localStorage.setItem('tractordost:guest-mobile', mobile);
    }
    return mobile;
  } catch {
    return '9823456789';
  }
}

/**
 * Loads a detail page through the API:
 * 1. Logged-in users: Automatically submit the lead information in the background using their
 *    existing access token. Location (latitude & longitude) is captured non-blockingly via
 *    the Geolocation API. Lead form is never displayed. Details unlock directly after submission.
 * 2. Guest users (not logged in): Seamlessly auto-granted detail access in the background.
 *    No modal form is ever displayed. Complete specs and info are displayed directly.
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
    (token?: string, markError = true) => {
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
            if (markError) setState({ status: 'error' });
          } else if (status === 404) {
            setState({ status: 'unavailable' });
          } else if (markError) {
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

    const numericId = Number(targetId);
    if (!numericId || isNaN(numericId) || numericId <= 0) {
      setState({ status: 'unavailable' });
      return;
    }

    if (autoSubmittedRef.current === numericId) return;
    autoSubmittedRef.current = numericId;

    if (isAuthenticated) {
      // Scenario 1: Logged-in user -> background lead submission via existing accessToken
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

          const attribution = getCapturedLeadAttribution({
            pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
            defaultPageLabel: targetType === 'TRACTOR' ? 'Tractor Detail Page' : 'Implement Detail Page',
            defaultCampaign: 'Detail Access (Auto-grant)',
          });

          const payload: any = {
            targetType,
            targetId: numericId,
            tractorId: targetType === 'TRACTOR' ? numericId : undefined,
            implmentId: targetType === 'IMPLEMENT' ? numericId : undefined,
            sourcePage: attribution.sourcePage,
            sourceCampaign: attribution.sourceCampaign,
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
      // Scenario 2: Guest user (not logged in) -> Auto-grant directly without showing any gate form
      (async () => {
        const existingToken = getDetailAccessToken(targetType, numericId);
        if (existingToken) {
          try {
            await load(existingToken, false);
            return;
          } catch {
            clearDetailAccess(targetType, numericId);
          }
        }

        try {
          const guestMobile = getOrCreateGuestMobile();
          const attribution = getCapturedLeadAttribution({
            pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
            defaultPageLabel: targetType === 'TRACTOR' ? 'Tractor Detail Page' : 'Implement Detail Page',
            defaultCampaign: 'Direct Access (Auto-grant)',
          });

          const payload: any = {
            targetType,
            targetId: numericId,
            tractorId: targetType === 'TRACTOR' ? numericId : undefined,
            implmentId: targetType === 'IMPLEMENT' ? numericId : undefined,
            name: 'Guest Farmer',
            mobile: guestMobile,
            state: 'Maharashtra',
            city: 'Pune',
            sourcePage: attribution.sourcePage,
            sourceCampaign: attribution.sourceCampaign,
          };

          const res = await leadAPI.createDetailAccessLead(payload);
          const grant = res.data?.detailAccess;
          if (grant?.token) {
            saveDetailAccess(grant, targetType, numericId);
            await load(grant.token, true);
            return;
          }
        } catch (err) {
          console.warn('Auto detail access request failed:', err);
        }

        load().catch(() => {});
      })();
    }
  }, [authLoading, isAuthenticated, load, targetId, targetType, user]);

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
