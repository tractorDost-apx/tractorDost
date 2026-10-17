import type { DetailAccessGrant } from '@/lib/api/leads';

/**
 * Access policy:
 * - Logged-in users: Lead is automatically submitted in the background using their
 *   access token. They access all tractor and implement detail pages directly.
 * - Guest users: Must fill out the lead form every time they click a tractor or implement card.
 *
 * Therefore, unauthenticated grants are not stored globally across sessions or cards.
 * Any legacy token in local storage is cleared.
 */
const STORAGE_KEY = 'tractordost:lead-access';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Attempts to capture the user's current GPS coordinates via the Geolocation API.
 * Never blocks submission: resolves with coordinates if granted, or null if denied,
 * unavailable, unsupported, or times out.
 */
export function captureLocation(timeoutMs = 2500): Promise<Coordinates | null> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    let finished = false;

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve(null);
      }
    }, timeoutMs);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!finished) {
            finished = true;
            clearTimeout(timer);
            resolve({
              latitude: Number(position.coords.latitude.toFixed(6)),
              longitude: Number(position.coords.longitude.toFixed(6)),
            });
          }
        },
        (_error) => {
          if (!finished) {
            finished = true;
            clearTimeout(timer);
            resolve(null);
          }
        },
        { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 60000 }
      );
    } catch {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve(null);
      }
    }
  });
}

const STORAGE_PREFIX = 'tractordost:lead-access';

function getStorageKey(targetType?: string, targetId?: number): string {
  if (targetType && targetId) {
    return `${STORAGE_PREFIX}:${targetType}:${targetId}`;
  }
  return STORAGE_PREFIX;
}

export function getDetailAccessToken(targetType?: string, targetId?: number): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const key = getStorageKey(targetType, targetId);
    const raw = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
        clearDetailAccess(targetType, targetId);
        return undefined;
      }
      return parsed.token || raw;
    } catch {
      return raw;
    }
  } catch {
    return undefined;
  }
}

export function saveDetailAccess(grant: DetailAccessGrant, targetType?: string, targetId?: number): void {
  if (typeof window === 'undefined' || !grant?.token) return;
  try {
    const key = getStorageKey(targetType, targetId);
    const value = JSON.stringify(grant);
    window.sessionStorage.setItem(key, value);
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable or quota exceeded
  }
}

export function clearDetailAccess(targetType?: string, targetId?: number): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(targetType, targetId);
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
  } catch {
    // Storage unavailable
  }
}

/** Header that carries a grant to the detail endpoints. Undefined leaves the request unchanged. */
export const detailAccessHeaders = (token?: string) =>
  token ? { 'X-Detail-Access-Token': token } : undefined;
