'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Wrench,
  Building2,
  MapPin,
  Phone,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Truck,
  Zap,
  Star,
  ShieldCheck,
  Send,
  X,
  ExternalLink,
  Sparkles,
  Navigation,
  LocateFixed,
  Crosshair,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { MyReviewAction } from '@/components/reviews/my-review-action';
import { ReviewList } from '@/components/reviews/review-list';
import { serviceCenterAPI, NearbyServiceCenter } from '@/lib/api/serviceCenters';
import { serviceBookingAPI, ServiceBookingItem, CreateServiceBookingPayload } from '@/lib/api/serviceBookings';
import { dealerAPI, Dealer } from '@/lib/api/dealers';
import { formatDate, formatDateTime } from '@/lib/utils/format-date';

const SERVICE_TYPE_OPTIONS = [
  { value: 'general_maintenance', label: 'General Maintenance & Inspection' },
  { value: 'oil_change', label: 'Oil & Filter Change' },
  { value: 'engine_overhaul', label: 'Engine Overhaul & Repair' },
  { value: 'hydraulics_repair', label: 'Hydraulics & Lift Repair' },
  { value: 'transmission_repair', label: 'Transmission & Clutch Service' },
  { value: 'electrical', label: 'Electrical, Starter & Battery' },
  { value: 'tyre_fitting', label: 'Tyre Fitting & Alignment' },
  { value: 'body_work', label: 'Body Work & Paint Repair' },
  { value: 'spare_parts', label: 'Genuine Spare Parts Replacement' },
];

const STORAGE_LOCATION_KEY = 'tractordost:user_location';

export const POPULAR_DISTRICTS = [
  { name: 'Pune', lat: 18.5204, lng: 73.8567, district: 'Pune', state: 'Maharashtra' },
  { name: 'Nashik', lat: 19.9975, lng: 73.7898, district: 'Nashik', state: 'Maharashtra' },
  { name: 'Ahmednagar', lat: 19.0952, lng: 74.7496, district: 'Ahmednagar', state: 'Maharashtra' },
  { name: 'Kolhapur', lat: 16.7050, lng: 74.2433, district: 'Kolhapur', state: 'Maharashtra' },
  { name: 'Chh. Sambhajinagar', lat: 19.8762, lng: 75.3433, district: 'Aurangabad', state: 'Maharashtra' },
  { name: 'Satara', lat: 17.6805, lng: 73.9997, district: 'Satara', state: 'Maharashtra' },
  { name: 'Solapur', lat: 17.6599, lng: 75.9064, district: 'Solapur', state: 'Maharashtra' },
  { name: 'Sangli', lat: 16.8524, lng: 74.5815, district: 'Sangli', state: 'Maharashtra' },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882, district: 'Nagpur', state: 'Maharashtra' },
  { name: 'Jalgaon', lat: 21.0077, lng: 75.5626, district: 'Jalgaon', state: 'Maharashtra' },
  { name: 'Amravati', lat: 20.9320, lng: 77.7523, district: 'Amravati', state: 'Maharashtra' },
  { name: 'Nanded', lat: 19.1383, lng: 77.3210, district: 'Nanded', state: 'Maharashtra' },
];

export interface UserLocationState {
  latitude: number;
  longitude: number;
  accuracy?: number;
  displayName?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  isLiveGps: boolean;
  source?: 'gps' | 'network' | 'ip' | 'preset' | 'manual';
}

export interface GpsLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  source: 'gps' | 'network';
}

// Compute great-circle distance in kilometers
function computeHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Reverse geocode coordinates via multi-provider strategy (OpenStreetMap Nominatim + BigDataCloud fallback)
async function reverseGeocodeCoords(lat: number, lon: number): Promise<{
  formattedAddress: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
} | null> {
  // Strategy 1: OpenStreetMap Nominatim with zoom 16 (resolves rural villages and landmarks properly)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1&accept-language=en`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }
    );
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const road = addr.road || addr.street || '';
        const suburb = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.locality || '';
        const city = addr.city || addr.town || addr.municipality || '';
        const district = addr.county || addr.state_district || addr.district || city || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';

        const parts = [
          addr.amenity || addr.building || '',
          road,
          suburb,
          city && city !== suburb ? city : '',
          district && district !== city ? district : '',
          state,
          pincode ? `PIN - ${pincode}` : '',
        ].filter(Boolean);

        return {
          formattedAddress: parts.join(', ') || data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          city: city || suburb || district,
          district: district || city,
          state,
          pincode,
        };
      }
    }
  } catch (e) {
    // Continue to fallback
  }

  // Strategy 2: BigDataCloud Reverse Geocoding (fast, free client API for India and global)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const locality = data.locality || data.localityInfo?.administrative?.[3]?.name || '';
      const city = data.city || data.localityInfo?.administrative?.[2]?.name || locality;
      const district = data.principalSubdivision ? (data.localityInfo?.administrative?.[2]?.name || city) : city;
      const state = data.principalSubdivision || '';
      const pincode = data.postcode || '';

      const parts = [locality, city !== locality ? city : '', district !== city ? district : '', state, pincode ? `PIN - ${pincode}` : ''].filter(Boolean);

      return {
        formattedAddress: parts.join(', ') || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        city: city || locality || district,
        district: district || city,
        state,
        pincode,
      };
    }
  } catch (e) {
    // Both failed
  }

  return {
    formattedAddress: `Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    city: '',
    district: '',
    state: '',
    pincode: '',
  };
}

// Forward geocode query (village/taluka/city/pincode) via OpenStreetMap Nominatim restricted to India
async function forwardGeocodeAddress(query: string): Promise<{
  latitude: number;
  longitude: number;
  displayName: string;
  city?: string;
  district?: string;
  state?: string;
} | null> {
  try {
    if (!query || query.trim().length < 2) return null;
    const cleanQuery = query.trim();
    // If it's a 6-digit Indian PIN code, append India for 100% precision
    const searchString = /^\d{6}$/.test(cleanQuery) ? `${cleanQuery}, India` : cleanQuery;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchString
      )}&limit=3&countrycodes=in&addressdetails=1&accept-language=en`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0];
    const addr = first.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || '';
    const district = addr.county || addr.state_district || addr.district || city;
    const state = addr.state || '';

    return {
      latitude: Number(Number(first.lat).toFixed(6)),
      longitude: Number(Number(first.lon).toFixed(6)),
      displayName: first.display_name,
      city,
      district,
      state,
    };
  } catch (e) {
    console.warn('Forward geocoding error:', e);
    return null;
  }
}

// Fallback: IP-based location when browser GPS permission is denied or unavailable
async function fetchIpLocation(): Promise<{
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  pincode: string;
} | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    // Free IP geolocation
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        return {
          latitude: Number(Number(data.latitude).toFixed(6)),
          longitude: Number(Number(data.longitude).toFixed(6)),
          city: data.city || '',
          region: data.region || '',
          pincode: data.postal || '',
        };
      }
    }
  } catch {
    // Continue
  }

  // Backup IP API
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        return {
          latitude: Number(Number(data.latitude).toFixed(6)),
          longitude: Number(Number(data.longitude).toFixed(6)),
          city: data.cityName || '',
          region: data.regionName || '',
          pincode: data.zipCode || '',
        };
      }
    }
  } catch {
    // Both IP APIs failed
  }

  return null;
}

