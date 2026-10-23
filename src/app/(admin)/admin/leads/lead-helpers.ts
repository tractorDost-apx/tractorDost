import { Lead } from '@/lib/api/leads';

export interface LeadProductLink {
  href: string;
  label: string;
  isDirect: boolean;
}

export function getLeadProductLink(lead: {
  tractorId?: number | null;
  tractor?: { id: number; modelName?: string } | null;
  implmentId?: number | null;
  interestedModel?: string | null;
  interestedBrand?: string | null;
}): LeadProductLink | null {
  const tractorId = lead.tractorId || lead.tractor?.id;
  if (tractorId) {
    const label = lead.interestedModel || lead.tractor?.modelName || `Tractor #${tractorId}`;
    return {
      href: `/tractors/${tractorId}`,
      label,
      isDirect: true,
    };
  }

  const implmentId = lead.implmentId;
  if (implmentId) {
    const label = lead.interestedModel || `Implement #${implmentId}`;
    return {
      href: `/implements/${implmentId}`,
      label,
      isDirect: true,
    };
  }

  if (lead.interestedModel && lead.interestedModel.trim()) {
    const model = lead.interestedModel.trim();
    return {
      href: `/tractors?search=${encodeURIComponent(model)}`,
      label: model,
      isDirect: false,
    };
  }

  if (lead.interestedBrand && lead.interestedBrand.trim()) {
    const brand = lead.interestedBrand.trim();
    return {
      href: `/tractors?brand=${encodeURIComponent(brand)}`,
      label: brand,
      isDirect: false,
    };
  }

  return null;
}

export interface LeadLocationInfo {
  hasCoords: boolean;
  coordsString: string | null;
  locationText: string;
  hasTextLocation: boolean;
  mapsUrl: string | null;
  lat: number | null;
  lng: number | null;
}

const geocodeCache = new Map<string, string>();

