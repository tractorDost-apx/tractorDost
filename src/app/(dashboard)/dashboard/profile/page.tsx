'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/store/AuthContext';
import { usersAPI } from '@/lib/api/users';
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
];

const FARMING_TYPES = [
  'Crop Farming (Paddy/Wheat/Sugarcane)',
  'Horticulture & Fruits',
  'Organic Farming',
  'Dairy & Livestock',
  'Commercial / Contract Farming',
  'Mixed Farming',
];

const BUDGET_RANGES = [
  'Under ₹3,00,000',
  '₹3,00,000 - ₹5,00,000',
  '₹5,00,000 - ₹8,00,000',
  '₹8,00,000 - ₹12,00,000',
  'Above ₹12,00,000',
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when user context loads or updates
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
      });
    }
  }, [user]);

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
      setSuccessMessage('Profile photo removed');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to remove profile photo';
      setErrorMessage(msg);
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const res = await usersAPI.updateMe(payload);
      if (res.success) {
        await refreshUser();
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(null), 4000);
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

  return (
    <div className="animate-fade-in mx-auto flex h-full w-full max-w-4xl flex-col">
      {/* Header */}
      <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
        <h1 className="text-foreground mb-1 text-2xl font-black md:text-3xl">My Profile</h1>
        <p className="text-muted text-sm font-medium">
          Manage your personal information, address, and tractor preferences.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 p-4 text-[var(--color-brand-green)]">
          <CheckCircle2 size={20} className="shrink-0" />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-bold">{errorMessage}</p>
        </div>
      )}

      {/* Profile Photo Card */}
      <div className="glass-panel mb-8 flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="group relative">
            <div className="bg-foreground/5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border-brand)] transition-all">
              {isUploadingPhoto ? (
                <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={32} />
              ) : user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.fullName || 'User Profile'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={38} className="text-muted" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto || isDeletingPhoto}
              className="absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--color-brand-green)] text-white shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
              title="Upload Photo"
            >
              <Camera size={14} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-foreground text-lg font-bold">
              {user?.fullName || 'TractorDost User'}
            </h3>
            <div className="text-muted flex items-center justify-center gap-2 text-xs font-medium sm:justify-start">
              <span>{user?.mobile ? `+91 ${user.mobile}` : 'No phone linked'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[var(--color-brand-green)]">
                <ShieldCheck size={12} /> {user?.role?.name || 'Customer'}
              </span>
            </div>
            <p className="text-muted mt-1 text-xs">JPG, PNG, or WebP. Max 2MB.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto || isDeletingPhoto}
            className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 text-xs font-bold text-foreground transition-all hover:bg-foreground/10 hover:border-[var(--color-brand-green)]"
          >
            {isUploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            Change Photo
          </button>
          {user?.profilePhoto && (
            <button
              type="button"
              onClick={handleDeletePhoto}
              disabled={isUploadingPhoto || isDeletingPhoto}
              className="flex h-10 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 text-xs font-bold text-red-500 transition-all hover:bg-red-500/10 hover:border-red-500/40"
              title="Remove Photo"
            >
              {isDeletingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
            <User size={18} className="text-[var(--color-brand-green)]" />
            <h2 className="text-foreground text-base font-bold">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">Full Name</label>
              <div className="relative">
                <User className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2" size={18} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] pr-4 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>
            </div>

            <div>
              <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">Mobile Number</label>
              <div className="relative">
                <Phone className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2" size={18} />
                <input
                  type="text"
                  value={user?.mobile ? String(user.mobile) : ''}
                  disabled
                  className="bg-foreground/5 text-muted h-12 w-full cursor-not-allowed rounded-xl border border-[var(--border-subtle)] pr-4 pl-10 text-sm font-medium opacity-80"
                />
              </div>
              <p className="text-muted mt-1 ml-1 text-[11px]">
                Registered mobile number cannot be changed.
              </p>
            </div>

            <div>
              <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">Email Address</label>
              <div className="relative">
                <Mail className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] pr-4 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                  placeholder="e.g. ramesh@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                Preferred Language
              </label>
              <div className="relative">
                <Globe className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2" size={18} />
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className="bg-foreground/5 text-foreground h-12 w-full appearance-none rounded-xl border border-[var(--border-subtle)] pr-8 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-[var(--bg-card)] text-foreground">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Location Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
            <MapPin size={18} className="text-[var(--color-brand-green)]" />
            <h2 className="text-foreground text-base font-bold">Location & Address</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                placeholder="e.g. Maharashtra, Punjab, etc."
              />
            </div>

            <div>
              <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                placeholder="e.g. Pune, Ludhiana, etc."
              />
            </div>

            <div>
              <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">Village / City</label>
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
              <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">Pincode</label>
              <input
                type="text"
                name="pincode"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                placeholder="6-digit pincode"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Tractor & Farming Preferences */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
            <Tractor size={18} className="text-[var(--color-brand-green)]" />
            <h2 className="text-foreground text-base font-bold">Tractor & Farming Preferences</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                Preferred Tractor Brand
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="preferredBrand"
                  list="brand-suggestions"
                  value={formData.preferredBrand}
                  onChange={handleChange}
                  className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                  placeholder="Select or enter brand"
                />
                <datalist id="brand-suggestions">
                  {POPULAR_BRANDS.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">Farming Type</label>
              <div className="relative">
                <Wheat className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2" size={18} />
                <select
                  name="farmingType"
                  value={formData.farmingType}
                  onChange={handleChange}
                  className="bg-foreground/5 text-foreground h-12 w-full appearance-none rounded-xl border border-[var(--border-subtle)] pr-8 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                >
                  <option value="" className="bg-[var(--bg-card)] text-foreground">
                    Select Farming Type
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
                Land Size (in Acres)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                name="landSize"
                value={formData.landSize}
                onChange={handleChange}
                className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
                placeholder="e.g. 5.5"
              />
            </div>

            <div>
              <label className="text-muted mb-1.5 ml-1 block text-xs font-bold">
                Tractor Budget Range
              </label>
              <div className="relative">
                <IndianRupee className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2" size={18} />
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 border-t border-[var(--border-subtle)] pt-6">
          <button
            type="submit"
            disabled={isSaving || isUploadingPhoto || isDeletingPhoto}
            className="spatial-button flex h-12 items-center gap-2 rounded-xl px-8 font-bold transition-all disabled:opacity-50"
          >
            {isSaving ? <TractorLoader size={20} /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
