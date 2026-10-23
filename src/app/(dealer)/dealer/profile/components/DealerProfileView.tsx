'use client';

import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  FileText,
  Store,
  Layers,
  Edit2,
  Info,
  Calendar,
  MessageSquare,
  Wrench,
  Lock,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  AlertTriangle,
  Clock,
  Navigation,
  CheckCircle2,
  XCircle,
  Award,
} from 'lucide-react';
import { Dealer, DealerProfileSummary } from '@/types/models/dealer';
import {
  VerificationBadge,
  CertifiedBadge,
  ActiveBadge,
  DealerTypeBadge,
} from '@/app/(admin)/admin/dealers/components/DealerStatusBadge';

interface DealerProfileViewProps {
  dealer: Dealer;
  profile: DealerProfileSummary | null;
  onEdit: () => void;
}

export function DealerProfileView({ dealer, profile, onEdit }: DealerProfileViewProps) {
  const formatWorkingHours = (wh: any) => {
    if (!wh) return 'Standard Business Hours (9:00 AM - 7:00 PM)';
    if (typeof wh === 'string') return wh;
    if (typeof wh === 'object') return JSON.stringify(wh, null, 2);
    return String(wh);
  };

  const formatServiceAreas = (sa: any) => {
    if (!sa) return 'N/A';
    if (Array.isArray(sa)) return sa.join(', ');
    if (typeof sa === 'object') return JSON.stringify(sa);
    return String(sa);
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Top Banner / Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-5 sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-2xl font-black text-[var(--color-brand-green)] shadow-lg sm:h-20 sm:w-20 sm:text-3xl">
              {dealer.businessName ? dealer.businessName.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  {dealer.businessName}
                </h1>
                <CertifiedBadge isCertified={dealer.isCertified} />
              </div>
              <div className="text-muted flex flex-wrap items-center gap-2 text-xs font-bold sm:text-sm">
                <span className="text-foreground/80 font-mono">ID #{dealer.id}</span>
                <span>•</span>
                <span>
                  {dealer.district}, {dealer.state}
                </span>
                <span>•</span>
                <DealerTypeBadge dealerType={dealer.dealerType} />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <VerificationBadge status={dealer.verificationStatus} />
                <ActiveBadge isActive={dealer.isActive} />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90"
            >
              <Edit2 size={16} /> Edit Basic Profile
            </button>
          </div>
        </div>

        {/* Top Quick Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[var(--border-subtle)] pt-6 sm:grid-cols-4">
          <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4">
            <div className="shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500">
              <Star size={20} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-500">
                  {Number(profile?.overallRating ?? dealer.rating ?? 0).toFixed(1)}
                </span>
                <span className="text-xs font-bold text-amber-500">★</span>
              </div>
              <div className="text-muted text-xs font-bold tracking-wider uppercase">
                Overall Rating
              </div>
            </div>
          </div>

          <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4">
            <div
              className={`shrink-0 rounded-xl border p-3 ${dealer.complaintsCount > 0 ? 'border-rose-500/20 bg-rose-500/10 text-rose-500' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'}`}
            >
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="text-foreground text-2xl font-black tracking-tight">
                {dealer.complaintsCount || 0}
              </div>
              <div className="text-muted text-xs font-bold tracking-wider uppercase">
                Complaints Logged
              </div>
            </div>
          </div>

          <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4">
            <div className="shrink-0 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-3 text-[var(--color-brand-green)]">
              <Navigation size={20} />
            </div>
            <div>
              <div className="text-foreground text-2xl font-black tracking-tight">
                {dealer.serviceRadiusKm || 10}{' '}
                <span className="text-muted text-xs font-normal">Km</span>
              </div>
              <div className="text-muted text-xs font-bold tracking-wider uppercase">
                Service Radius
              </div>
            </div>
          </div>

          <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4">
            <div className="shrink-0 rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 text-purple-600 dark:text-purple-400">
              <Layers size={20} />
            </div>
            <div>
              <div className="text-foreground text-2xl font-black tracking-tight">
                {dealer.brands?.length || 0}
              </div>
              <div className="text-muted text-xs font-bold tracking-wider uppercase">
                Brands Represented
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Notice Banner if rejected */}
      {dealer.verificationStatus === 'REJECTED' && dealer.rejectionReason && (
        <div className="space-y-1.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-xs font-bold text-rose-500">
          <div className="flex items-center gap-2 text-sm font-black tracking-wider uppercase">
            <XCircle size={18} /> Dealership Application Rejection Reason
            <span className="ml-auto rounded bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] text-rose-600 dark:text-rose-400">
              Managed by Admin
            </span>
          </div>
          <p className="text-foreground text-sm font-normal">{dealer.rejectionReason}</p>
        </div>
      )}

      {/* Navigation tabs for scrolling to sections */}
      <div className="hidden-scrollbar flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'section-basic', label: '1. Basic Info' },
          { id: 'section-business', label: '2. Business Info' },
          { id: 'section-contact', label: '3. Contact Info' },
          { id: 'section-location', label: '4. Location' },
          { id: 'section-brands', label: '5. Brands' },
          { id: 'section-facilities', label: '6. Showroom & Service' },
          { id: 'section-kyc', label: '7. KYC Info' },
          { id: 'section-verification', label: '8. Verification' },
          { id: 'section-reviews', label: '9. Ratings & Reviews' },
          { id: 'section-complaints', label: '10. Complaints' },
          { id: 'section-system', label: '11. System Info' },
        ].map((tab) => (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            className="bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground rounded-xl border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors"
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* SECTION 1: Basic Information */}
      <div id="section-basic" className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
            <Info size={20} className="text-[var(--color-brand-green)]" />
            1. Basic Information
          </h2>
          <span className="rounded-md border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
            Self-Service Editable
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Business Name</label>
            <div className="text-foreground bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-base font-bold">
              {dealer.businessName}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block flex items-center justify-between text-xs font-bold">
              <span>Slug (Public URL Identifier)</span>
              <span className="text-muted/70 flex items-center gap-1 text-[10px]">
                <Lock size={10} /> Auto-generated / Unique
              </span>
            </label>
            <div className="text-foreground bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-mono">
              {dealer.slug}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block flex items-center justify-between text-xs font-bold">
              <span>Dealer Type</span>
              <span className="text-muted/70 flex items-center gap-1 text-[10px]">
                <Lock size={10} /> Account Classification
              </span>
            </label>
            <div className="bg-foreground/5 flex items-center rounded-xl border border-[var(--border-subtle)] px-4 py-2.5">
              <DealerTypeBadge dealerType={dealer.dealerType} />
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block flex items-center justify-between text-xs font-bold">
              <span>Active Status</span>
              <span className="text-muted/70 flex items-center gap-1 text-[10px]">
                <Lock size={10} /> Managed by System
              </span>
            </label>
            <div className="bg-foreground/5 flex items-center rounded-xl border border-[var(--border-subtle)] px-4 py-2.5">
              <ActiveBadge isActive={dealer.isActive} />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-muted mb-1 block text-xs font-bold">About Dealership</label>
            <div className="text-foreground/90 bg-foreground/5 rounded-xl border border-[var(--border-subtle)] p-4 leading-relaxed font-medium whitespace-pre-line">
              {dealer.aboutDealer || 'No biography or business summary provided yet.'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Business Information */}
      <div id="section-business" className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
            <Building2 size={20} className="text-[var(--color-brand-green)]" />
            2. Business Information
          </h2>
          <span className="rounded-md border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
            Partial Self-Service
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Working Hours</label>
            <div className="text-foreground bg-foreground/5 rounded-xl border border-[var(--border-subtle)] p-4 font-mono text-xs font-medium">
              {formatWorkingHours(dealer.workingHours)}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-muted mb-1 block flex items-center justify-between text-xs font-bold">
                <span>Certified Status</span>
                <span className="text-muted/70 flex items-center gap-1 text-[10px]">
                  <Lock size={10} /> Admin Only
                </span>
              </label>
              <div className="bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-bold">
                {dealer.isCertified ? (
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Award size={16} /> Certified Dealership
                  </span>
                ) : (
                  <span className="text-muted">Not Certified</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-muted mb-1 block flex items-center justify-between text-xs font-bold">
                <span>Certification Date</span>
                <span className="text-muted/70 flex items-center gap-1 text-[10px]">
                  <Lock size={10} /> Admin Only
                </span>
              </label>
              <div className="bg-foreground/5 text-muted rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-medium">
                {dealer.certifiedAt ? new Date(dealer.certifiedAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-muted mb-1 block text-xs font-bold">
              SEO Title & Description
            </label>
            <div className="bg-foreground/5 grid grid-cols-1 gap-4 rounded-xl border border-[var(--border-subtle)] p-4 text-xs md:grid-cols-2">
              <div>
                <span className="text-muted mb-1 block font-bold">SEO Title</span>
                <span className="text-foreground font-bold">
                  {dealer.seoTitle || 'Not configured'}
                </span>
              </div>
              <div>
                <span className="text-muted mb-1 block font-bold">SEO Description</span>
                <span className="text-foreground">{dealer.seoDescription || 'Not configured'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Contact Information */}
      <div id="section-contact" className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
            <Phone size={20} className="text-[var(--color-brand-green)]" />
            3. Contact Information
          </h2>
          <span className="rounded-md border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
            Self-Service Editable
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Phone Number</label>
            <div className="text-foreground bg-foreground/5 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-bold">
              <Phone size={14} className="text-muted" />
              {dealer.phone || 'N/A'}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">WhatsApp Number</label>
            <div className="text-foreground bg-foreground/5 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-bold">
              <Phone size={14} className="text-emerald-500" />
              {dealer.whatsapp || 'N/A'}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Email Address</label>
            <div className="text-foreground bg-foreground/5 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-bold">
              <Mail size={14} className="text-muted" />
              {dealer.email || 'N/A'}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Official Website</label>
            <div className="text-foreground bg-foreground/5 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-bold">
              <Globe size={14} className="text-muted" />
              {dealer.website ? (
                <a
                  href={dealer.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[var(--color-brand-green)] hover:underline"
                >
                  {dealer.website} <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-muted font-normal">N/A</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Location */}
      <div id="section-location" className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
            <MapPin size={20} className="text-[var(--color-brand-green)]" />
            4. Location & Operational Coverage
          </h2>
          <span className="rounded-md border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
            Self-Service Editable
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-3">
          <div className="md:col-span-3">
            <label className="text-muted mb-1 block text-xs font-bold">Complete Address</label>
            <div className="text-foreground bg-foreground/5 rounded-xl border border-[var(--border-subtle)] p-4 font-bold">
              {dealer.address}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">State</label>
            <div className="text-foreground bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-bold">
              {dealer.state}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">District</label>
            <div className="text-foreground bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-bold">
              {dealer.district}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Pincode</label>
            <div className="text-foreground bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-bold">
              {dealer.pincode || 'N/A'}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Service Radius (Km)</label>
            <div className="text-foreground bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-bold">
              {dealer.serviceRadiusKm || 10} Km
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-muted mb-1 block text-xs font-bold">Service Areas Covered</label>
            <div className="text-foreground bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-medium">
              {formatServiceAreas(dealer.serviceAreas)}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">
              Coordinates (Lat / Long)
            </label>
            <div className="text-muted bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-mono text-xs">
              {dealer.latitude
                ? `${Number(dealer.latitude).toFixed(6)}, ${Number(dealer.longitude).toFixed(6)}`
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Brands */}
      <div id="section-brands" className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
            <Layers size={20} className="text-[var(--color-brand-green)]" />
            5. Dealership Brands
          </h2>
          <span className="bg-foreground/10 text-muted flex items-center gap-1 rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] font-black tracking-wider uppercase">
            <Lock size={10} /> System Managed
          </span>
        </div>

        {dealer.brands && dealer.brands.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dealer.brands.map((b) => (
              <div
                key={b.id}
                className="bg-foreground/5 hover:bg-foreground/10 flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-4 transition-all"
              >
                <div>
                  <span className="text-foreground block text-base font-black">
                    {b.brand?.name || `Brand #${b.brandId}`}
                  </span>
                  <span className="text-muted text-xs">Authorized Dealership Brand</span>
                </div>
                {b.isPrimary && (
                  <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] py-4 text-center text-sm font-medium">
            No brand associations currently linked to this dealership.
          </p>
        )}
      </div>

      {/* SECTION 6: Showroom & Service Information */}
      <div id="section-facilities" className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
            <Wrench size={20} className="text-[var(--color-brand-green)]" />
            6. Showroom & Service Facilities
          </h2>
          <span className="bg-foreground/10 text-muted flex items-center gap-1 rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] font-black tracking-wider uppercase">
            <Lock size={10} /> Linked Records
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Showroom */}
          <div className="bg-foreground/5 space-y-4 rounded-2xl border border-[var(--border-subtle)] p-5">
            <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-[var(--color-brand-green)] uppercase">
              <Store size={16} /> Showroom Facility
            </h3>
            {dealer.showroom ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted block font-bold">Showroom Name</span>
                  <span className="text-foreground text-sm font-bold">
                    {dealer.showroom.showroomName}
                  </span>
                </div>
                <div>
                  <span className="text-muted block font-bold">Address</span>
                  <span className="text-foreground">{dealer.showroom.address}</span>
                </div>
                <div className="flex items-center gap-4 border-t border-[var(--border-subtle)] pt-2">
                  <div>
                    <span className="text-muted block font-bold">Test Drives</span>
                    <span
                      className={`font-bold ${dealer.showroom.testDriveAvailable ? 'text-emerald-500' : 'text-muted'}`}
                    >
                      {dealer.showroom.testDriveAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block font-bold">Parking</span>
                    <span
                      className={`font-bold ${dealer.showroom.parkingAvailable ? 'text-emerald-500' : 'text-muted'}`}
                    >
                      {dealer.showroom.parkingAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted text-xs">
                No linked showroom record found for this dealership.
              </p>
            )}
          </div>

          {/* Service Center */}
          <div className="bg-foreground/5 space-y-4 rounded-2xl border border-[var(--border-subtle)] p-5">
            <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-[var(--color-brand-green)] uppercase">
              <Wrench size={16} /> Service Center Facility
            </h3>
            {dealer.serviceCenter ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted block font-bold">Service Name</span>
                  <span className="text-foreground text-sm font-bold">
                    {dealer.serviceCenter.serviceName}
                  </span>
                </div>
                <div>
                  <span className="text-muted block font-bold">Helpline / Emergency Phone</span>
                  <span className="text-foreground font-mono">{dealer.serviceCenter.phone}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] pt-2">
                  <div>
                    <span className="text-muted block font-bold">Pickup Service</span>
                    <span
                      className={`font-bold ${dealer.serviceCenter.hasPickupService ? 'text-emerald-500' : 'text-muted'}`}
                    >
                      {dealer.serviceCenter.hasPickupService ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block font-bold">Spare Parts</span>
                    <span
                      className={`font-bold ${dealer.serviceCenter.sparePartsAvailable ? 'text-emerald-500' : 'text-muted'}`}
                    >
                      {dealer.serviceCenter.sparePartsAvailable ? 'In Stock' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted text-xs">
                No linked service center record found for this dealership.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 7: KYC Information */}
      <div id="section-kyc" className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
            <FileText size={20} className="text-[var(--color-brand-green)]" />
            7. KYC Information
          </h2>
          <span className="flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-rose-500 uppercase">
            <Lock size={10} /> Strictly Read-Only
          </span>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs font-bold text-amber-600 dark:text-amber-400">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div className="space-y-0.5">
            <div className="text-xs font-black tracking-wider text-amber-500 uppercase">
              KYC Verification Lock
            </div>
            <p className="text-foreground font-medium">
              KYC information cannot be changed from your profile. Please contact TractorDost
              support for corrections.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div className="bg-foreground/5 space-y-2 rounded-2xl border border-[var(--border-subtle)] p-5">
            <div className="text-muted flex items-center justify-between text-xs font-bold">
              <span>PAN Number</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <Lock size={10} /> 🔒 Verified KYC
              </span>
            </div>
            <div className="text-foreground font-mono text-xl font-black tracking-wider uppercase">
              {dealer.panNumber || 'NOT PROVIDED'}
            </div>
          </div>

          <div className="bg-foreground/5 space-y-2 rounded-2xl border border-[var(--border-subtle)] p-5">
            <div className="text-muted flex items-center justify-between text-xs font-bold">
              <span>GSTIN Number</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <Lock size={10} /> 🔒 Verified KYC
              </span>
            </div>
            <div className="text-foreground font-mono text-xl font-black tracking-wider uppercase">
              {dealer.gstNumber || 'NOT PROVIDED'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 8: Verification Information */}
      <div id="section-verification" className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
            <ShieldCheck size={20} className="text-[var(--color-brand-green)]" />
            8. Verification & Admin Control
          </h2>
          <span className="bg-foreground/10 text-muted flex items-center gap-1 rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] font-black tracking-wider uppercase">
            <Lock size={10} /> Managed by Admin
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-3">
          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Verification Status</label>
            <div className="bg-foreground/5 flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-4">
              <VerificationBadge status={dealer.verificationStatus} />
              <span className="text-muted font-mono text-[10px]">🔒 Admin Only</span>
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Certified Status</label>
            <div className="bg-foreground/5 flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-4 font-bold">
              <span>{dealer.isCertified ? 'CERTIFIED' : 'NOT CERTIFIED'}</span>
              <span className="text-muted font-mono text-[10px]">🔒 Admin Only</span>
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Certification Date</label>
            <div className="bg-foreground/5 text-muted rounded-xl border border-[var(--border-subtle)] p-4 font-medium">
              {dealer.certifiedAt ? new Date(dealer.certifiedAt).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 9: Ratings & Reviews */}
      <div id="section-reviews" className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
            <Star size={20} className="text-[var(--color-brand-green)]" />
            9. Ratings & Customer Reviews
          </h2>
          <span className="bg-foreground/10 text-muted flex items-center gap-1 rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] font-black tracking-wider uppercase">
            <Lock size={10} /> Customer Generated
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="bg-foreground/5 flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] p-6 text-center">
            <div className="mb-1 text-5xl font-black text-amber-500">
              {Number(profile?.overallRating ?? dealer.rating ?? 0).toFixed(1)}
            </div>
            <div className="mb-2 flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(Number(profile?.overallRating ?? dealer.rating ?? 0))
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-muted/30'
                  }
                />
              ))}
            </div>
            <span className="text-muted text-xs font-bold">
              Based on {profile?.reviewsCount ?? dealer.reviewsCount ?? 0} customer reviews
            </span>
          </div>

          <div className="bg-foreground/5 space-y-3 rounded-2xl border border-[var(--border-subtle)] p-6 lg:col-span-2">
            <h3 className="text-muted mb-2 text-xs font-black tracking-wider uppercase">
              Rating Breakdown
            </h3>
            {profile?.ratingBreakdown ? (
              [
                { label: '5 Stars', count: profile.ratingBreakdown.fiveStar },
                { label: '4 Stars', count: profile.ratingBreakdown.fourStar },
                { label: '3 Stars', count: profile.ratingBreakdown.threeStar },
                { label: '2 Stars', count: profile.ratingBreakdown.twoStar },
                { label: '1 Star', count: profile.ratingBreakdown.oneStar },
              ].map((row, idx) => {
                const total = profile.reviewsCount || 1;
                const pct = Math.round((row.count / total) * 100);
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="text-muted w-16 shrink-0 font-bold">{row.label}</span>
                    <div className="bg-foreground/10 h-2 flex-1 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-muted w-8 shrink-0 text-right font-mono">
                      {row.count}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-muted text-xs">Rating breakdown metrics loading...</p>
            )}
          </div>
        </div>

        {profile?.recentReviews && profile.recentReviews.length > 0 && (
          <div className="space-y-3 border-t border-[var(--border-subtle)] pt-6">
            <h3 className="text-muted text-xs font-black tracking-wider uppercase">
              Recent Customer Reviews
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {profile.recentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-foreground/5 space-y-2 rounded-2xl border border-[var(--border-subtle)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-muted/30'}
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold text-amber-500">{rev.rating}.0</span>
                    </div>
                    {rev.createdAt && (
                      <span className="text-muted text-[10px]">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {rev.headline && (
                    <h4 className="text-foreground text-xs font-bold">{rev.headline}</h4>
                  )}
                  {rev.body && (
                    <p className="text-muted text-xs font-medium">{rev.body}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 10: Complaints */}
      <div id="section-complaints" className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
            <MessageSquare size={20} className="text-[var(--color-brand-green)]" />
            10. Complaints & Grievances
          </h2>
          <span className="bg-foreground/10 text-muted flex items-center gap-1 rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] font-black tracking-wider uppercase">
            <Lock size={10} /> Customer & Support Log
          </span>
        </div>

        {profile?.grievanceStats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-foreground/5 rounded-xl border border-[var(--border-subtle)] p-4 text-center">
              <div className="text-foreground text-xl font-black">
                {profile.grievanceStats.totalGrievances}
              </div>
              <div className="text-muted mt-1 text-[10px] font-bold uppercase">
                Total Complaints
              </div>
            </div>
            <div className="bg-foreground/5 rounded-xl border border-[var(--border-subtle)] p-4 text-center">
              <div className="text-xl font-black text-emerald-500">
                {profile.grievanceStats.resolved}
              </div>
              <div className="text-muted mt-1 text-[10px] font-bold uppercase">Resolved</div>
            </div>
            <div className="bg-foreground/5 rounded-xl border border-[var(--border-subtle)] p-4 text-center">
              <div className="text-xl font-black text-amber-500">
                {profile.grievanceStats.pending}
              </div>
              <div className="text-muted mt-1 text-[10px] font-bold uppercase">Pending</div>
            </div>
            <div className="bg-foreground/5 rounded-xl border border-[var(--border-subtle)] p-4 text-center">
              <div className="text-xl font-black text-[var(--color-brand-green)]">
                {profile.grievanceStats.resolutionRate}
              </div>
              <div className="text-muted mt-1 text-[10px] font-bold uppercase">Resolution Rate</div>
            </div>
          </div>
        )}

        {dealer.grievances && dealer.grievances.length > 0 ? (
          <div className="space-y-3 pt-2">
            {dealer.grievances.map((g) => (
              <div
                key={g.id}
                className="bg-foreground/5 space-y-1.5 rounded-xl border border-[var(--border-subtle)] p-4 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-foreground text-sm">{g.title}</span>
                  <span className="bg-foreground/10 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                    {g.status}
                  </span>
                </div>
                <p className="text-muted">{g.description}</p>
                <div className="text-muted/70 flex items-center justify-between pt-1 font-mono text-[10px]">
                  <span>Ref: {g.referenceNo}</span>
                  <span>Logged: {new Date(g.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] py-4 text-center text-sm font-medium">
            No complaints recorded against this dealership.
          </p>
        )}
      </div>

      {/* SECTION 11: Account / System Information */}
      <div id="section-system" className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
            <Calendar size={20} className="text-[var(--color-brand-green)]" />
            11. Account & System Information
          </h2>
          <span className="bg-foreground/10 text-muted flex items-center gap-1 rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] font-black tracking-wider uppercase">
            <Lock size={10} /> Strictly System Audit
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Internal Dealer ID</label>
            <div className="text-foreground bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-mono font-bold">
              #{dealer.id}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Linked User ID</label>
            <div className="text-foreground bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-mono font-bold">
              {dealer.userId ? `#${dealer.userId}` : 'Unlinked'}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Created At</label>
            <div className="text-muted bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-mono text-xs">
              {dealer.createdAt ? new Date(dealer.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Last Updated</label>
            <div className="text-muted bg-foreground/5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-mono text-xs">
              {dealer.updatedAt ? new Date(dealer.updatedAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