/**
 * Client-side reverse geocoding for GPS coordinates using BigDataCloud reverse geocode client API
 * (Free, no API key required, fast locality/city/district/state lookup with in-memory & sessionStorage cache).
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<string | null> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const cached = window.sessionStorage.getItem(`geo_${cacheKey}`);
      if (cached) {
        geocodeCache.set(cacheKey, cached);
        return cached;
      }
    } catch {}
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (data) {
      const locality = data.locality || data.city || '';
      const districtAdmin = data.localityInfo?.administrative?.find(
        (a: any) =>
          a.adminLevel === 5 ||
          (a.name && a.name.toLowerCase().includes('district'))
      );
      const district = districtAdmin?.name?.replace(/\s+district/i, '') || '';
      const state = data.principalSubdivision || '';

      const parts = [locality, district, state].filter(Boolean);
      const uniqueParts: string[] = [];
      for (const p of parts) {
        if (!uniqueParts.some((existing) => existing.toLowerCase() === p.toLowerCase())) {
          uniqueParts.push(p);
        }
      }

      const text = uniqueParts.join(', ') || data.countryName || null;
      if (text) {
        geocodeCache.set(cacheKey, text);
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            window.sessionStorage.setItem(`geo_${cacheKey}`, text);
          } catch {}
        }
        return text;
      }
    }
  } catch {
    // Gracefully handle network/abort
  }

  return null;
}

export function getLeadLocationInfo(lead: {
  latitude?: string | number | null;
  longitude?: string | number | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
}): LeadLocationInfo {
  const latStr = lead.latitude !== null && lead.latitude !== undefined ? String(lead.latitude).trim() : '';
  const lngStr = lead.longitude !== null && lead.longitude !== undefined ? String(lead.longitude).trim() : '';

  const latNum = Number(latStr);
  const lngNum = Number(lngStr);
  const hasCoords = Boolean(latStr && lngStr && !isNaN(latNum) && !isNaN(lngNum));
  const coordsString = hasCoords ? `${latStr}, ${lngStr}` : null;

  const parts = [lead.address, lead.city, lead.district, lead.state]
    .map((p) => (p ? String(p).trim() : ''))
    .filter(Boolean);

  // Deduplicate consecutive duplicates (e.g. Pune, Pune, Maharashtra)
  const dedupedParts: string[] = [];
  for (const part of parts) {
    if (!dedupedParts.includes(part)) {
      dedupedParts.push(part);
    }
  }

  const hasTextLocation = dedupedParts.length > 0;
  let locationText = '';

  if (hasTextLocation) {
    locationText = dedupedParts.join(', ');
  } else if (hasCoords) {
    const cacheKey = `${latNum.toFixed(4)},${lngNum.toFixed(4)}`;
    const cached =
      geocodeCache.get(cacheKey) ||
      (typeof window !== 'undefined' ? window.sessionStorage?.getItem(`geo_${cacheKey}`) : null);
    locationText = cached || `GPS Pin (${latStr}, ${lngStr})`;
  } else {
    locationText = 'Not specified';
  }

  let mapsUrl: string | null = null;
  if (hasCoords) {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latStr},${lngStr}`)}`;
  } else if (hasTextLocation) {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`;
  }

  return {
    hasCoords,
    coordsString,
    locationText,
    hasTextLocation,
    mapsUrl,
    lat: hasCoords ? latNum : null,
    lng: hasCoords ? lngNum : null,
  };
}

export type LeadPlatformId =
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'google_ads'
  | 'google'
  | 'youtube'
  | 'twitter'
  | 'website'
  | 'unknown';

export interface LeadTrackingParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPage?: string;
  ref?: string;
  [key: string]: string | undefined;
}

export interface LeadPlatformBadgeConfig {
  id: LeadPlatformId;
  name: string;
  channelCategory: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  iconName: 'whatsapp' | 'instagram' | 'facebook' | 'google' | 'youtube' | 'twitter' | 'globe' | 'help';
}

export interface LeadSourceInfo {
  // Platform details
  platform: LeadPlatformBadgeConfig;
  platformName: string;
  isPlatformKnown: boolean;

  // Source page details
  rawPage: string;
  pageLabel: string;
  pageHref: string | null;
  isPageKnown: boolean;

  // Campaign details
  rawCampaign: string;
  campaignLabel: string;
  isCampaignKnown: boolean;

  // Tracking details (UTMs, ref, click IDs, referrer)
  trackingParams: LeadTrackingParams;
  hasTrackingParams: boolean;

  // Origin product details
  originProductLabel: string | null;
  originProductHref: string | null;
}

export const PLATFORM_CONFIGS: Record<LeadPlatformId, LeadPlatformBadgeConfig> = {
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    channelCategory: 'Social Messaging',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    iconName: 'whatsapp',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    channelCategory: 'Social Media',
    badgeBg: 'bg-pink-500/10 dark:bg-pink-500/20',
    badgeText: 'text-pink-700 dark:text-pink-300',
    badgeBorder: 'border-pink-500/30',
    dotColor: 'bg-pink-500',
    iconName: 'instagram',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    channelCategory: 'Social Media',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-500/30',
    dotColor: 'bg-blue-600',
    iconName: 'facebook',
  },
  google_ads: {
    id: 'google_ads',
    name: 'Google Ads',
    channelCategory: 'Paid Search (PPC)',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
    iconName: 'google',
  },
  google: {
    id: 'google',
    name: 'Google Search',
    channelCategory: 'Organic Search',
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-500/30',
    dotColor: 'bg-sky-500',
    iconName: 'google',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    channelCategory: 'Video Platform',
    badgeBg: 'bg-red-500/10 dark:bg-red-500/20',
    badgeText: 'text-red-700 dark:text-red-300',
    badgeBorder: 'border-red-500/30',
    dotColor: 'bg-red-500',
    iconName: 'youtube',
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    channelCategory: 'Social Media',
    badgeBg: 'bg-zinc-500/10 dark:bg-zinc-500/20',
    badgeText: 'text-zinc-800 dark:text-zinc-200',
    badgeBorder: 'border-zinc-500/30',
    dotColor: 'bg-zinc-700',
    iconName: 'twitter',
  },
  website: {
    id: 'website',
    name: 'TractorDost Website',
    channelCategory: 'Direct Platform',
    badgeBg: 'bg-[var(--color-brand-green)]/10 dark:bg-[var(--color-brand-green)]/20',
    badgeText: 'text-[var(--color-brand-green)] dark:text-lime-400',
    badgeBorder: 'border-[var(--color-brand-green)]/30',
    dotColor: 'bg-[var(--color-brand-green)]',
    iconName: 'globe',
  },
  unknown: {
    id: 'unknown',
    name: 'Unknown',
    channelCategory: 'Not Available',
    badgeBg: 'bg-zinc-500/10 dark:bg-zinc-500/20',
    badgeText: 'text-zinc-500 dark:text-zinc-400',
    badgeBorder: 'border-zinc-500/20',
    dotColor: 'bg-zinc-400',
    iconName: 'help',
  },
};

export function getLeadSourceInfo(lead: {
  sourcePage?: string | null;
  sourceCampaign?: string | null;
  tractorId?: number | null;
  implmentId?: number | null;
  tractor?: { id: number; modelName?: string } | null;
  interestedModel?: string | null;
  interestedBrand?: string | null;
}): LeadSourceInfo {
  const rawPage = (lead.sourcePage || '').trim();
  const rawCampaign = (lead.sourceCampaign || '').trim();

  const tractorId = lead.tractorId || lead.tractor?.id;
  const implementId = lead.implmentId;

  let originProductLabel: string | null = null;
  let originProductHref: string | null = null;

  if (tractorId) {
    originProductLabel = lead.tractor?.modelName || lead.interestedModel || `Tractor #${tractorId}`;
    originProductHref = `/tractors/${tractorId}`;
  } else if (implementId) {
    originProductLabel = lead.interestedModel || `Implement #${implementId}`;
    originProductHref = `/implements/${implementId}`;
  } else if (lead.interestedModel) {
    originProductLabel = lead.interestedModel;
    originProductHref = `/tractors?search=${encodeURIComponent(lead.interestedModel)}`;
  }

  // 1. Parse JSON campaign or tracking parameters if present
  let parsedJson: Record<string, any> | null = null;
  if (rawCampaign.startsWith('{') && rawCampaign.endsWith('}')) {
    try {
      parsedJson = JSON.parse(rawCampaign);
    } catch {}
  }

  const trackingParams: LeadTrackingParams = {};
  if (parsedJson) {
    if (parsedJson.utm_source) trackingParams.utmSource = String(parsedJson.utm_source);
    if (parsedJson.utm_medium) trackingParams.utmMedium = String(parsedJson.utm_medium);
    if (parsedJson.utm_campaign) trackingParams.utmCampaign = String(parsedJson.utm_campaign);
    if (parsedJson.utm_term) trackingParams.utmTerm = String(parsedJson.utm_term);
    if (parsedJson.utm_content) trackingParams.utmContent = String(parsedJson.utm_content);
    if (parsedJson.referrer) trackingParams.referrer = String(parsedJson.referrer);
    if (parsedJson.landingPage) trackingParams.landingPage = String(parsedJson.landingPage);
  }

  // Also check if rawCampaign or rawPage has URL search parameters like ?utm_source=...
  const combinedText = `${rawCampaign} ${rawPage}`.toLowerCase();
  if (combinedText.includes('utm_') || combinedText.includes('ref=')) {
    const queryPart = rawCampaign.includes('?') ? rawCampaign.split('?')[1] : rawPage.includes('?') ? rawPage.split('?')[1] : '';
    if (queryPart) {
      try {
        const usp = new URLSearchParams(queryPart);
        if (usp.get('utm_source')) trackingParams.utmSource = usp.get('utm_source')!;
        if (usp.get('utm_medium')) trackingParams.utmMedium = usp.get('utm_medium')!;
        if (usp.get('utm_campaign')) trackingParams.utmCampaign = usp.get('utm_campaign')!;
        if (usp.get('ref')) trackingParams.ref = usp.get('ref')!;
      } catch {}
    }
  }

  // 2. Identify Original Platform
  let platformId: LeadPlatformId = 'unknown';

  if (parsedJson && parsedJson.platformId && PLATFORM_CONFIGS[parsedJson.platformId as LeadPlatformId]) {
    platformId = parsedJson.platformId as LeadPlatformId;
  } else if (parsedJson && parsedJson.platform) {
    const pStr = String(parsedJson.platform).toLowerCase();
    if (pStr.includes('whatsapp') || pStr === 'wa') platformId = 'whatsapp';
    else if (pStr.includes('instagram') || pStr.includes('insta') || pStr === 'ig') platformId = 'instagram';
    else if (pStr.includes('facebook') || pStr.includes('fb') || pStr.includes('meta')) platformId = 'facebook';
    else if (pStr.includes('ads') || pStr.includes('cpc')) platformId = 'google_ads';
    else if (pStr.includes('google')) platformId = 'google';
    else if (pStr.includes('youtube')) platformId = 'youtube';
    else if (pStr.includes('twitter') || pStr.includes('x')) platformId = 'twitter';
    else if (pStr.includes('website') || pStr.includes('direct')) platformId = 'website';
  } else {
    // Detect from combined text
    if (combinedText.includes('whatsapp') || combinedText.includes('wa.me') || combinedText.includes('api.whatsapp')) {
      platformId = 'whatsapp';
    } else if (combinedText.includes('instagram') || combinedText.includes('insta') || combinedText.includes('l.instagram') || combinedText.includes('ig_')) {
      platformId = 'instagram';
    } else if (combinedText.includes('facebook') || combinedText.includes('fbclid') || combinedText.includes('l.facebook') || combinedText.includes('m.facebook')) {
      platformId = 'facebook';
    } else if (combinedText.includes('google_ads') || combinedText.includes('googleads') || combinedText.includes('gclid') || combinedText.includes('cpc')) {
      platformId = 'google_ads';
    } else if (combinedText.includes('google') || combinedText.includes('google.com') || combinedText.includes('google.co.in')) {
      platformId = 'google';
    } else if (combinedText.includes('youtube') || combinedText.includes('youtu.be')) {
      platformId = 'youtube';
    } else if (combinedText.includes('twitter') || combinedText.includes('t.co') || combinedText.includes('x.com')) {
      platformId = 'twitter';
    } else if (rawPage || rawCampaign || tractorId || implementId) {
      // User performed action on website directly without external referrer/UTM
      platformId = 'website';
    } else {
      // Both sourcePage and sourceCampaign are missing/empty
      platformId = 'unknown';
    }
  }

  const isPlatformKnown = platformId !== 'unknown';
  const platform = PLATFORM_CONFIGS[platformId];

  // 3. Resolve Specific Source Page
  let pageLabel = 'Not Available';
  let pageHref: string | null = null;
  let isPageKnown = false;

  const pageStringToAnalyze = rawPage || (parsedJson?.landingPage ? String(parsedJson.landingPage) : '');

  if (pageStringToAnalyze.includes('tractor-detail') || (tractorId && !pageStringToAnalyze)) {
    pageLabel = 'Tractor Detail Page';
    pageHref = originProductHref || '/tractors';
    isPageKnown = true;
  } else if (pageStringToAnalyze.includes('implement-detail') || (implementId && !pageStringToAnalyze)) {
    pageLabel = 'Implement Detail Page';
    pageHref = originProductHref || '/implements';
    isPageKnown = true;
  } else if (pageStringToAnalyze.includes('compare')) {
    pageLabel = 'Compare Tractors Tool';
    pageHref = '/compare';
    isPageKnown = true;
  } else if (pageStringToAnalyze.includes('emi')) {
    pageLabel = 'EMI Calculator Page';
    pageHref = '/emi-calculator';
    isPageKnown = true;
  } else if (pageStringToAnalyze.includes('on-road') || pageStringToAnalyze.includes('price')) {
    pageLabel = 'On-Road Price Page';
    pageHref = '/on-road-price';
    isPageKnown = true;
  } else if (pageStringToAnalyze.includes('used')) {
    pageLabel = 'Used Tractor Marketplace';
    pageHref = '/used-tractors';
    isPageKnown = true;
  } else if (pageStringToAnalyze.includes('dealer')) {
    pageLabel = 'Dealer Directory Page';
    pageHref = '/dealers';
    isPageKnown = true;
  } else if (pageStringToAnalyze === '/' || pageStringToAnalyze.toLowerCase() === 'homepage') {
    pageLabel = 'Homepage';
    pageHref = '/';
    isPageKnown = true;
  } else if (pageStringToAnalyze) {
    pageLabel = pageStringToAnalyze
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (pageStringToAnalyze.startsWith('/')) {
      pageHref = pageStringToAnalyze;
    }
    isPageKnown = true;
  } else if (tractorId) {
    pageLabel = 'Tractor Detail Page';
    pageHref = originProductHref || '/tractors';
    isPageKnown = true;
  } else if (implementId) {
    pageLabel = 'Implement Detail Page';
    pageHref = originProductHref || '/implements';
    isPageKnown = true;
  }

  // 4. Resolve Campaign Details
  let campaignLabel = 'Not Available';
  let isCampaignKnown = false;

  const rawCampaignValue = parsedJson?.campaign || rawCampaign;

  if (rawCampaignValue === 'detail-access') {
    campaignLabel = 'Detail Access Gate (Specs & Features Unlock)';
    isCampaignKnown = true;
  } else if (rawCampaignValue && typeof rawCampaignValue === 'string') {
    if (rawCampaignValue.startsWith('{')) {
      // JSON parsed earlier
      if (parsedJson?.campaign) {
        campaignLabel = String(parsedJson.campaign);
        isCampaignKnown = true;
      }
    } else if (rawCampaignValue.includes('emi')) {
      campaignLabel = 'EMI Calculation Lead Form';
      isCampaignKnown = true;
    } else if (rawCampaignValue.includes('price')) {
      campaignLabel = 'On-Road Price Request Form';
      isCampaignKnown = true;
    } else if (rawCampaignValue.trim()) {
      campaignLabel = rawCampaignValue
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      isCampaignKnown = true;
    }
  }

  // If platform is WhatsApp or Social and campaign wasn't explicitly given
  if (!isCampaignKnown && isPlatformKnown && platformId !== 'website') {
    campaignLabel = `${platform.name} Inbound Referral`;
    isCampaignKnown = true;
  } else if (!isCampaignKnown && isPlatformKnown && platformId === 'website' && isPageKnown) {
    campaignLabel = 'Organic Website Enquiry';
    isCampaignKnown = true;
  }

  const hasTrackingParams = Object.keys(trackingParams).length > 0;

  return {
    platform,
    platformName: platform.name,
    isPlatformKnown,
    rawPage,
    pageLabel,
    pageHref,
    isPageKnown,
    rawCampaign,
    campaignLabel,
    isCampaignKnown,
    trackingParams,
    hasTrackingParams,
    originProductLabel,
    originProductHref,
  };
}

export function parseStaffUsers(
  candidateUsers: any[],
  currentUser?: any
): { id: number; fullName: string }[] {
  const staffMap = new Map<number, { id: number; fullName: string }>();

  const list = [...candidateUsers];
  if (currentUser) {
    list.push(currentUser);
  }

  for (const u of list) {
    if (!u || !u.id) continue;
    if (u.isDeleted || u.isActive === false) continue;

    const roleName = (typeof u.role === 'string' ? u.role : u.role?.name || '').toUpperCase();
    if (['AGENT', 'ADMIN', 'SUPER_ADMIN'].includes(roleName)) {
      const roleBadge = roleName === 'AGENT' ? 'Agent' : 'Admin';
      const rawName = u.fullName?.trim() || u.name?.trim();
      const mobilePart = u.mobile ? String(u.mobile).trim() : null;
      const emailPart = u.email ? String(u.email).trim() : null;

      const baseLabel = rawName || (mobilePart ? `${roleBadge} (${mobilePart})` : null) || emailPart || `${roleBadge} #${u.id}`;
      const fullName = baseLabel.endsWith(`(${roleBadge})`) ? baseLabel : `${baseLabel} (${roleBadge})`;

      staffMap.set(Number(u.id), {
        id: Number(u.id),
        fullName,
      });
    }
  }

  return Array.from(staffMap.values()).sort((a, b) => a.fullName.localeCompare(b.fullName));
}
