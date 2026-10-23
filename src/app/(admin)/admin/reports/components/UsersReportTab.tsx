'use client';

import React, { useState, useMemo } from 'react';
import { User } from '@/types/models/user';
import {
  Search,
  Download,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
} from 'lucide-react';
import { exportDataToCSV } from '../utils/reportExportUtils';

interface UsersReportTabProps {
  users: User[];
  loading?: boolean;
}

export const UsersReportTab: React.FC<UsersReportTabProps> = ({ users, loading }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [kycFilter, setKycFilter] = useState<string>('ALL');

  // Compute metrics
  const stats = useMemo(() => {
    let kycVerified = 0;
    let kycPending = 0;
    let kycRejected = 0;
    let activeUsers = 0;
    const byRole: Record<string, number> = {};

    users.forEach((u) => {
      const kyc = u.kycStatus || 'PENDING';
      if (kyc === 'VERIFIED') kycVerified++;
      else if (kyc === 'REJECTED') kycRejected++;
      else kycPending++;

      if (u.isActive) activeUsers++;

      const roleName = u.role?.name || 'CUSTOMER';
      byRole[roleName] = (byRole[roleName] || 0) + 1;
    });

    return {
      kycVerified,
      kycPending,
      kycRejected,
      activeUsers,
      byRole,
    };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const roleName = u.role?.name || 'CUSTOMER';
      const kyc = u.kycStatus || 'PENDING';
      const mobileStr = String(u.mobile ?? '');

      const matchesSearch =
        search === '' ||
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        mobileStr.includes(search) ||
        u.villageCity?.toLowerCase().includes(search.toLowerCase()) ||
        u.district?.toLowerCase().includes(search.toLowerCase()) ||
        u.state?.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || roleName === roleFilter;
      const matchesKyc = kycFilter === 'ALL' || kyc === kycFilter;

      return matchesSearch && matchesRole && matchesKyc;
    });
  }, [users, search, roleFilter, kycFilter]);

  const handleExportCSV = () => {
    const rows = filteredUsers.map((u) => ({
      ID: u.id,
      FullName: u.fullName || 'User',
      Email: u.email || '-',
      Mobile: String(u.mobile ?? '-'),
      Role: u.role?.name || 'CUSTOMER',
      KYCStatus: u.kycStatus || 'PENDING',
      IsActive: u.isActive ? 'Active' : 'Suspended',
      City: u.villageCity || u.district || '-',
      State: u.state || '-',
      CreatedAt: new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN'),
    }));
    exportDataToCSV(rows, 'Users_Report');
  };

  return (
    <div className="space-y-6">
      {/* 1. Demographics & KYC Barometer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* KYC Verification Health */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              KYC Verification Overview
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Identity verification and compliance status
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/60 dark:bg-purple-500/5 p-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
                  Verified Identities
                </span>
              </div>
              <span className="text-base font-black text-neutral-900 dark:text-white">
                {stats.kycVerified}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/5 p-3">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Pending Review
                </span>
              </div>
              <span className="text-base font-black text-neutral-900 dark:text-white">
                {stats.kycPending}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/5 p-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Active Accounts
                </span>
              </div>
              <span className="text-base font-black text-neutral-900 dark:text-white">
                {stats.activeUsers}
              </span>
            </div>
          </div>
        </div>

        {/* Roles Distribution */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              User Roles Distribution
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Community breakdown across platform personas
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {Object.entries(stats.byRole).length === 0 ? (
              <p className="text-xs text-neutral-500">No user data recorded</p>
            ) : (
              Object.entries(stats.byRole).map(([role, count]) => {
                const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                return (
                  <div
                    key={role}
                    className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-4 text-center transition-all hover:border-purple-300"
                  >
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {role}
                    </span>
                    <div className="mt-1.5 text-2xl font-black text-neutral-900 dark:text-white">
                      {count}
                    </div>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                      {pct}% of community
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Data Table with Filters */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              User Community Directory
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Showing {filteredUsers.length} of {users.length} registered accounts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search user, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 py-2 pl-9 pr-3 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-purple-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs font-medium"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 focus:border-purple-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs"
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="DEALER">Dealer</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff / Agent</option>
            </select>

            {/* KYC Filter */}
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 focus:border-purple-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs"
            >
              <option value="ALL">All KYC Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-200 shadow-2xs transition-all hover:border-purple-500 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-neutral-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              <tr>
                <th className="py-3 pl-3">User ID</th>
                <th className="py-3">Full Name</th>
                <th className="py-3">Contact</th>
                <th className="py-3">Role</th>
                <th className="py-3">KYC Status</th>
                <th className="py-3">Account Status</th>
                <th className="py-3 pr-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <p className="font-semibold">No users matching your search criteria</p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Try adjusting the search query or role filter
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.slice(0, 50).map((u) => {
                  const roleName = u.role?.name || 'CUSTOMER';
                  const kyc = u.kycStatus || 'PENDING';
                  return (
                    <tr
                      key={u.id}
                      className="group transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40"
                    >
                      <td className="py-3 pl-3 font-mono text-[11px] font-bold text-neutral-500">
                        #{u.id}
                      </td>
                      <td className="py-3 font-bold text-neutral-900 dark:text-white">
                        {u.fullName || 'User'}
                      </td>
                      <td className="py-3 font-medium text-neutral-600 dark:text-neutral-400">
                        <div>{String(u.mobile ?? '-')}</div>
                        <div className="text-[10px] text-neutral-500">{u.email || ''}</div>
                      </td>
                      <td className="py-3">
                        <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                          {roleName}
                        </span>
                      </td>
                      <td className="py-3">
                        {kyc === 'VERIFIED' ? (
                          <span className="inline-flex items-center rounded-full border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-400">
                            Verified
                          </span>
                        ) : kyc === 'REJECTED' ? (
                          <span className="inline-flex items-center rounded-full border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400">
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-medium text-[11px] text-neutral-500">
                            <span className="h-2 w-2 rounded-full bg-neutral-400" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-neutral-500 dark:text-neutral-400 font-medium">
                        {new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
