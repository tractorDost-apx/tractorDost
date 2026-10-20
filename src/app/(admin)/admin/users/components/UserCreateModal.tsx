'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  Globe,
  Sparkles,
} from 'lucide-react';
import { usersAPI } from '@/lib/api/users';
import { authAPI } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/axios/axios';
import { INDIAN_STATES } from '@/lib/constants/indian-states';

interface UserCreateModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function UserCreateModal({ onClose, onSaved }: UserCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    roleId: '',
    isActive: true,
    state: '',
    district: '',
    villageCity: '',
    pincode: '',
    preferredLanguage: 'HI',
    sellerType: '',
    kycStatus: 'PENDING',
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await apiClient.get('/roles/getAll');
        if (res.data?.data?.roles) {
          const fetchedRoles: { id: number; name: string }[] = res.data.data.roles;
          setRoles(fetchedRoles);
          // Set default to CUSTOMER or first role
          const customerRole = fetchedRoles.find((r) => r.name === 'CUSTOMER') || fetchedRoles[0];
          if (customerRole) {
            setFormData((prev) => ({ ...prev, roleId: String(customerRole.id) }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    // Validate inputs
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      return;
    }

    if (formData.fullName.trim().length < 2) {
      setError('Please enter the user full name (at least 2 characters)');
      return;
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.pincode.trim() && !/^\d{6}$/.test(formData.pincode.trim())) {
      setError('Please enter a valid 6-digit postal pincode');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Check if user already exists with this mobile
      let targetUserId: number | null = null;
      try {
        const checkRes = await usersAPI.getAllUsers({ search: cleanMobile, limit: 1 });
        const existing = checkRes.data?.data?.find(
          (u) => String(u.mobile).replace(/\D/g, '') === cleanMobile
        );
        if (existing) {
          targetUserId = existing.id;
        }
      } catch {
        // ignore search error
      }

      // Step 2: If user does not exist in database, trigger creation via public auth endpoint
      if (!targetUserId) {
        await authAPI.requestOtp(cleanMobile);

        // Fetch the newly created user record from backend
        const searchRes = await usersAPI.getAllUsers({ search: cleanMobile, limit: 1 });
        const newlyCreated = searchRes.data?.data?.[0];
        if (newlyCreated && newlyCreated.id) {
          targetUserId = newlyCreated.id;
        }
      }

      if (!targetUserId) {
        throw new Error('User record could not be located in database. Please check connection and try again.');
      }

      // Step 3: Update all master fields (Role, Name, Email, Location, Active Status)
      const updatePayload: Record<string, any> = {
        fullName: formData.fullName.trim(),
        isActive: formData.isActive,
      };

      if (formData.roleId) updatePayload.roleId = Number(formData.roleId);
      if (formData.email.trim()) updatePayload.email = formData.email.trim();
      if (formData.state) updatePayload.state = formData.state;
      if (formData.district.trim()) updatePayload.district = formData.district.trim();
      if (formData.villageCity.trim()) updatePayload.villageCity = formData.villageCity.trim();
      if (formData.pincode.trim()) updatePayload.pincode = formData.pincode.trim();
      if (formData.preferredLanguage) updatePayload.preferredLanguage = formData.preferredLanguage;
      if (formData.sellerType) updatePayload.sellerType = formData.sellerType;
      if (formData.kycStatus) updatePayload.kycStatus = formData.kycStatus;

      await usersAPI.updateUserById(targetUserId, updatePayload);

      setSuccessNotice(`User #${targetUserId} (${formData.fullName.trim()}) registered and updated successfully!`);
      setTimeout(() => {
        onSaved();
      }, 700);
    } catch (err: any) {
      console.error('Error creating user:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to create user master record.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm sm:p-6">
      <div className="animate-fade-in flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl">
        {/* Sticky Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-black tracking-tight">Create User Master</h2>
              <p className="text-muted text-xs font-semibold">
                Register a new customer, agent, dealer, or admin in the system.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-bold text-red-600 dark:text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <Check size={16} className="mt-0.5 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <form id="create-user-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* 1. Identity & Credentials */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-black tracking-wider uppercase text-foreground">
                <UserIcon size={14} className="text-[var(--color-brand-green)]" />
                <span>Identity & Role Master</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-muted">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-background py-2.5 pr-3 pl-12 text-xs font-bold text-foreground transition-all focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Rahul Patil"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground transition-all focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. rahul@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground transition-all focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground">
                    Assign Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="roleId"
                    required
                    value={formData.roleId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground transition-all focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Location & Demographics */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-black tracking-wider uppercase text-foreground">
                <MapPin size={14} className="text-[var(--color-brand-green)]" />
                <span>Location & Address</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground transition-all focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none cursor-pointer"
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
                  <label className="text-[11px] font-bold text-foreground">District</label>
                  <input
                    type="text"
                    name="district"
                    placeholder="e.g. Pune, Kolhapur"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground transition-all focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground">Village / City / Tehsil</label>
                  <input
                    type="text"
                    name="villageCity"
                    placeholder="e.g. Baramati"
                    value={formData.villageCity}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground transition-all focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground">Postal Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    placeholder="e.g. 411001"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground transition-all focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Account Settings & Preferences */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-black tracking-wider uppercase text-foreground">
                <Globe size={14} className="text-[var(--color-brand-green)]" />
                <span>Account Status & Permissions</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground">Preferred Language</label>
                  <select
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none cursor-pointer"
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
                  <label className="text-[11px] font-bold text-foreground">Seller Classification</label>
                  <select
                    name="sellerType"
                    value={formData.sellerType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none cursor-pointer"
                  >
                    <option value="">Individual Farmer / Buyer</option>
                    <option value="dealer">Authorized Dealer / Broker</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-foreground">KYC Status</label>
                  <select
                    name="kycStatus"
                    value={formData.kycStatus}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-[var(--border-subtle)] text-[#4a7635] accent-[#4a7635] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground">Active Account Status</span>
                    <p className="text-[10px] text-muted">User will be able to log in and access the system immediately.</p>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-subtle)] bg-background px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold text-muted transition-colors hover:bg-foreground/5 hover:text-foreground cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-user-form"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black text-white shadow-md shadow-[var(--color-brand-green)]/20 transition-all hover:bg-[var(--color-brand-green-dark)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>Creating User Master...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Create User Master</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
