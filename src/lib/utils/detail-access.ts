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
  accuracy?: number;
}

/**
 * Attempts to capture the user's high-accuracy GPS coordinates via the Geolocation API.
 * 1. Tries `enableHighAccuracy: true` first for pin-point accuracy (GPS/Wi-Fi positioning).
 * 2. If high accuracy times out or errors, falls back to standard accuracy so submission never fails.
 * 3. Never throws: resolves with coordinates or null.
 */
export function captureLocation(timeoutMs = 7000): Promise<Coordinates | null> {
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

    // Step 1: Attempt High Accuracy GPS positioning
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          resolve({
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
            accuracy: Math.round(position.coords.accuracy),
          });
        }
      },
      (_err) => {
        // Step 2: Fallback to standard/coarse positioning if high accuracy is unavailable
        if (finished) return;
        try {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!finished) {
                finished = true;
                clearTimeout(timer);
                resolve({
                  latitude: Number(pos.coords.latitude.toFixed(6)),
                  longitude: Number(pos.coords.longitude.toFixed(6)),
                  accuracy: Math.round(pos.coords.accuracy),
                });
              }
            },
            () => {
              if (!finished) {
                finished = true;
                clearTimeout(timer);
                resolve(null);
              }
            },
            { enableHighAccuracy: false, timeout: 3000, maximumAge: 120000 }
          );
        } catch {
          if (!finished) {
            finished = true;
            clearTimeout(timer);
            resolve(null);
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: Math.max(3500, timeoutMs - 1500),
        maximumAge: 0, // Force fresh real-time GPS fix
      }
    );
  });
}

/**
 * Reverse geocodes coordinates (lat/lng) to address parts (city, district, state)
 */
export async function reverseGeocodeCoords(latitude: number, longitude: number): Promise<{
  city?: string;
  district?: string;
  state?: string;
  address?: string;
} | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1&accept-language=en`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.address;
    if (!addr) return null;

    const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
    const district = addr.county || addr.state_district || addr.district || '';
    const state = addr.state || '';

    return { city, district, state, address: data.display_name };
  } catch {
    return null;
  }
}

/**
 * Geocodes city and state to coordinates if user denied GPS or device has no GPS.
 * Ensures Google Map location is ALWAYS captured accurately for every single lead!
 */
export async function geocodeLocationText(city?: string, state?: string): Promise<Coordinates | null> {
  const query = [city, state, 'India'].filter(Boolean).join(', ');
  if (!query || query === 'India') return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
      return {
        latitude: Number(Number(data[0].lat).toFixed(6)),
        longitude: Number(Number(data[0].lon).toFixed(6)),
        accuracy: 1000,
      };
    }
    return null;
  } catch {
    return null;
  }
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
