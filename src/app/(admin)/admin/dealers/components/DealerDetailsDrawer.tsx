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
      className="fixed inset-0 z-[100] overflow-hidden bg-black/80 backdrop-blur-md flex justify-end h-screen w-screen top-0 left-0 animate-fade-in"
    >
      {/* Inner Panel - Flex Container with strict min-h-0 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-zinc-950 border-l border-white/10 h-full max-h-screen flex flex-col shadow-2xl overflow-hidden relative shrink-0"
      >
        {/* 1. DEALER HEADER (FIXED TOP, SHRINK-0) */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/90 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-lime-400/10 text-lime-400 flex items-center justify-center border border-lime-400/20 font-black text-xl shrink-0">
              {dealer?.businessName ? dealer.businessName.charAt(0).toUpperCase() : 'D'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  {dealer?.businessName || 'Loading Dealer...'}
                </h2>
                {dealer && <CertifiedBadge isCertified={dealer.isCertified} />}
              </div>
              <p className="text-xs font-bold text-muted mt-0.5">
                Dealer ID #{dealerId} • {dealer?.district || '...'}, {dealer?.state || '...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {dealer && (
              <>
                <button
                  onClick={() => onOpenEdit(dealer)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 text-foreground hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => onOpenModeration(dealer)}
                  className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-lime-400 text-black hover:bg-lime-300 transition-colors flex items-center gap-1.5"
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
              className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/10 transition-colors"
              title="Close panel (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 2. DETAILS NAVIGATION (FIXED BELOW HEADER, HORIZONTALLY SCROLLABLE ONLY) */}
        <div className="w-full overflow-x-auto border-b border-white/10 bg-zinc-900/70 backdrop-blur-md px-6 py-3 flex items-center gap-2 shrink-0 z-10 scrollbar-thin scrollbar-thumb-lime-400/30 scrollbar-track-transparent whitespace-nowrap">
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
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30 font-black shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-white/5 border border-transparent'
                }`}
              >
                <IconComponent size={14} className={isActive ? 'text-lime-400' : 'text-muted'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 3. CONTENT BODY (VERTICALLY SCROLLABLE ONLY) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {loading ? (
            <div className="space-y-4 py-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold">
              {error}
            </div>
          ) : dealer ? (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <VerificationBadge status={dealer.verificationStatus} />
                      <ActiveBadge isActive={dealer.isActive} />
                      <DealerTypeBadge dealerType={dealer.dealerType} />
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-muted">
                      <span>Rating: <strong className="text-foreground">{Number(dealer.rating || 0).toFixed(1)} ★</strong></span>
                      <span>Reviews: <strong className="text-foreground">{dealer.reviewsCount || 0}</strong></span>
                      <span>Complaints: <strong className="text-foreground">{dealer.complaintsCount || 0}</strong></span>
                    </div>
                  </div>

                  {/* Rejection notice if rejected */}
                  {dealer.verificationStatus === 'REJECTED' && dealer.rejectionReason && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold space-y-1">
                      <div className="flex items-center gap-1.5 text-sm uppercase tracking-wider font-black">
                        <XCircle size={16} /> Rejection Reason
                      </div>
                      <p className="font-normal text-rose-300">{dealer.rejectionReason}</p>
                    </div>
                  )}

                  {/* Quick Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-panel p-4 rounded-2xl space-y-2 border border-white/5">
                      <div className="text-xs font-bold text-muted uppercase tracking-wider">Contact Info</div>
                      <div className="text-sm font-bold text-foreground">{dealer.phone || 'N/A'}</div>
                      <div className="text-xs text-muted">{dealer.email || 'No email provided'}</div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl space-y-2 border border-white/5">
                      <div className="text-xs font-bold text-muted uppercase tracking-wider">Location</div>
                      <div className="text-sm font-bold text-foreground">{dealer.address}</div>
                      <div className="text-xs text-muted">{dealer.district}, {dealer.state} - {dealer.pincode || 'N/A'}</div>
                    </div>
                  </div>

                  {/* About Dealer */}
                  {dealer.aboutDealer && (
                    <div className="glass-panel p-5 rounded-2xl space-y-2 border border-white/5">
                      <h4 className="text-xs font-black uppercase text-muted tracking-wider">About Dealership</h4>
                      <p className="text-sm text-foreground/90 leading-relaxed font-medium">{dealer.aboutDealer}</p>
                    </div>
                  )}

                  {/* Profile Metrics Card if loaded */}
                  {profile && (
                    <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/5">
                      <h4 className="text-xs font-black uppercase text-lime-400 tracking-wider">Performance & Resolution Metrics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-white/5 rounded-xl text-center">
                          <div className="text-xl font-black text-foreground">{profile.overallRating.toFixed(1)}</div>
                          <div className="text-[10px] text-muted uppercase font-bold mt-0.5">Overall Rating</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl text-center">
                          <div className="text-xl font-black text-foreground">{profile.grievanceStats.totalGrievances}</div>
                          <div className="text-[10px] text-muted uppercase font-bold mt-0.5">Total Grievances</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl text-center">
                          <div className="text-xl font-black text-emerald-400">{profile.grievanceStats.resolved}</div>
                          <div className="text-[10px] text-muted uppercase font-bold mt-0.5">Resolved</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl text-center">
                          <div className="text-xl font-black text-lime-400">{profile.grievanceStats.resolutionRate}</div>
                          <div className="text-[10px] text-muted uppercase font-bold mt-0.5">Resolution Rate</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: BUSINESS */}
              {activeTab === 'business' && (
                <div className="space-y-4">
                  <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/5">
                    <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider">Business Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted font-bold block">Business Name</span>
                        <span className="text-foreground font-black text-sm">{dealer.businessName}</span>
                      </div>
                      <div>
                        <span className="text-muted font-bold block">Slug</span>
                        <span className="text-foreground font-mono bg-white/5 px-2 py-1 rounded-md inline-block">{dealer.slug}</span>
                      </div>
                      <div>
                        <span className="text-muted font-bold block">Dealer Type</span>
                        <DealerTypeBadge dealerType={dealer.dealerType} />
                      </div>
                      <div>
                        <span className="text-muted font-bold block">Certified Status</span>
                        <span className="text-foreground font-bold">{dealer.isCertified ? `Yes (at ${dealer.certifiedAt ? new Date(dealer.certifiedAt).toLocaleDateString() : 'N/A'})` : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl space-y-3 border border-white/5">
                    <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider">Working Hours & Operations</h3>
                    <div className="text-xs text-foreground font-medium bg-white/5 p-3 rounded-xl font-mono overflow-x-auto">
                      {dealer.workingHours ? JSON.stringify(dealer.workingHours, null, 2) : 'Standard business hours'}
                    </div>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl space-y-3 border border-white/5">
                    <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider">SEO Metadata</h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-muted font-bold block">SEO Title</span>
                        <span className="text-foreground font-bold">{dealer.seoTitle || 'Not configured'}</span>
                      </div>
                      <div>
                        <span className="text-muted font-bold block">SEO Description</span>
                        <span className="text-foreground">{dealer.seoDescription || 'Not configured'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTACT & KYC */}
              {activeTab === 'contact_kyc' && (
                <div className="space-y-4">
                  <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/5">
                    <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider">Contact Communication</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted font-bold block">Phone Number</span>
                        <span className="text-foreground font-black text-sm">{dealer.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted font-bold block">WhatsApp Number</span>
                        <span className="text-foreground font-bold">{dealer.whatsapp || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted font-bold block">Email Address</span>
                        <span className="text-foreground font-bold">{dealer.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted font-bold block">Official Website</span>
                        {dealer.website ? (
                          <a href={dealer.website} target="_blank" rel="noreferrer" className="text-lime-400 underline font-bold">
                            {dealer.website}
                          </a>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/5">
                    <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider">KYC Verification Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-muted font-bold block mb-1">PAN Number</span>
                        <span className="text-foreground font-mono font-black text-base tracking-wider uppercase">
                          {dealer.panNumber || 'NOT PROVIDED'}
                        </span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-muted font-bold block mb-1">GSTIN Number</span>
                        <span className="text-foreground font-mono font-black text-base tracking-wider uppercase">
                          {dealer.gstNumber || 'NOT PROVIDED'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LOCATION */}
              {activeTab === 'location' && (
                <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/5">
                  <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider">Geographic Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="md:col-span-2">
                      <span className="text-muted font-bold block">Complete Address</span>
                      <span className="text-foreground font-bold text-sm">{dealer.address}</span>
                    </div>
                    <div>
                      <span className="text-muted font-bold block">State</span>
                      <span className="text-foreground font-bold">{dealer.state}</span>
                    </div>
                    <div>
                      <span className="text-muted font-bold block">District</span>
                      <span className="text-foreground font-bold">{dealer.district}</span>
                    </div>
                    <div>
                      <span className="text-muted font-bold block">Pincode</span>
                      <span className="text-foreground font-bold">{dealer.pincode || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted font-bold block">Service Radius</span>
                      <span className="text-foreground font-bold">{dealer.serviceRadiusKm || 10} Km</span>
                    </div>
                    <div>
                      <span className="text-muted font-bold block">Latitude</span>
                      <span className="text-foreground font-mono">{dealer.latitude ? Number(dealer.latitude).toFixed(6) : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted font-bold block">Longitude</span>
                      <span className="text-foreground font-mono">{dealer.longitude ? Number(dealer.longitude).toFixed(6) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BRANDS */}
              {activeTab === 'brands' && (
                <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider">Dealership Brands</h3>
                    <button
                      onClick={() => setShowBrandModal(true)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-lime-400/10 text-lime-400 hover:bg-lime-400/20 border border-lime-400/20 transition-colors flex items-center gap-1.5"
                    >
                      <Layers size={14} /> Manage Brands
                    </button>
                  </div>
                  {dealer.brands && dealer.brands.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dealer.brands.map((b) => (
                        <div key={b.id} className="p-3 bg-white/5 rounded-xl flex items-center justify-between border border-white/5">
                          <span className="font-bold text-foreground text-sm">{b.brand?.name || `Brand #${b.brandId}`}</span>
                          {b.isPrimary && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-lime-400/20 text-lime-400">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted font-medium">No associated brands configured yet.</p>
                  )}
                </div>
              )}

              {/* TAB 6: INVENTORY */}
              {activeTab === 'inventory' && (
                <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/5">
                  <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider">Dealership Stock Inventory</h3>
                  {dealer.inventory && dealer.inventory.length > 0 ? (
                    <div className="space-y-2">
                      {dealer.inventory.map((inv) => (
                        <div key={inv.id} className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-foreground">{inv.customModel || `Tractor #${inv.tractorId}`}</span>
                            <span className="text-muted block text-[11px]">Updated: {new Date(inv.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-lime-400 text-sm block">{inv.stockCount} units</span>
                            <span className={`text-[10px] font-bold ${inv.isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {inv.isAvailable ? 'Available' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted font-medium">No inventory items listed for this dealership.</p>
                  )}
                </div>
              )}

              {/* TAB 7: SHOWROOM & SERVICE */}
              {activeTab === 'facilities' && (
                <div className="space-y-4">
                  {/* Showroom */}
                  <div className="glass-panel p-5 rounded-2xl space-y-3 border border-white/5">
                    <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider flex items-center gap-2">
                      <Store size={16} /> Showroom Facility
                    </h3>
                    {dealer.showroom ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted block">Showroom Name</span>
                          <span className="font-bold text-foreground">{dealer.showroom.showroomName}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Address</span>
                          <span className="font-bold text-foreground">{dealer.showroom.address}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Test Drives</span>
                          <span className="font-bold text-foreground">{dealer.showroom.testDriveAvailable ? 'Available' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Parking</span>
                          <span className="font-bold text-foreground">{dealer.showroom.parkingAvailable ? 'Available' : 'No'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted">No linked showroom record found.</p>
                    )}
                  </div>

                  {/* Service Center */}
                  <div className="glass-panel p-5 rounded-2xl space-y-3 border border-white/5">
                    <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider flex items-center gap-2">
                      <Wrench size={16} /> Service Center Facility
                    </h3>
                    {dealer.serviceCenter ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted block">Service Name</span>
                          <span className="font-bold text-foreground">{dealer.serviceCenter.serviceName}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Emergency Service</span>
                          <span className="font-bold text-foreground">{dealer.serviceCenter.hasEmergencySupport ? 'Available' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Pickup Service</span>
                          <span className="font-bold text-foreground">{dealer.serviceCenter.hasPickupService ? 'Available' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Spare Parts</span>
                          <span className="font-bold text-foreground">{dealer.serviceCenter.sparePartsAvailable ? 'In Stock' : 'No'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted">No linked service center record found.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: REVIEWS & COMPLAINTS */}
              {activeTab === 'reviews_complaints' && (
                <div className="space-y-4">
                  {/* Reviews Summary */}
                  <div className="glass-panel p-5 rounded-2xl space-y-3 border border-white/5">
                    <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider">Customer Reviews ({dealer.reviewsCount || 0})</h3>
                    {profile && profile.recentReviews && profile.recentReviews.length > 0 ? (
                      <div className="space-y-3">
                        {profile.recentReviews.map((rev) => (
                          <div key={rev.id} className="p-3 bg-white/5 rounded-xl space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-400 flex items-center gap-1">
                                <Star size={12} className="fill-amber-400" /> {rev.rating} / 5
                              </span>
                              <span className="text-[10px] text-muted">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                            {rev.headline && <div className="font-bold text-foreground">{rev.headline}</div>}
                            {rev.body && <p className="text-muted">{rev.body}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted">No approved reviews posted yet.</p>
                    )}
                  </div>

                  {/* Grievances List */}
                  <div className="glass-panel p-5 rounded-2xl space-y-3 border border-white/5">
                    <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider">Filed Complaints ({dealer.complaintsCount || 0})</h3>
                    {dealer.grievances && dealer.grievances.length > 0 ? (
                      <div className="space-y-2">
                        {dealer.grievances.map((g) => (
                          <div key={g.id} className="p-3 bg-white/5 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-foreground">{g.title}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-white/10 text-lime-400">
                                {g.status}
                              </span>
                            </div>
                            <p className="text-muted">{g.description}</p>
                            <div className="text-[10px] text-muted/70 font-mono">Ref: {g.referenceNo}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted">No complaints filed against this dealership.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 9: METADATA */}
              {activeTab === 'metadata' && (
                <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/5 text-xs">
                  <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider">System Metadata & Audit</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted block font-bold">Internal Dealer ID</span>
                      <span className="font-mono text-foreground font-bold">#{dealer.id}</span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">Linked User Account ID</span>
                      <span className="font-mono text-foreground font-bold">{dealer.userId ? `#${dealer.userId}` : 'Unlinked'}</span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">Created Timestamp</span>
                      <span className="text-foreground font-bold">{new Date(dealer.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted block font-bold">Last Updated Timestamp</span>
                      <span className="text-foreground font-bold">{new Date(dealer.updatedAt).toLocaleString()}</span>
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
