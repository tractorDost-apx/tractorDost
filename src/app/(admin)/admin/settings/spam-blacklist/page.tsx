'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  Phone,
  AlertTriangle,
  RefreshCw,
  X,
  Lock,
  Shield,
  Ban,
} from 'lucide-react';

interface BlacklistEntry {
  id: string;
  mobile: string;
  reason: string;
  blockType: 'FULL_BLOCK' | 'SHADOW_BAN';
  reportedBy: string;
  blockedAt: string;
}

const DEFAULT_BLACKLIST: BlacklistEntry[] = [
  {
    id: 'BLK-01',
    mobile: '9123456789',
    reason: 'Fraudulent tractor seller requesting advance token via Google Pay without machine inspection',
    blockType: 'FULL_BLOCK',
    reportedBy: 'Super Admin',
    blockedAt: '2026-10-22',
  },
  {
    id: 'BLK-02',
    mobile: '9811122233',
    reason: 'Automated telemarketing bot spamming lead callback forms',
    blockType: 'SHADOW_BAN',
    reportedBy: 'CRM System Filter',
    blockedAt: '2026-10-18',
  },
  {
    id: 'BLK-03',
    mobile: '9900011122',
    reason: 'Repeatedly uploaded stolen tractor RC book photos with forged engine numbers',
    blockType: 'FULL_BLOCK',
    reportedBy: 'Field Inspector Pune',
    blockedAt: '2026-10-15',
  },
];

export default function SpamBlacklistAdminPage() {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(DEFAULT_BLACKLIST);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'FULL_BLOCK' | 'SHADOW_BAN'>('ALL');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<BlacklistEntry | null>(null);

  const [formData, setFormData] = useState<{
    mobile: string;
    reason: string;
    blockType: 'FULL_BLOCK' | 'SHADOW_BAN';
  }>({
    mobile: '',
    reason: '',
    blockType: 'FULL_BLOCK',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) return;

    const newEntry: BlacklistEntry = {
      id: `BLK-${Date.now().toString().slice(-4)}`,
      mobile: cleanMobile,
      reason: formData.reason.trim(),
      blockType: formData.blockType,
      reportedBy: 'Admin Authority',
      blockedAt: new Date().toISOString().split('T')[0],
    };

    setBlacklist((prev) => [newEntry, ...prev]);
    setSuccessMsg(`Mobile +91 ${cleanMobile} added to security firewall blacklist.`);
    setIsAddModalOpen(false);
    setFormData({ mobile: '', reason: '', blockType: 'FULL_BLOCK' });
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDelete = () => {
    if (!deletingEntry) return;
    setBlacklist((prev) => prev.filter((b) => b.id !== deletingEntry.id));
    setSuccessMsg(`Mobile +91 ${deletingEntry.mobile} removed from blacklist.`);
    setDeletingEntry(null);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const filtered = useMemo(() => {
    return blacklist.filter((b) => {
      const matchesSearch =
        !search ||
        b.mobile.includes(search) ||
        b.reason.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === 'ALL' || b.blockType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [blacklist, search, typeFilter]);

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500 shadow-sm">
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Fraud & Spam Phone Blacklist
                </h1>
                <span className="rounded-lg bg-rose-500/10 px-2.5 py-0.5 text-xs font-black text-rose-500">
                  Firewall Guard
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Proactively block malicious phone numbers from posting scam listings, OTP abuses, or spamming leads.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Ban size={16} />
          <span>Add Number to Blacklist</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <p>{successMsg}</p>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Blocked Numbers
          </span>
          <div className="text-rose-400 mt-1 text-2xl font-black">{blacklist.length}</div>
          <span className="text-muted text-xs font-semibold">Banned Caller Records</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Hard Firewall Blocks
          </span>
          <div className="text-foreground mt-1 text-2xl font-black">
            {blacklist.filter((b) => b.blockType === 'FULL_BLOCK').length}
          </div>
          <span className="text-muted text-xs font-semibold">Immediate 403 Rejections</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Shadow Banned
          </span>
          <div className="text-amber-500 mt-1 text-2xl font-black">
            {blacklist.filter((b) => b.blockType === 'SHADOW_BAN').length}
          </div>
          <span className="text-muted text-xs font-semibold">Silent Telemarketing Drops</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Firewall Status
          </span>
          <div className="text-emerald-400 mt-1 text-2xl font-black">Active</div>
          <span className="text-muted text-xs font-semibold">Zero-Trust Shield On</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 10-digit mobile or fraud reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-semibold text-foreground placeholder:text-muted focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
          >
            <option value="ALL">All Block Types</option>
            <option value="FULL_BLOCK">Full Rejection (Hard Block)</option>
            <option value="SHADOW_BAN">Shadow Ban (Silent Discard)</option>
          </select>
        </div>
      </div>

      {/* Blacklist Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Blacklisted Mobile</th>
                <th className="px-5 py-4">Block Enforcement</th>
                <th className="px-5 py-4">Reason & Fraud Evidence</th>
                <th className="px-5 py-4">Reported By</th>
                <th className="px-5 py-4">Blocked Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="transition-colors hover:bg-foreground/[0.02]"
                >
                  <td className="px-5 py-4 font-mono">
                    <span className="text-foreground text-xs font-black inline-flex items-center gap-1.5">
                      <Phone size={12} className="text-rose-400" />
                      +91 {b.mobile}
                    </span>
                    <span className="text-muted text-[10px] block font-mono">
                      Ref: {b.id}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        b.blockType === 'FULL_BLOCK'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {b.blockType === 'FULL_BLOCK' ? 'Full Rejection' : 'Shadow Banned'}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-foreground text-xs font-medium max-w-sm line-clamp-2">
                      {b.reason}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-xs font-semibold text-muted">
                    {b.reportedBy}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {b.blockedAt}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setDeletingEntry(b)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/15"
                      title="Unblock / Remove Number"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/20 bg-background shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-2">
                <Ban size={18} className="text-rose-500" />
                <h3 className="text-foreground text-base font-black">
                  Add Number to Blacklist
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  10-Digit Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })
                  }
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 font-mono text-xs font-bold text-foreground focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Block Enforcement Mode
                </label>
                <select
                  value={formData.blockType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      blockType: e.target.value as 'FULL_BLOCK' | 'SHADOW_BAN',
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="FULL_BLOCK">Full Rejection (Cannot log in, submit leads or post)</option>
                  <option value="SHADOW_BAN">Shadow Ban (Submissions succeed visually, discarded in db)</option>
                </select>
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Reason / Scam Documentation
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Detail incident: Advance token fraud, fake RC, bot spamming..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-5 py-2 text-xs font-black text-white hover:bg-rose-600"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl animate-scale-up text-center">
            <h3 className="text-foreground text-lg font-black">
              Unblock Phone Number?
            </h3>
            <p className="text-muted text-xs font-medium mt-1 mb-6">
              Remove <strong className="text-foreground">+91 {deletingEntry.mobile}</strong> from the firewall blacklist? This number will be permitted to access services again.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
              >
                Keep Blocked
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-black text-white hover:bg-emerald-600"
              >
                Confirm Unblock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