// Request browser GPS with dual-tier fallback (High Accuracy GPS -> Standard Network Accuracy)
function fetchBrowserGps(timeoutMs = 12000): Promise<GpsLocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    let isDone = false;

    // Timeout safety
    const totalTimer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        reject(new Error('Location request timed out. Please check browser permissions or select your district below.'));
      }
    }, timeoutMs);

    // Tier 1: Try High Accuracy GPS positioning (GPS chip / mobile sensor)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!isDone) {
          isDone = true;
          clearTimeout(totalTimer);
          resolve({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy),
            source: 'gps',
          });
        }
      },
      (err) => {
        if (isDone) return;

        // If permission explicitly denied, do not retry
        if (err.code === 1) {
          isDone = true;
          clearTimeout(totalTimer);
          const deniedErr = new Error('Location permission was denied in your browser. Click the lock icon in the address bar to allow location.');
          (deniedErr as any).isPermissionDenied = true;
          reject(deniedErr);
          return;
        }

        // Tier 2: Fallback to standard network/Wi-Fi positioning (succeeds on PC, laptops, indoors)
        try {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!isDone) {
                isDone = true;
                clearTimeout(totalTimer);
                resolve({
                  latitude: Number(pos.coords.latitude.toFixed(6)),
                  longitude: Number(pos.coords.longitude.toFixed(6)),
                  accuracy: Math.round(pos.coords.accuracy),
                  source: 'network',
                });
              }
            },
            (fallbackErr) => {
              if (!isDone) {
                isDone = true;
                clearTimeout(totalTimer);
                let msg = 'Could not acquire GPS position.';
                if (fallbackErr.code === 1) {
                  msg = 'Location permission was denied in your browser settings.';
                  const e = new Error(msg);
                  (e as any).isPermissionDenied = true;
                  reject(e);
                  return;
                } else if (fallbackErr.code === 2) {
                  msg = 'GPS signal lost or unavailable on this device.';
                } else if (fallbackErr.code === 3) {
                  msg = 'GPS request timed out. Please choose your district or search village below.';
                }
                reject(new Error(msg));
              }
            },
            { enableHighAccuracy: false, timeout: Math.max(4000, timeoutMs - 5000), maximumAge: 180000 }
          );
        } catch {
          if (!isDone) {
            isDone = true;
            clearTimeout(totalTimer);
            reject(new Error('Location services unavailable.'));
          }
        }
      },
      { enableHighAccuracy: true, timeout: Math.min(6500, Math.floor(timeoutMs * 0.6)), maximumAge: 30000 }
    );
  });
}

