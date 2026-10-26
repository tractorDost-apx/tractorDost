'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Edit2,
  AlertCircle,
  Save,
  Building2,
  Phone,
  Mail,
  Globe,
  FileText,
  ShieldCheck,
  MapPin,
  Layers,
  Clock,
  Award,
  Search,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { dealerAPI } from '@/lib/api/dealers';
import { brandAPI, Brand } from '@/lib/api/brands';
import { dealerBrandAPI } from '@/lib/api/dealerBrands';
import {
  Dealer,
  DealerType,
  VerificationStatus,
  UpdateDealerAdminPayload,
} from '@/types/models/dealer';

interface EditDealerModalProps {
  dealer: Dealer;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalTab = 'general' | 'kyc' | 'location' | 'brands_ops' | 'status_seo';

export function EditDealerModal({ dealer, onClose, onSuccess }: EditDealerModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('general');

  // Business & Core
  const [businessName, setBusinessName] = useState(dealer.businessName || '');
  const [slug, setSlug] = useState(dealer.slug || '');
  const [dealerType, setDealerType] = useState<DealerType>(dealer.dealerType || 'BRAND_DEALER');
  const [aboutDealer, setAboutDealer] = useState(dealer.aboutDealer || '');

  // Contact & Online
  const [phone, setPhone] = useState(dealer.phone || '');
  const [whatsapp, setWhatsapp] = useState(dealer.whatsapp || '');
  const [email, setEmail] = useState(dealer.email || '');
  const [website, setWebsite] = useState(dealer.website || '');

  // KYC & Legal
  const [gstNumber, setGstNumber] = useState(dealer.gstNumber || '');
  const [panNumber, setPanNumber] = useState(dealer.panNumber || '');

  // Location & Geo
  const [address, setAddress] = useState(dealer.address || '');
  const [state, setState] = useState(dealer.state || '');
  const [district, setDistrict] = useState(dealer.district || '');
  const [pincode, setPincode] = useState(dealer.pincode || '');
  const [latitude, setLatitude] = useState(dealer.latitude ? String(dealer.latitude) : '');
  const [longitude, setLongitude] = useState(dealer.longitude ? String(dealer.longitude) : '');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(
    dealer.serviceRadiusKm ? String(dealer.serviceRadiusKm) : '50'
  );

  // Operations & Hours
  const [workingHoursStr, setWorkingHoursStr] = useState(
    dealer.workingHours
      ? typeof dealer.workingHours === 'string'
        ? dealer.workingHours
        : JSON.stringify(dealer.workingHours, null, 2)
      : '{\n  "monday": "09:00-19:00",\n  "tuesday": "09:00-19:00",\n  "wednesday": "09:00-19:00",\n  "thursday": "09:00-19:00",\n  "friday": "09:00-19:00",\n  "saturday": "09:00-19:00",\n  "sunday": "closed"\n}'
  );
  const [serviceAreasStr, setServiceAreasStr] = useState(
    dealer.serviceAreas
      ? Array.isArray(dealer.serviceAreas)
        ? dealer.serviceAreas.join(', ')
        : String(dealer.serviceAreas)
      : ''
  );

  // Verification & Status Controls
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    dealer.verificationStatus || 'PENDING'
  );
  const [isCertified, setIsCertified] = useState<boolean>(dealer.isCertified ?? false);
  const [isActive, setIsActive] = useState<boolean>(dealer.isActive ?? true);
  const [rejectionReason, setRejectionReason] = useState(dealer.rejectionReason || '');

