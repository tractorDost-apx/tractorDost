'use client';

import React from 'react';
import {
  Globe,
  ExternalLink,
  HelpCircle,
  Share2,
  Search,
  Target,
  PlaySquare,
  MessageCircle,
  Radio,
  Layers,
} from 'lucide-react';
import { LeadSourceInfo } from '../lead-helpers';

/**
 * Custom SVG Icons for WhatsApp, Instagram, Facebook for clean brand representation
 */
export function PlatformIcon({
  iconName,
  className = 'w-3.5 h-3.5 shrink-0',
}: {
  iconName: string;
  className?: string;
}) {
  switch (iconName) {
    case 'whatsapp':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.45 0-2.87-.38-4.12-1.11l-.3-.17-3.12.82.83-3.04-.19-.31a8.19 8.19 0 0 1-1.26-4.43c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.12-.22-.19-.47-.31z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'google':
      return <Search className={className} />;
    case 'google_ads':
      return <Target className={className} />;
    case 'youtube':
      return <PlaySquare className={className} />;
    case 'twitter':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'globe':
      return <Globe className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
}

/**
 * Compact / Inline Lead Platform Badge (e.g. for Table rows, header pills)
 */
export function LeadSourcePlatformBadge({
  sourceInfo,
  size = 'sm',
  showCategory = false,
}: {
  sourceInfo: LeadSourceInfo;
  size?: 'xs' | 'sm' | 'md';
  showCategory?: boolean;
}) {
  const { platform } = sourceInfo;

  const sizeClasses =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[9px] gap-1'
      : size === 'sm'
        ? 'px-2 py-0.5 text-[10px] gap-1.5'
        : 'px-2.5 py-1 text-xs gap-2';

  const iconSize =
    size === 'xs' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-bold shadow-xs transition-colors ${sizeClasses} ${platform.badgeBg} ${platform.badgeText} ${platform.badgeBorder}`}
      title={`Platform: ${platform.name} (${platform.channelCategory})`}
    >
      <PlatformIcon iconName={platform.iconName} className={`${iconSize} shrink-0`} />
      <span className="truncate">{platform.name}</span>
      {showCategory && (
        <span className="opacity-70 text-[9px] font-medium hidden sm:inline">
          • {platform.channelCategory}
        </span>
      )}
    </span>
  );
}

/**
 * Comprehensive Lead Source & Acquisition Overview Card
 * Used in LeadDetailsDrawer Overview Tab and [id]/page.tsx
 */
export function LeadSourceOverviewCard({
  sourceInfo,
  lead,
}: {
  sourceInfo: LeadSourceInfo;
  lead: {
    sourcePage?: string | null;
    sourceCampaign?: string | null;
  };
}) {
  const { platform, trackingParams, hasTrackingParams } = sourceInfo;

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4 text-xs font-semibold">
      <div className="flex items-center justify-between mb-3 border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[#4a7635]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-muted">
            Lead Origin & Source Channel (लीड कुठून आली)
          </h3>
        </div>
        <LeadSourcePlatformBadge sourceInfo={sourceInfo} size="sm" showCategory />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. ORIGINAL LEAD SOURCE PLATFORM */}
        <div className="flex flex-col gap-1 rounded-xl bg-foreground/5 p-3 border border-[var(--border-subtle)]">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
            1. Original Source Platform
          </span>
          <div className="mt-1 flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg border shadow-xs ${platform.badgeBg} ${platform.badgeText} ${platform.badgeBorder}`}
            >
              <PlatformIcon iconName={platform.iconName} className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-foreground truncate">
                {platform.name}
              </span>
              <span className="text-[10px] font-medium text-muted truncate">
                {platform.channelCategory}
              </span>
            </div>
          </div>
          <span className="mt-1 text-[9px] font-mono text-muted/80">
            channel: {platform.id}
          </span>
        </div>

        {/* 2. SPECIFIC SOURCE PAGE */}
        <div className="flex flex-col gap-1 rounded-xl bg-foreground/5 p-3 border border-[var(--border-subtle)]">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
            2. Specific Source Page
          </span>
          <div className="mt-1 flex flex-col gap-0.5">
            <span
              className={`text-xs font-bold ${
                sourceInfo.isPageKnown ? 'text-foreground' : 'text-muted italic'
              }`}
            >
              {sourceInfo.pageLabel}
            </span>

            {sourceInfo.originProductHref && (
              <a
                href={sourceInfo.originProductHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#4a7635] hover:underline"
              >
                <span>Origin: {sourceInfo.originProductLabel}</span>
                <ExternalLink size={10} />
              </a>
            )}

            {sourceInfo.pageHref && !sourceInfo.originProductHref && (
              <a
                href={sourceInfo.pageHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#4a7635] hover:underline"
              >
                <span>View Page Link</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
          <span className="mt-auto text-[9px] font-mono text-muted/80 truncate" title={sourceInfo.rawPage || 'Not available'}>
            raw: {sourceInfo.rawPage || (sourceInfo.isPageKnown ? 'auto-detected' : 'Not Available')}
          </span>
        </div>

        {/* 3. CAMPAIGN DETAILS */}
        <div className="flex flex-col gap-1 rounded-xl bg-foreground/5 p-3 border border-[var(--border-subtle)]">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
            3. Source Campaign & Offer
          </span>
          <div className="mt-1 flex flex-col gap-0.5">
            <p
              className={`text-xs font-bold ${
                sourceInfo.isCampaignKnown ? 'text-foreground' : 'text-muted italic'
              }`}
            >
              {sourceInfo.campaignLabel}
            </p>
            {trackingParams.utmMedium && (
              <span className="text-[10px] text-muted">
                Medium: <span className="font-semibold text-foreground">{trackingParams.utmMedium}</span>
              </span>
            )}
          </div>
          <span className="mt-auto text-[9px] font-mono text-muted/80 truncate" title={lead.sourceCampaign || 'None'}>
            tag: {lead.sourceCampaign ? (lead.sourceCampaign.length > 30 ? `${lead.sourceCampaign.slice(0, 27)}...` : lead.sourceCampaign) : (sourceInfo.isCampaignKnown ? 'auto-tracked' : 'Not Available')}
          </span>
        </div>
      </div>

      {/* TRACKING PARAMETERS CHIPS (UTMs, Ref, Referrer) */}
      {hasTrackingParams && (
        <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] p-2.5">
          <span className="text-[9px] font-bold text-muted uppercase tracking-wider block mb-1.5">
            Captured Tracking Parameters (UTMs & Referrer)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {trackingParams.utmSource && (
              <span className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0.5 text-[10px] font-mono text-foreground border border-[var(--border-subtle)]">
                <span className="text-muted">utm_source:</span>
                <strong className="text-[#4a7635]">{trackingParams.utmSource}</strong>
              </span>
            )}
            {trackingParams.utmMedium && (
              <span className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0.5 text-[10px] font-mono text-foreground border border-[var(--border-subtle)]">
                <span className="text-muted">utm_medium:</span>
                <strong>{trackingParams.utmMedium}</strong>
              </span>
            )}
            {trackingParams.utmCampaign && (
              <span className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0.5 text-[10px] font-mono text-foreground border border-[var(--border-subtle)]">
                <span className="text-muted">utm_campaign:</span>
                <strong>{trackingParams.utmCampaign}</strong>
              </span>
            )}
            {trackingParams.ref && (
              <span className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0.5 text-[10px] font-mono text-foreground border border-[var(--border-subtle)]">
                <span className="text-muted">ref:</span>
                <strong>{trackingParams.ref}</strong>
              </span>
            )}
            {trackingParams.referrer && (
              <span className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0.5 text-[10px] font-mono text-foreground border border-[var(--border-subtle)] truncate max-w-[280px]">
                <span className="text-muted">referrer:</span>
                <span className="truncate" title={trackingParams.referrer}>{trackingParams.referrer}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
