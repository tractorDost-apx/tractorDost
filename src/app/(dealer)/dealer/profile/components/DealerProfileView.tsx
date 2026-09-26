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
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner / Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] flex items-center justify-center border border-[var(--color-brand-green)]/20 font-black text-2xl sm:text-3xl shrink-0 shadow-lg">
              {dealer.businessName ? dealer.businessName.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {dealer.businessName}
                </h1>
                <CertifiedBadge isCertified={dealer.isCertified} />
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-bold text-muted">
                <span className="font-mono text-foreground/80">ID #{dealer.id}</span>
                <span>•</span>
                <span>{dealer.district}, {dealer.state}</span>
                <span>•</span>
                <DealerTypeBadge dealerType={dealer.dealerType} />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <VerificationBadge status={dealer.verificationStatus} />
                <ActiveBadge isActive={dealer.isActive} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onEdit}
              className="px-5 py-2.5 bg-[var(--color-brand-green)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-md flex items-center gap-2"
            >
              <Edit2 size={16} /> Edit Basic Profile
            </button>
          </div>
        </div>

        {/* Top Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[var(--border-subtle)]">
          <div className="bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 border border-amber-500/20">
              <Star size={20} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-500">
                  {Number(dealer.rating || 0).toFixed(1)}
                </span>
                <span className="text-xs text-amber-500 font-bold">★</span>
              </div>
              <div className="text-xs font-bold text-muted uppercase tracking-wider">Overall Rating</div>
            </div>
          </div>

          <div className="bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-4">
            <div className={`p-3 rounded-xl shrink-0 border ${dealer.complaintsCount > 0 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-foreground">{dealer.complaintsCount || 0}</div>
              <div className="text-xs font-bold text-muted uppercase tracking-wider">Complaints Logged</div>
            </div>
          </div>

          <div className="bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 shrink-0">
              <Navigation size={20} />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-foreground">{dealer.serviceRadiusKm || 10} <span className="text-xs text-muted font-normal">Km</span></div>
              <div className="text-xs font-bold text-muted uppercase tracking-wider">Service Radius</div>
            </div>
          </div>

          <div className="bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-foreground">{dealer.brands?.length || 0}</div>
              <div className="text-xs font-bold text-muted uppercase tracking-wider">Brands Represented</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Notice Banner if rejected */}
      {dealer.verificationStatus === 'REJECTED' && dealer.rejectionReason && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold space-y-1.5">
          <div className="flex items-center gap-2 text-sm uppercase tracking-wider font-black">
            <XCircle size={18} /> Dealership Application Rejection Reason
            <span className="ml-auto px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-600 dark:text-rose-400 font-mono">Managed by Admin</span>
          </div>
          <p className="font-normal text-foreground text-sm">{dealer.rejectionReason}</p>
        </div>
      )}

      {/* Navigation tabs for scrolling to sections */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 hidden-scrollbar">
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
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground border border-[var(--border-subtle)] whitespace-nowrap transition-colors"
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* SECTION 1: Basic Information */}
      <div id="section-basic" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Info size={20} className="text-[var(--color-brand-green)]" />
            1. Basic Information
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
            Self-Service Editable
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="text-xs font-bold text-muted block mb-1">Business Name</label>
            <div className="font-bold text-foreground text-base bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              {dealer.businessName}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1 flex items-center justify-between">
              <span>Slug (Public URL Identifier)</span>
              <span className="text-[10px] text-muted/70 flex items-center gap-1"><Lock size={10} /> Auto-generated / Unique</span>
            </label>
            <div className="font-mono text-foreground bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              {dealer.slug}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1 flex items-center justify-between">
              <span>Dealer Type</span>
              <span className="text-[10px] text-muted/70 flex items-center gap-1"><Lock size={10} /> Account Classification</span>
            </label>
            <div className="bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center">
              <DealerTypeBadge dealerType={dealer.dealerType} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1 flex items-center justify-between">
              <span>Active Status</span>
              <span className="text-[10px] text-muted/70 flex items-center gap-1"><Lock size={10} /> Managed by System</span>
            </label>
            <div className="bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center">
              <ActiveBadge isActive={dealer.isActive} />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted block mb-1">About Dealership</label>
            <div className="text-foreground/90 leading-relaxed font-medium bg-foreground/5 p-4 rounded-xl border border-[var(--border-subtle)] whitespace-pre-line">
              {dealer.aboutDealer || 'No biography or business summary provided yet.'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Business Information */}
      <div id="section-business" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Building2 size={20} className="text-[var(--color-brand-green)]" />
            2. Business Information
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
            Partial Self-Service
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="text-xs font-bold text-muted block mb-1">Working Hours</label>
            <div className="font-medium text-foreground bg-foreground/5 p-4 rounded-xl border border-[var(--border-subtle)] font-mono text-xs">
              {formatWorkingHours(dealer.workingHours)}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted block mb-1 flex items-center justify-between">
                <span>Certified Status</span>
                <span className="text-[10px] text-muted/70 flex items-center gap-1"><Lock size={10} /> Admin Only</span>
              </label>
              <div className="bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] font-bold">
                {dealer.isCertified ? (
                  <span className="text-amber-500 flex items-center gap-1.5">
                    <Award size={16} /> Certified Dealership
                  </span>
                ) : (
                  <span className="text-muted">Not Certified</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1 flex items-center justify-between">
                <span>Certification Date</span>
                <span className="text-[10px] text-muted/70 flex items-center gap-1"><Lock size={10} /> Admin Only</span>
              </label>
              <div className="bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] font-medium text-muted">
                {dealer.certifiedAt ? new Date(dealer.certifiedAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted block mb-1">SEO Title & Description</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-foreground/5 p-4 rounded-xl border border-[var(--border-subtle)] text-xs">
              <div>
                <span className="text-muted font-bold block mb-1">SEO Title</span>
                <span className="font-bold text-foreground">{dealer.seoTitle || 'Not configured'}</span>
              </div>
              <div>
                <span className="text-muted font-bold block mb-1">SEO Description</span>
                <span className="text-foreground">{dealer.seoDescription || 'Not configured'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Contact Information */}
      <div id="section-contact" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Phone size={20} className="text-[var(--color-brand-green)]" />
            3. Contact Information
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
            Self-Service Editable
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="text-xs font-bold text-muted block mb-1">Phone Number</label>
            <div className="font-bold text-foreground bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center gap-2">
              <Phone size={14} className="text-muted" />
              {dealer.phone || 'N/A'}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">WhatsApp Number</label>
            <div className="font-bold text-foreground bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center gap-2">
              <Phone size={14} className="text-emerald-500" />
              {dealer.whatsapp || 'N/A'}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Email Address</label>
            <div className="font-bold text-foreground bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center gap-2">
              <Mail size={14} className="text-muted" />
              {dealer.email || 'N/A'}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Official Website</label>
            <div className="font-bold text-foreground bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center gap-2">
              <Globe size={14} className="text-muted" />
              {dealer.website ? (
                <a href={dealer.website} target="_blank" rel="noreferrer" className="text-[var(--color-brand-green)] hover:underline flex items-center gap-1">
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
      <div id="section-location" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <MapPin size={20} className="text-[var(--color-brand-green)]" />
            4. Location & Operational Coverage
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
            Self-Service Editable
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-muted block mb-1">Complete Address</label>
            <div className="font-bold text-foreground bg-foreground/5 p-4 rounded-xl border border-[var(--border-subtle)]">
              {dealer.address}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">State</label>
            <div className="font-bold text-foreground bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              {dealer.state}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">District</label>
            <div className="font-bold text-foreground bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              {dealer.district}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Pincode</label>
            <div className="font-bold text-foreground bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              {dealer.pincode || 'N/A'}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Service Radius (Km)</label>
            <div className="font-bold text-foreground bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              {dealer.serviceRadiusKm || 10} Km
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted block mb-1">Service Areas Covered</label>
            <div className="font-medium text-foreground bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              {formatServiceAreas(dealer.serviceAreas)}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Coordinates (Lat / Long)</label>
            <div className="font-mono text-xs text-muted bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              {dealer.latitude ? `${Number(dealer.latitude).toFixed(6)}, ${Number(dealer.longitude).toFixed(6)}` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Brands */}
      <div id="section-brands" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Layers size={20} className="text-[var(--color-brand-green)]" />
            5. Dealership Brands
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-foreground/10 text-muted border border-[var(--border-subtle)] flex items-center gap-1">
            <Lock size={10} /> System Managed
          </span>
        </div>

        {dealer.brands && dealer.brands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dealer.brands.map((b) => (
              <div key={b.id} className="p-4 bg-foreground/5 rounded-2xl flex items-center justify-between border border-[var(--border-subtle)] hover:bg-foreground/10 transition-all">
                <div>
                  <span className="font-black text-foreground text-base block">{b.brand?.name || `Brand #${b.brandId}`}</span>
                  <span className="text-xs text-muted">Authorized Dealership Brand</span>
                </div>
                {b.isPrimary && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted font-medium py-4 text-center bg-foreground/5 rounded-2xl border border-[var(--border-subtle)]">
            No brand associations currently linked to this dealership.
          </p>
        )}
      </div>

      {/* SECTION 6: Showroom & Service Information */}
      <div id="section-facilities" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Wrench size={20} className="text-[var(--color-brand-green)]" />
            6. Showroom & Service Facilities
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-foreground/10 text-muted border border-[var(--border-subtle)] flex items-center gap-1">
            <Lock size={10} /> Linked Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Showroom */}
          <div className="p-5 rounded-2xl bg-foreground/5 border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-sm font-black uppercase text-[var(--color-brand-green)] tracking-wider flex items-center gap-2">
              <Store size={16} /> Showroom Facility
            </h3>
            {dealer.showroom ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted block font-bold">Showroom Name</span>
                  <span className="font-bold text-foreground text-sm">{dealer.showroom.showroomName}</span>
                </div>
                <div>
                  <span className="text-muted block font-bold">Address</span>
                  <span className="text-foreground">{dealer.showroom.address}</span>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-[var(--border-subtle)]">
                  <div>
                    <span className="text-muted block font-bold">Test Drives</span>
                    <span className={`font-bold ${dealer.showroom.testDriveAvailable ? 'text-emerald-500' : 'text-muted'}`}>
                      {dealer.showroom.testDriveAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block font-bold">Parking</span>
                    <span className={`font-bold ${dealer.showroom.parkingAvailable ? 'text-emerald-500' : 'text-muted'}`}>
                      {dealer.showroom.parkingAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted">No linked showroom record found for this dealership.</p>
            )}
          </div>

          {/* Service Center */}
          <div className="p-5 rounded-2xl bg-foreground/5 border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-sm font-black uppercase text-[var(--color-brand-green)] tracking-wider flex items-center gap-2">
              <Wrench size={16} /> Service Center Facility
            </h3>
            {dealer.serviceCenter ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted block font-bold">Service Name</span>
                  <span className="font-bold text-foreground text-sm">{dealer.serviceCenter.serviceName}</span>
                </div>
                <div>
                  <span className="text-muted block font-bold">Helpline / Emergency Phone</span>
                  <span className="text-foreground font-mono">{dealer.serviceCenter.phone}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <div>
                    <span className="text-muted block font-bold">Pickup Service</span>
                    <span className={`font-bold ${dealer.serviceCenter.hasPickupService ? 'text-emerald-500' : 'text-muted'}`}>
                      {dealer.serviceCenter.hasPickupService ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block font-bold">Spare Parts</span>
                    <span className={`font-bold ${dealer.serviceCenter.sparePartsAvailable ? 'text-emerald-500' : 'text-muted'}`}>
                      {dealer.serviceCenter.sparePartsAvailable ? 'In Stock' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted">No linked service center record found for this dealership.</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 7: KYC Information */}
      <div id="section-kyc" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <FileText size={20} className="text-[var(--color-brand-green)]" />
            7. KYC Information
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
            <Lock size={10} /> Strictly Read-Only
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-black text-amber-500 uppercase tracking-wider text-xs">KYC Verification Lock</div>
            <p className="font-medium text-foreground">
              KYC information cannot be changed from your profile. Please contact TractorDost support for corrections.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="p-5 rounded-2xl bg-foreground/5 border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted">
              <span>PAN Number</span>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <Lock size={10} /> 🔒 Verified KYC
              </span>
            </div>
            <div className="font-mono text-xl font-black text-foreground tracking-wider uppercase">
              {dealer.panNumber || 'NOT PROVIDED'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-foreground/5 border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted">
              <span>GSTIN Number</span>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <Lock size={10} /> 🔒 Verified KYC
              </span>
            </div>
            <div className="font-mono text-xl font-black text-foreground tracking-wider uppercase">
              {dealer.gstNumber || 'NOT PROVIDED'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 8: Verification Information */}
      <div id="section-verification" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <ShieldCheck size={20} className="text-[var(--color-brand-green)]" />
            8. Verification & Admin Control
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-foreground/10 text-muted border border-[var(--border-subtle)] flex items-center gap-1">
            <Lock size={10} /> Managed by Admin
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="text-xs font-bold text-muted block mb-1">Verification Status</label>
            <div className="bg-foreground/5 p-4 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between">
              <VerificationBadge status={dealer.verificationStatus} />
              <span className="text-[10px] text-muted font-mono">🔒 Admin Only</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Certified Status</label>
            <div className="bg-foreground/5 p-4 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between font-bold">
              <span>{dealer.isCertified ? 'CERTIFIED' : 'NOT CERTIFIED'}</span>
              <span className="text-[10px] text-muted font-mono">🔒 Admin Only</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Certification Date</label>
            <div className="bg-foreground/5 p-4 rounded-xl border border-[var(--border-subtle)] font-medium text-muted">
              {dealer.certifiedAt ? new Date(dealer.certifiedAt).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 9: Ratings & Reviews */}
      <div id="section-reviews" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Star size={20} className="text-[var(--color-brand-green)]" />
            9. Ratings & Customer Reviews
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-foreground/10 text-muted border border-[var(--border-subtle)] flex items-center gap-1">
            <Lock size={10} /> Customer Generated
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-foreground/5 border border-[var(--border-subtle)] flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-black text-amber-500 mb-1">
              {Number(dealer.rating || 0).toFixed(1)}
            </div>
            <div className="flex items-center gap-1 text-amber-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.round(Number(dealer.rating || 0)) ? 'fill-amber-500 text-amber-500' : 'text-muted/30'}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-muted">
              Based on {dealer.reviewsCount || 0} customer reviews
            </span>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-foreground/5 border border-[var(--border-subtle)] space-y-3">
            <h3 className="text-xs font-black uppercase text-muted tracking-wider mb-2">Rating Breakdown</h3>
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
                    <span className="w-16 font-bold text-muted shrink-0">{row.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-foreground/10 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 font-mono text-right text-muted shrink-0">{row.count}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted">Rating breakdown metrics loading...</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 10: Complaints */}
      <div id="section-complaints" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <MessageSquare size={20} className="text-[var(--color-brand-green)]" />
            10. Complaints & Grievances
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-foreground/10 text-muted border border-[var(--border-subtle)] flex items-center gap-1">
            <Lock size={10} /> Customer & Support Log
          </span>
        </div>

        {profile?.grievanceStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-foreground/5 border border-[var(--border-subtle)] text-center">
              <div className="text-xl font-black text-foreground">{profile.grievanceStats.totalGrievances}</div>
              <div className="text-[10px] text-muted uppercase font-bold mt-1">Total Complaints</div>
            </div>
            <div className="p-4 rounded-xl bg-foreground/5 border border-[var(--border-subtle)] text-center">
              <div className="text-xl font-black text-emerald-500">{profile.grievanceStats.resolved}</div>
              <div className="text-[10px] text-muted uppercase font-bold mt-1">Resolved</div>
            </div>
            <div className="p-4 rounded-xl bg-foreground/5 border border-[var(--border-subtle)] text-center">
              <div className="text-xl font-black text-amber-500">{profile.grievanceStats.pending}</div>
              <div className="text-[10px] text-muted uppercase font-bold mt-1">Pending</div>
            </div>
            <div className="p-4 rounded-xl bg-foreground/5 border border-[var(--border-subtle)] text-center">
              <div className="text-xl font-black text-[var(--color-brand-green)]">{profile.grievanceStats.resolutionRate}</div>
              <div className="text-[10px] text-muted uppercase font-bold mt-1">Resolution Rate</div>
            </div>
          </div>
        )}

        {dealer.grievances && dealer.grievances.length > 0 ? (
          <div className="space-y-3 pt-2">
            {dealer.grievances.map((g) => (
              <div key={g.id} className="p-4 rounded-xl bg-foreground/5 border border-[var(--border-subtle)] space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-foreground text-sm">{g.title}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-foreground/10 text-[var(--color-brand-green)]">
                    {g.status}
                  </span>
                </div>
                <p className="text-muted">{g.description}</p>
                <div className="flex items-center justify-between text-[10px] text-muted/70 font-mono pt-1">
                  <span>Ref: {g.referenceNo}</span>
                  <span>Logged: {new Date(g.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted font-medium py-4 text-center bg-foreground/5 rounded-2xl border border-[var(--border-subtle)]">
            No complaints recorded against this dealership.
          </p>
        )}
      </div>

      {/* SECTION 11: Account / System Information */}
      <div id="section-system" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Calendar size={20} className="text-[var(--color-brand-green)]" />
            11. Account & System Information
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-foreground/10 text-muted border border-[var(--border-subtle)] flex items-center gap-1">
            <Lock size={10} /> Strictly System Audit
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <label className="text-xs font-bold text-muted block mb-1">Internal Dealer ID</label>
            <div className="font-mono text-foreground font-bold bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              #{dealer.id}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Linked User ID</label>
            <div className="font-mono text-foreground font-bold bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              {dealer.userId ? `#${dealer.userId}` : 'Unlinked'}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Created At</label>
            <div className="font-mono text-xs text-muted bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              {dealer.createdAt ? new Date(dealer.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Last Updated</label>
            <div className="font-mono text-xs text-muted bg-foreground/5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
              {dealer.updatedAt ? new Date(dealer.updatedAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