  // SEO
  const [seoTitle, setSeoTitle] = useState(dealer.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(dealer.seoDescription || '');

  // Brands catalog & selection
  const [allMasterBrands, setAllMasterBrands] = useState<Brand[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [primaryBrandId, setPrimaryBrandId] = useState<number | null>(null);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandsLoading, setBrandsLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load brands on mount
  useEffect(() => {
    let isMounted = true;
    const loadBrands = async () => {
      try {
        setBrandsLoading(true);
        const [masterRes, assignedRes] = await Promise.allSettled([
          brandAPI.getAllBrands({ limit: 100 }),
          dealerBrandAPI.getDealerBrands(dealer.id),
        ]);

        if (!isMounted) return;

        if (masterRes.status === 'fulfilled' && masterRes.value.success) {
          setAllMasterBrands(masterRes.value.data.data || []);
        }

        if (assignedRes.status === 'fulfilled' && assignedRes.value.success) {
          const assigned = assignedRes.value.data.brands || [];
          const ids = assigned.map((b) => b.id);
          setSelectedBrandIds(ids);
          const prim = assigned.find((b) => b.isPrimary);
          setPrimaryBrandId(prim ? prim.id : ids[0] || null);
        } else if (dealer.brands && dealer.brands.length > 0) {
          const ids = dealer.brands.map((b) => b.brandId);
          setSelectedBrandIds(ids);
          const prim = dealer.brands.find((b) => b.isPrimary);
          setPrimaryBrandId(prim ? prim.brandId : ids[0] || null);
        }
      } catch (err) {
        console.error('Error fetching brand data for edit dealer modal:', err);
      } finally {
        if (isMounted) setBrandsLoading(false);
      }
    };

    loadBrands();

    return () => {
      isMounted = false;
    };
  }, [dealer.id, dealer.brands]);

  const filteredCatalogBrands = useMemo(() => {
    if (!brandSearch.trim()) return allMasterBrands;
    const q = brandSearch.toLowerCase().trim();
    return allMasterBrands.filter(
      (b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q)
    );
  }, [allMasterBrands, brandSearch]);

  const toggleBrand = (bId: number) => {
    setSelectedBrandIds((prev) => {
      if (prev.includes(bId)) {
        const next = prev.filter((id) => id !== bId);
        if (primaryBrandId === bId) {
          setPrimaryBrandId(next[0] || null);
        }
        return next;
      } else {
        const next = [...prev, bId];
        if (!primaryBrandId) setPrimaryBrandId(bId);
        return next;
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMsg(null);

    // Parse Working Hours JSON if valid
    let parsedWorkingHours: any = null;
    if (workingHoursStr.trim()) {
      try {
        parsedWorkingHours = JSON.parse(workingHoursStr);
      } catch {
        parsedWorkingHours = workingHoursStr.trim();
      }
    }

    // Parse Service Areas
    let parsedServiceAreas: any = null;
    if (serviceAreasStr.trim()) {
      parsedServiceAreas = serviceAreasStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (verificationStatus === 'REJECTED' && !rejectionReason.trim()) {
      setActiveTab('status_seo');
      setApiError('Please provide a rejection reason when status is set to REJECTED.');
      return;
    }

    const payload: UpdateDealerAdminPayload = {
      businessName: businessName.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
      dealerType,
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
      website: website.trim() || null,
      gstNumber: gstNumber.trim() ? gstNumber.trim().toUpperCase() : null,
      panNumber: panNumber.trim() ? panNumber.trim().toUpperCase() : null,
      address: address.trim(),
      state: state.trim(),
      district: district.trim(),
      pincode: pincode.trim() || null,
      latitude: latitude.trim() ? Number(latitude) : null,
      longitude: longitude.trim() ? Number(longitude) : null,
      serviceRadiusKm: serviceRadiusKm.trim()
        ? Math.min(500, Math.max(20, Math.round(Number(serviceRadiusKm) || 50)))
        : 50,
      workingHours: parsedWorkingHours,
      serviceAreas: parsedServiceAreas,
      verificationStatus,
      isCertified,
      isActive,
      rejectionReason: verificationStatus === 'REJECTED' ? rejectionReason.trim() : null,
      aboutDealer: aboutDealer.trim() || null,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      brandIds: selectedBrandIds,
      primaryBrandId: primaryBrandId || selectedBrandIds[0] || null,
    };

    try {
      setSubmitting(true);
      const res = await dealerAPI.updateDealerByAdmin(dealer.id, payload);

      if (res.success) {
        setSuccessMsg('Dealership updated successfully!');
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        setApiError(res.message || 'Failed to update dealership details');
      }
    } catch (err: any) {
      console.error('Error updating dealer by admin:', err);
      setApiError(
        err?.response?.data?.message || err?.message || 'Failed to save dealership changes'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: Array<{ id: ModalTab; label: string; icon: React.ReactNode }> = [
    { id: 'general', label: 'General & Contact', icon: <Building2 size={14} /> },
    { id: 'kyc', label: 'KYC & Legal', icon: <FileText size={14} /> },
    { id: 'location', label: 'Location & Geo', icon: <MapPin size={14} /> },
    { id: 'brands_ops', label: 'Brands & Hours', icon: <Layers size={14} /> },
    { id: 'status_seo', label: 'Verification & SEO', icon: <ShieldCheck size={14} /> },
  ];

  return (
    <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/5 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 p-2.5 text-lime-400">
              <Edit2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-foreground text-lg font-black tracking-tight sm:text-xl">
                  Edit Dealership — {dealer.businessName}
                </h2>
                <span className="rounded-md border border-[var(--border-subtle)] bg-foreground/10 px-2 py-0.5 font-mono text-[10px] font-bold text-lime-400">
                  #{dealer.id}
                </span>
              </div>
              <p className="text-muted mt-0.5 text-xs font-medium">
                Admin Master Editor: Modify all dealership credentials, KYC, brands, and settings.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-xl p-2 transition-colors hover:bg-foreground/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector Navigation Bar */}
        <div className="scrollbar-none flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-[var(--border-subtle)] bg-foreground/5 px-4 py-2 sm:px-6">
          {tabs.map((tab) => {
            const isActiveTab = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black tracking-wide uppercase transition-all select-none ${
                  isActiveTab
                    ? 'border border-lime-400/30 bg-lime-400/10 text-lime-400 shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
            {apiError && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
                <AlertCircle size={16} className="shrink-0" />
                <p>{apiError}</p>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400">
                <CheckCircle2 size={16} className="shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            {/* TAB 1: GENERAL & CONTACT */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
                    <Building2 size={14} /> Business Identity
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">Business Name *</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Tractor Singh Motors"
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">Dealership Slug *</label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. tractor-singh-motors"
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 font-mono text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">Dealership Type *</label>
                      <select
                        value={dealerType}
                        onChange={(e) => setDealerType(e.target.value as DealerType)}
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                      >
                        <option value="BRAND_DEALER">BRAND_DEALER (Authorized OEM Dealer)</option>
                        <option value="MULTI_BRAND">MULTI_BRAND (Multi-Brand Dealer)</option>
                        <option value="USED_TRACTOR_DEALER">USED_TRACTOR_DEALER (Pre-Owned Tractors)</option>
                        <option value="INDEPENDENT">INDEPENDENT (Independent Dealer)</option>
                        <option value="SHOWROOM_ONLY">SHOWROOM_ONLY (Display / Sales Only)</option>
                        <option value="SERVICE_ONLY">SERVICE_ONLY (Workshop Only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">Official Website URL</label>
                      <div className="relative">
                        <Globe size={14} className="text-muted pointer-events-none absolute top-3 left-3" />
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://example.com"
                          className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2.5 pr-3 pl-9 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
                    <Phone size={14} /> Contact Communication
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">Calling Phone *</label>
                      <div className="relative">
                        <Phone size={14} className="text-muted pointer-events-none absolute top-3 left-3" />
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2.5 pr-3 pl-9 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">WhatsApp Number</label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="WhatsApp contact"
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">Official Email</label>
                      <div className="relative">
                        <Mail size={14} className="text-muted pointer-events-none absolute top-3 left-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="dealer@example.com"
                          className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2.5 pr-3 pl-9 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-muted mb-1 block text-xs font-bold">About Dealership / Bio</label>
                  <textarea
                    rows={4}
                    value={aboutDealer}
                    onChange={(e) => setAboutDealer(e.target.value)}
                    placeholder="Describe dealership capabilities, customer services, tractors available, etc."
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-xs font-medium focus:border-lime-400/50 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: KYC & LEGAL */}
            {activeTab === 'kyc' && (
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
                    <ShieldCheck size={14} /> Legal Registrations & Tax IDs
                  </h3>
                  <p className="text-muted mt-1 text-xs">
                    These sensitive identifiers are securely encrypted at rest. Admin can review and modify them here.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="glass-panel space-y-2 rounded-2xl p-5">
                    <label className="block text-xs font-black tracking-wider text-lime-400 uppercase">
                      GSTIN Number
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 font-mono text-sm font-black tracking-wider uppercase focus:border-lime-400/50 focus:outline-none"
                    />
                    <span className="text-muted block text-[11px]">
                      15-character Goods & Services Tax Identification Number.
                    </span>
                  </div>

                  <div className="glass-panel space-y-2 rounded-2xl p-5">
                    <label className="block text-xs font-black tracking-wider text-lime-400 uppercase">
                      PAN Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 font-mono text-sm font-black tracking-wider uppercase focus:border-lime-400/50 focus:outline-none"
                    />
                    <span className="text-muted block text-[11px]">
                      10-character Permanent Account Number of dealership business/entity.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LOCATION & GEO */}
            {activeTab === 'location' && (
              <div className="space-y-5">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
                    <MapPin size={14} /> Physical Address & Jurisdiction
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-muted mb-1 block text-xs font-bold">Complete Street Address *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Building, street, landmark, area"
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">State *</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Maharashtra"
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">District *</label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Pune"
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">Pincode</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="6-digit pincode"
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 font-mono text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">Latitude Coordinates</label>
                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="e.g. 18.597600"
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 font-mono text-xs focus:border-lime-400/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">Longitude Coordinates</label>
                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="e.g. 73.926900"
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 font-mono text-xs focus:border-lime-400/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">Service Radius (Km)</label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={serviceRadiusKm}
                        onChange={(e) => setServiceRadiusKm(e.target.value)}
                        placeholder="Coverage radius in km"
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BRANDS & HOURS */}
            {activeTab === 'brands_ops' && (
              <div className="space-y-6">
                {/* Brand Selection Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
                      <Layers size={14} /> Authorized Brands ({selectedBrandIds.length})
                    </h3>
                    <span className="text-muted text-[11px]">
                      Select all brands this dealership is authorized to sell
                    </span>
                  </div>

                  {/* Selected Brand Chips */}
                  {selectedBrandIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
                      {selectedBrandIds.map((id) => {
                        const brandObj = allMasterBrands.find((b) => b.id === id);
                        const isPrimary = primaryBrandId === id;
                        return (
                          <span
                            key={id}
                            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                              isPrimary
                                ? 'border-amber-400/40 bg-amber-400/20 text-amber-300'
                                : 'text-foreground border-[var(--border-subtle)] bg-foreground/10'
                            }`}
                          >
                            {isPrimary && <Award size={12} className="text-amber-400" />}
                            <span>{brandObj ? brandObj.name : `Brand #${id}`}</span>
                            <button
                              type="button"
                              onClick={() => toggleBrand(id)}
                              className="rounded p-0.5 hover:text-rose-400"
                              title="Remove brand"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Brand Catalog Filter and List */}
                  <div className="relative">
                    <Search size={14} className="text-muted pointer-events-none absolute top-3 left-3.5" />
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Search tractor brands to assign..."
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2.5 pr-4 pl-9 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                    />
                  </div>

                  <div className="scrollbar-thin max-h-48 space-y-1 divide-y divide-white/5 overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-2">
                    {brandsLoading ? (
                      <div className="text-muted animate-pulse p-4 text-center text-xs">Loading brands...</div>
                    ) : filteredCatalogBrands.length === 0 ? (
                      <div className="text-muted p-4 text-center text-xs">No brands found.</div>
                    ) : (
                      filteredCatalogBrands.map((b) => {
                        const isChecked = selectedBrandIds.includes(b.id);
                        const isPrimary = primaryBrandId === b.id;
                        return (
                          <div
                            key={b.id}
                            onClick={() => toggleBrand(b.id)}
                            className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition-all select-none ${
                              isChecked
                                ? 'border border-lime-400/20 bg-lime-400/10 font-bold'
                                : 'text-muted hover:text-foreground hover:bg-foreground/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-4 w-4 items-center justify-center rounded border ${
                                  isChecked
                                    ? 'border-lime-400 bg-lime-400 text-black'
                                    : 'border-white/20 bg-foreground/5'
                                }`}
                              >
                                {isChecked && <Check size={12} className="stroke-[3]" />}
                              </div>
                              <span className="text-foreground text-xs font-bold">{b.name}</span>
                            </div>

                            {isChecked && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrimaryBrandId(b.id);
                                }}
                                className={`rounded px-2 py-0.5 text-[10px] font-black uppercase transition-all ${
                                  isPrimary
                                    ? 'border border-amber-400/30 bg-amber-400/20 text-amber-300'
                                    : 'text-muted hover:text-foreground bg-foreground/10'
                                }`}
                              >
                                {isPrimary ? 'Primary Brand' : 'Set as Primary'}
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Operations & Hours */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted mb-1 block text-xs font-bold">
                      Working Hours (JSON or Schedule)
                    </label>
                    <textarea
                      rows={5}
                      value={workingHoursStr}
                      onChange={(e) => setWorkingHoursStr(e.target.value)}
                      placeholder='{"monday": "09:00-19:00", ...}'
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 font-mono text-[11px] focus:border-lime-400/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-1 block text-xs font-bold">
                      Covered Service Areas / Talukas (Comma Separated)
                    </label>
                    <textarea
                      rows={5}
                      value={serviceAreasStr}
                      onChange={(e) => setServiceAreasStr(e.target.value)}
                      placeholder="e.g. Haveli, Shirur, Khed, Baramati, Junnar"
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-xs font-medium focus:border-lime-400/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: VERIFICATION & SEO */}
            {activeTab === 'status_seo' && (
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
                    <ShieldCheck size={14} /> Admin Verification & Accreditation
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">Verification Status</label>
                      <select
                        value={verificationStatus}
                        onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                      >
                        <option value="PENDING">PENDING (Under Review)</option>
                        <option value="VERIFIED">VERIFIED (Approved Dealership)</option>
                        <option value="REJECTED">REJECTED (Declined Application)</option>
                        <option value="SUSPENDED">SUSPENDED (Temporarily Blocked)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-3 sm:col-span-2">
                      <input
                        type="checkbox"
                        id="isCertified"
                        checked={isCertified}
                        onChange={(e) => setIsCertified(e.target.checked)}
                        className="h-4 w-4 rounded border-lime-400 text-lime-400 focus:ring-lime-400"
                      />
                      <label htmlFor="isCertified" className="cursor-pointer select-none">
                        <span className="text-foreground flex items-center gap-1.5 text-xs font-black">
                          <Award size={14} className="text-amber-400" /> Tractor Dost Certified Partner
                        </span>
                        <span className="text-muted block text-[11px]">
                          Grants certified badge and top ranking on dealer search directories.
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-lime-400 text-lime-400 focus:ring-lime-400"
                    />
                    <label htmlFor="isActive" className="cursor-pointer select-none">
                      <span className="text-foreground text-xs font-black">Active Dealership Profile</span>
                      <span className="text-muted block text-[11px]">
                        When inactive, dealership listings and profile are hidden from customers.
                      </span>
                    </label>
                  </div>

                  {verificationStatus === 'REJECTED' && (
                    <div className="mt-4">
                      <label className="mb-1 block text-xs font-bold text-rose-400">
                        Rejection Reason * (Emailed to Dealer)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="State specific reason for rejection..."
                        className="w-full rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs font-medium text-rose-200 focus:border-rose-400 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
                    <Search size={14} /> Search Engine Optimization (SEO)
                  </h3>
                  <div className="mt-3 space-y-4">
                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">SEO Title</label>
                      <input
                        type="text"
                        maxLength={60}
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="e.g. Authorized Mahindra Tractor Dealer in Pune | Tractor Singh"
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-muted mb-1 block text-xs font-bold">
                        SEO Meta Description
                      </label>
                      <textarea
                        rows={2}
                        maxLength={160}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="e.g. Visit Tractor Singh Motors in Pune for new and certified pre-owned tractors, transparent prices, finance offers, and service support."
                        className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-xs font-medium focus:border-lime-400/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex shrink-0 items-center justify-between border-t border-[var(--border-subtle)] bg-foreground/5 p-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="text-muted text-[11px] font-bold">Section:</span>
              <span className="rounded-md bg-foreground/10 px-2.5 py-1 text-[11px] font-black text-lime-400 uppercase">
                {tabs.find((t) => t.id === activeTab)?.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="text-muted hover:text-foreground rounded-xl px-4 py-2.5 text-xs font-bold transition-colors hover:bg-foreground/10"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-lime-400/20 transition-all hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Saving Dealership...</span>
                ) : (
                  <>
                    <Save size={16} /> Save All Details
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
