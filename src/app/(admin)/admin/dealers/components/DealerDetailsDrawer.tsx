'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  FileText,
  Store,
  Layers,
  Edit2,
  Info,
  Calendar,
  MessageSquare,
  Wrench,
} from 'lucide-react';
import { dealerAPI } from '@/lib/api/dealers';
import { Dealer, DealerProfileSummary } from '@/types/models/dealer';
import {
  VerificationBadge,
  CertifiedBadge,
  ActiveBadge,
  DealerTypeBadge,
} from './DealerStatusBadge';
import { DealerBrandManagementModal } from './DealerBrandManagementModal';
import { DealerPerformanceMetrics } from './DealerPerformanceMetrics';

interface DealerDetailsDrawerProps {
  dealerId: number | null;
  onClose: () => void;
  onOpenEdit: (dealer: Dealer) => void;
  onOpenModeration: (dealer: Dealer) => void;
}

type TabType =
  | 'overview'
  | 'business'
  | 'contact_kyc'
  | 'location'
  | 'brands'
  | 'inventory'
  | 'facilities'
  | 'reviews_complaints'
  | 'metadata';

export function DealerDetailsDrawer({
  dealerId,
  onClose,
  onOpenEdit,
  onOpenModeration,
}: DealerDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [profile, setProfile] = useState<DealerProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch details and reset state when dealerId changes
  useEffect(() => {
    setDealer(null);
    setProfile(null);
    setActiveTab('overview');
    setError(null);

    if (!dealerId) return;

    let isMounted = true;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [dealerRes, profileRes] = await Promise.allSettled([
          dealerAPI.getDealerById(dealerId),
          dealerAPI.getDealerProfile(dealerId),
        ]);

        if (!isMounted) return;

        if (dealerRes.status === 'fulfilled' && dealerRes.value.success) {
          setDealer(dealerRes.value.data);
        } else {
          setError('Failed to load dealer details');
        }

        if (profileRes.status === 'fulfilled' && profileRes.value.success) {
          setProfile(profileRes.value.data);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Error fetching dealer details:', err);
        setError(err?.response?.data?.message || 'Error loading dealer details');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [dealerId]);

  // Handle Escape Key Listener & Body Scroll Lock
  useEffect(() => {
    if (!dealerId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [dealerId, onClose]);

  if (!dealerId || !mounted) return null;

  const drawerContent = (
    <div
      onClick={onClose}
      className="animate-fade-in fixed inset-0 top-0 left-0 z-[100] flex h-screen w-screen justify-end overflow-hidden bg-black/80 backdrop-blur-md"
    >
      {/* Inner Panel - Flex Container with strict min-h-0 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full max-h-screen w-full max-w-4xl shrink-0 flex-col overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl"
      >
        {/* 1. DEALER HEADER (FIXED TOP, SHRINK-0) */}
        <div className="z-20 flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/5 p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10 text-xl font-black text-lime-400">
              {dealer?.businessName ? dealer.businessName.charAt(0).toUpperCase() : 'D'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-foreground text-xl font-black tracking-tight">
                  {dealer?.businessName || 'Loading Dealer...'}
                </h2>
                {dealer && <CertifiedBadge isCertified={dealer.isCertified} />}
              </div>
              <p className="text-muted mt-0.5 text-xs font-bold">
                Dealer ID #{dealerId} • {dealer?.district || '...'}, {dealer?.state || '...'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {dealer && (
              <>
                <button
                  onClick={() => onOpenEdit(dealer)}
                  className="text-foreground flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2 text-xs font-bold transition-colors hover:bg-foreground/10"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => onOpenModeration(dealer)}
                  className="flex items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-2 text-xs font-black tracking-wider text-black uppercase transition-colors hover:bg-lime-300"
                >
                  <ShieldCheck size={14} /> Moderate
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-muted hover:text-foreground rounded-xl p-2 transition-colors hover:bg-foreground/10"
              title="Close panel (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 2. DETAILS NAVIGATION (FIXED BELOW HEADER, HORIZONTALLY SCROLLABLE ONLY) */}
        <div className="scrollbar-thin scrollbar-thumb-lime-400/30 scrollbar-track-transparent z-10 flex w-full shrink-0 items-center gap-2 overflow-x-auto border-b border-[var(--border-subtle)] bg-foreground/5 px-6 py-3 whitespace-nowrap backdrop-blur-md">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'business', label: 'Business', icon: Building2 },
            { id: 'contact_kyc', label: 'Contact & KYC', icon: FileText },
            { id: 'location', label: 'Location', icon: MapPin },
            { id: 'brands', label: 'Brands', icon: Layers },
            { id: 'inventory', label: 'Inventory', icon: Store },
            { id: 'facilities', label: 'Showroom & Service', icon: Wrench },
            { id: 'reviews_complaints', label: 'Reviews & Grievances', icon: MessageSquare },
            { id: 'metadata', label: 'Metadata', icon: Calendar },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'border border-lime-400/30 bg-lime-400/10 font-black text-lime-400 shadow-sm'
                    : 'text-muted hover:text-foreground border border-transparent hover:bg-foreground/5'
                }`}
              >
                <IconComponent size={14} className={isActive ? 'text-lime-400' : 'text-muted'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 3. CONTENT BODY (VERTICALLY SCROLLABLE ONLY) */}
        <div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4 py-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-foreground/5" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-bold text-rose-400">
              {error}
            </div>
          ) : dealer ? (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl  p-5">
                    <div className="flex items-center gap-3">
                      <VerificationBadge status={dealer.verificationStatus} />
                      <ActiveBadge isActive={dealer.isActive} />
                      <DealerTypeBadge dealerType={dealer.dealerType} />
                    </div>

                    <div className="text-muted flex items-center gap-4 text-xs font-bold">
                      <span>
                        Rating:{' '}
                        <strong className="text-foreground">
                          {Number(dealer.rating || 0).toFixed(1)} ★
                        </strong>
                      </span>
                      <span>
                        Reviews:{' '}
                        <strong className="text-foreground">{dealer.reviewsCount || 0}</strong>
                      </span>
                      <span>
                        Complaints:{' '}
                        <strong className="text-foreground">{dealer.complaintsCount || 0}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Rejection notice if rejected */}
                  {dealer.verificationStatus === 'REJECTED' && dealer.rejectionReason && (
                    <div className="space-y-1 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
                      <div className="flex items-center gap-1.5 text-sm font-black tracking-wider uppercase">
                        <XCircle size={16} /> Rejection Reason
                      </div>
                      <p className="font-normal text-rose-300">{dealer.rejectionReason}</p>
                    </div>
                  )}

                  {/* Quick Summary Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="glass-panel space-y-2 rounded-2xl  p-4">
                      <div className="text-muted text-xs font-bold tracking-wider uppercase">
                        Contact Info
                      </div>
                      <div className="text-foreground text-sm font-bold">
                        {dealer.phone || 'N/A'}
                      </div>
                      <div className="text-muted text-xs">
                        {dealer.email || 'No email provided'}
                      </div>
                    </div>

                    <div className="glass-panel space-y-2 rounded-2xl  p-4">
                      <div className="text-muted text-xs font-bold tracking-wider uppercase">
                        Location
                      </div>
                      <div className="text-foreground text-sm font-bold">{dealer.address}</div>
                      <div className="text-muted text-xs">
                        {dealer.district}, {dealer.state} - {dealer.pincode || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* About Dealer */}
                  {dealer.aboutDealer && (
                    <div className="glass-panel space-y-2 rounded-2xl  p-5">
                      <h4 className="text-muted text-xs font-black tracking-wider uppercase">
                        About Dealership
                      </h4>
                      <p className="text-foreground/90 text-sm leading-relaxed font-medium">
                        {dealer.aboutDealer}
                      </p>
                    </div>
                  )}

                  {/* Performance & Resolution Metrics */}
                  <DealerPerformanceMetrics profile={profile} loading={loading} />
                </div>
              )}

              {/* TAB 2: BUSINESS */}
              {activeTab === 'business' && (
                <div className="space-y-4">
                  <div className="glass-panel space-y-4 rounded-2xl  p-5">
                    <h3 className="text-sm font-black tracking-wider text-lime-400 uppercase">
                      Business Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
                      <div>
                        <span className="text-muted block font-bold">Business Name</span>
                        <span className="text-foreground text-sm font-black">
                          {dealer.businessName}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block font-bold">Slug</span>
                        <span className="text-foreground inline-block rounded-md bg-foreground/5 px-2 py-1 font-mono">
                          {dealer.slug}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block font-bold">Dealer Type</span>
                        <DealerTypeBadge dealerType={dealer.dealerType} />
                      </div>
                      <div>
                        <span className="text-muted block font-bold">Certified Status</span>
                        <span className="text-foreground font-bold">
                          {dealer.isCertified
                            ? `Yes (at ${dealer.certifiedAt ? new Date(dealer.certifiedAt).toLocaleDateString() : 'N/A'})`
                            : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel space-y-3 rounded-2xl  p-5">
                    <h3 className="text-sm font-black tracking-wider text-lime-400 uppercase">
                      Working Hours & Operations
                    </h3>
                    <div className="text-foreground overflow-x-auto rounded-xl bg-foreground/5 p-3 font-mono text-xs font-medium">
                      {dealer.workingHours
                        ? JSON.stringify(dealer.workingHours, null, 2)
                        : 'Standard business hours'}
                    </div>
                  </div>

                  <div className="glass-panel space-y-3 rounded-2xl  p-5">
                    <h3 className="text-sm font-black tracking-wider text-lime-400 uppercase">
                      SEO Metadata
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-muted block font-bold">SEO Title</span>
                        <span className="text-foreground font-bold">
                          {dealer.seoTitle || 'Not configured'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block font-bold">SEO Description</span>
                        <span className="text-foreground">
                          {dealer.seoDescription || 'Not configured'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTACT & KYC */}
              {activeTab === 'contact_kyc' && (
                <div className="space-y-4">
                  <div className="glass-panel space-y-4 rounded-2xl  p-5">
                    <h3 className="text-sm font-black tracking-wider text-lime-400 uppercase">
                      Contact Communication
                    </h3>
                    <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
                      <div>
                        <span className="text-muted block font-bold">Phone Number</span>
                        <span className="text-foreground text-sm font-black">
                          {dealer.phone || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block font-bold">WhatsApp Number</span>
                        <span className="text-foreground font-bold">
                          {dealer.whatsapp || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block font-bold">Email Address</span>
                        <span className="text-foreground font-bold">{dealer.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted block font-bold">Official Website</span>
                        {dealer.website ? (
                          <a
                            href={dealer.website}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-lime-400 underline"
                          >
                            {dealer.website}
                          </a>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel space-y-4 rounded-2xl  p-5">
                    <h3 className="text-sm font-black tracking-wider text-lime-400 uppercase">
                      KYC Verification Data
                    </h3>
                    <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
                      <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-4">
                        <span className="text-muted mb-1 block font-bold">PAN Number</span>
                        <span className="text-foreground font-mono text-base font-black tracking-wider uppercase">
                          {dealer.panNumber || 'NOT PROVIDED'}
                        </span>
                      </div>
                      <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-4">
                        <span className="text-muted mb-1 block font-bold">GSTIN Number</span>
                        <span className="text-foreground font-mono text-base font-black tracking-wider uppercase">
                          {dealer.gstNumber || 'NOT PROVIDED'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LOCATION */}
              {activeTab === 'location' && (
                <div className="glass-panel space-y-4 rounded-2xl  p-5">
                  <h3 className="text-sm font-black tracking-wider text-lime-400 uppercase">
                    Geographic Location
                  </h3>
                  <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
                    <div className="md:col-span-2">
                      <span className="text-muted block font-bold">Complete Address</span>
                      <span className="text-foreground text-sm font-bold">{dealer.address}</span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">State</span>
                      <span className="text-foreground font-bold">{dealer.state}</span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">District</span>
                      <span className="text-foreground font-bold">{dealer.district}</span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">Pincode</span>
                      <span className="text-foreground font-bold">{dealer.pincode || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">Service Radius</span>
                      <span className="text-foreground font-bold">
                        {dealer.serviceRadiusKm || 10} Km
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">Latitude</span>
                      <span className="text-foreground font-mono">
                        {dealer.latitude ? Number(dealer.latitude).toFixed(6) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">Longitude</span>
                      <span className="text-foreground font-mono">
                        {dealer.longitude ? Number(dealer.longitude).toFixed(6) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BRANDS */}
              {activeTab === 'brands' && (
                <div className="glass-panel space-y-4 rounded-2xl  p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black tracking-wider text-lime-400 uppercase">
                      Dealership Brands
                    </h3>
                    <button
                      onClick={() => setShowBrandModal(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-lime-400/20 bg-lime-400/10 px-3 py-1.5 text-xs font-bold text-lime-400 transition-colors hover:bg-lime-400/20"
                    >
                      <Layers size={14} /> Manage Brands
                    </button>
                  </div>
                  {dealer.brands && dealer.brands.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {dealer.brands.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3"
                        >
                          <span className="text-foreground text-sm font-bold">
                            {b.brand?.name || `Brand #${b.brandId}`}
                          </span>
                          {b.isPrimary && (
                            <span className="rounded bg-lime-400/20 px-2 py-0.5 text-[10px] font-black text-lime-400 uppercase">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-xs font-medium">
                      No associated brands configured yet.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 6: INVENTORY */}
              {activeTab === 'inventory' && (
                <div className="glass-panel space-y-4 rounded-2xl  p-5">
                  <h3 className="text-sm font-black tracking-wider text-lime-400 uppercase">
                    Dealership Stock Inventory
                  </h3>
                  {dealer.inventory && dealer.inventory.length > 0 ? (
                    <div className="space-y-2">
                      {dealer.inventory.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between rounded-xl bg-foreground/5 p-3 text-xs"
                        >
                          <div>
                            <span className="text-foreground font-bold">
                              {inv.customModel || `Tractor #${inv.tractorId}`}
                            </span>
                            <span className="text-muted block text-[11px]">
                              Updated: {new Date(inv.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm font-black text-lime-400">
                              {inv.stockCount} units
                            </span>
                            <span
                              className={`text-[10px] font-bold ${inv.isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}
                            >
                              {inv.isAvailable ? 'Available' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-xs font-medium">
                      No inventory items listed for this dealership.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 7: SHOWROOM & SERVICE */}
              {activeTab === 'facilities' && (
                <div className="space-y-4">
                  {/* Showroom */}
                  <div className="glass-panel space-y-3 rounded-2xl  p-5">
                    <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-lime-400 uppercase">
                      <Store size={16} /> Showroom Facility
                    </h3>
                    {dealer.showroom ? (
                      <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                        <div>
                          <span className="text-muted block">Showroom Name</span>
                          <span className="text-foreground font-bold">
                            {dealer.showroom.showroomName}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block">Address</span>
                          <span className="text-foreground font-bold">
                            {dealer.showroom.address}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block">Test Drives</span>
                          <span className="text-foreground font-bold">
                            {dealer.showroom.testDriveAvailable ? 'Available' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block">Parking</span>
                          <span className="text-foreground font-bold">
                            {dealer.showroom.parkingAvailable ? 'Available' : 'No'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted text-xs">No linked showroom record found.</p>
                    )}
                  </div>

                  {/* Service Center */}
                  <div className="glass-panel space-y-3 rounded-2xl  p-5">
                    <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-lime-400 uppercase">
                      <Wrench size={16} /> Service Center Facility
                    </h3>
                    {dealer.serviceCenter ? (
                      <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                        <div>
                          <span className="text-muted block">Service Name</span>
                          <span className="text-foreground font-bold">
                            {dealer.serviceCenter.serviceName}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block">Emergency Service</span>
                          <span className="text-foreground font-bold">
                            {dealer.serviceCenter.hasEmergencySupport ? 'Available' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block">Pickup Service</span>
                          <span className="text-foreground font-bold">
                            {dealer.serviceCenter.hasPickupService ? 'Available' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block">Spare Parts</span>
                          <span className="text-foreground font-bold">
                            {dealer.serviceCenter.sparePartsAvailable ? 'In Stock' : 'No'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted text-xs">No linked service center record found.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: REVIEWS & COMPLAINTS */}
              {activeTab === 'reviews_complaints' && (
                <div className="space-y-4">
                  {/* Detailed Performance & Resolution Metrics */}
                  <DealerPerformanceMetrics profile={profile} loading={loading} />
                  {/* Reviews Summary */}
                  <div className="glass-panel space-y-3 rounded-2xl  p-5">
                    <h3 className="text-sm font-black tracking-wider text-lime-400 uppercase">
                      Customer Reviews ({dealer.reviewsCount || 0})
                    </h3>
                    {profile && profile.recentReviews && profile.recentReviews.length > 0 ? (
                      <div className="space-y-3">
                        {profile.recentReviews.map((rev) => (
                          <div key={rev.id} className="space-y-1 rounded-xl bg-foreground/5 p-3 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 font-bold text-amber-400">
                                <Star size={12} className="fill-amber-400" /> {rev.rating} / 5
                              </span>
                              <span className="text-muted text-[10px]">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {rev.headline && (
                              <div className="text-foreground font-bold">{rev.headline}</div>
                            )}
                            {rev.body && <p className="text-muted">{rev.body}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted text-xs">No approved reviews posted yet.</p>
                    )}
                  </div>

                  {/* Grievances List */}
                  <div className="glass-panel space-y-3 rounded-2xl  p-5">
                    <h3 className="text-sm font-black tracking-wider text-lime-400 uppercase">
                      Filed Complaints ({dealer.complaintsCount || 0})
                    </h3>
                    {dealer.grievances && dealer.grievances.length > 0 ? (
                      <div className="space-y-2">
                        {dealer.grievances.map((g) => (
                          <div key={g.id} className="space-y-1 rounded-xl bg-foreground/5 p-3 text-xs">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-foreground">{g.title}</span>
                              <span className="rounded bg-foreground/10 px-2 py-0.5 text-[10px] font-black text-lime-400 uppercase">
                                {g.status}
                              </span>
                            </div>
                            <p className="text-muted">{g.description}</p>
                            <div className="text-muted/70 font-mono text-[10px]">
                              Ref: {g.referenceNo}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted text-xs">
                        No complaints filed against this dealership.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 9: METADATA */}
              {activeTab === 'metadata' && (
                <div className="glass-panel space-y-4 rounded-2xl  p-5 text-xs">
                  <h3 className="text-sm font-black tracking-wider text-lime-400 uppercase">
                    System Metadata & Audit
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <span className="text-muted block font-bold">Internal Dealer ID</span>
                      <span className="text-foreground font-mono font-bold">#{dealer.id}</span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">Linked User Account ID</span>
                      <span className="text-foreground font-mono font-bold">
                        {dealer.userId ? `#${dealer.userId}` : 'Unlinked'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">Created Timestamp</span>
                      <span className="text-foreground font-bold">
                        {new Date(dealer.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">Last Updated Timestamp</span>
                      <span className="text-foreground font-bold">
                        {new Date(dealer.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {showBrandModal && dealer && (
        <DealerBrandManagementModal
          dealer={dealer}
          onClose={() => setShowBrandModal(false)}
          onSuccess={() => {
            // Re-fetch drawer details
            if (dealerId) {
              dealerAPI.getDealerById(dealerId).then((res) => {
                if (res.success) setDealer(res.data);
              });
            }
          }}
        />
      )}
    </div>
  );

  return createPortal(drawerContent, document.body);
}