export default function TractorRepairPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'centers' | 'my-bookings'>('centers');

  // Centers & Dealers list state
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [centers, setCenters] = useState<NearbyServiceCenter[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('');

  // User Location State (Default: Pune, Maharashtra)
  const [userLocation, setUserLocation] = useState<UserLocationState>({
    latitude: 18.5204,
    longitude: 73.8567,
    accuracy: undefined,
    displayName: 'Pune, Maharashtra',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    isLiveGps: false,
    source: 'preset',
  });
  const [searchRadius, setSearchRadius] = useState<number>(100); // 25, 50, 100, 250, 500 km
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [manualLocationInput, setManualLocationInput] = useState<string>('');
  const [geocodingLocation, setGeocodingLocation] = useState<boolean>(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState<boolean>(false);

  // Bookings list state
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [myBookings, setMyBookings] = useState<ServiceBookingItem[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Booking Modal State
  const [selectedCenter, setSelectedCenter] = useState<{
    serviceCenterId: number;
    serviceName: string;
    dealerName: string;
    phone?: string;
    address?: string;
    servicesAvailable?: string[];
  } | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [modalGpsDetecting, setModalGpsDetecting] = useState<boolean>(false);
  const [modalGeocoding, setModalGeocoding] = useState<boolean>(false);
  const [modalGpsStatus, setModalGpsStatus] = useState<'idle' | 'locked' | 'manual'>('idle');
  const [modalGpsAccuracy, setModalGpsAccuracy] = useState<number | null>(null);
  const [modalGpsError, setModalGpsError] = useState<string | null>(null);

  // Read-only reviews viewer for a service center
  const [reviewsCenter, setReviewsCenter] = useState<{ serviceCenterId: number; serviceName: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Helper to persist location in localStorage
  const saveUserLocation = (loc: UserLocationState) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(loc));
      }
    } catch {
      // Storage unavailable
    }
  };

  // Min date for booking: at least 2 days ahead
  const minBookingDate = useMemo(() => {
    const d = new Date(Date.now() + 36 * 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const customerName = user?.fullName || (user as any)?.name || '';
  const customerMobile = user?.mobile ? String(user.mobile) : (user as any)?.phone || '';

  const [bookingForm, setBookingForm] = useState({
    name: customerName,
    mobile: customerMobile,
    tractorBrand: '',
    tractorModel: '',
    serviceType: 'general_maintenance',
    preferredDate: minBookingDate,
    address: '',
    latitude: 18.5204,
    longitude: 73.8567,
    description: '',
    notes: '',
  });

  // Pre-fill user info when user context updates
  useEffect(() => {
    if (user) {
      const name = user.fullName || (user as any).name || '';
      const mobile = user.mobile ? String(user.mobile) : (user as any).phone || '';
      setBookingForm((prev) => ({
        ...prev,
        name: prev.name || name,
        mobile: prev.mobile || mobile,
      }));
    }
  }, [user]);

  // Helper to fetch live GPS coordinates silently upon submission
  const getLiveCoordinates = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        resolve({
          latitude: bookingForm.latitude || 18.5204,
          longitude: bookingForm.longitude || 73.8567,
        });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
          });
        },
        (err) => {
          console.warn('Geolocation unavailable, using default fallback coordinates:', err);
          resolve({
            latitude: bookingForm.latitude || 18.5204,
            longitude: bookingForm.longitude || 73.8567,
          });
        },
        { timeout: 4000, enableHighAccuracy: true, maximumAge: 60000 }
      );
    });
  };

  // Load Centers & Dealers
  const loadCentersAndDealers = async () => {
    try {
      setLoadingCenters(true);
      const [nearbyRes, dealersRes] = await Promise.allSettled([
        serviceCenterAPI.getNearbyServiceCenters({
          latitude: 18.5204,
          longitude: 73.8567,
          radius: 1000,
          limit: 50,
        }),
        dealerAPI.getAllDealers({ limit: 50, sortBy: 'positive_reviews' }),
      ]);

        let loadedCenters: NearbyServiceCenter[] = [];
        if (nearbyRes.status === 'fulfilled' && nearbyRes.value.success) {
          loadedCenters = nearbyRes.value.data.serviceCenters || [];
        }

        // Augment centers with client-side accurate distance calculation
        const augmentedCenters = loadedCenters.map((c) => {
          if (c.latitude && c.longitude) {
            const calculatedDist = computeHaversineDistanceKm(lat, lon, Number(c.latitude), Number(c.longitude));
            return {
              ...c,
              distanceKm: calculatedDist,
            };
          }
          return c;
        });

        // Sort by distance ascending
        augmentedCenters.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
        setCenters(augmentedCenters);

        if (dealersRes.status === 'fulfilled' && dealersRes.value.success) {
          const rawDealers: Dealer[] = dealersRes.value.data.data || [];
          // Augment dealers with calculated distance from current coordinates and sort by proximity
          const augmentedDealers = rawDealers.map((d: any) => {
            if (d.latitude && d.longitude) {
              const dist = computeHaversineDistanceKm(lat, lon, Number(d.latitude), Number(d.longitude));
              return { ...d, distanceKm: dist };
            }
            return d;
          });
          augmentedDealers.sort((a: any, b: any) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
          setDealers(augmentedDealers);
        }
      } catch (err: any) {
        console.error('Failed to load service centers:', err);
      } finally {
        setLoadingCenters(false);
      }
    },
    []
  );

  // Auto-detect location on initial page mount with cached restore + dual-tier fallback
  useEffect(() => {
    let isMounted = true;

    const initLocation = async () => {
      let initialLat = 18.5204;
      let initialLng = 73.8567;
      let hasCached = false;

      // Step 1: Check localStorage for previously saved verified location
      try {
        const cached = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_LOCATION_KEY) : null;
        if (cached) {
          const parsed: UserLocationState = JSON.parse(cached);
          if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
            hasCached = true;
            initialLat = parsed.latitude;
            initialLng = parsed.longitude;
            setUserLocation(parsed);
            setBookingForm((prev) => ({
              ...prev,
              latitude: parsed.latitude,
              longitude: parsed.longitude,
              address: prev.address || parsed.displayName || '',
            }));
            loadCentersAndDealers(parsed.latitude, parsed.longitude, searchRadius);
          }
        }
      } catch (e) {
        console.warn('Could not read cached location:', e);
      }

      // If no cached location, fetch immediately with default coordinates
      if (!hasCached) {
        loadCentersAndDealers(initialLat, initialLng, searchRadius);
      }

      // Step 2: Attempt fresh GPS fix with dual-tier (High Accuracy -> Network)
      try {
        setDetectingLocation(true);
        const gps = await fetchBrowserGps(8000);
        if (!isMounted) return;

        setPermissionBlocked(false);

        let name = `${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}`;
        let city = '';
        let district = '';
        let state = '';
        let pincode = '';

        const geo = await reverseGeocodeCoords(gps.latitude, gps.longitude);
        if (geo) {
          name = geo.formattedAddress;
          city = geo.city;
          district = geo.district;
          state = geo.state;
          pincode = geo.pincode;
        }

        const newLoc: UserLocationState = {
          latitude: gps.latitude,
          longitude: gps.longitude,
          accuracy: gps.accuracy,
          displayName: name,
          city,
          district,
          state,
          pincode,
          isLiveGps: true,
          source: gps.source,
        };

        setUserLocation(newLoc);
        saveUserLocation(newLoc);

        setBookingForm((prev) => ({
          ...prev,
          latitude: gps.latitude,
          longitude: gps.longitude,
          address: prev.address || name,
        }));

        loadCentersAndDealers(gps.latitude, gps.longitude, searchRadius);
      } catch (err: any) {
        if (!isMounted) return;
        if (err?.isPermissionDenied) {
          setPermissionBlocked(true);
        }

        // If no cached location was found and GPS failed, attempt IP location fallback
        if (!hasCached) {
          try {
            const ipLoc = await fetchIpLocation();
            if (ipLoc && isMounted) {
              const newLoc: UserLocationState = {
                latitude: ipLoc.latitude,
                longitude: ipLoc.longitude,
                displayName: `${ipLoc.city || ipLoc.region || 'Detected City'}, ${ipLoc.region || 'India'}`,
                city: ipLoc.city,
                district: ipLoc.city,
                state: ipLoc.region,
                pincode: ipLoc.pincode,
                isLiveGps: false,
                source: 'ip',
              };
              setUserLocation(newLoc);
              saveUserLocation(newLoc);
              setBookingForm((prev) => ({
                ...prev,
                latitude: ipLoc.latitude,
                longitude: ipLoc.longitude,
                address: prev.address || newLoc.displayName || '',
              }));
              loadCentersAndDealers(ipLoc.latitude, ipLoc.longitude, searchRadius);
            }
          } catch {
            // Already loaded default location
          }
        }
      } finally {
        if (isMounted) {
          setDetectingLocation(false);
        }
      }
    };

    initLocation();
    loadMyBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle manual trigger to detect live GPS on the main page
  const handleDetectPageGps = async () => {
    try {
      setDetectingLocation(true);
      setLocationToast(null);
      setPermissionBlocked(false);
      const gps = await fetchBrowserGps(14000);

      let name = `${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}`;
      let city = '';
      let district = '';
      let state = '';
      let pincode = '';

      const geo = await reverseGeocodeCoords(gps.latitude, gps.longitude);
      if (geo) {
        name = geo.formattedAddress;
        city = geo.city;
        district = geo.district;
        state = geo.state;
        pincode = geo.pincode;
      }

      const newLoc: UserLocationState = {
        latitude: gps.latitude,
        longitude: gps.longitude,
        accuracy: gps.accuracy,
        displayName: name,
        city,
        district,
        state,
        pincode,
        isLiveGps: true,
        source: gps.source,
      };

      setUserLocation(newLoc);
      saveUserLocation(newLoc);

      setBookingForm((prev) => ({
        ...prev,
        latitude: gps.latitude,
        longitude: gps.longitude,
        address: prev.address || name,
      }));

      const precText = gps.accuracy ? ` (±${gps.accuracy}m)` : '';
      setLocationToast(`Accurate location locked: ${city || district || 'Exact Location'}${precText}`);
      setTimeout(() => setLocationToast(null), 4000);

      await loadCentersAndDealers(gps.latitude, gps.longitude, searchRadius);
    } catch (err: any) {
      if (err?.isPermissionDenied) {
        setPermissionBlocked(true);
      }
      setLocationToast(err.message || 'Could not detect live GPS. Please enter your location manually or tap a district below.');
      setTimeout(() => setLocationToast(null), 6000);
    } finally {
      setDetectingLocation(false);
    }
  };

  // Handle quick selection of popular agricultural districts
  const handleSelectPresetDistrict = async (d: (typeof POPULAR_DISTRICTS)[0]) => {
    const newLoc: UserLocationState = {
      latitude: d.lat,
      longitude: d.lng,
      displayName: `${d.name}, ${d.state}`,
      city: d.name,
      district: d.district,
      state: d.state,
      isLiveGps: false,
      source: 'preset',
    };

    setUserLocation(newLoc);
    saveUserLocation(newLoc);

    setBookingForm((prev) => ({
      ...prev,
      latitude: d.lat,
      longitude: d.lng,
      address: `${d.name}, ${d.district}, ${d.state}`,
    }));

    setLocationToast(`Location set to ${d.name}, ${d.state}`);
    setTimeout(() => setLocationToast(null), 3500);

    await loadCentersAndDealers(d.lat, d.lng, searchRadius);
  };

  // Handle radius change
  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    loadCentersAndDealers(userLocation.latitude, userLocation.longitude, newRadius);
  };

  // Handle manual search by City / Village / Taluka / Pincode
  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocationInput.trim()) return;

    try {
      setGeocodingLocation(true);
      setLocationToast(null);
      const res = await forwardGeocodeAddress(manualLocationInput);

      if (res) {
        const newLoc: UserLocationState = {
          latitude: res.latitude,
          longitude: res.longitude,
          displayName: res.displayName,
          city: res.city,
          district: res.district,
          state: res.state,
          isLiveGps: false,
          source: 'manual',
        };

        setUserLocation(newLoc);
        saveUserLocation(newLoc);

        setBookingForm((prev) => ({
          ...prev,
          latitude: res.latitude,
          longitude: res.longitude,
          address: res.displayName,
        }));

        const cleanName = res.city || res.district || res.displayName.split(',')[0];
        setLocationToast(`Location set to: ${cleanName}`);
        setTimeout(() => setLocationToast(null), 4000);

        await loadCentersAndDealers(res.latitude, res.longitude, searchRadius);
      } else {
        setLocationToast(`Could not find coordinates for "${manualLocationInput}". Please try a nearby town, taluka or 6-digit PIN code.`);
        setTimeout(() => setLocationToast(null), 5000);
      }
    } catch (err: any) {
      setLocationToast(err.message || 'Geocoding failed. Please check network.');
      setTimeout(() => setLocationToast(null), 4000);
    } finally {
      setGeocodingLocation(false);
    }
  };

  // Load My Bookings
  const loadMyBookings = async () => {
    try {
      setLoadingBookings(true);
      setBookingError(null);
      const res = await serviceBookingAPI.getMyBookings({ limit: 50 });
      if (res.success && res.data) {
        setMyBookings(res.data.bookings || []);
      }
    } catch (err: any) {
      console.error('Failed to load my service bookings:', err);
      setBookingError(err?.response?.data?.message || 'Failed to load your service bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  // Filter service centers
  const filteredCenters = useMemo(() => {
    return centers.filter((center) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        center.serviceName.toLowerCase().includes(q) ||
        center.dealerName.toLowerCase().includes(q) ||
        center.district.toLowerCase().includes(q) ||
        center.state.toLowerCase().includes(q) ||
        center.supportedBrands.some((b) => b.toLowerCase().includes(q));

      const matchesService =
        !selectedServiceFilter ||
        (Array.isArray(center.servicesAvailable) &&
          center.servicesAvailable.includes(selectedServiceFilter));

      return matchesSearch && matchesService;
    });
  }, [centers, searchQuery, selectedServiceFilter]);

  // Sort and filter dealers by number of positive reviews in descending order
  const sortedDealers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = dealers.filter((d) => {
      if (!q) return true;
      return (
        d.businessName?.toLowerCase().includes(q) ||
        d.district?.toLowerCase().includes(q) ||
        d.state?.toLowerCase().includes(q) ||
        d.dealerType?.toLowerCase().includes(q) ||
        d.phone?.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const aPos = Number(a.positiveReviewsCount ?? 0);
      const bPos = Number(b.positiveReviewsCount ?? 0);
      if (bPos !== aPos) return bPos - aPos;

      const aRating = Number(a.rating) || 0;
      const bRating = Number(b.rating) || 0;
      if (bRating !== aRating) return bRating - aRating;

      const aCount = Number(a.reviewsCount) || 0;
      const bCount = Number(b.reviewsCount) || 0;
      if (bCount !== aCount) return bCount - aCount;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [dealers, searchQuery]);

  // Handle opening booking modal for a center or dealer
  const handleOpenBooking = async (centerItem?: NearbyServiceCenter, dealerItem?: Dealer) => {
    setFormError(null);
    setFormSuccess(null);
    setModalGpsError(null);

    const name = user?.fullName || (user as any)?.name || '';
    const mobile = user?.mobile ? String(user.mobile) : (user as any)?.phone || '';

    // Initialize location in booking form
    const currentLat = userLocation.latitude;
    const currentLng = userLocation.longitude;
    const currentAddr = userLocation.displayName || '';

    setModalGpsStatus(userLocation.isLiveGps ? 'locked' : userLocation.source === 'manual' || userLocation.source === 'preset' ? 'manual' : 'idle');
    setModalGpsAccuracy(userLocation.accuracy || null);

    if (centerItem) {
      const availableServices =
        Array.isArray(centerItem.servicesAvailable) && centerItem.servicesAvailable.length > 0
          ? centerItem.servicesAvailable
          : SERVICE_TYPE_OPTIONS.map((o) => o.value);

      setSelectedCenter({
        serviceCenterId: Number(centerItem.serviceCenterId),
        serviceName: centerItem.serviceName,
        dealerName: centerItem.dealerName,
        phone: centerItem.phone,
        address: `${centerItem.district}, ${centerItem.state}`,
        servicesAvailable: availableServices,
      });

      setBookingForm((prev) => ({
        ...prev,
        name: prev.name || name,
        mobile: prev.mobile || mobile,
        preferredDate: prev.preferredDate || minBookingDate,
        address: prev.address || currentAddr,
        latitude: currentLat,
        longitude: currentLng,
        serviceType: availableServices.includes(prev.serviceType)
          ? prev.serviceType
          : availableServices[0] || 'general_maintenance',
      }));
    } else if (dealerItem) {
      try {
        const scRes = await serviceCenterAPI.getServiceCenterByDealer(dealerItem.id);
        if (scRes.success && scRes.data) {
          const scId = Number((scRes.data as any).serviceCenterId || scRes.data.id);
          if (!scId || isNaN(scId)) {
            alert('This dealership does not have an active workshop ID configured yet.');
            return;
          }

          const availableServices =
            Array.isArray(scRes.data.servicesAvailable) && scRes.data.servicesAvailable.length > 0
              ? scRes.data.servicesAvailable
              : SERVICE_TYPE_OPTIONS.map((o) => o.value);

          setSelectedCenter({
            serviceCenterId: scId,
            serviceName: scRes.data.serviceName,
            dealerName: dealerItem.businessName,
            phone: scRes.data.phone || dealerItem.phone || '',
            address: `${dealerItem.district}, ${dealerItem.state}`,
            servicesAvailable: availableServices,
          });

          setBookingForm((prev) => ({
            ...prev,
            name: prev.name || name,
            mobile: prev.mobile || mobile,
            preferredDate: prev.preferredDate || minBookingDate,
            address: prev.address || currentAddr,
            latitude: currentLat,
            longitude: currentLng,
            serviceType: availableServices.includes(prev.serviceType)
              ? prev.serviceType
              : availableServices[0] || 'general_maintenance',
          }));
        } else {
          alert('This dealership has not configured an active service center workshop yet. Please choose another verified workshop from the list.');
          return;
        }
      } catch (err: any) {
        alert('Unable to load service center details for this dealer.');
        return;
      }
    }
  };

  // In-Modal: Detect Exact Live GPS
  const handleModalDetectGps = async () => {
    try {
      setModalGpsDetecting(true);
      setModalGpsError(null);
      const gps = await fetchBrowserGps(15000);

      setBookingForm((prev) => ({
        ...prev,
        latitude: gps.latitude,
        longitude: gps.longitude,
      }));
      setModalGpsAccuracy(gps.accuracy);
      setModalGpsStatus('locked');

      // Attempt reverse geocoding to fill address
      const rev = await reverseGeocodeCoords(gps.latitude, gps.longitude);
      if (rev && rev.formattedAddress) {
        setBookingForm((prev) => ({
          ...prev,
          address: rev.formattedAddress,
        }));
      }
    } catch (err: any) {
      setModalGpsError(err.message || 'Could not acquire GPS lock. Please enter address manually.');
      setModalGpsStatus('idle');
    } finally {
      setModalGpsDetecting(false);
    }
  };

  // In-Modal: Pin Coordinates from Entered Address
  const handleModalPinFromAddress = async () => {
    if (!bookingForm.address.trim()) {
      setModalGpsError('Please type your address, town, or landmark first.');
      return;
    }

    try {
      setModalGeocoding(true);
      setModalGpsError(null);
      const res = await forwardGeocodeAddress(bookingForm.address);
      if (res) {
        setBookingForm((prev) => ({
          ...prev,
          latitude: res.latitude,
          longitude: res.longitude,
        }));
        setModalGpsStatus('manual');
        setModalGpsAccuracy(null);
      } else {
        setModalGpsError('Could not pinpoint that address on the map. Please add a city or PIN code.');
      }
    } catch (err: any) {
      setModalGpsError(err.message || 'Pinning failed. Please try again.');
    } finally {
      setModalGeocoding(false);
    }
  };

  // Submit Booking
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter || !selectedCenter.serviceCenterId) {
      setFormError('Invalid or unassigned service center workshop');
      return;
    }

    setFormError(null);
    setFormSuccess(null);

    const name = bookingForm.name.trim();
    if (!name || name.length < 3) {
      setFormError('Please enter your full name (at least 3 characters)');
      return;
    }

    let cleanMobile = bookingForm.mobile.replace(/\D/g, '');
    if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
      cleanMobile = cleanMobile.slice(2);
    }
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      return;
    }

    if (!bookingForm.tractorBrand.trim() || bookingForm.tractorBrand.trim().length < 2) {
      setFormError('Please enter the tractor brand name (e.g. Mahindra, Swaraj, John Deere)');
      return;
    }

    if (!bookingForm.tractorModel.trim() || bookingForm.tractorModel.trim().length < 1) {
      setFormError('Please enter the tractor model (e.g. 575 DI, 744 FE)');
      return;
    }

    if (!bookingForm.address.trim() || bookingForm.address.trim().length < 3) {
      setFormError('Please enter the tractor breakdown / service location address');
      return;
    }

    if (!bookingForm.description.trim() || bookingForm.description.trim().length < 5) {
      setFormError('Please provide a brief problem description (at least 5 characters)');
      return;
    }

    let scheduledDate = new Date();
    if (bookingForm.preferredDate) {
      const parts = bookingForm.preferredDate.split('-');
      if (parts.length === 3) {
        let y = Number(parts[0]);
        let m = Number(parts[1]) - 1;
        let d = Number(parts[2]);
        if (parts[2].length === 4) {
          y = Number(parts[2]);
          m = Number(parts[1]) - 1;
          d = Number(parts[0]);
        }
        scheduledDate = new Date(y, m, d, 10, 0, 0);
      } else {
        scheduledDate = new Date(bookingForm.preferredDate);
      }
    }
    if (isNaN(scheduledDate.getTime()) || scheduledDate.getTime() < Date.now()) {
      scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    try {
      setSubmittingBooking(true);

      // Resolve final high-accuracy coordinates
      let finalLat = bookingForm.latitude;
      let finalLng = bookingForm.longitude;

      // If user hasn't explicitly locked GPS and coordinates are still at default Pune, forward geocode the entered address
      if (modalGpsStatus === 'idle' && (finalLat === 18.5204 && finalLng === 73.8567)) {
        try {
          const geo = await forwardGeocodeAddress(bookingForm.address);
          if (geo) {
            finalLat = geo.latitude;
            finalLng = geo.longitude;
          }
        } catch {
          // fallback to current coordinates
        }
      }

      const payload: CreateServiceBookingPayload = {
        name: name,
        mobile: cleanMobile,
        tractorBrand: bookingForm.tractorBrand.trim(),
        tractorModel: bookingForm.tractorModel.trim(),
        serviceType: bookingForm.serviceType,
        description: bookingForm.description.trim(),
        preferredDate: scheduledDate.toISOString(),
        address: bookingForm.address.trim(),
        latitude: finalLat,
        longitude: finalLng,
        notes: bookingForm.notes.trim() || undefined,
      };

      const res = await serviceBookingAPI.createBooking(selectedCenter.serviceCenterId, payload);

      if (res.success) {
        setFormSuccess('Tractor repair request submitted successfully!');
        loadMyBookings();
        setTimeout(() => {
          setSelectedCenter(null);
          setFormSuccess(null);
          setActiveTab('my-bookings');
        }, 1200);
      } else {
        setFormError(res.message || 'Failed to submit repair request');
      }
    } catch (err: any) {
      console.error('Error booking service:', err);
      const apiIssues = err?.response?.data?.error;
      const issueMsg = Array.isArray(apiIssues)
        ? apiIssues.map((i: any) => i.message).join(', ')
        : null;
      const errMsg =
        issueMsg ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit repair request';
      setFormError(errMsg);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
            <Clock size={12} /> Scheduled
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
            <Wrench size={12} className="animate-spin" /> In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400">
            <X size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1 text-xs font-bold text-muted">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-col pb-12">
      {/* Toast Notification */}
      {locationToast && (
        <div className="animate-fade-in fixed top-5 right-5 z-[200] flex items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] px-4 py-3 text-xs font-bold text-foreground shadow-2xl">
          <MapPin size={16} className="text-[var(--color-brand-green)]" />
          <span>{locationToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-3 text-3xl font-black tracking-tight">
            <div className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
              <Wrench size={26} />
            </div>
            Tractor Repair & Service
          </h1>
          <p className="text-muted mt-1 text-sm font-medium">
            Book certified tractor repair, scheduled maintenance, and breakdown support with authorized dealers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-1.5">
          <button
            onClick={() => setActiveTab('centers')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'centers'
                ? 'bg-[var(--color-brand-green)] text-black shadow-lg shadow-[var(--color-brand-green)]/20'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Building2 size={14} /> Find Service Centers
          </button>
          <button
            onClick={() => {
              setActiveTab('my-bookings');
              loadMyBookings();
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'my-bookings'
                ? 'bg-[var(--color-brand-green)] text-black shadow-lg shadow-[var(--color-brand-green)]/20'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Calendar size={14} />
            <span>My Repair Requests</span>
            {myBookings.length > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                  activeTab === 'my-bookings'
                    ? 'bg-black text-[var(--color-brand-green)]'
                    : 'bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)]'
                }`}
              >
                {myBookings.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: FIND SERVICE CENTERS & DEALERS */}
      {activeTab === 'centers' && (
        <div className="space-y-6">
          {/* HIGH-PRECISION LOCATION CONTROLLER CARD */}
          <div className="glass-panel flex flex-col gap-4 rounded-3xl p-5 border border-[var(--border-subtle)] bg-foreground/[0.02]">
            {permissionBlocked && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-amber-400" />
                  <span>
                    <strong>Browser Location Access Blocked:</strong> To use accurate satellite GPS, click the 🔒 icon in your browser address bar and select <em>&ldquo;Allow Location&rdquo;</em>, or choose your district below.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDetectPageGps}
                  className="shrink-0 rounded-xl bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200 hover:bg-amber-400/30"
                >
                  Try Again
                </button>
              </div>
            )}

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <MapPin size={22} />
                  {userLocation.isLiveGps && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted text-[11px] font-bold uppercase tracking-wider">
                      Search Location:
                    </span>
                    {userLocation.isLiveGps ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-400">
                        <CheckCircle2 size={11} /> Accurate GPS Locked {userLocation.accuracy ? `(±${userLocation.accuracy}m)` : ''}
                      </span>
                    ) : userLocation.source === 'network' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                        <CheckCircle2 size={11} /> Wi-Fi / Network Location {userLocation.accuracy ? `(±${userLocation.accuracy}m)` : ''}
                      </span>
                    ) : userLocation.source === 'ip' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                        City Location (via Network)
                      </span>
                    ) : userLocation.source === 'manual' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                        Custom Searched Location
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        {userLocation.city || 'District Preset'}
                      </span>
                    )}

                    <a
                      href={`https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-[var(--color-brand-green)] inline-flex items-center gap-1 text-[11px] font-bold transition-colors ml-1"
                      title="Verify your exact coordinates on Google Maps"
                    >
                      <span>View on Google Maps</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  <h3 className="text-foreground text-sm font-black tracking-tight sm:text-base line-clamp-1">
                    {userLocation.displayName || `Lat: ${userLocation.latitude.toFixed(4)}, Lng: ${userLocation.longitude.toFixed(4)}`}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleDetectPageGps}
                  disabled={detectingLocation}
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-3.5 py-2 text-xs font-black text-black uppercase tracking-wider shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                  title="Detect live GPS from your device"
                >
                  {detectingLocation ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Locking GPS...</span>
                    </>
                  ) : (
                    <>
                      <LocateFixed size={14} />
                      <span>Use Exact Live GPS</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-2.5 py-1.5 text-xs">
                  <span className="text-muted font-bold text-[11px]">Radius:</span>
                  <select
                    value={searchRadius}
                    onChange={(e) => handleRadiusChange(Number(e.target.value))}
                    className="text-foreground cursor-pointer bg-transparent font-black focus:outline-none"
                  >
                    <option value="25" className="bg-[var(--background)]">25 km</option>
                    <option value="50" className="bg-[var(--background)]">50 km</option>
                    <option value="100" className="bg-[var(--background)]">100 km</option>
                    <option value="250" className="bg-[var(--background)]">250 km</option>
                    <option value="500" className="bg-[var(--background)]">500 km (Max)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Manual Location Search Input */}
            <form onSubmit={handleManualLocationSubmit} className="flex flex-col gap-2 pt-2 border-t border-[var(--border-subtle)] sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={14} className="text-muted pointer-events-none absolute top-3 left-3" />
                <input
                  type="text"
                  value={manualLocationInput}
                  onChange={(e) => setManualLocationInput(e.target.value)}
                  placeholder="Enter your village, city, taluka or 6-digit PIN code (e.g. Nashik, Baramati, 422003)..."
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-3 pl-9 text-xs font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={geocodingLocation || !manualLocationInput.trim()}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/10 px-4 py-2 text-xs font-bold text-foreground transition-all hover:bg-foreground/20 disabled:opacity-40"
              >
                {geocodingLocation ? <Loader2 size={13} className="animate-spin" /> : <Crosshair size={13} />}
                <span>Set Location</span>
              </button>
            </form>

            {/* Quick Agricultural Districts Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[var(--border-subtle)]/60">
              <span className="text-muted text-[10px] font-bold uppercase tracking-wider mr-1">
                Quick Select:
              </span>
              {POPULAR_DISTRICTS.map((dist) => {
                const isSelected =
                  userLocation.city?.toLowerCase() === dist.name.toLowerCase() ||
                  userLocation.district?.toLowerCase() === dist.district.toLowerCase() ||
                  (Math.abs(userLocation.latitude - dist.lat) < 0.05 && Math.abs(userLocation.longitude - dist.lng) < 0.05);

                return (
                  <button
                    key={dist.name}
                    type="button"
                    onClick={() => handleSelectPresetDistrict(dist)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                      isSelected
                        ? 'bg-[var(--color-brand-green)] text-black shadow-sm font-black'
                        : 'border border-[var(--border-subtle)] bg-foreground/5 text-muted hover:text-foreground hover:bg-foreground/10'
                    }`}
                  >
                    {dist.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Category Filters */}
          <div className="glass-panel grid grid-cols-1 gap-4 rounded-3xl p-5 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search
                size={18}
                className="text-muted pointer-events-none absolute top-3.5 left-4"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by dealership, workshop name, district, state, or brand..."
                className="text-foreground w-full rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 py-3 pr-4 pl-11 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={selectedServiceFilter}
                onChange={(e) => setSelectedServiceFilter(e.target.value)}
                className="text-foreground w-full rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-3 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
              >
                <option value="" className="bg-[var(--background)]">All Repair & Service Types</option>
                {SERVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[var(--background)]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Centers Grid */}
          {loadingCenters ? (
            <div className="flex flex-1 items-center justify-center py-24 space-y-3 flex-col">
              <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={36} />
              <p className="text-muted text-xs font-bold">Scanning authorized service centers near your location...</p>
            </div>
          ) : filteredCenters.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredCenters.map((center) => (
                <div
                  key={center.serviceCenterId}
                  className="glass-panel group flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 hover:border-[var(--color-brand-green)]/30 hover:shadow-2xl hover:shadow-[var(--color-brand-green)]/5"
                >
                  <div className="space-y-4">
                    {/* Header: Title & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-foreground text-base font-black tracking-tight transition-colors group-hover:text-[var(--color-brand-green)]">
                          {center.serviceName}
                        </h3>
                        <p className="text-muted mt-0.5 text-xs font-bold">
                          By <span className="text-foreground">{center.dealerName}</span>
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 rounded-xl border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-400">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {center.rating ? Number(center.rating).toFixed(1) : 'New'}
                      </span>
                    </div>

                    {/* Location & Contact */}
                    <div className="space-y-1.5 text-xs">
                      <div className="text-foreground/90 flex items-center gap-2 font-bold">
                        <MapPin size={14} className="shrink-0 text-[var(--color-brand-green)]" />
                        <span>{center.district}, {center.state}</span>
                        {center.distanceKm !== undefined && (
                          <span className="text-[var(--color-brand-green)] text-[11px] font-black">
                            ({center.distanceKm} km away)
                          </span>
                        )}
                      </div>
                      {center.phone && (
                        <div className="text-muted flex items-center gap-2 font-medium">
                          <Phone size={13} className="shrink-0" />
                          <span>{center.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {center.hasPickupService && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand-green)]">
                          <Truck size={10} /> Pickup & Drop
                        </span>
                      )}
                      {center.hasEmergencySupport && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          <Zap size={10} /> Emergency Support
                        </span>
                      )}
                      {center.is24x7 && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                          <Clock size={10} /> 24x7 Open
                        </span>
                      )}
                    </div>

                    {/* Supported Brands */}
                    {center.supportedBrands && center.supportedBrands.length > 0 && (
                      <div className="border-t border-[var(--border-subtle)] pt-3">
                        <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                          Supported Brands:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {center.supportedBrands.map((b, idx) => (
                            <span
                              key={idx}
                              className="rounded-md border border-[var(--border-subtle)] bg-foreground/5 px-2 py-0.5 text-[10px] font-bold text-foreground/80"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-2 border-t border-[var(--border-subtle)] pt-4">
                    <button
                      onClick={() => handleOpenBooking(center)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] px-4 py-3 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-[var(--color-brand-green)]/10 transition-all duration-200 hover:opacity-95"
                    >
                      <Wrench size={15} /> Request Repair
                    </button>
                    <button
                      onClick={() => setReviewsCenter({ serviceCenterId: center.serviceCenterId, serviceName: center.serviceName })}
                      className="text-muted hover:text-foreground flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-colors"
                    >
                      <Star size={13} /> View reviews
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Fallback to authorized dealers list if nearby centers are not configured */
            <div className="space-y-4">
              <div className="glass-panel flex flex-col items-center justify-center p-10 text-center">
                <Wrench className="text-muted mb-3" size={36} />
                <h3 className="text-foreground text-base font-bold">
                  No Direct Service Centers Within {searchRadius} km
                </h3>
                <p className="text-muted mt-1 max-w-md text-xs font-medium">
                  Select an authorized dealer below or expand your search radius up to 500 km.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {sortedDealers.map((dealer) => (
                  <div
                    key={dealer.id}
                    className="glass-panel group flex flex-col justify-between rounded-3xl p-6 transition-all hover:border-[var(--color-brand-green)]/30"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-foreground text-base font-black tracking-tight group-hover:text-[var(--color-brand-green)]">
                            {dealer.businessName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-muted text-[11px] font-bold">
                              {dealer.dealerType} • Certified
                            </span>
                            {Number((dealer as any).positiveReviewsCount || 0) > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-black text-amber-400">
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                {(dealer as any).positiveReviewsCount} {((dealer as any).positiveReviewsCount === 1) ? 'Positive Review' : 'Positive Reviews'}
                              </span>
                            )}
                          </div>
                        </div>
                        <ShieldCheck size={18} className="text-[var(--color-brand-green)] shrink-0" />
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-foreground/90 flex flex-wrap items-center gap-1.5 font-bold">
                          <MapPin size={13} className="text-[var(--color-brand-green)] shrink-0" />
                          <span>{dealer.district}, {dealer.state}</span>
                          {(dealer as any).distanceKm !== undefined && (
                            <span className="text-[var(--color-brand-green)] text-[11px] font-black">
                              ({(dealer as any).distanceKm} km away)
                            </span>
                          )}
                        </div>
                        {dealer.phone && (
                          <div className="text-muted flex items-center gap-1.5">
                            <Phone size={12} className="shrink-0" />
                            <span>{dealer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[var(--border-subtle)] pt-4">
                      <button
                        onClick={() => handleOpenBooking(undefined, dealer)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] px-4 py-3 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-[var(--color-brand-green)]/10 transition-all hover:opacity-95"
                      >
                        <Wrench size={15} /> Book Repair Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY REPAIR REQUESTS */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          {loadingBookings ? (
            <div className="flex flex-1 items-center justify-center py-24">
              <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={36} />
            </div>
          ) : bookingError ? (
            <div className="glass-panel p-8 text-center">
              <p className="text-rose-400 mb-4 text-xs font-bold">{bookingError}</p>
              <button
                onClick={loadMyBookings}
                className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2 text-xs font-bold text-white hover:bg-foreground/10"
              >
                Try Again
              </button>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="glass-panel flex flex-col items-center p-12 text-center">
              <Wrench className="text-muted mb-4" size={42} />
              <h3 className="text-foreground text-lg font-bold">No Repair Requests Found</h3>
              <p className="text-muted mt-1 max-w-sm text-xs font-medium">
                You haven&apos;t submitted any tractor repair or service requests yet.
              </p>
              <button
                onClick={() => setActiveTab('centers')}
                className="mt-6 flex items-center gap-2 rounded-2xl bg-[var(--color-brand-green)] px-6 py-3 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-[var(--color-brand-green)]/10 transition-all hover:opacity-90"
              >
                <Sparkles size={14} /> Find Dealers & Book Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((b) => {
                const mapLink =
                  b.latitude && b.longitude
                    ? `https://www.google.com/maps?q=${b.latitude},${b.longitude}`
                    : b.mapUrl || null;

                return (
                  <div
                    key={b.bookingId}
                    className="glass-panel flex flex-col justify-between gap-4 rounded-3xl p-6 md:flex-row md:items-center"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground text-lg font-black tracking-tight">
                          {b.tractorBrand} {b.tractorModel}
                        </span>
                        <span className="text-muted text-xs font-bold">•</span>
                        <span className="text-[var(--color-brand-green)] text-xs font-bold uppercase">
                          {b.serviceType.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                        <span className="text-foreground/90 flex items-center gap-1.5 font-bold">
                          <Building2 size={13} className="text-muted" />
                          {b.serviceCenterName || b.dealerName}
                        </span>
                        <span className="text-muted flex items-center gap-1.5">
                          <Calendar size={13} />
                          Preferred Date: <strong className="text-foreground">{formatDate(b.preferredDate)}</strong>
                        </span>
                        {b.address && (
                          <span className="text-muted flex items-center gap-1.5">
                            <MapPin size={13} className="text-[var(--color-brand-green)]" />
                            <span className="text-foreground/90 font-medium truncate max-w-xs">{b.address}</span>
                          </span>
                        )}
                        <span className="text-muted text-[11px]">
                          Requested: {formatDateTime(b.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(b.status)}
                      {b.status === 'COMPLETED' && b.serviceCenterId && (
                        <MyReviewAction
                          targetType="SERVICE_CENTER"
                          targetId={b.serviceCenterId}
                          targetName={b.serviceCenterName}
                          canRate
                        />
                      )}
                      {mapLink && (
                        <a
                          href={mapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted hover:text-foreground rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-2.5 transition-colors"
                          title="View Location on Google Maps"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: SERVICE CENTER REVIEWS (read-only) */}
      {reviewsCenter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="glass-panel max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground text-lg font-black">{reviewsCenter.serviceName} · Reviews</h2>
              <button onClick={() => setReviewsCenter(null)} className="glass-button p-2" aria-label="Close">
                <X size={14} />
              </button>
            </div>
            <ReviewList
              targetType="SERVICE_CENTER"
              targetId={reviewsCenter.serviceCenterId}
              currentUserId={user?.id}
            />
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT REPAIR REQUEST WITH ACCURATE LOCATION LOCK */}
      {selectedCenter && (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/25 dark:bg-black/80 p-4 backdrop-blur-md sm:p-6">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/5 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
                  <Wrench size={20} />
                </div>
                <div>
                  <h2 className="text-foreground text-lg font-black tracking-tight">
                    Request Tractor Repair
                  </h2>
                  <p className="text-muted text-xs font-bold">
                    {selectedCenter.serviceName} • <span className="text-foreground">{selectedCenter.dealerName}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCenter(null)}
                className="text-muted hover:text-foreground rounded-xl p-2 transition-colors hover:bg-foreground/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitBooking} className="flex-1 space-y-4 overflow-y-auto p-6">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-muted block text-xs font-bold">Your Full Name *</label>
                    {user?.fullName && (
                      <span className="text-[var(--color-brand-green)] text-[10px] font-bold">Auto-filled</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-muted block text-xs font-bold">Mobile Number *</label>
                    {user?.mobile && (
                      <span className="text-[var(--color-brand-green)] text-[10px] font-bold">Auto-filled</span>
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    value={bookingForm.mobile}
                    onChange={(e) => setBookingForm({ ...bookingForm, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted mb-1 block text-xs font-bold">Tractor Brand *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.tractorBrand}
                    onChange={(e) => setBookingForm({ ...bookingForm, tractorBrand: e.target.value })}
                    placeholder="e.g. Mahindra, Swaraj, John Deere"
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted mb-1 block text-xs font-bold">Tractor Model *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.tractorModel}
                    onChange={(e) => setBookingForm({ ...bookingForm, tractorModel: e.target.value })}
                    placeholder="e.g. 575 DI, 744 FE"
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted mb-1 block text-xs font-bold">Service / Repair Category *</label>
                  <select
                    value={bookingForm.serviceType}
                    onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  >
                    {SERVICE_TYPE_OPTIONS.map((opt) => {
                      const isOffered =
                        !selectedCenter?.servicesAvailable ||
                        selectedCenter.servicesAvailable.length === 0 ||
                        selectedCenter.servicesAvailable.includes(opt.value);
                      return (
                        <option key={opt.value} value={opt.value} className="bg-[var(--background)]">
                          {opt.label} {isOffered ? '' : '(Custom Request)'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-muted mb-1 block text-xs font-bold">Preferred Service Date *</label>
                  <input
                    type="date"
                    required
                    min={minBookingDate}
                    value={bookingForm.preferredDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                {/* ACCURATE BREAKDOWN LOCATION PICKER */}
                <div className="sm:col-span-2 space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-foreground flex items-center gap-1.5 text-xs font-black">
                      <MapPin size={15} className="text-[var(--color-brand-green)]" />
                      <span>Breakdown / Service Location *</span>
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleModalDetectGps}
                        disabled={modalGpsDetecting}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-3 py-1.5 text-[11px] font-black text-black uppercase tracking-wider shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
                        title="Capture precise GPS sensor coordinates"
                      >
                        {modalGpsDetecting ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Locking GPS...</span>
                          </>
                        ) : (
                          <>
                            <LocateFixed size={13} />
                            <span>Detect Exact Live GPS</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleModalPinFromAddress}
                        disabled={modalGeocoding || !bookingForm.address.trim()}
                        className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-2.5 py-1.5 text-[11px] font-bold text-foreground transition-all hover:bg-foreground/10 disabled:opacity-40"
                        title="Derive GPS coordinates from typed address"
                      >
                        {modalGeocoding ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Crosshair size={12} />
                        )}
                        <span>Pin from Address</span>
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    value={bookingForm.address}
                    onChange={(e) => {
                      setBookingForm({ ...bookingForm, address: e.target.value });
                      if (modalGpsStatus === 'locked') setModalGpsStatus('manual');
                    }}
                    placeholder="Enter village, farm landmark, taluka, district, or PIN code..."
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />

                  {/* GPS Verification Status Card */}
                  {modalGpsStatus === 'locked' && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                        <span>
                          <strong>Accurate GPS Locked:</strong> Lat: {bookingForm.latitude.toFixed(5)}, Lng: {bookingForm.longitude.toFixed(5)}
                          {modalGpsAccuracy ? ` (±${modalGpsAccuracy}m precision)` : ''}
                        </span>
                      </div>

                      <a
                        href={`https://www.google.com/maps?q=${bookingForm.latitude},${bookingForm.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 underline hover:text-emerald-200"
                      >
                        <span>Verify on Google Maps</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}

                  {modalGpsStatus === 'manual' && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-400">
                      <div className="flex items-center gap-1.5">
                        <Crosshair size={14} className="shrink-0 text-blue-400" />
                        <span>
                          <strong>Coordinates Aligned:</strong> Lat: {bookingForm.latitude.toFixed(5)}, Lng: {bookingForm.longitude.toFixed(5)}
                        </span>
                      </div>

                      <a
                        href={`https://www.google.com/maps?q=${bookingForm.latitude},${bookingForm.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 underline hover:text-blue-200"
                      >
                        <span>Verify on Google Maps</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}

                  {modalGpsError && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] font-medium text-amber-300">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{modalGpsError}</span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-muted mb-1 block text-xs font-bold">
                    Problem / Issue Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                    placeholder="Describe the tractor symptoms, breakdown location, or maintenance requirements in detail..."
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-muted mb-1 block text-xs font-bold">Additional Notes (Optional)</label>
                  <input
                    type="text"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="e.g. Please bring towing van / field pickup required"
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-subtle)] bg-foreground/5 p-4">
              <button
                type="button"
                onClick={() => setSelectedCenter(null)}
                disabled={submittingBooking}
                className="text-muted hover:text-foreground rounded-xl px-5 py-2.5 text-xs font-bold transition-colors hover:bg-foreground/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitBooking}
                disabled={submittingBooking}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-[var(--color-brand-green)]/10 transition-all hover:opacity-90 disabled:opacity-50"
              >
                {submittingBooking ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} /> Submit Repair Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
