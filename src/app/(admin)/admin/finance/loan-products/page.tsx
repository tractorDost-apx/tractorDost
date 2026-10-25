'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Percent,
  Coins,
  ShieldCheck,
  RefreshCw,
  X,
  FileCheck2,
} from 'lucide-react';

interface LoanProductScheme {
  id: number;
  productName: string;
  category: 'NEW_TRACTOR' | 'USED_TRACTOR' | 'REFINANCE' | 'IMPLEMENTS' | 'SUBSIDY_SCHEME';
  minAmount: number;
  maxAmount: number;
  marginMoneyPct: number;
  typicalRatePct: number;
  maxTenureMonths: number;
  subsidyEligible: boolean;
  description: string;
  isActive: boolean;
}

const CATEGORY_META = {
  NEW_TRACTOR: { label: 'New Tractor Loan', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  USED_TRACTOR: { label: 'Used Tractor Loan', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
  REFINANCE: { label: 'Refinance / Equity', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
  IMPLEMENTS: { label: 'Farm Implements', color: 'border-amber-500/30 bg-amber-500/10 text-amber-500' },
  SUBSIDY_SCHEME: { label: 'Govt Subsidy Scheme', color: 'border-rose-500/30 bg-rose-500/10 text-rose-400' },
};

const DEFAULT_PRODUCTS: LoanProductScheme[] = [
  {
    id: 1,
    productName: 'Kisan Prime New Tractor Finance',
    category: 'NEW_TRACTOR',
    minAmount: 200000,
    maxAmount: 1500000,
    marginMoneyPct: 10,
    typicalRatePct: 9.25,
    maxTenureMonths: 84,
    subsidyEligible: true,
    description: 'Up to 90% funding on ex-showroom price for brand new tractors across all certified dealers.',
    isActive: true,
  },
  {
    id: 2,
    productName: 'Certified Pre-Owned Tractor Loan',
    category: 'USED_TRACTOR',
    minAmount: 100000,
    maxAmount: 800000,
    marginMoneyPct: 20,
    typicalRatePct: 11.5,
    maxTenureMonths: 60,
    subsidyEligible: false,
    description: 'Low-paperwork funding for pre-owned tractors under 10 years of age with physical valuation.',
    isActive: true,
  },
  {
    id: 3,
    productName: 'PM-Kisan Tractor Krishi Subsidy Scheme',
    category: 'SUBSIDY_SCHEME',
    minAmount: 150000,
    maxAmount: 1000000,
    marginMoneyPct: 15,
    typicalRatePct: 8.95,
    maxTenureMonths: 84,
    subsidyEligible: true,
    description: 'Direct DBT subsidy credit of up to ₹2.5 Lakhs for small, marginal, and women farmers.',
    isActive: true,
  },
  {
    id: 4,
    productName: 'Tractor Dost Instant Refinance',
    category: 'REFINANCE',
    minAmount: 100000,
    maxAmount: 600000,
    marginMoneyPct: 0,
    typicalRatePct: 12.0,
    maxTenureMonths: 48,
    subsidyEligible: false,
    description: 'Instant liquidity against clear tractor RC book title for farm crop working capital.',
    isActive: true,
  },
  {
    id: 5,
    productName: 'Rotavator & Harvester Equipment Loan',
    category: 'IMPLEMENTS',
    minAmount: 50000,
    maxAmount: 2500000,
    marginMoneyPct: 15,
    typicalRatePct: 10.5,
    maxTenureMonths: 60,
    subsidyEligible: true,
    description: 'Equipment term loans for laser levelers, combine harvesters, and balers with SMAM subsidy.',
    isActive: true,
  },
];

export default function LoanProductsAdminPage() {
  const [products, setProducts] = useState<LoanProductScheme[]>(DEFAULT_PRODUCTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProductScheme | null>(null);

  const [formData, setFormData] = useState<LoanProductScheme>({
    id: 0,
    productName: '',
    category: 'NEW_TRACTOR',
    minAmount: 200000,
    maxAmount: 1500000,
    marginMoneyPct: 15,
    typicalRatePct: 9.5,
    maxTenureMonths: 60,
    subsidyEligible: true,
    description: '',
    isActive: true,
  });

  const handleToggleActive = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
    setSuccessMsg('Product scheme status updated.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...formData,
                id: editingProduct.id,
              }
            : p
        )
      );
      setSuccessMsg(`Loan scheme "${formData.productName}" updated successfully!`);
      setEditingProduct(null);
    } else {
      const newProduct: LoanProductScheme = {
        ...formData,
        id: Date.now(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      setSuccessMsg(`Loan scheme "${formData.productName}" added!`);
      setIsAddModalOpen(false);
    }
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const openEdit = (p: LoanProductScheme) => {
    setEditingProduct(p);
    setFormData(p);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.productName.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [products, search, categoryFilter]);

  // KPIs
  const totalCount = products.length;
  const subsidyLinked = products.filter((p) => p.subsidyEligible).length;
  const activeCount = products.filter((p) => p.isActive).length;
  const avgMargin = Math.round(
    products.reduce((acc, p) => acc + p.marginMoneyPct, 0) / (products.length || 1)
  );

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-sm">
              <CreditCard size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Loan Products & Schemes
                </h1>
                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black text-emerald-500">
                  Credit Catalog
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Configure agri equipment loan products, margin money requirements, and government subsidy tie-ups.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              id: 0,
              productName: '',
              category: 'NEW_TRACTOR',
              minAmount: 200000,
              maxAmount: 1500000,
              marginMoneyPct: 15,
              typicalRatePct: 9.5,
              maxTenureMonths: 60,
              subsidyEligible: true,
              description: '',
              isActive: true,
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Add Loan Scheme</span>
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
            Total Schemes
          </span>
          <div className="text-foreground mt-1 text-2xl font-black">{totalCount}</div>
          <span className="text-muted text-xs font-semibold">Configured Products</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Subsidy Linked
          </span>
          <div className="text-emerald-400 mt-1 text-2xl font-black">{subsidyLinked}</div>
          <span className="text-muted text-xs font-semibold">DBT Supported Schemes</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Avg Margin Required
          </span>
          <div className="text-blue-400 mt-1 text-2xl font-black">{avgMargin}%</div>
          <span className="text-muted text-xs font-semibold">Farmer Downpayment</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Active Catalog
          </span>
          <div className="text-purple-400 mt-1 text-2xl font-black">{activeCount}</div>
          <span className="text-muted text-xs font-semibold">Live in EMI Calculator</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scheme name, features, or subsidy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="ALL">All Credit Categories</option>
            <option value="NEW_TRACTOR">New Tractor</option>
            <option value="USED_TRACTOR">Used Tractor</option>
            <option value="SUBSIDY_SCHEME">Subsidy Scheme</option>
            <option value="REFINANCE">Refinance / Equity</option>
            <option value="IMPLEMENTS">Farm Implements</option>
          </select>
        </div>
      </div>

      {/* Schemes Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Loan Scheme & Category</th>
                <th className="px-5 py-4">Amount Range</th>
                <th className="px-5 py-4">Downpayment</th>
                <th className="px-5 py-4">Interest Rate</th>
                <th className="px-5 py-4">Max Tenure</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredProducts.map((p) => {
                const meta = CATEGORY_META[p.category];

                return (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-foreground/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-xs font-black">
                            {p.productName}
                          </span>
                          {p.subsidyEligible && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck size={9} /> Subsidy
                            </span>
                          )}
                        </div>
                        <span className="text-muted text-[11px] font-medium line-clamp-1 mt-0.5">
                          {p.description}
                        </span>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-black uppercase ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs font-bold text-foreground">
                      ₹{(p.minAmount / 100000).toFixed(1)}L - ₹{(p.maxAmount / 100000).toFixed(1)}L
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-blue-400 font-bold">
                      {p.marginMoneyPct}% Margin
                    </td>

                    <td className="px-5 py-4 font-mono text-xs font-black text-emerald-400">
                      ~{p.typicalRatePct}% p.a.
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-muted">
                      {p.maxTenureMonths} Months
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase transition-all ${
                          p.isActive
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {p.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="text-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-foreground/5 hover:bg-foreground/10"
                        title="Edit Scheme Terms"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-400" />
                <h3 className="text-foreground text-base font-black">
                  {editingProduct ? 'Edit Loan Scheme' : 'Add Loan Product Scheme'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Product Scheme Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g. Kisan Smart Tractor Loan"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as any })
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="NEW_TRACTOR">New Tractor</option>
                  <option value="USED_TRACTOR">Used Tractor</option>
                  <option value="SUBSIDY_SCHEME">Govt Subsidy Scheme</option>
                  <option value="REFINANCE">Refinance / Equity</option>
                  <option value="IMPLEMENTS">Farm Implements</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Min Loan (₹)
                  </label>
                  <input
                    type="number"
                    min="10000"
                    required
                    value={formData.minAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minAmount: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Max Loan (₹)
                  </label>
                  <input
                    type="number"
                    min="50000"
                    required
                    value={formData.maxAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxAmount: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Margin %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.marginMoneyPct}
                    onChange={(e) =>
                      setFormData({ ...formData, marginMoneyPct: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Rate % p.a.
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.typicalRatePct}
                    onChange={(e) =>
                      setFormData({ ...formData, typicalRatePct: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Tenure (Mo)
                  </label>
                  <input
                    type="number"
                    value={formData.maxTenureMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, maxTenureMonths: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Scheme Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Terms, eligibility criteria, subsidy DBT link details..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subsidyEligible}
                    onChange={(e) =>
                      setFormData({ ...formData, subsidyEligible: e.target.checked })
                    }
                    className="rounded text-[var(--color-brand-green)]"
                  />
                  Govt DBT Subsidy Eligible
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded text-[var(--color-brand-green)]"
                  />
                  Active in Calculator
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white hover:opacity-95"
                >
                  Save Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
