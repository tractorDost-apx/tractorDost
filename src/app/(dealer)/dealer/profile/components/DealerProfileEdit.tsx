'use client';

import React, { useState } from 'react';
import {
  Save,
  X,
  Lock,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Dealer, UpdateDealerPayload } from '@/types/models/dealer';
import { dealerAPI } from '@/lib/api/dealers';
import {
  VerificationBadge,
  CertifiedBadge,
  ActiveBadge,
  DealerTypeBadge,
} from '@/app/(admin)/admin/dealers/components/DealerStatusBadge';

interface DealerProfileEditProps {
  dealer: Dealer;
  onCancel: () => void;
  onSaveSuccess: (updatedDealer: Dealer) => void;
}

export function DealerProfileEdit({ dealer, onCancel, onSaveSuccess }: DealerProfileEditProps) {
  const [formData, setFormData] = useState({
    businessName: dealer.businessName || '',
    phone: dealer.phone || '',
    whatsapp: dealer.whatsapp || '',
    email: dealer.email || '',
    website: dealer.website || '',
    address: dealer.address || '',
    state: dealer.state || '',
    district: dealer.district || '',
    pincode: dealer.pincode || '',
    serviceRadiusKm: dealer.serviceRadiusKm || 10,
    workingHours: typeof dealer.workingHours === 'string' 
      ? dealer.workingHours 
      : dealer.workingHours 
        ? JSON.stringify(dealer.workingHours, null, 2) 
        : 'Standard Business Hours (9:00 AM - 7:00 PM)',
    serviceAreas: Array.isArray(dealer.serviceAreas) 
      ? dealer.serviceAreas.join(', ') 
      : typeof dealer.serviceAreas === 'string' 
        ? dealer.serviceAreas 
        : dealer.serviceAreas 
          ? JSON.stringify(dealer.serviceAreas) 
          : '',
    aboutDealer: dealer.aboutDealer || '',
    seoTitle: dealer.seoTitle || '',
    seoDescription: dealer.seoDescription || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Basic frontend validations
    if (!formData.businessName || formData.businessName.length < 3) {
      setError('Business name must be at least 3 characters long');
      return;
    }
    if (!formData.phone || formData.phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      return;
    }
    if (!formData.address || formData.address.length < 3) {
      setError('Address must be at least 3 characters long');
      return;
    }
    if (!formData.state || formData.state.length < 3) {
      setError('State must be at least 3 characters long');
      return;
    }
    if (!formData.district || formData.district.length < 3) {
      setError('District must be at least 3 characters long');
      return;
    }
    if (formData.pincode && formData.pincode.length < 6) {
      setError('Pincode must be at least 6 characters long');
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      setError('Website URL must start with http:// or https://');
      return;
    }

    try {
      setSaving(true);

      let parsedWorkingHours: any = formData.workingHours;
      try {
        if (formData.workingHours.trim().startsWith('{') || formData.workingHours.trim().startsWith('[')) {
          parsedWorkingHours = JSON.parse(formData.workingHours);
        }
      } catch (err) {
        parsedWorkingHours = formData.workingHours;
      }

      let parsedServiceAreas: any = formData.serviceAreas;
      if (formData.serviceAreas.includes(',')) {
        parsedServiceAreas = formData.serviceAreas.split(',').map((s) => s.trim()).filter(Boolean);
      }

      const payload: UpdateDealerPayload = {
        businessName: formData.businessName,
        phone: formData.phone,
        whatsapp: formData.whatsapp || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        address: formData.address,
        state: formData.state,
        district: formData.district,
        pincode: formData.pincode || undefined,
        serviceRadiusKm: Number(formData.serviceRadiusKm) || 10,
        workingHours: parsedWorkingHours,
        serviceAreas: parsedServiceAreas,
        aboutDealer: formData.aboutDealer || undefined,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
      };

      const res = await dealerAPI.updateDealerById(dealer.id, payload);

      if (res.success && res.data) {
        setSuccessMessage('Dealer profile updated successfully!');
        setTimeout(() => {
          onSaveSuccess(res.data);
        }, 800);
      } else {
        setError(res.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Error updating dealer profile:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in pb-12">
      {/* Top Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-foreground">Edit Basic Information</h1>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
              Self-Service Mode
            </span>
          </div>
          <p className="text-xs text-muted font-medium mt-1">
            Update your business contact details, location, operational hours, and general profile description.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-foreground/5 hover:bg-foreground/10 text-foreground border border-[var(--border-subtle)] transition-colors flex items-center justify-center gap-2"
          >
            <X size={16} /> Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-[var(--color-brand-green)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
          >
            {saving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Read-Only KYC Notice Banner */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-start gap-3">
        <AlertTriangle size={20} className="shrink-0 text-amber-500 mt-0.5" />
        <div className="space-y-1">
          <div className="font-black uppercase tracking-wider text-xs">Read-Only Safety Notice</div>
          <p className="font-medium text-foreground">
            KYC information (PAN & GST), Verification status, Certification status, Ratings, and System IDs are locked and cannot be changed from your profile edit form.
            If KYC correction is required, please contact TractorDost support.
          </p>
        </div>
      </div>

      {/* EDITABLE SECTION 1: Basic Information */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4">
          <Info size={20} className="text-[var(--color-brand-green)]" />
          1. Basic Profile Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="text-xs font-bold text-muted block mb-1">Business Name *</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Dealership Business Name"
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-bold focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1 flex items-center justify-between">
              <span>Slug (Public URL Identifier)</span>
              <span className="text-[10px] text-muted/70 flex items-center gap-1"><Lock size={10} /> Read-Only</span>
            </label>
            <input
              type="text"
              value={dealer.slug}
              disabled
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-muted font-mono text-xs cursor-not-allowed opacity-60"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1 flex items-center justify-between">
              <span>Dealer Type</span>
              <span className="text-[10px] text-muted/70 flex items-center gap-1"><Lock size={10} /> Read-Only</span>
            </label>
            <div className="p-2.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl flex items-center opacity-60">
              <DealerTypeBadge dealerType={dealer.dealerType} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1 flex items-center justify-between">
              <span>Active Status</span>
              <span className="text-[10px] text-muted/70 flex items-center gap-1"><Lock size={10} /> Read-Only</span>
            </label>
            <div className="p-2.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl flex items-center opacity-60">
              <ActiveBadge isActive={dealer.isActive} />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted block mb-1">About Dealership</label>
            <textarea
              name="aboutDealer"
              rows={4}
              value={formData.aboutDealer}
              onChange={handleChange}
              placeholder="Tell farmers and customers about your dealership history, authorized services, and offerings..."
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl p-4 text-foreground text-sm font-medium focus:outline-none transition-colors resize-y"
            />
          </div>
        </div>
      </div>

      {/* EDITABLE SECTION 2: Contact Information */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4">
          <Phone size={20} className="text-[var(--color-brand-green)]" />
          2. Contact Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="text-xs font-bold text-muted block mb-1">Phone Number *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Primary Phone Number"
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-bold focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">WhatsApp Number</label>
            <input
              type="text"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="WhatsApp Contact Number"
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-bold focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Official Business Email"
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-bold focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Official Website URL</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.yourdealership.com"
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-bold focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* EDITABLE SECTION 3: Location & Operational Info */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4">
          <MapPin size={20} className="text-[var(--color-brand-green)]" />
          3. Location & Operational Info
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-muted block mb-1">Complete Dealership Address *</label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, landmark..."
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl p-3 text-foreground text-sm font-bold focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-bold focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">District *</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="District"
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-bold focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-bold focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Service Radius (Km)</label>
            <input
              type="number"
              name="serviceRadiusKm"
              value={formData.serviceRadiusKm}
              onChange={handleChange}
              min={1}
              max={500}
              placeholder="e.g. 50"
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-bold focus:outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted block mb-1">Service Areas Covered (comma separated)</label>
            <input
              type="text"
              name="serviceAreas"
              value={formData.serviceAreas}
              onChange={handleChange}
              placeholder="e.g. Taluka A, Taluka B, District Center"
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-medium focus:outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-bold text-muted block mb-1">Working Hours Description / Schedule</label>
            <input
              type="text"
              name="workingHours"
              value={formData.workingHours}
              onChange={handleChange}
              placeholder="e.g. Mon-Sat: 9:00 AM - 7:00 PM, Sun: Closed"
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-medium focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* EDITABLE SECTION 4: SEO Settings */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4">
          <Globe size={20} className="text-[var(--color-brand-green)]" />
          4. SEO & Search Presence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="text-xs font-bold text-muted block mb-1">SEO Title</label>
            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleChange}
              placeholder="Search Title (max 60 chars)"
              maxLength={60}
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-medium focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">SEO Description</label>
            <input
              type="text"
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleChange}
              placeholder="Search Summary Description (max 160 chars)"
              maxLength={160}
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl px-4 py-2.5 text-foreground text-sm font-medium focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* READ-ONLY SECTIONS PREVIEW */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-lg font-black text-muted flex items-center gap-2">
            <Lock size={18} className="text-muted" />
            Read-Only System & KYC Summary (Non-Editable)
          </h2>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Read-Only Protection
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-foreground/5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-muted block text-[10px] font-sans font-bold">PAN Number</span>
            <span className="text-foreground font-black tracking-wider uppercase text-sm">{dealer.panNumber || 'NOT PROVIDED'}</span>
            <span className="text-[10px] text-emerald-500 block font-sans mt-0.5">🔒 Verified KYC</span>
          </div>

          <div className="p-3.5 bg-foreground/5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-muted block text-[10px] font-sans font-bold">GSTIN Number</span>
            <span className="text-foreground font-black tracking-wider uppercase text-sm">{dealer.gstNumber || 'NOT PROVIDED'}</span>
            <span className="text-[10px] text-emerald-500 block font-sans mt-0.5">🔒 Verified KYC</span>
          </div>

          <div className="p-3.5 bg-foreground/5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-muted block text-[10px] font-sans font-bold">Verification Status</span>
            <span className="text-foreground font-bold font-sans text-sm block mt-0.5">{dealer.verificationStatus}</span>
            <span className="text-[10px] text-muted block font-sans">🔒 Managed by Admin</span>
          </div>

          <div className="p-3.5 bg-foreground/5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-muted block text-[10px] font-sans font-bold">Rating & Reviews</span>
            <span className="text-amber-500 font-bold font-sans text-sm block mt-0.5">{Number(dealer.rating || 0).toFixed(1)} ★ ({dealer.reviewsCount})</span>
            <span className="text-[10px] text-muted block font-sans">🔒 System Metric</span>
          </div>
        </div>
      </div>

      {/* Form Bottom Action bar */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-3 rounded-xl text-xs font-bold bg-foreground/5 hover:bg-foreground/10 text-foreground border border-[var(--border-subtle)] transition-colors flex items-center gap-2"
        >
          <X size={16} /> Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-[var(--color-brand-green)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-md flex items-center gap-2"
        >
          {saving ? (
            <span>Saving Changes...</span>
          ) : (
            <>
              <Save size={16} /> Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
