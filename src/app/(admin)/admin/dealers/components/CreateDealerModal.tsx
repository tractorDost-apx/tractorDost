import React, { useState } from 'react';
import {
  X,
  Building2,
  User,
  FileText,
  Phone,
  MapPin,
  Wrench,
  Globe,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { dealerAPI } from '@/lib/api/dealers';
import { DealerType, CreateDealerPayload } from '@/types/models/dealer';

interface CreateDealerModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDealerModal({ onClose, onSuccess }: CreateDealerModalProps) {
  // Form State
  // 1. User Primary
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');

  // 2. Business
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [dealerType, setDealerType] = useState<DealerType>('BRAND_DEALER');
  const [aboutDealer, setAboutDealer] = useState('');

  // 3. KYC (Double confirmation)
  const [panNumber, setPanNumber] = useState('');
  const [confirmPanNumber, setConfirmPanNumber] = useState('');

  const [gstNumber, setGstNumber] = useState('');
  const [confirmGstNumber, setConfirmGstNumber] = useState('');

  // 4. Contact
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  // 5. Location
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [serviceRadiusKm, setServiceRadiusKm] = useState('50');

  // 6. Operations
  const [workingHours, setWorkingHours] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');

  // 7. SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Regex patterns
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  // Auto-generate slug when businessName changes if user hasn't typed custom slug
  const handleBusinessNameChange = (val: string) => {
    setBusinessName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
  };

  // Normalization handlers
  const handlePanChange = (val: string) => {
    setPanNumber(val.toUpperCase().trim());
  };

  const handleConfirmPanChange = (val: string) => {
    setConfirmPanNumber(val.toUpperCase().trim());
  };

  const handleGstChange = (val: string) => {
    setGstNumber(val.toUpperCase().trim());
  };

  const handleConfirmGstChange = (val: string) => {
    setConfirmGstNumber(val.toUpperCase().trim());
  };

  // Validation checks
  const isPanValid = !panNumber || panRegex.test(panNumber);
  const isPanConfirmRequired = !!panNumber;
  const isPanMatching = !panNumber || panNumber === confirmPanNumber;

  const isGstValid = !gstNumber || gstRegex.test(gstNumber);
  const isGstConfirmRequired = !!gstNumber;
  const isGstMatching = !gstNumber || gstNumber === confirmGstNumber;

  const hasKycErrors =
    (!!panNumber && (!isPanValid || !confirmPanNumber || !isPanMatching)) ||
    (!!gstNumber && (!isGstValid || !confirmGstNumber || !isGstMatching));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Front-end validations
    if (!mobile || mobile.length !== 10 || isNaN(Number(mobile))) {
      setApiError('Please enter a valid 10-digit mobile number for the owner account');
      return;
    }

    if (!businessName || businessName.length < 3) {
      setApiError('Business name must be at least 3 characters long');
      return;
    }

    if (!slug || slug.length < 3) {
      setApiError('Slug must be at least 3 characters long');
      return;
    }

    if (!phone || phone.length < 10) {
      setApiError('Primary phone number must be at least 10 digits');
      return;
    }

    if (!address || address.length < 3) {
      setApiError('Address must be at least 3 characters long');
      return;
    }

    if (!state || state.length < 3) {
      setApiError('State must be at least 3 characters long');
      return;
    }

    if (!district || district.length < 3) {
      setApiError('District must be at least 3 characters long');
      return;
    }

    // Check PAN & GST rules
    if (panNumber) {
      if (!panRegex.test(panNumber)) {
        setApiError('Invalid PAN number format (e.g. ABCDE1234F)');
        return;
      }
      if (!confirmPanNumber) {
        setApiError('Please confirm the PAN number');
        return;
      }
      if (panNumber !== confirmPanNumber) {
        setApiError('PAN confirmation does not match original PAN number');
        return;
      }
    }

    if (gstNumber) {
      if (!gstRegex.test(gstNumber)) {
        setApiError('Invalid GSTIN number format (e.g. 27ABCDE1234F1Z5)');
        return;
      }
      if (!confirmGstNumber) {
        setApiError('Please confirm the GSTIN number');
        return;
      }
      if (gstNumber !== confirmGstNumber) {
        setApiError('GSTIN confirmation does not match original GSTIN number');
        return;
      }
    }

    // Construct Payload (EXCLUDING confirmPanNumber and confirmGstNumber!)
    const cleanWebsite = website.trim()
      ? website.trim().startsWith('http://') || website.trim().startsWith('https://')
        ? website.trim()
        : `https://${website.trim()}`
      : undefined;

    const payload: CreateDealerPayload = {
      mobile: Number(mobile.trim()),
      fullName: fullName.trim() || undefined,
      businessName: businessName.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
      dealerType,
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim() ? email.trim().toLowerCase() : undefined,
      website: cleanWebsite,
      panNumber: panNumber.trim() ? panNumber.trim().toUpperCase() : undefined,
      gstNumber: gstNumber.trim() ? gstNumber.trim().toUpperCase() : undefined,
      address: address.trim(),
      state: state.trim(),
      district: district.trim(),
      pincode: pincode.trim() || undefined,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      serviceRadiusKm: serviceRadiusKm ? Math.min(500, Math.max(1, Math.round(Number(serviceRadiusKm) || 50))) : 50,
      aboutDealer: aboutDealer.trim() || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const res = await dealerAPI.createDealer(payload);
      if (res.success) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error creating dealer:', err);
      const firstIssue = err?.response?.data?.error?.[0]?.message;
      const serverMsg = err?.response?.data?.message;
      const msg = firstIssue
        ? serverMsg && serverMsg !== 'Validation failed'
          ? `${serverMsg}: ${firstIssue}`
          : firstIssue
        : serverMsg || 'Failed to create dealer. Please check the form and try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:p-6">
      <div className="flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--card-bg)] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 p-2.5 text-lime-400">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-black tracking-tight">
                Add New Dealership
              </h2>
              <p className="text-muted mt-0.5 text-xs font-bold">
                Onboard a new dealer partner with double KYC confirmation & sectioned data fields.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-xl p-2 transition-colors hover:bg-[var(--card-bg)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-8 overflow-y-auto p-6">
          {apiError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
              <AlertCircle size={16} className="shrink-0" />
              <p>{apiError}</p>
            </div>
          )}

          {/* Section 1: User / Owner Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
              <User size={16} /> 1. Dealer Owner / Primary Account
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">
                  Mobile Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">Owner Full Name</label>
                <input
                  type="text"
                  placeholder="Owner's full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-[var(--border-subtle)]" />

          {/* Section 2: Business Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
              <Building2 size={16} /> 2. Business Information
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">
                  Business Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Official dealership name"
                  value={businessName}
                  onChange={(e) => handleBusinessNameChange(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">
                  URL Slug <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="dealership-name-city"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 font-mono text-sm focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">
                  Dealer Type <span className="text-rose-400">*</span>
                </label>
                <select
                  value={dealerType}
                  onChange={(e) => setDealerType(e.target.value as DealerType)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3.5 py-2.5 text-sm font-bold focus:border-lime-400/50 focus:outline-none"
                >
                  <option value="BRAND_DEALER">BRAND_DEALER (Brand Authorized)</option>
                  <option value="USED_DEALER">USED_DEALER (Pre-owned)</option>
                  <option value="SERVICE_CENTER">SERVICE_CENTER (Service & Repairs)</option>
                  <option value="IMPLEMENT_DEALER">IMPLEMENT_DEALER (Implements & Tools)</option>
                  <option value="TYRE_DEALER">TYRE_DEALER (Tires & Spares)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-muted mb-1.5 block text-xs font-bold">About Dealer</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of facilities, services offered, history..."
                  value={aboutDealer}
                  onChange={(e) => setAboutDealer(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-[var(--border-subtle)]" />

          {/* Section 3: KYC Verification (WITH MANDATORY DOUBLE CONFIRMATION) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
                <FileText size={16} /> 3. Mandatory KYC Double Confirmation
              </div>
              <span className="text-muted text-[10px] font-bold uppercase">
                Double verification check required
              </span>
            </div>

            {/* PAN GROUP */}
            <div className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-4">
              <div className="text-foreground flex items-center justify-between text-xs font-bold">
                <span>Permanent Account Number (PAN)</span>
                {panNumber && isPanValid && isPanMatching && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                    <CheckCircle2 size={12} /> Matching & Valid Format
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-muted mb-1 block text-[11px] font-bold">PAN Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. ABCDE1234F"
                    value={panNumber}
                    onChange={(e) => handlePanChange(e.target.value)}
                    className={`w-full rounded-xl border bg-[var(--background)] px-3.5 py-2 font-mono text-sm tracking-wider uppercase focus:outline-none ${
                      panNumber && !isPanValid
                        ? 'border-rose-500 text-rose-400'
                        : 'text-foreground border-[var(--border-subtle)] focus:border-lime-400/50'
                    }`}
                  />
                  {panNumber && !isPanValid && (
                    <span className="mt-1 block text-[10px] font-bold text-rose-400">
                      Invalid PAN format (e.g. 5 letters, 4 digits, 1 letter)
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-muted mb-1 block text-[11px] font-bold">
                    Confirm PAN Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="Re-enter PAN to confirm"
                    value={confirmPanNumber}
                    onChange={(e) => handleConfirmPanChange(e.target.value)}
                    className={`w-full rounded-xl border bg-[var(--background)] px-3.5 py-2 font-mono text-sm tracking-wider uppercase focus:outline-none ${
                      panNumber && !isPanMatching
                        ? 'border-rose-500 text-rose-400'
                        : 'text-foreground border-[var(--border-subtle)] focus:border-lime-400/50'
                    }`}
                  />
                  {panNumber && confirmPanNumber && !isPanMatching && (
                    <span className="mt-1 block text-[10px] font-bold text-rose-400">
                      PAN confirmation does not match original PAN number
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* GST GROUP */}
            <div className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-4">
              <div className="text-foreground flex items-center justify-between text-xs font-bold">
                <span>Goods & Services Tax Identification (GSTIN)</span>
                {gstNumber && isGstValid && isGstMatching && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                    <CheckCircle2 size={12} /> Matching & Valid Format
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-muted mb-1 block text-[11px] font-bold">GST Number</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 27ABCDE1234F1Z5"
                    value={gstNumber}
                    onChange={(e) => handleGstChange(e.target.value)}
                    className={`w-full rounded-xl border bg-[var(--background)] px-3.5 py-2 font-mono text-sm tracking-wider uppercase focus:outline-none ${
                      gstNumber && !isGstValid
                        ? 'border-rose-500 text-rose-400'
                        : 'text-foreground border-[var(--border-subtle)] focus:border-lime-400/50'
                    }`}
                  />
                  {gstNumber && !isGstValid && (
                    <span className="mt-1 block text-[10px] font-bold text-rose-400">
                      Invalid GSTIN format (15-character alphanumeric GSTIN)
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-muted mb-1 block text-[11px] font-bold">
                    Confirm GST Number
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="Re-enter GSTIN to confirm"
                    value={confirmGstNumber}
                    onChange={(e) => handleConfirmGstChange(e.target.value)}
                    className={`w-full rounded-xl border bg-[var(--background)] px-3.5 py-2 font-mono text-sm tracking-wider uppercase focus:outline-none ${
                      gstNumber && !isGstMatching
                        ? 'border-rose-500 text-rose-400'
                        : 'text-foreground border-[var(--border-subtle)] focus:border-lime-400/50'
                    }`}
                  />
                  {gstNumber && confirmGstNumber && !isGstMatching && (
                    <span className="mt-1 block text-[10px] font-bold text-rose-400">
                      GSTIN confirmation does not match original GSTIN number
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-[var(--border-subtle)]" />

          {/* Section 4: Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
              <Phone size={16} /> 4. Contact Details
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">
                  Dealership Phone <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Primary phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="WhatsApp phone number"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">Email Address</label>
                <input
                  type="email"
                  placeholder="contact@dealership.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">Website</label>
                <input
                  type="url"
                  placeholder="https://dealership.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-[var(--border-subtle)]" />

          {/* Section 5: Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
              <MapPin size={16} /> 5. Location & Service Boundary
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="text-muted mb-1.5 block text-xs font-bold">
                  Street Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full physical street address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">
                  State <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="State name"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">
                  District <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="District name"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 18.5204"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 font-mono text-sm focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 73.8567"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 font-mono text-sm focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">
                  Service Radius (Km)
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-[var(--border-subtle)]" />

          {/* Section 6: SEO Metadata */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
              <Globe size={16} /> 6. SEO Meta Information
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">SEO Title</label>
                <input
                  type="text"
                  placeholder="Meta title tag"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted mb-1.5 block text-xs font-bold">SEO Description</label>
                <input
                  type="text"
                  placeholder="Meta description tag"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3.5 py-2.5 text-sm font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Bar */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-foreground rounded-xl px-5 py-2.5 text-xs font-bold transition-colors hover:bg-[var(--card-bg)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || hasKycErrors}
              className="flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Creating Dealership...' : 'Create Dealership'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
