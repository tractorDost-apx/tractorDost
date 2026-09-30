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
    workingHours:
      typeof dealer.workingHours === 'string'
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
        if (
          formData.workingHours.trim().startsWith('{') ||
          formData.workingHours.trim().startsWith('[')
        ) {
          parsedWorkingHours = JSON.parse(formData.workingHours);
        }
      } catch (err) {
        parsedWorkingHours = formData.workingHours;
      }

      let parsedServiceAreas: any = formData.serviceAreas;
      if (formData.serviceAreas.includes(',')) {
        parsedServiceAreas = formData.serviceAreas
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
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
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-8 pb-12">
      {/* Top Header Card */}
      <div className="glass-panel flex flex-col items-start justify-between gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-2xl font-black">Edit Basic Information</h1>
            <span className="rounded-md border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
              Self-Service Mode
            </span>
          </div>
          <p className="text-muted mt-1 text-xs font-medium">
            Update your business contact details, location, operational hours, and general profile
            description.
          </p>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold transition-colors sm:flex-none"
          >
            <X size={16} /> Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 sm:flex-none"
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
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-500">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Read-Only KYC Notice Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-xs font-bold text-amber-600 dark:text-amber-400">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-500" />
        <div className="space-y-1">
          <div className="text-xs font-black tracking-wider uppercase">Read-Only Safety Notice</div>
          <p className="text-foreground font-medium">
            KYC information (PAN & GST), Verification status, Certification status, Ratings, and
            System IDs are locked and cannot be changed from your profile edit form. If KYC
            correction is required, please contact TractorDost support.
          </p>
        </div>
      </div>

      {/* EDITABLE SECTION 1: Basic Information */}
      <div className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <h2 className="text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4 text-lg font-black">
          <Info size={20} className="text-[var(--color-brand-green)]" />
          1. Basic Profile Details
        </h2>

        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Business Name *</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Dealership Business Name"
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-muted mb-1 block flex items-center justify-between text-xs font-bold">
              <span>Slug (Public URL Identifier)</span>
              <span className="text-muted/70 flex items-center gap-1 text-[10px]">
                <Lock size={10} /> Read-Only
              </span>
            </label>
            <input
              type="text"
              value={dealer.slug}
              disabled
              className="bg-foreground/5 text-muted w-full cursor-not-allowed rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 font-mono text-xs opacity-60"
            />
          </div>

          <div>
            <label className="text-muted mb-1 block flex items-center justify-between text-xs font-bold">
              <span>Dealer Type</span>
              <span className="text-muted/70 flex items-center gap-1 text-[10px]">
                <Lock size={10} /> Read-Only
              </span>
            </label>
            <div className="bg-foreground/5 flex items-center rounded-xl border border-[var(--border-subtle)] p-2.5 opacity-60">
              <DealerTypeBadge dealerType={dealer.dealerType} />
            </div>
          </div>

          <div>
            <label className="text-muted mb-1 block flex items-center justify-between text-xs font-bold">
              <span>Active Status</span>
              <span className="text-muted/70 flex items-center gap-1 text-[10px]">
                <Lock size={10} /> Read-Only
              </span>
            </label>
            <div className="bg-foreground/5 flex items-center rounded-xl border border-[var(--border-subtle)] p-2.5 opacity-60">
              <ActiveBadge isActive={dealer.isActive} />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-muted mb-1 block text-xs font-bold">About Dealership</label>
            <textarea
              name="aboutDealer"
              rows={4}
              value={formData.aboutDealer}
              onChange={handleChange}
              placeholder="Tell farmers and customers about your dealership history, authorized services, and offerings..."
              className="bg-foreground/5 text-foreground w-full resize-y rounded-xl border border-[var(--border-subtle)] p-4 text-sm font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* EDITABLE SECTION 2: Contact Information */}
      <div className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <h2 className="text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4 text-lg font-black">
          <Phone size={20} className="text-[var(--color-brand-green)]" />
          2. Contact Details
        </h2>

        <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Phone Number *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Primary Phone Number"
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">WhatsApp Number</label>
            <input
              type="text"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="WhatsApp Contact Number"
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Official Business Email"
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Official Website URL</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.yourdealership.com"
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* EDITABLE SECTION 3: Location & Operational Info */}
      <div className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <h2 className="text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4 text-lg font-black">
          <MapPin size={20} className="text-[var(--color-brand-green)]" />
          3. Location & Operational Info
        </h2>

        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-3">
          <div className="md:col-span-3">
            <label className="text-muted mb-1 block text-xs font-bold">
              Complete Dealership Address *
            </label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, landmark..."
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] p-3 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">District *</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="District"
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">Service Radius (Km)</label>
            <input
              type="number"
              name="serviceRadiusKm"
              value={formData.serviceRadiusKm}
              onChange={handleChange}
              min={1}
              max={500}
              placeholder="e.g. 50"
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-muted mb-1 block text-xs font-bold">
              Service Areas Covered (comma separated)
            </label>
            <input
              type="text"
              name="serviceAreas"
              value={formData.serviceAreas}
              onChange={handleChange}
              placeholder="e.g. Taluka A, Taluka B, District Center"
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-muted mb-1 block text-xs font-bold">
              Working Hours Description / Schedule
            </label>
            <input
              type="text"
              name="workingHours"
              value={formData.workingHours}
              onChange={handleChange}
              placeholder="e.g. Mon-Sat: 9:00 AM - 7:00 PM, Sun: Closed"
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* EDITABLE SECTION 4: SEO Settings */}
      <div className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <h2 className="text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4 text-lg font-black">
          <Globe size={20} className="text-[var(--color-brand-green)]" />
          4. SEO & Search Presence
        </h2>

        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <label className="text-muted mb-1 block text-xs font-bold">SEO Title</label>
            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleChange}
              placeholder="Search Title (max 60 chars)"
              maxLength={60}
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-muted mb-1 block text-xs font-bold">SEO Description</label>
            <input
              type="text"
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleChange}
              placeholder="Search Summary Description (max 160 chars)"
              maxLength={160}
              className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* READ-ONLY SECTIONS PREVIEW */}
      <div className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h2 className="text-muted flex items-center gap-2 text-lg font-black">
            <Lock size={18} className="text-muted" />
            Read-Only System & KYC Summary (Non-Editable)
          </h2>
          <span className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-rose-500 uppercase">
            Read-Only Protection
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 font-mono text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-foreground/5 rounded-xl border border-[var(--border-subtle)] p-3.5">
            <span className="text-muted block font-sans text-[10px] font-bold">PAN Number</span>
            <span className="text-foreground text-sm font-black tracking-wider uppercase">
              {dealer.panNumber || 'NOT PROVIDED'}
            </span>
            <span className="mt-0.5 block font-sans text-[10px] text-emerald-500">
              🔒 Verified KYC
            </span>
          </div>

          <div className="bg-foreground/5 rounded-xl border border-[var(--border-subtle)] p-3.5">
            <span className="text-muted block font-sans text-[10px] font-bold">GSTIN Number</span>
            <span className="text-foreground text-sm font-black tracking-wider uppercase">
              {dealer.gstNumber || 'NOT PROVIDED'}
            </span>
            <span className="mt-0.5 block font-sans text-[10px] text-emerald-500">
              🔒 Verified KYC
            </span>
          </div>

          <div className="bg-foreground/5 rounded-xl border border-[var(--border-subtle)] p-3.5">
            <span className="text-muted block font-sans text-[10px] font-bold">
              Verification Status
            </span>
            <span className="text-foreground mt-0.5 block font-sans text-sm font-bold">
              {dealer.verificationStatus}
            </span>
            <span className="text-muted block font-sans text-[10px]">🔒 Managed by Admin</span>
          </div>

          <div className="bg-foreground/5 rounded-xl border border-[var(--border-subtle)] p-3.5">
            <span className="text-muted block font-sans text-[10px] font-bold">
              Rating & Reviews
            </span>
            <span className="mt-0.5 block font-sans text-sm font-bold text-amber-500">
              {Number(dealer.rating || 0).toFixed(1)} ★ ({dealer.reviewsCount})
            </span>
            <span className="text-muted block font-sans text-[10px]">🔒 System Metric</span>
          </div>
        </div>
      </div>

      {/* Form Bottom Action bar */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-6 py-3 text-xs font-bold transition-colors"
        >
          <X size={16} /> Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-8 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90"
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
