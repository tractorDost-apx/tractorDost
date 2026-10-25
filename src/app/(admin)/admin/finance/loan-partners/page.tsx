'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Percent,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { loanAPI, LoanPartner } from '@/lib/api/loan';

export default function LoanPartnersAdminPage() {
  const [partners, setPartners] = useState<LoanPartner[]>(() => loanAPI.getLoanPartners());
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<LoanPartner | null>(null);

  const [formData, setFormData] = useState<LoanPartner>({
    id: '',
    name: '',
    logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=60',
    minRate: 9.5,
    maxRate: 13.0,
    maxTenureMonths: 60,
    maxFundingPct: 85,
    processingFeePct: 1.0,
    popularFor: 'Quick sanction for rural agricultural farmers',
  });

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartner) {
      setPartners((prev) =>
        prev.map((p) =>
          p.id === editingPartner.id
            ? {
                ...formData,
                id: editingPartner.id,
              }
            : p
        )
      );
      setSuccessMsg(`Bank partner "${formData.name}" updated successfully!`);
      setEditingPartner(null);
    } else {
      const newId = formData.name.toLowerCase().replace(/\s+/g, '-');
      const newPartner: LoanPartner = {
        ...formData,
        id: newId,
      };
      setPartners((prev) => [newPartner, ...prev]);
      setSuccessMsg(`Bank partner "${formData.name}" added to approved network!`);
      setIsAddModalOpen(false);
    }
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const openEdit = (p: LoanPartner) => {
    setEditingPartner(p);
    setFormData(p);
  };

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      return (
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.popularFor.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [partners, search]);

  const lowestRate = partners.length
    ? Math.min(...partners.map((p) => p.minRate))
    : 8.95;
  const maxFunding = partners.length
    ? Math.max(...partners.map((p) => p.maxFundingPct))
    : 90;

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-sm">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Loan Partner Financial Institutions
                </h1>
                <span className="rounded-lg bg-blue-500/10 px-2.5 py-0.5 text-xs font-black text-blue-400">
                  Banking Tie-ups
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Manage partner commercial banks, NBFCs, interest rate slabs, and loan processing guidelines.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingPartner(null);
            setFormData({
              id: '',
              name: '',
              logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=60',
              minRate: 9.5,
              maxRate: 13.0,
              maxTenureMonths: 60,
              maxFundingPct: 85,
              processingFeePct: 1.0,
              popularFor: 'Quick sanction for rural agricultural farmers',
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Add Lending Partner</span>
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
            Approved Partners
          </span>
          <div className="text-foreground mt-1 text-2xl font-black">{partners.length}</div>
          <span className="text-muted text-xs font-semibold">Banks & NBFCs</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Lowest Interest Rate
          </span>
          <div className="text-emerald-400 mt-1 text-2xl font-black">{lowestRate}% p.a.</div>
          <span className="text-muted text-xs font-semibold">Subsidized Agri Rate</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Max On-Road Funding
          </span>
          <div className="text-blue-400 mt-1 text-2xl font-black">{maxFunding}%</div>
          <span className="text-muted text-xs font-semibold">Zero Downpayment Plans</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Max Tenure
          </span>
          <div className="text-purple-400 mt-1 text-2xl font-black">7 Years (84 Mo)</div>
          <span className="text-muted text-xs font-semibold">Flexible Repayments</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bank name or financing scheme..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>
      </div>

      {/* Partners Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Financial Institution</th>
                <th className="px-5 py-4">Interest Rate Range</th>
                <th className="px-5 py-4">Max Tenure</th>
                <th className="px-5 py-4">Max Funding %</th>
                <th className="px-5 py-4">Processing Fee</th>
                <th className="px-5 py-4">Key Advantage</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredPartners.map((p) => (
                <tr
                  key={p.id}
                  className="transition-colors hover:bg-foreground/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white p-1 shadow-sm">
                        <img
                          src={p.logo}
                          alt={p.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-foreground text-xs font-black">
                          {p.name}
                        </span>
                        <span className="text-muted text-[10px] font-mono">
                          ID: {p.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono text-xs font-black text-emerald-400">
                    {p.minRate}% - {p.maxRate}% p.a.
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-foreground font-bold">
                    {p.maxTenureMonths} Months ({p.maxTenureMonths / 12} yrs)
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-blue-400 font-bold">
                    Up to {p.maxFundingPct}%
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {p.processingFeePct}% + GST
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-muted text-[11px] font-medium max-w-xs line-clamp-2">
                      {p.popularFor}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="text-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-foreground/5 hover:bg-foreground/10"
                      title="Edit Bank Terms"
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editingPartner) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-blue-400" />
                <h3 className="text-foreground text-base font-black">
                  {editingPartner ? 'Edit Loan Partner' : 'Add Financial Institution'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPartner(null);
                }}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="p-5 space-y-4">
              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Bank / NBFC Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bank of Baroda, IndusInd Bank"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Min Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={formData.minRate}
                    onChange={(e) =>
                      setFormData({ ...formData, minRate: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Max Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={formData.maxRate}
                    onChange={(e) =>
                      setFormData({ ...formData, maxRate: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Tenure (Mo)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.maxTenureMonths}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxTenureMonths: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Max Funding %
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.maxFundingPct}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxFundingPct: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Proc. Fee %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.processingFeePct}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        processingFeePct: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Popular Advantage / Scheme Highlights
                </label>
                <textarea
                  rows={2}
                  value={formData.popularFor}
                  onChange={(e) =>
                    setFormData({ ...formData, popularFor: e.target.value })
                  }
                  placeholder="Special highlights e.g. Zero processing fee for women farmers..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPartner(null);
                  }}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white hover:opacity-95"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
