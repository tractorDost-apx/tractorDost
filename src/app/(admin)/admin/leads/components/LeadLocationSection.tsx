'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  ExternalLink,
  Copy,
  Check,
  Navigation,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { getLeadLocationInfo, reverseGeocodeCoords } from '../lead-helpers';

interface LeadLocationSectionProps {
  lead: {
    latitude?: string | number | null;
    longitude?: string | number | null;
    address?: string | null;
    city?: string | null;
    district?: string | null;
    state?: string | null;
  };
}

export function LeadLocationSection({ lead }: LeadLocationSectionProps) {
  const locationInfo = getLeadLocationInfo(lead);
  const [resolvedPlace, setResolvedPlace] = useState<string | null>(null);
  const [resolving, setResolving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    async function resolveLocation() {
      if (
        !locationInfo.hasTextLocation &&
        locationInfo.hasCoords &&
        locationInfo.lat !== null &&
        locationInfo.lng !== null
      ) {
        setResolving(true);
        try {
          const place = await reverseGeocodeCoords(locationInfo.lat, locationInfo.lng);
          if (active && place) {
            setResolvedPlace(place);
          }
        } catch {
          // Fallback to coordinates
        } finally {
          if (active) setResolving(false);
        }
      }
    }

    resolveLocation();

    return () => {
      active = false;
    };
  }, [lead.latitude, lead.longitude, lead.address, lead.city, lead.state, lead.district]);

  const handleCopyCoords = () => {
    if (!locationInfo.coordsString) return;
    navigator.clipboard.writeText(locationInfo.coordsString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayText = locationInfo.hasTextLocation
    ? locationInfo.locationText
    : resolvedPlace || (locationInfo.hasCoords ? `Coordinates: ${locationInfo.coordsString}` : 'Location details not provided');

  return (
    <div className="flex items-start gap-3 sm:col-span-2">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
        locationInfo.hasCoords
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
      }`}>
        {locationInfo.hasCoords ? <Compass size={18} /> : <MapPin size={18} />}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted">
            Location & Coordinates
          </span>

          {locationInfo.hasCoords && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={10} />
              GPS Captured
            </span>
          )}

          {resolvedPlace && !locationInfo.hasTextLocation && (
            <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[9px] font-black text-sky-600 dark:text-sky-400">
              Auto-Detected Area
            </span>
          )}
        </div>

        {/* Location Display */}
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          {resolving ? (
            <div className="flex items-center gap-2 text-xs font-bold text-muted animate-pulse">
              <Loader2 size={13} className="animate-spin text-[var(--color-brand-green)]" />
              <span>Detecting area from GPS coordinates ({locationInfo.coordsString})...</span>
            </div>
          ) : (
            <span className={`text-xs sm:text-sm font-bold ${
              locationInfo.hasTextLocation || resolvedPlace || locationInfo.hasCoords
                ? 'text-foreground'
                : 'text-muted italic'
            }`}>
              {displayText}
            </span>
          )}
        </div>

        {/* GPS coordinates & Google Maps Action Bar */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {locationInfo.hasCoords ? (
            <>
              {/* Copy GPS Pill */}
              <button
                type="button"
                onClick={handleCopyCoords}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer shadow-sm"
                title="Click to copy GPS coordinates"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Compass size={12} />
                    <span>GPS: {locationInfo.coordsString}</span>
                    <Copy size={11} className="opacity-60" />
                  </>
                )}
              </button>

              {/* Open in Google Maps */}
              {locationInfo.mapsUrl && (
                <a
                  href={locationInfo.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer"
                  title="View exact customer pin on Google Maps"
                >
                  <MapPin size={13} />
                  <span>Open in Google Maps</span>
                  <ExternalLink size={11} />
                </a>
              )}

              {/* Directions Link */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationInfo.coordsString || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3 py-1.5 text-xs font-bold text-foreground hover:bg-foreground/10 transition-all cursor-pointer"
                title="Get navigation directions"
              >
                <Navigation size={12} className="text-[var(--color-brand-green)]" />
                <span>Directions</span>
              </a>
            </>
          ) : locationInfo.mapsUrl ? (
            <a
              href={locationInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3 py-1.5 text-xs font-bold text-foreground hover:bg-foreground/10 transition-all cursor-pointer"
            >
              <MapPin size={13} />
              <span>Search Location on Google Maps</span>
              <ExternalLink size={11} />
            </a>
          ) : (
            <span className="text-[11px] text-muted italic">
              GPS coordinates not captured for this lead
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
