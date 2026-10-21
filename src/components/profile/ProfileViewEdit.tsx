'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/AuthContext';
import { usersAPI } from '@/lib/api/users';
import { INDIAN_STATES } from '@/lib/constants/indian-states';
import {
  User,
  Mail,
  Phone,
  Globe,
  Camera,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Tractor,
  Wheat,
  IndianRupee,
  Trash2,
  Loader2,
  ShieldCheck,
  Edit3,
  Save,
  X,
  ExternalLink,
  Calendar,
  Check,
  ArrowRight,
  Shield,
  Sparkles,
  Building2,
  Tag,
  Layers,
  Clock,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

const LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'HI', label: 'हिंदी (Hindi)' },
  { code: 'MR', label: 'मराठी (Marathi)' },
  { code: 'PB', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'GU', label: 'ગુજરાતી (Gujarati)' },
  { code: 'BN', label: 'বাংলা (Bengali)' },
  { code: 'TE', label: 'తెలుగు (Telugu)' },
  { code: 'TA', label: 'தமிழ் (Tamil)' },
  { code: 'KN', label: 'ಕನ್ನಡ (Kannada)' },
];

const POPULAR_BRANDS = [
  'Mahindra',
  'Swaraj',
  'John Deere',
  'Sonalika',
  'Massey Ferguson',
  'New Holland',
  'Kubota',
  'Eicher',
  'Powertrac',
  'Farmtrac',
  'Preet',
  'Captain',
  'VST Tillers',
  'Indo Farm',
];

const FARMING_TYPES = [
  'Crop Farming (Paddy/Wheat/Sugarcane/Cotton)',
  'Horticulture & Fruits',
  'Organic Farming',
  'Dairy & Livestock',
  'Commercial / Contract Farming',
  'Vegetable & Greenhouse Farming',
  'Mixed Farming',
];

const BUDGET_RANGES = [
  'Under ₹3,00,000',
  '₹3,00,000 - ₹5,00,000',
  '₹5,00,000 - ₹8,00,000',
  '₹8,00,000 - ₹12,00,000',
  'Above ₹12,00,000',
];

export interface ProfileViewEditProps {
  initialMode?: 'view' | 'edit';
  inDashboard?: boolean;
}

