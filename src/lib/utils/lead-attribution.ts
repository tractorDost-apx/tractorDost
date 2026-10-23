'use client';

/**
 * Lead Attribution & Platform Source Tracker
 *
 * Automatically detects and persists visitor acquisition channel:
 * - Platforms: WhatsApp, Instagram, Facebook, Google Ads, Google Search, YouTube, X (Twitter), TractorDost Website
 * - UTM Parameters: utm_source, utm_medium, utm_campaign, utm_term, utm_content
 * - Click IDs: gclid, fbclid
 * - Referrers: document.referrer
 */

export interface LeadAttributionData {
  platform: string; // "WhatsApp" | "Instagram" | "Facebook" | "Google Ads" | "Google Search" | "YouTube" | "TractorDost Website" | "Unknown"
  platformId: string; // "whatsapp" | "instagram" | "facebook" | "google_ads" | "google" | "youtube" | "website" | "unknown"
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPage?: string;
  landingUrl?: string;
  capturedAt: string;
}

const STORAGE_KEY = 'td_lead_attribution_v1';

/**
 * Detects platform from URL search params and referrer string
 */
export function detectPlatform(searchParams: URLSearchParams, referrerUrl?: string): { platform: string; platformId: string } {
  const utmSource = (searchParams.get('utm_source') || '').toLowerCase().trim();
  const utmMedium = (searchParams.get('utm_medium') || '').toLowerCase().trim();
  const ref = (searchParams.get('ref') || searchParams.get('source') || searchParams.get('platform') || '').toLowerCase().trim();
  const gclid = searchParams.get('gclid');
  const fbclid = searchParams.get('fbclid');

  const refHost = (() => {
    if (!referrerUrl) return '';
    try {
      const parsed = new URL(referrerUrl);
      return parsed.hostname.toLowerCase();
    } catch {
      return referrerUrl.toLowerCase();
    }
  })();

  // 1. WhatsApp
  if (
    utmSource === 'whatsapp' ||
    utmSource === 'wa' ||
    ref === 'whatsapp' ||
    ref === 'wa' ||
    refHost.includes('whatsapp') ||
    refHost.includes('wa.me') ||
    referrerUrl?.startsWith('whatsapp://')
  ) {
    return { platform: 'WhatsApp', platformId: 'whatsapp' };
  }

  // 2. Instagram
  if (
    utmSource === 'instagram' ||
    utmSource === 'ig' ||
    ref === 'instagram' ||
    ref === 'ig' ||
    refHost.includes('instagram.com') ||
    refHost.includes('l.instagram.com')
  ) {
    return { platform: 'Instagram', platformId: 'instagram' };
  }

  // 3. Facebook
  if (
    Boolean(fbclid) ||
    utmSource === 'facebook' ||
    utmSource === 'fb' ||
    ref === 'facebook' ||
    ref === 'fb' ||
    refHost.includes('facebook.com') ||
    refHost.includes('l.facebook.com') ||
    refHost.includes('m.facebook.com')
  ) {
    return { platform: 'Facebook', platformId: 'facebook' };
  }

  // 4. Google Ads vs Google Search
  if (Boolean(gclid) || utmMedium === 'cpc' || utmSource.includes('googleads') || utmSource.includes('google_cpc')) {
    return { platform: 'Google Ads', platformId: 'google_ads' };
  }

  if (utmSource === 'google' || refHost.includes('google.') || refHost.includes('google.co.in')) {
    return { platform: 'Google Search', platformId: 'google' };
  }

  // 5. YouTube
  if (utmSource === 'youtube' || ref === 'youtube' || refHost.includes('youtube.com') || refHost.includes('youtu.be')) {
    return { platform: 'YouTube', platformId: 'youtube' };
  }

  // 6. X (Twitter)
  if (utmSource === 'twitter' || utmSource === 'x' || refHost.includes('twitter.com') || refHost.includes('t.co') || refHost.includes('x.com')) {
    return { platform: 'X (Twitter)', platformId: 'twitter' };
  }

  // 7. Custom other external channel from utm_source
  if (utmSource) {
    const formatted = utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
    return { platform: formatted, platformId: utmSource };
  }

  // 8. If internal or no external referrer, visitor arrived via website direct
  if (typeof window !== 'undefined' && window.location) {
    return { platform: 'TractorDost Website', platformId: 'website' };
  }

  return { platform: 'Unknown', platformId: 'unknown' };
}

/**
 * Initializes attribution capture on page load
 */
