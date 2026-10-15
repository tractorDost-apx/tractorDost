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

export function getDetailAccessToken(): string | undefined {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable or disabled
    }
  }
  return undefined;
}

export function saveDetailAccess(_grant: DetailAccessGrant): void {
  // Grants are not saved to localStorage so every subsequent card click requires the lead form for guests.
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable or disabled
    }
  }
}

export function clearDetailAccess(): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing stored to clear
    }
  }
}

/** Header that carries a grant to the detail endpoints. Undefined leaves the request unchanged. */
export const detailAccessHeaders = (token?: string) =>
  token ? { 'X-Detail-Access-Token': token } : undefined;
