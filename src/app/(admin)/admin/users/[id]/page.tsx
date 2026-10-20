'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Building2,
  Globe,
  ShoppingBag,
  MessageSquare,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';
import { usersAPI, UserStats } from '@/lib/api/users';
import { User } from '@/types/models/user';
import { UserEditModal } from '../components/UserEditModal';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingActive, setTogglingActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchUserData = async () => {
    if (!userId || isNaN(userId)) {
      setError('Invalid User ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [userRes, statsRes] = await Promise.allSettled([
        usersAPI.getUserById(userId),
        usersAPI.getUserStats(userId),
      ]);

      if (userRes.status === 'fulfilled' && userRes.value.success) {
        setUser(userRes.value.data);
      } else {
        throw new Error('User not found or inaccessible.');
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      }
    } catch (err: any) {
      console.error('Failed to load user:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load user details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const handleToggleActive = async () => {
    if (!user || togglingActive) return;
    const willDeactivate = Boolean(user.isActive);
    const actionLabel = willDeactivate ? 'deactivate' : 'activate';

    if (willDeactivate && user.role?.name === 'SUPER_ADMIN') {
      setError('Cannot deactivate a SUPER_ADMIN account.');
      return;
    }

    const confirmMessage = willDeactivate
      ? `Are you sure you want to deactivate ${user.fullName || 'User #' + user.id}? The user will be immediately logged out and unable to log in.`
      : `Are you sure you want to activate ${user.fullName || 'User #' + user.id}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setTogglingActive(true);
      setError(null);
      let newActiveState = !willDeactivate;

      try {
        const res = await usersAPI.toggleUserActive(user.id);
        if (res?.success && res?.data && typeof res.data.isActive === 'boolean') {
          newActiveState = res.data.isActive;
        }
      } catch (toggleErr: any) {
        console.warn('Dedicated toggleUserActive failed, falling back to updateUserById...', toggleErr);
        const fallbackRes = await usersAPI.updateUserById(user.id, { isActive: !willDeactivate });
        if (fallbackRes?.success && fallbackRes?.data && typeof fallbackRes.data.isActive === 'boolean') {
          newActiveState = fallbackRes.data.isActive;
        } else {
          throw toggleErr;
        }
      }

      setUser({ ...user, isActive: newActiveState });
      setActionSuccess(`User account has been ${newActiveState ? 'activated' : 'deactivated'} successfully.`);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      console.error('Failed to toggle active status:', err);
      setError(err?.response?.data?.message || `Failed to ${actionLabel} user account`);
    } finally {
      setTogglingActive(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-[var(--color-brand-green)]" />
        <p className="text-xs font-bold text-muted">Loading User Master Details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle size={40} className="text-red-500" />
        <h2 className="text-xl font-black text-foreground">User Not Found</h2>
        <p className="text-xs text-muted max-w-md">{error || 'The requested user could not be loaded.'}</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white hover:bg-[var(--color-brand-green-dark)]"
        >
          <ArrowLeft size={14} /> Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to User Master List</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={togglingActive || (user.isActive && user.role?.name === 'SUPER_ADMIN')}
            onClick={handleToggleActive}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              user.isActive
                ? 'border-amber-300 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100'
                : 'border-emerald-300 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            {togglingActive ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Updating Status...</span>
              </>
            ) : user.isActive ? (
              <>
                <XCircle size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Deactivate Account</span>
              </>
            ) : (
              <>
                <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Activate Account</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-4 py-1.5 text-xs font-black text-white hover:bg-[var(--color-brand-green-dark)] shadow-sm cursor-pointer"
          >
            <Edit2 size={13} />
            <span>Edit User Master</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p>{actionSuccess}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-bold text-red-600 dark:text-red-400">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Header Card */}
      <div className="glass-panel flex flex-col gap-5 rounded-2xl border border-[var(--border-subtle)] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--color-brand-green)]/10 text-2xl font-black text-[var(--color-brand-green)] uppercase">
            {user.fullName ? user.fullName.charAt(0) : 'U'}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black text-[#4a7635]">#{user.id}</span>
              <span className="inline-flex items-center rounded-md border border-purple-300 dark:border-purple-800/50 bg-purple-100 dark:bg-purple-950/40 px-2 py-0.5 text-[10px] font-black text-purple-900 dark:text-purple-300 uppercase">
                {user.role?.name || 'CUSTOMER'}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                  user.isActive
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50'
                    : 'bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800/50'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {user.fullName || 'Unnamed User'}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted">
              <span className="flex items-center gap-1 text-foreground font-mono">
                <Phone size={12} className="text-muted" /> +91 {user.mobile}
              </span>
              {user.email && (
                <span className="flex items-center gap-1">
                  <Mail size={12} /> {user.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Master Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Location Master */}
        <div className="glass-panel flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] p-5">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-black uppercase tracking-wider text-foreground">
            <MapPin size={14} className="text-[var(--color-brand-green)]" />
            <span>Location Master</span>
          </div>
          <div className="flex flex-col gap-2.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">State:</span>
              <p className="font-bold text-foreground">{user.state || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">District:</span>
              <p className="font-bold text-foreground">{user.district || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">Village / City / Tehsil:</span>
              <p className="font-bold text-foreground">{user.villageCity || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">Pincode:</span>
              <p className="font-bold text-foreground font-mono">{user.pincode || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Account Preferences */}
        <div className="glass-panel flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] p-5">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-black uppercase tracking-wider text-foreground">
            <Globe size={14} className="text-amber-500" />
            <span>Preferences & Profile</span>
          </div>
          <div className="flex flex-col gap-2.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">Preferred Language:</span>
              <p className="font-bold text-foreground">{user.preferredLanguage || 'HI'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">Seller Classification:</span>
              <p className="font-bold text-foreground capitalize">{user.sellerType ? `${user.sellerType} Account` : 'Individual Farmer / Buyer'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">Preferred Brand:</span>
              <p className="font-bold text-foreground">{user.preferredBrand || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">Farming Type:</span>
              <p className="font-bold text-foreground">{user.farmingType || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Verification & KYC */}
        <div className="glass-panel flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] p-5">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-black uppercase tracking-wider text-foreground">
            <ShieldCheck size={14} className="text-purple-500" />
            <span>KYC & Security</span>
          </div>
          <div className="flex flex-col gap-2.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">KYC Status:</span>
              <p className="font-bold text-foreground">{user.kycStatus || 'PENDING'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">Mobile Verification:</span>
              <p className="font-bold text-foreground">{user.isMobileVerified ? 'Verified (OTP)' : 'Unverified'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">Email Verification:</span>
              <p className="font-bold text-foreground">{user.isEmailVerified ? 'Verified' : 'Unverified'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase">Active Listing Limit:</span>
              <p className="font-bold text-foreground">{user.activeListingLimit || 3} Listings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats Summary */}
      {stats && (
        <div className="glass-panel flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] p-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted">Platform Activity Summary</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
              <span className="text-[10px] font-black uppercase text-muted flex items-center gap-1.5">
                <ShoppingBag size={13} className="text-emerald-600 dark:text-emerald-400" /> Total Listings
              </span>
              <p className="mt-1 text-2xl font-black text-foreground">{stats.totalListings}</p>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
              <span className="text-[10px] font-black uppercase text-muted flex items-center gap-1.5">
                <MessageSquare size={13} className="text-blue-600 dark:text-blue-400" /> Enquiries Made
              </span>
              <p className="mt-1 text-2xl font-black text-foreground">{stats.totalEnquiries}</p>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
              <span className="text-[10px] font-black uppercase text-muted flex items-center gap-1.5">
                <Phone size={13} className="text-amber-600 dark:text-amber-400" /> Leads Generated
              </span>
              <p className="mt-1 text-2xl font-black text-foreground">{stats.totalLeads}</p>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
              <span className="text-[10px] font-black uppercase text-muted flex items-center gap-1.5">
                <FileText size={13} className="text-purple-700 dark:text-purple-400" /> Loan Applications
              </span>
              <p className="mt-1 text-2xl font-black text-foreground">{stats.totalLoanApplications}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <UserEditModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={() => {
            setIsEditModalOpen(false);
            fetchUserData();
          }}
        />
      )}
    </div>
  );
}