export function captureAttributionOnLanding(): LeadAttributionData | null {
  if (typeof window === 'undefined') return null;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer || '';
    const pathname = window.location.pathname;

    const utmSource = searchParams.get('utm_source') || undefined;
    const utmMedium = searchParams.get('utm_medium') || undefined;
    const utmCampaign = searchParams.get('utm_campaign') || undefined;
    const utmTerm = searchParams.get('utm_term') || undefined;
    const utmContent = searchParams.get('utm_content') || undefined;
    const ref = searchParams.get('ref') || searchParams.get('source') || searchParams.get('platform') || undefined;

    const hasTrackingQuery = Boolean(
      utmSource || utmMedium || utmCampaign || utmTerm || utmContent || ref || searchParams.get('gclid') || searchParams.get('fbclid')
    );

    const isExternalReferrer = (() => {
      if (!referrer) return false;
      try {
        const refHost = new URL(referrer).hostname;
        return refHost !== window.location.hostname;
      } catch {
        return false;
      }
    })();

    const existingJson = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    let existingData: LeadAttributionData | null = null;
    if (existingJson) {
      try {
        existingData = JSON.parse(existingJson);
      } catch {}
    }

    // If new campaign params or external referrer arrived, or no existing attribution saved
    if (hasTrackingQuery || isExternalReferrer || !existingData) {
      const { platform, platformId } = detectPlatform(searchParams, referrer);

      const campaignName =
        utmCampaign ||
        (hasTrackingQuery ? `Campaign (${platform})` : isExternalReferrer ? `Referral from ${platform}` : 'Direct Website Visit');

      const data: LeadAttributionData = {
        platform,
        platformId,
        campaign: campaignName,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        referrer: referrer || undefined,
        landingPage: pathname,
        landingUrl: window.location.href,
        capturedAt: new Date().toISOString(),
      };

      try {
        const serialized = JSON.stringify(data);
        sessionStorage.setItem(STORAGE_KEY, serialized);
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch {}

      return data;
    }

    return existingData;
  } catch (err) {
    console.warn('Lead attribution capture error:', err);
    return null;
  }
}

/**
 * Returns the captured attribution ready to be sent with a lead creation payload
 */
export function getCapturedLeadAttribution(context?: {
  pagePath?: string;
  defaultPageLabel?: string;
  defaultCampaign?: string;
}): {
  sourcePage: string;
  sourceCampaign: string;
  attribution: LeadAttributionData | null;
} {
  let attribution: LeadAttributionData | null = null;

  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (raw) {
        attribution = JSON.parse(raw);
      } else {
        // Fallback capture right now
        attribution = captureAttributionOnLanding();
      }
    } catch {}
  }

  const currentPath =
    context?.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '');

  // Format source page: prefer human-friendly label if path matches
  let sourcePage = context?.defaultPageLabel || currentPath || 'Website';
  if (!context?.defaultPageLabel && currentPath) {
    if (currentPath.includes('/tractors/')) {
      sourcePage = `Tractor Detail Page (${currentPath})`;
    } else if (currentPath.includes('/implements/')) {
      sourcePage = `Implement Detail Page (${currentPath})`;
    } else if (currentPath.includes('/used-tractors/')) {
      sourcePage = `Used Tractor Page (${currentPath})`;
    } else if (currentPath.includes('/compare')) {
      sourcePage = 'Compare Tractors Tool';
    } else if (currentPath.includes('/dealers')) {
      sourcePage = 'Dealer Directory Page';
    } else if (currentPath === '/') {
      sourcePage = 'Homepage';
    }
  }

  // Format sourceCampaign as structured JSON string so it stores complete attribution
  const campaignPayload = {
    platform: attribution?.platform || 'TractorDost Website',
    platformId: attribution?.platformId || 'website',
    campaign: attribution?.utmCampaign || context?.defaultCampaign || attribution?.campaign || 'Organic Enquiry',
    utm_source: attribution?.utmSource,
    utm_medium: attribution?.utmMedium,
    utm_campaign: attribution?.utmCampaign,
    utm_term: attribution?.utmTerm,
    utm_content: attribution?.utmContent,
    referrer: attribution?.referrer,
    landingPage: attribution?.landingPage,
    capturedAt: attribution?.capturedAt || new Date().toISOString(),
  };

  const sourceCampaign = JSON.stringify(campaignPayload);

  return {
    sourcePage,
    sourceCampaign,
    attribution,
  };
}