export function ProfileViewEdit({ initialMode = 'view', inDashboard = false }: ProfileViewEditProps) {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [activeTab, setActiveTab] = useState<'personal' | 'location' | 'preferences' | 'identity'>('personal');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    preferredLanguage: 'EN',
    state: '',
    district: '',
    villageCity: '',
    pincode: '',
    preferredBrand: '',
    farmingType: '',
    landSize: '',
    budgetRange: '',
    sellerType: 'individual',
    aadhaarRef: '',
    panRef: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check URL query parameters for edit mode or specific tab on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('edit') === 'true' || params.get('mode') === 'edit') {
        setMode('edit');
        const tab = params.get('tab');
        if (tab === 'location' || tab === 'preferences' || tab === 'identity') {
          setActiveTab(tab);
        }
      }
    }
  }, []);

  // Sync state whenever authenticated user context updates
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        preferredLanguage: user.preferredLanguage || 'EN',
        state: user.state || '',
        district: user.district || '',
        villageCity: user.villageCity || '',
        pincode: user.pincode || '',
        preferredBrand: user.preferredBrand || '',
        farmingType: user.farmingType || '',
        landSize: user.landSize !== undefined && user.landSize !== null ? String(user.landSize) : '',
        budgetRange: user.budgetRange || '',
        sellerType: user.sellerType || 'individual',
        aadhaarRef: user.aadhaarRef || '',
        panRef: user.panRef || '',
      });
    }
  }, [user]);

  // Calculate profile completion score
  const calculateCompletion = () => {
    if (!user) return 0;
    const fields = [
      formData.fullName,
      user.mobile,
      formData.email,
      formData.state,
      formData.district,
      formData.villageCity,
      formData.pincode,
      formData.preferredBrand,
      formData.farmingType,
      formData.landSize,
      formData.budgetRange,
    ];
    const filled = fields.filter((f) => !!f && String(f).trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercent = calculateCompletion();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Profile photo size must be less than 2MB');
      return;
    }

    // Validate format
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMessage('Only JPG, PNG, or WebP images are allowed');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const uploadData = new FormData();
      uploadData.append('photo', file);

      await usersAPI.uploadProfilePhoto(uploadData);
      await refreshUser();
      setSuccessMessage('Profile photo updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload profile photo';
      setErrorMessage(msg);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;

    try {
      setIsDeletingPhoto(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await usersAPI.deleteProfilePhoto();
      await refreshUser();
      setSuccessMessage('Profile photo removed successfully');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to remove profile photo';
      setErrorMessage(msg);
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Frontend Validations
    if (formData.fullName.trim() && formData.fullName.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters long');
      return;
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setErrorMessage('Please enter a valid email address');
        return;
      }
    }

    if (formData.pincode.trim()) {
      if (!/^\d{6}$/.test(formData.pincode.trim())) {
        setErrorMessage('Pincode must be exactly 6 digits');
        return;
      }
    }

    let parsedLandSize: number | undefined = undefined;
    if (formData.landSize.trim()) {
      parsedLandSize = Number(formData.landSize);
      if (isNaN(parsedLandSize) || parsedLandSize <= 0) {
        setErrorMessage('Land size must be a valid positive number');
        return;
      }
    }

    try {
      setIsSaving(true);

      // Clean payload: empty strings converted to undefined so backend Zod validations pass
      const payload: Record<string, any> = {
        fullName: formData.fullName.trim() || undefined,
        preferredLanguage: formData.preferredLanguage || 'EN',
      };

      if (formData.email.trim()) {
        payload.email = formData.email.trim();
      }

      if (formData.state.trim()) payload.state = formData.state.trim();
      if (formData.district.trim()) payload.district = formData.district.trim();
      if (formData.villageCity.trim()) payload.villageCity = formData.villageCity.trim();
      if (formData.pincode.trim()) payload.pincode = formData.pincode.trim();
      if (formData.preferredBrand.trim()) payload.preferredBrand = formData.preferredBrand.trim();
      if (formData.farmingType.trim()) payload.farmingType = formData.farmingType.trim();
      if (parsedLandSize !== undefined) payload.landSize = parsedLandSize;
      if (formData.budgetRange.trim()) payload.budgetRange = formData.budgetRange.trim();
      if (formData.sellerType.trim()) payload.sellerType = formData.sellerType.trim();
      if (formData.aadhaarRef.trim()) payload.aadhaarRef = formData.aadhaarRef.trim();
      if (formData.panRef.trim()) payload.panRef = formData.panRef.trim();

      const res = await usersAPI.updateMe(payload);
      if (res.success) {
        await refreshUser();
        setSuccessMessage('Profile updated successfully!');
        setMode('view');
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(res.message || 'Failed to update profile');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.error)
          ? err.response.data.error.map((i: any) => i.message).join(', ')
          : null) ||
        err.message ||
        'Failed to save profile changes';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Revert form data to user state
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        preferredLanguage: user.preferredLanguage || 'EN',
        state: user.state || '',
        district: user.district || '',
        villageCity: user.villageCity || '',
        pincode: user.pincode || '',
        preferredBrand: user.preferredBrand || '',
        farmingType: user.farmingType || '',
        landSize: user.landSize !== undefined && user.landSize !== null ? String(user.landSize) : '',
        budgetRange: user.budgetRange || '',
        sellerType: user.sellerType || 'individual',
        aadhaarRef: user.aadhaarRef || '',
        panRef: user.panRef || '',
      });
    }
    setErrorMessage(null);
    setMode('view');
  };

  // Helper for role badge label and styling
  const getRoleBadge = (roleName?: string) => {
    switch (roleName?.toUpperCase()) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return {
          label: roleName === 'SUPER_ADMIN' ? 'Super Admin' : 'Administrator',
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
      case 'DEALER':
        return {
          label: 'Authorized Dealer',
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        };
      case 'AGENT':
        return {
          label: 'Customer Support Agent',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      default:
        return {
          label: 'Farmer / Customer',
          bg: 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border-[var(--color-brand-green)]/30',
        };
    }
  };

  // Helper for KYC badge
  const getKycBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return {
          label: 'KYC Verified',
          className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: ShieldCheck,
        };
      case 'REJECTED':
        return {
          label: 'KYC Rejected',
          className: 'bg-red-500/15 text-red-400 border-red-500/30',
          icon: AlertCircle,
        };
      default:
        return {
          label: 'KYC Pending',
          className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          icon: Clock,
        };
    }
  };

  const roleBadge = getRoleBadge(user?.role?.name);
  const kycBadge = getKycBadge(user?.kycStatus);
  const KycIcon = kycBadge.icon;

  const currentLangLabel =
    LANGUAGES.find((l) => l.code === (user?.preferredLanguage || formData.preferredLanguage))?.label ||
    'English';

  return (
    <div className={`mx-auto w-full ${inDashboard ? 'max-w-5xl' : 'max-w-5xl'}`}>
      {/* ─── Profile Hero Banner ─── */}
      <div className="glass-panel relative mb-8 overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)]/90 to-[var(--color-brand-green)]/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--color-brand-green)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Avatar and Basic Identity */}
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {/* Avatar with Camera badge */}
            <div className="group relative">
              <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--border-brand)] bg-foreground/5 shadow-2xl transition-all duration-300 group-hover:scale-105">
                {isUploadingPhoto ? (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={32} />
                    <span className="text-[10px] font-bold text-[var(--color-brand-green)]">Uploading</span>
                  </div>
                ) : user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.fullName || 'User Profile'}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <User size={52} className="text-muted/60" />
                )}
              </div>

              {/* Camera upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto || isDeletingPhoto}
                className="absolute right-0 bottom-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--color-brand-green)] text-white shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
                title="Change Profile Photo"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
            </div>

            {/* Name, Mobile, Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  {user?.fullName || 'TractorDost User'}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${roleBadge.bg}`}
                >
                  <ShieldCheck size={12} /> {roleBadge.label}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${kycBadge.className}`}
                >
                  <KycIcon size={12} /> {kycBadge.label}
                </span>
              </div>

              <div className="text-muted flex flex-wrap items-center justify-center gap-3 text-sm font-medium sm:justify-start">
                <span className="flex items-center gap-1.5 text-foreground/80">
                  <Phone size={14} className="text-[var(--color-brand-green)]" />
                  {user?.mobile ? `+91 ${user.mobile}` : 'No phone linked'}
                  {user?.isMobileVerified && (
                    <span className="text-xs text-emerald-400 font-bold" title="Mobile Verified">
                      ✓
                    </span>
                  )}
                </span>
                {user?.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <Mail size={14} className="text-blue-400" />
                      {user.email}
                    </span>
                  </>
                )}
                {(user?.villageCity || user?.state) && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <MapPin size={14} className="text-amber-400" />
                      {[user.villageCity, user.district, user.state].filter(Boolean).join(', ')}
                    </span>
                  </>
                )}
              </div>

              {/* Member Since & Photo actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-muted sm:justify-start">
                {user?.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="opacity-70" />
                    Member since{' '}
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
                {user?.profilePhoto && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    disabled={isDeletingPhoto || isUploadingPhoto}
                    className="flex items-center gap-1 font-semibold text-red-400 hover:text-red-300 hover:underline disabled:opacity-50"
                  >
                    {isDeletingPhoto ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mode Switcher / Action Button */}
          <div className="flex flex-col items-center gap-3 sm:flex-row lg:flex-col lg:items-end">
            <div className="flex items-center gap-2">
              {mode === 'view' ? (
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className="spatial-button flex items-center gap-2.5 rounded-2xl px-6 py-3 font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-3 text-sm font-bold text-foreground transition-all hover:bg-foreground/10"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className="spatial-button flex items-center gap-2 rounded-2xl px-6 py-3 font-bold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Profile Completion Meter */}
            <div className="w-full max-w-xs space-y-1.5 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Sparkles size={13} className="text-[var(--color-brand-green)]" /> Profile Strength
                </span>
                <span className="text-[var(--color-brand-green)]">{completionPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[var(--color-brand-green)] transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-muted">
                {completionPercent === 100
                  ? 'All profile details are up to date!'
                  : 'Add location and tractor preferences to get 100% matched leads.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Feedback Notifications ─── */}
      {successMessage && (
        <div className="animate-fade-in mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-400 shadow-md">
          <CheckCircle2 size={22} className="shrink-0 text-emerald-400" />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="animate-fade-in mb-6 flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-400 shadow-md">
          <AlertCircle size={22} className="shrink-0 text-red-400" />
          <p className="text-sm font-bold">{errorMessage}</p>
        </div>
      )}

      {/* ─── VIEW MODE ─── */}
      {mode === 'view' ? (
        <div className="space-y-6">
          {/* Grid of Key Detail Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Card 1: Personal & Contact Information */}
            <div className="glass-panel flex flex-col justify-between rounded-3xl border border-[var(--border-subtle)] p-6 shadow-sm">
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                      <User size={18} />
                    </div>
                    <h2 className="text-foreground text-base font-bold">Personal Information</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('edit');
                      setActiveTab('personal');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[var(--color-brand-green)] hover:underline"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Full Name</span>
                    <span className="text-foreground font-bold">{user?.fullName || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Mobile Number</span>
                    <span className="flex items-center gap-1.5 text-foreground font-bold">
                      {user?.mobile ? `+91 ${user.mobile}` : '—'}
                      {user?.isMobileVerified && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400">
                          Verified
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Email Address</span>
                    <span className="text-foreground font-bold">{user?.email || 'Not configured'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Preferred Language</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/5 px-2.5 py-1 text-xs font-bold text-foreground">
                      <Globe size={13} className="text-[var(--color-brand-green)]" />
                      {currentLangLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Location & Address */}
            <div className="glass-panel flex flex-col justify-between rounded-3xl border border-[var(--border-subtle)] p-6 shadow-sm">
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                      <MapPin size={18} />
                    </div>
                    <h2 className="text-foreground text-base font-bold">Location & Address</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('edit');
                      setActiveTab('location');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[var(--color-brand-green)] hover:underline"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">State</span>
                    <span className="text-foreground font-bold">{user?.state || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">District</span>
                    <span className="text-foreground font-bold">{user?.district || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Village / City</span>
                    <span className="text-foreground font-bold">{user?.villageCity || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Pincode</span>
                    <span className="text-foreground font-bold">{user?.pincode || '—'}</span>
                  </div>
                </div>
              </div>

              {(user?.villageCity || user?.state) && (
                <div className="mt-4 border-t border-[var(--border-subtle)] pt-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      [user?.villageCity, user?.district, user?.state, user?.pincode].filter(Boolean).join(', ')
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:underline"
                  >
                    <ExternalLink size={12} /> View area on Google Maps
                  </a>
                </div>
              )}
            </div>

            {/* Card 3: Tractor & Agricultural Preferences */}
            <div className="glass-panel flex flex-col justify-between rounded-3xl border border-[var(--border-subtle)] p-6 shadow-sm">
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Tractor size={18} />
                    </div>
                    <h2 className="text-foreground text-base font-bold">Tractor & Farming Profile</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('edit');
                      setActiveTab('preferences');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[var(--color-brand-green)] hover:underline"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Preferred Brand</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                      <Tag size={12} />
                      {user?.preferredBrand || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Farming Type</span>
                    <span className="text-foreground font-bold">{user?.farmingType || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Land Size</span>
                    <span className="text-foreground font-bold">
                      {user?.landSize ? `${user.landSize} Acres` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Budget Range</span>
                    <span className="text-foreground font-bold">{user?.budgetRange || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Seller Type</span>
                    <span className="capitalize text-foreground font-bold">
                      {user?.sellerType || 'Individual Farmer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Account Security & Identification */}
            <div className="glass-panel flex flex-col justify-between rounded-3xl border border-[var(--border-subtle)] p-6 shadow-sm">
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                      <Shield size={18} />
                    </div>
                    <h2 className="text-foreground text-base font-bold">KYC & Identity Status</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('edit');
                      setActiveTab('identity');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[var(--color-brand-green)] hover:underline"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Account ID</span>
                    <span className="font-mono text-xs text-muted font-bold">#TD-USER-{user?.id}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">KYC Verification</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${kycBadge.className}`}
                    >
                      <KycIcon size={12} /> {kycBadge.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">Aadhaar Reference</span>
                    <span className="text-foreground font-bold">
                      {user?.aadhaarRef
                        ? `•••• •••• ${user.aadhaarRef.slice(-4)}`
                        : 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted font-medium">PAN Reference</span>
                    <span className="text-foreground font-bold">
                      {user?.panRef
                        ? `••••••${user.panRef.slice(-4).toUpperCase()}`
                        : 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-xs text-muted">
                <span className="font-bold text-foreground">Data Privacy:</span> Identity documents are encrypted
                at rest and strictly used for compliance and verified badge authorization.
              </div>
            </div>
          </div>

          {/* Quick Contextual Actions based on role */}
          <div className="glass-panel rounded-3xl border border-[var(--border-subtle)] p-6">
            <h3 className="text-foreground mb-4 text-sm font-bold tracking-wider uppercase text-muted">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPER_ADMIN' ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <Building2 size={20} className="text-purple-400" />
                    <span className="text-xs font-bold text-foreground">Admin Portal</span>
                  </Link>
                  <Link
                    href="/admin/users"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <User size={20} className="text-[var(--color-brand-green)]" />
                    <span className="text-xs font-bold text-foreground">User Master</span>
                  </Link>
                  <Link
                    href="/admin/leads"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <Layers size={20} className="text-blue-400" />
                    <span className="text-xs font-bold text-foreground">Leads CRM</span>
                  </Link>
                  <Link
                    href="/admin/tractors"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <Tractor size={20} className="text-amber-400" />
                    <span className="text-xs font-bold text-foreground">Tractor Catalog</span>
                  </Link>
                </>
              ) : user?.role?.name === 'DEALER' ? (
                <>
                  <Link
                    href="/dealer/dashboard"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <Building2 size={20} className="text-blue-400" />
                    <span className="text-xs font-bold text-foreground">Dealer Dashboard</span>
                  </Link>
                  <Link
                    href="/dealer/inventory"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <Tractor size={20} className="text-[var(--color-brand-green)]" />
                    <span className="text-xs font-bold text-foreground">Inventory</span>
                  </Link>
                  <Link
                    href="/dealer/leads"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <Layers size={20} className="text-amber-400" />
                    <span className="text-xs font-bold text-foreground">Customer Leads</span>
                  </Link>
                  <Link
                    href="/dealer/profile"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <Building2 size={20} className="text-purple-400" />
                    <span className="text-xs font-bold text-foreground">Showroom Profile</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <Building2 size={20} className="text-[var(--color-brand-green)]" />
                    <span className="text-xs font-bold text-foreground">My Dashboard</span>
                  </Link>
                  <Link
                    href="/tractors"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <Tractor size={20} className="text-emerald-400" />
                    <span className="text-xs font-bold text-foreground">Browse Tractors</span>
                  </Link>
                  <Link
                    href="/sell-used-tractor"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <Tag size={20} className="text-amber-400" />
                    <span className="text-xs font-bold text-foreground">Sell My Tractor</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                  >
                    <Sparkles size={20} className="text-purple-400" />
                    <span className="text-xs font-bold text-foreground">My Wishlist</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ─── EDIT MODE ─── */
        <div className="glass-panel animate-fade-in rounded-3xl border border-[var(--border-subtle)] p-6 shadow-xl backdrop-blur-xl md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-foreground text-xl font-black md:text-2xl">Edit Profile Details</h2>
              <p className="text-muted text-xs font-medium">
                Update your personal information, address, and equipment preferences.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-foreground/10"
              >
                <X size={14} /> Discard
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving || isUploadingPhoto || isDeletingPhoto}
                className="spatial-button flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Edit Navigation Tabs */}
          <div className="mb-8 flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-2">
            {[
              { id: 'personal', label: '1. Personal Info', icon: User },
              { id: 'location', label: '2. Address & Location', icon: MapPin },
              { id: 'preferences', label: '3. Farming & Tractor', icon: Tractor },
              { id: 'identity', label: '4. Identity & KYC', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                      : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* ─── TAB 1: Personal Information ─── */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2" size={16} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] pr-4 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                        placeholder="e.g. Ramesh Patil"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2" size={16} />
                      <input
                        type="text"
                        value={user?.mobile ? `+91 ${user.mobile}` : ''}
                        disabled
                        className="bg-foreground/5 text-muted h-12 w-full cursor-not-allowed rounded-xl border border-[var(--border-subtle)] pr-4 pl-10 text-sm font-medium opacity-70"
                      />
                    </div>
                    <p className="text-muted mt-1 ml-1 text-[11px]">
                      Registered mobile number is your login key and cannot be changed directly.
                    </p>
                  </div>

                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2" size={16} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] pr-4 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                        placeholder="e.g. ramesh.patil@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Preferred Language
                    </label>
                    <div className="relative">
                      <Globe className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2" size={16} />
                      <select
                        name="preferredLanguage"
                        value={formData.preferredLanguage}
                        onChange={handleChange}
                        className="bg-foreground/5 text-foreground h-12 w-full appearance-none rounded-xl border border-[var(--border-subtle)] pr-8 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                      >
                        {LANGUAGES.map((lang) => (
                          <option
                            key={lang.code}
                            value={lang.code}
                            className="bg-[var(--bg-card)] text-foreground"
                          >
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('location')}
                    className="flex items-center gap-1.5 rounded-xl bg-foreground/10 px-5 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-foreground/15"
                  >
                    Next: Location & Address <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB 2: Location & Address ─── */}
            {activeTab === 'location' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">State</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                    >
                      <option value="" className="bg-[var(--bg-card)] text-foreground">
                        Select State / UT
                      </option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st} className="bg-[var(--bg-card)] text-foreground">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                      placeholder="e.g. Pune, Kolhapur, Ludhiana"
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Village / City / Tehsil
                    </label>
                    <input
                      type="text"
                      name="villageCity"
                      value={formData.villageCity}
                      onChange={handleChange}
                      className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                      placeholder="e.g. Baramati"
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Pincode (6 digits)
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                      placeholder="e.g. 413102"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className="rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/5"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preferences')}
                    className="flex items-center gap-1.5 rounded-xl bg-foreground/10 px-5 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-foreground/15"
                  >
                    Next: Farming Profile <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB 3: Tractor & Farming Preferences ─── */}
            {activeTab === 'preferences' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Preferred Tractor Brand
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="preferredBrand"
                        list="popular-brands-list"
                        value={formData.preferredBrand}
                        onChange={handleChange}
                        className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                        placeholder="Select or enter tractor brand"
                      />
                      <datalist id="popular-brands-list">
                        {POPULAR_BRANDS.map((b) => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Primary Farming Type
                    </label>
                    <div className="relative">
                      <Wheat className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2" size={16} />
                      <select
                        name="farmingType"
                        value={formData.farmingType}
                        onChange={handleChange}
                        className="bg-foreground/5 text-foreground h-12 w-full appearance-none rounded-xl border border-[var(--border-subtle)] pr-8 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                      >
                        <option value="" className="bg-[var(--bg-card)] text-foreground">
                          Select Farming Category
                        </option>
                        {FARMING_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-[var(--bg-card)] text-foreground">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Agricultural Land Size (in Acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="99999"
                      name="landSize"
                      value={formData.landSize}
                      onChange={handleChange}
                      className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                      placeholder="e.g. 5.5"
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Target Tractor Budget Range
                    </label>
                    <div className="relative">
                      <IndianRupee
                        className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2"
                        size={16}
                      />
                      <select
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleChange}
                        className="bg-foreground/5 text-foreground h-12 w-full appearance-none rounded-xl border border-[var(--border-subtle)] pr-8 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                      >
                        <option value="" className="bg-[var(--bg-card)] text-foreground">
                          Select Budget Range
                        </option>
                        {BUDGET_RANGES.map((b) => (
                          <option key={b} value={b} className="bg-[var(--bg-card)] text-foreground">
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Seller / Profile Category
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, sellerType: 'individual' }))}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                          formData.sellerType === 'individual'
                            ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]'
                            : 'border-[var(--border-subtle)] text-muted hover:bg-foreground/5 hover:text-foreground'
                        }`}
                      >
                        <User size={16} /> Individual Farmer / Owner
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, sellerType: 'dealer' }))}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                          formData.sellerType === 'dealer'
                            ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                            : 'border-[var(--border-subtle)] text-muted hover:bg-foreground/5 hover:text-foreground'
                        }`}
                      >
                        <Building2 size={16} /> Commercial Dealer
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('location')}
                    className="rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/5"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('identity')}
                    className="flex items-center gap-1.5 rounded-xl bg-foreground/10 px-5 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-foreground/15"
                  >
                    Next: Identity & KYC <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB 4: Identity & KYC References ─── */}
            {activeTab === 'identity' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs text-blue-300">
                  <div className="flex items-center gap-2 font-bold">
                    <Shield size={16} /> Verification & Identity Protection
                  </div>
                  <p className="mt-1 text-blue-300/80">
                    Entering your document reference numbers accelerates your verified seller badge and high-value loan
                    processing. All documents are encrypted with AES-256 before storage.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      Aadhaar Reference Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="aadhaarRef"
                      maxLength={16}
                      value={formData.aadhaarRef}
                      onChange={handleChange}
                      className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                      placeholder="e.g. XXXX-XXXX-1234"
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                      PAN Reference Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="panRef"
                      maxLength={10}
                      value={formData.panRef}
                      onChange={handleChange}
                      className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium uppercase transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                      placeholder="e.g. ABCDE1234F"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preferences')}
                    className="rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/5"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="spatial-button flex items-center gap-2 rounded-xl px-8 py-3 font-bold shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save All Changes
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions for all tabs */}
            <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploadingPhoto || isDeletingPhoto}
                className="spatial-button flex items-center gap-2 rounded-xl px-7 py-2.5 text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {isSaving ? <TractorLoader size={18} /> : <Save size={16} />}
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
