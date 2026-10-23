'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Activity,
  Calendar,
  FileText,
  ShoppingBag,
  MessageSquare,
  Phone,
  Check,
  AlertCircle,
  User as UserIcon,
  MapPin,
  Globe,
  ShieldCheck,
  Loader2,
  CheckCircle,
  XCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { User } from '@/types/models/user';
import { usersAPI, UserStats } from '@/lib/api/users';
import { apiClient } from '@/lib/api/axios/axios';
import { INDIAN_STATES } from '@/lib/constants/indian-states';

interface UserEditModalProps {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}

export function UserEditModal({ user, onClose, onSaved }: UserEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [quickToggling, setQuickToggling] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Keyboard shortcut: Escape exits fullscreen first, or closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, onClose]);

  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    isActive: Boolean(user.isActive),
    roleId: user.roleId ? String(user.roleId) : '',
    state: user.state || '',
    district: user.district || '',
    villageCity: user.villageCity || '',
    pincode: user.pincode || '',
    preferredLanguage: user.preferredLanguage || 'HI',
    sellerType: user.sellerType || 'individual',
    kycStatus: user.kycStatus || 'PENDING',
    activeListingLimit: user.activeListingLimit ?? 3,
  });

  // Keep form data synchronized if user prop changes
  useEffect(() => {
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      isActive: Boolean(user.isActive),
      roleId: user.roleId ? String(user.roleId) : '',
      state: user.state || '',
      district: user.district || '',
      villageCity: user.villageCity || '',
      pincode: user.pincode || '',
      preferredLanguage: user.preferredLanguage || 'HI',
      sellerType: user.sellerType || 'individual',
      kycStatus: user.kycStatus || 'PENDING',
      activeListingLimit: user.activeListingLimit ?? 3,
    });
  }, [user]);

  useEffect(() => {
    const fetchStatsAndRoles = async () => {
      try {
        const statsRes = await usersAPI.getUserStats(user.id);
        if (statsRes.success) {
          setStats(statsRes.data);
        }

        const rolesRes = await apiClient.get('/roles/getAll');
        if (rolesRes.data?.data?.roles) {
          setRoles(rolesRes.data.data.roles);
        }
      } catch (err) {
        console.error('Failed to fetch modal data', err);
      }
    };

    fetchStatsAndRoles();
  }, [user.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleQuickToggleActive = async () => {
    if (quickToggling || loading) return;
    const willDeactivate = Boolean(formData.isActive);
    const actionText = willDeactivate ? 'deactivate' : 'activate';

    if (willDeactivate && user.role?.name === 'SUPER_ADMIN') {
      setError('Cannot deactivate a SUPER_ADMIN account.');
      return;
    }

    try {
      setQuickToggling(true);
      setError(null);
      let newActiveState = !willDeactivate;

      // Method 1: Dedicated toggle endpoint (inverts isActive and clears sessions in backend if deactivating)
      try {
        const res = await usersAPI.toggleUserActive(user.id);
        if (res?.success && res?.data && typeof res.data.isActive === 'boolean') {
          newActiveState = res.data.isActive;
        }
      } catch (toggleErr: any) {
        console.warn('Dedicated toggleUserActive endpoint failed, attempting updateUserById fallback...', toggleErr);
        // Method 2: Resilient fallback
        const fallbackRes = await usersAPI.updateUserById(user.id, { isActive: !willDeactivate });
        if (fallbackRes?.success && fallbackRes?.data && typeof fallbackRes.data.isActive === 'boolean') {
          newActiveState = fallbackRes.data.isActive;
        } else {
          throw toggleErr;
        }
      }

      setFormData((prev) => ({ ...prev, isActive: newActiveState }));
      onSaved();
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      setError(err?.response?.data?.message || `Failed to ${actionText} user account`);
    } finally {
      setQuickToggling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const dataToUpdate: Record<string, any> = {
        fullName: formData.fullName.trim() || undefined,
        isActive: formData.isActive,
        roleId: formData.roleId ? Number(formData.roleId) : undefined,
        preferredLanguage: formData.preferredLanguage || undefined,
        kycStatus: formData.kycStatus || undefined,
        activeListingLimit: Number(formData.activeListingLimit) || undefined,
      };

      if (formData.email.trim()) {
        dataToUpdate.email = formData.email.trim();
      }

      if (formData.state) {
        dataToUpdate.state = formData.state;
      }

      if (formData.district.trim()) {
        dataToUpdate.district = formData.district.trim();
      }

      if (formData.villageCity.trim()) {
        dataToUpdate.villageCity = formData.villageCity.trim();
      }

      if (formData.pincode.trim() && /^\d{6}$/.test(formData.pincode.trim())) {
        dataToUpdate.pincode = formData.pincode.trim();
      }

      if (formData.sellerType) {
        dataToUpdate.sellerType = formData.sellerType;
      }

      const res = await usersAPI.updateUserById(user.id, dataToUpdate);

      // If user was deactivated from form, also call toggleUserActive to ensure backend deletes sessions
      if (user.isActive && !formData.isActive) {
        try {
          await usersAPI.toggleUserActive(user.id);
        } catch (sessionErr) {
          console.warn('Session invalidation on deactivation notice:', sessionErr);
        }
      }

      if (res.success) {
        onSaved();
      }
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err?.response?.data?.message || 'Failed to update user master record');
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({
    icon: Icon,
    title,
    colorClass = 'text-[var(--color-brand-green)]',
  }: {
    icon: any;
    title: string;
    colorClass?: string;
  }) => (
    <div className="text-foreground border-[var(--border-subtle)] mb-4 flex items-center gap-2 border-b pb-2">
      <Icon size={16} className={colorClass} />
      <h3 className="text-xs font-black tracking-wider uppercase">{title}</h3>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm ${
      isFullScreen ? 'p-0' : 'p-4 sm:p-6'
    }`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (isFullScreen) setIsFullScreen(false);
          else onClose();
        }}
      />

      <div className={`relative z-10 animate-fade-in border border-[var(--border-subtle)] flex flex-col overflow-hidden bg-background shadow-2xl transition-all duration-200 ${
        isFullScreen
          ? 'h-full w-full max-h-none max-w-none rounded-none'
          : 'max-h-[88vh] w-full max-w-3xl rounded-3xl'
      }`}>
        {/* Sticky Header */}
        <div className="border-b border-[var(--border-subtle)] bg-background z-10 flex shrink-0 items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] font-black text-sm">
              #{user.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-foreground text-xl font-black tracking-tight">Edit User Master</h2>
                <span className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-black text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800/50">
                  {user.role?.name || 'USER'}
                </span>
              </div>
              <p className="text-muted text-xs font-semibold">
                Manage profile details, assign roles, access permissions, and master settings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Quick Activate/Deactivate Button */}
            <button
              type="button"
              disabled={quickToggling || (formData.isActive && user.role?.name === 'SUPER_ADMIN')}
              onClick={handleQuickToggleActive}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                formData.isActive
                  ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                  : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
              }`}
              title={
                formData.isActive && user.role?.name === 'SUPER_ADMIN'
                  ? 'SUPER_ADMIN cannot be deactivated'
                  : formData.isActive
                  ? 'Deactivate User Account now'
                  : 'Activate User Account now'
              }
            >
              {quickToggling ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : formData.isActive ? (
                <>
                  <XCircle size={13} className="text-amber-600 dark:text-amber-400" />
                  <span>Deactivate Account</span>
                </>
              ) : (
                <>
                  <CheckCircle size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Activate Account</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/10 hover:text-foreground cursor-pointer"
              title={isFullScreen ? 'Exit Full Screen (Esc)' : 'Expand to Full Screen'}
            >
              {isFullScreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/10 hover:text-foreground cursor-pointer"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-bold text-red-600 dark:text-red-400 animate-fade-in">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form id="edit-user-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* SECTION 1: Identity & Access */}
            <section>
              <SectionTitle icon={UserIcon} title="Identity & Access" />

              <div className="bg-foreground/[0.02] border-[var(--border-subtle)] grid grid-cols-1 gap-4 rounded-2xl border p-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-[11px] font-bold tracking-wider uppercase">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-[11px] font-bold tracking-wider uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-[11px] font-bold tracking-wider uppercase">
                    Mobile Number (Primary Identity)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={user.mobile ? `+91 ${user.mobile}` : 'No mobile'}
                      disabled
                      className="bg-background border-[var(--border-subtle)] text-foreground w-full cursor-not-allowed rounded-xl border px-3.5 py-2.5 text-xs font-bold opacity-75 font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-muted uppercase">Verified</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-[11px] font-bold tracking-wider uppercase">
                    User Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none cursor-pointer"
                  >
                    <option value="">Select a role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                    {roles.length === 0 && <option value={user.roleId}>{user.role?.name}</option>}
                  </select>
                </div>

                {/* Account Status Switch Card */}
                <div className="pt-2 md:col-span-2">
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                      formData.isActive
                        ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-500/[0.04]'
                        : 'border-rose-300 dark:border-rose-800/60 bg-rose-500/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          formData.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        }`}
                      >
                        {formData.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-xs font-black">
                            {formData.isActive ? 'Account Status: Active' : 'Account Status: Inactive (Deactivated)'}
                          </span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase ${
                              formData.isActive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {formData.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </div>
                        <span className="text-muted text-[11px] font-medium">
                          {formData.isActive
                            ? 'User can log in and access allowed platform features and listings.'
                            : 'User is locked out, sessions revoked, and cannot log in until reactivated.'}
                        </span>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer self-start sm:self-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-brand-green)] relative transition-colors"></div>
                      <span className="text-xs font-bold text-foreground select-none">
                        {formData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: Location Master */}
            <section>
              <SectionTitle icon={MapPin} title="Location & Demographics" />

              <div className="bg-foreground/[0.02] border-[var(--border-subtle)] grid grid-cols-1 gap-4 rounded-2xl border p-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-[11px] font-bold tracking-wider uppercase">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select State --</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-[11px] font-bold tracking-wider uppercase">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Pune, Nagpur"
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-[11px] font-bold tracking-wider uppercase">Village / City / Tehsil</label>
                  <input
                    type="text"
                    name="villageCity"
                    value={formData.villageCity}
                    onChange={handleChange}
                    placeholder="e.g. Haveli, Baramati"
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-[11px] font-bold tracking-wider uppercase">Postal Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 3: Preferences & Classification */}
            <section>
              <SectionTitle icon={Globe} title="Preferences & Classification" />

              <div className="bg-foreground/[0.02] border-[var(--border-subtle)] grid grid-cols-1 gap-4 rounded-2xl border p-5 md:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-[11px] font-bold tracking-wider uppercase">Preferred Language</label>
                  <select
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleChange}
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)] focus:outline-none cursor-pointer"
                  >
                    <option value="HI">Hindi (हिंदी)</option>
                    <option value="MR">Marathi (मराठी)</option>
                    <option value="EN">English</option>
                    <option value="GU">Gujarati (ગુજરાતી)</option>
                    <option value="PB">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="TE">Telugu (తెలుగు)</option>
                    <option value="TA">Tamil (தமிழ்)</option>
                    <option value="KN">Kannada (ಕನ್ನಡ)</option>
                    <option value="BN">Bengali (বাংলা)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-[11px] font-bold tracking-wider uppercase">Seller Type</label>
                  <select
                    name="sellerType"
                    value={formData.sellerType}
                    onChange={handleChange}
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)] focus:outline-none cursor-pointer"
                  >
                    <option value="individual">Individual Farmer / Buyer</option>
                    <option value="dealer">Authorized Dealer / Broker</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-[11px] font-bold tracking-wider uppercase">KYC Status</label>
                  <select
                    name="kycStatus"
                    value={formData.kycStatus}
                    onChange={handleChange}
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)] focus:outline-none cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>
            </section>

            {/* SECTION 4: Live Activity Stats */}
            <section>
              <SectionTitle
                icon={Activity}
                title="User Activity Stats"
                colorClass="text-[var(--color-brand-green)]"
              />

              {!stats ? (
                <div className="flex animate-pulse gap-3">
                  <div className="bg-foreground/5 h-20 flex-1 rounded-2xl"></div>
                  <div className="bg-foreground/5 h-20 flex-1 rounded-2xl"></div>
                  <div className="bg-foreground/5 h-20 flex-1 rounded-2xl"></div>
                  <div className="bg-foreground/5 h-20 flex-1 rounded-2xl"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="bg-foreground/[0.02] border border-[var(--border-subtle)] flex flex-col gap-1.5 rounded-2xl p-4 shadow-sm">
                    <div className="text-muted flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase">
                      <ShoppingBag size={13} className="text-emerald-600 dark:text-emerald-400" /> Listings
                    </div>
                    <div className="text-foreground text-2xl font-black">{stats.totalListings}</div>
                  </div>

                  <div className="bg-foreground/[0.02] border border-[var(--border-subtle)] flex flex-col gap-1.5 rounded-2xl p-4 shadow-sm">
                    <div className="text-muted flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase">
                      <MessageSquare size={13} className="text-blue-600 dark:text-blue-400" /> Enquiries
                    </div>
                    <div className="text-foreground text-2xl font-black">{stats.totalEnquiries}</div>
                  </div>

                  <div className="bg-foreground/[0.02] border border-[var(--border-subtle)] flex flex-col gap-1.5 rounded-2xl p-4 shadow-sm">
                    <div className="text-muted flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase">
                      <Phone size={13} className="text-amber-600 dark:text-amber-400" /> Leads
                    </div>
                    <div className="text-foreground text-2xl font-black">{stats.totalLeads}</div>
                  </div>

                  <div className="bg-foreground/[0.02] border border-[var(--border-subtle)] flex flex-col gap-1.5 rounded-2xl p-4 shadow-sm">
                    <div className="text-muted flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase">
                      <FileText size={13} className="text-purple-700 dark:text-purple-400" /> Loans
                    </div>
                    <div className="text-foreground text-2xl font-black">{stats.totalLoanApplications}</div>
                  </div>

                  <div className="bg-background border border-[var(--border-subtle)] text-muted col-span-2 flex items-center justify-between rounded-xl p-3 text-xs font-bold shadow-sm md:col-span-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[var(--color-brand-green)]" />
                      <span>Member Since: <strong className="text-foreground">{new Date(stats.memberSince).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</strong></span>
                    </div>
                    {stats.lastLogin && (
                      <span className="text-[11px] text-muted font-medium">Last Login: {new Date(stats.lastLogin).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              )}
            </section>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="border-t border-[var(--border-subtle)] bg-background z-10 flex shrink-0 justify-end gap-3 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-xl px-5 py-2.5 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-user-form"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black text-white transition-all hover:bg-[var(--color-brand-green-dark)] hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[var(--color-brand-green)]/20 disabled:transform-none disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
