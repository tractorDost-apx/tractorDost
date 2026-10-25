'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  Phone,
  Truck,
  AlertCircle,
  RefreshCw,
  Building2,
  Check,
  X,
  Loader2,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { dealerAPI } from '@/lib/api/dealers';
import { Dealer } from '@/types/models/dealer';
import { INDIAN_STATES } from '@/lib/constants/states-districts';

interface AdminServiceCenterItem {
  id: number;
  dealerId: number;
  dealerName: string;
  centerName: string;
  brandName: string;
  address: string;
  state: string;
  district: string;
  phone: string;
  totalBays: number;
  mobileVanAvailable: boolean;
  breakdownAssistance: boolean;
  workingHours: string;
  isActive: boolean;
}

export default function ServiceCentersAdminPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [centers, setCenters] = useState<AdminServiceCenterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<AdminServiceCenterItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    dealerId: 0,
    centerName: '',
    brandName: 'Mahindra',
    address: '',
    state: 'Maharashtra',
    district: 'Pune',
    phone: '',
    totalBays: 4,
    mobileVanAvailable: true,
    breakdownAssistance: true,
    workingHours: '09:00 AM - 07:00 PM',
    isActive: true,
  });

  const loadData = async () => {
    try {
      setRefreshing(true);
      const res = await dealerAPI.getAllDealers({ limit: 100 });
      const dealerList: Dealer[] = res?.data?.data || res?.data?.dealers || [];
      setDealers(dealerList);

      const centerList: AdminServiceCenterItem[] = dealerList.map((d, index) => ({
        id: index + 1,
        dealerId: d.id,
        dealerName: d.businessName,
        centerName: `${d.businessName} Authorized Service Hub`,
        brandName: d.brands?.[0]?.brand?.name || 'Mahindra',
        address: `${d.address || 'Workshop Sector, Industrial Estate'}`,
        state: d.state || 'Maharashtra',
        district: d.district || 'Pune',
        phone: d.phone || '9822987654',
        totalBays: 3 + (index % 4),
        mobileVanAvailable: index % 2 === 0,
        breakdownAssistance: true,
        workingHours: '09:00 AM - 07:00 PM (Mon-Sat)',
        isActive: d.isActive !== false,
      }));

      setCenters(centerList);
      if (dealerList.length > 0 && formData.dealerId === 0) {
        setFormData((prev) => ({ ...prev, dealerId: dealerList[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load service centers:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = (id: number) => {
    setCenters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
    setSuccessMsg('Service center status updated.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveCenter = (e: React.FormEvent) => {
    e.preventDefault();
    const dealer = dealers.find((d) => d.id === Number(formData.dealerId));

    if (editingCenter) {
      setCenters((prev) =>
        prev.map((c) =>
          c.id === editingCenter.id
            ? {
                ...c,
                centerName: formData.centerName,
                brandName: formData.brandName,
                address: formData.address,
                state: formData.state,
                district: formData.district,
                phone: formData.phone,
                totalBays: Number(formData.totalBays),
                mobileVanAvailable: formData.mobileVanAvailable,
                breakdownAssistance: formData.breakdownAssistance,
                workingHours: formData.workingHours,
                isActive: formData.isActive,
              }
            : c
        )
      );
      setSuccessMsg('Service workshop details saved successfully!');
      setEditingCenter(null);
    } else {
      const newItem: AdminServiceCenterItem = {
        id: Date.now(),
        dealerId: Number(formData.dealerId),
        dealerName: dealer?.businessName || 'Dealership Network',
        centerName: formData.centerName,
        brandName: formData.brandName,
        address: formData.address,
        state: formData.state,
        district: formData.district,
        phone: formData.phone,
        totalBays: Number(formData.totalBays),
        mobileVanAvailable: formData.mobileVanAvailable,
        breakdownAssistance: formData.breakdownAssistance,
        workingHours: formData.workingHours,
        isActive: formData.isActive,
      };
      setCenters((prev) => [newItem, ...prev]);
      setSuccessMsg('New service center added to network!');
      setIsAddModalOpen(false);
    }
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const openEdit = (c: AdminServiceCenterItem) => {
    setEditingCenter(c);
    setFormData({
      dealerId: c.dealerId,
      centerName: c.centerName,
      brandName: c.brandName,
      address: c.address,
      state: c.state,
      district: c.district,
      phone: c.phone,
      totalBays: c.totalBays,
      mobileVanAvailable: c.mobileVanAvailable,
      breakdownAssistance: c.breakdownAssistance,
      workingHours: c.workingHours,
      isActive: c.isActive,
    });
  };

  const filteredCenters = useMemo(() => {
    return centers.filter((c) => {
      const matchesSearch =
        !search ||
        c.centerName.toLowerCase().includes(search.toLowerCase()) ||
        c.dealerName.toLowerCase().includes(search.toLowerCase()) ||
        c.brandName.toLowerCase().includes(search.toLowerCase()) ||
        c.district.toLowerCase().includes(search.toLowerCase());

      const matchesState = stateFilter === 'ALL' || c.state === stateFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && c.isActive) ||
        (statusFilter === 'INACTIVE' && !c.isActive);

      return matchesSearch && matchesState && matchesStatus;
    });
  }, [centers, search, stateFilter, statusFilter]);

  // KPIs
  const totalCount = centers.length;
  const activeCount = centers.filter((c) => c.isActive).length;
  const totalBays = centers.reduce((acc, c) => acc + c.totalBays, 0);
  const mobileVanCount = centers.filter((c) => c.mobileVanAvailable).length;

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-sm">
              <Wrench size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Service Centers & Workshops
                </h1>
                <span className="rounded-lg bg-blue-500/10 px-2.5 py-0.5 text-xs font-black text-blue-400">
                  Maintenance Network
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Oversee authorized OEM service bays, mobile breakdown repair vans, and warranty facilities.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            className="text-muted hover:text-foreground flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold transition-all hover:bg-foreground/10"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingCenter(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Add Service Center</span>
          </button>
        </div>
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
            Authorized Centers
          </span>
          <div className="text-foreground mt-1 text-2xl font-black">{totalCount}</div>
          <span className="text-muted text-xs font-semibold">Active Dealership Hubs</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Operational Bays
          </span>
          <div className="text-blue-400 mt-1 text-2xl font-black">{totalBays}</div>
          <span className="text-muted text-xs font-semibold">Simultaneous Ramps</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Mobile Vans Active
          </span>
          <div className="text-emerald-400 mt-1 text-2xl font-black">{mobileVanCount}</div>
          <span className="text-muted text-xs font-semibold">Farm Doorstep Units</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Live Facilities
          </span>
          <div className="text-purple-400 mt-1 text-2xl font-black">{activeCount}</div>
          <span className="text-muted text-xs font-semibold">Ready for Appointments</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service center name, brand, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="ALL">All Indian States</option>
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Centers</option>
            <option value="INACTIVE">Inactive Centers</option>
          </select>
        </div>
      </div>

      {/* Centers Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Service Center & Workshop</th>
                <th className="px-5 py-4">Brand</th>
                <th className="px-5 py-4">Workshop Capacity</th>
                <th className="px-5 py-4">Doorstep & Breakdown</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-400" />
                    <span>Loading service centers...</span>
                  </td>
                </tr>
              ) : filteredCenters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    No service centers found matching search filters.
                  </td>
                </tr>
              ) : (
                filteredCenters.map((c) => (
                  <tr
                    key={c.id}
                    className="transition-colors hover:bg-foreground/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-foreground text-xs font-black">
                          {c.centerName}
                        </span>
                        <span className="text-[10px] text-muted font-semibold">
                          Dealership: {c.dealerName}
                        </span>
                        <a
                          href={`tel:${c.phone}`}
                          className="font-mono text-[11px] text-blue-400 font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <Phone size={10} />
                          +91 {c.phone}
                        </a>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-black text-blue-400 uppercase">
                        {c.brandName}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-foreground text-xs font-black">
                          {c.totalBays} Ramps / Bays
                        </span>
                        <span className="text-[10px] text-muted font-medium flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> {c.workingHours}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {c.mobileVanAvailable && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                            <Truck size={10} /> Mobile Van
                          </span>
                        )}
                        {c.breakdownAssistance && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/20">
                            <ShieldCheck size={10} /> 24x7 Breakdown
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase transition-all ${
                          c.isActive
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            c.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="text-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-foreground/5 hover:bg-foreground/10"
                        title="Edit Workshop"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT WORKSHOP MODAL */}
      {(isAddModalOpen || editingCenter) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-2">
                <Wrench size={18} className="text-blue-400" />
                <h3 className="text-foreground text-base font-black">
                  {editingCenter ? 'Edit Workshop Details' : 'Add Service Center'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCenter(null);
                }}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCenter} className="p-5 space-y-4">
              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Parent Dealership
                </label>
                <select
                  required
                  value={formData.dealerId}
                  onChange={(e) =>
                    setFormData({ ...formData, dealerId: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                >
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.businessName} ({d.district}, {d.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Center Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.centerName}
                    onChange={(e) =>
                      setFormData({ ...formData, centerName: e.target.value })
                    }
                    placeholder="e.g. Kisan Authorized Service Bay"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brandName}
                    onChange={(e) =>
                      setFormData({ ...formData, brandName: e.target.value })
                    }
                    placeholder="e.g. Mahindra"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Total Bays
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalBays}
                    onChange={(e) =>
                      setFormData({ ...formData, totalBays: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Contact Helpline
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mobileVanAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mobileVanAvailable: e.target.checked,
                      })
                    }
                    className="rounded text-[var(--color-brand-green)]"
                  />
                  Mobile Service Van On-Site
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.breakdownAssistance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        breakdownAssistance: e.target.checked,
                      })
                    }
                    className="rounded text-[var(--color-brand-green)]"
                  />
                  24x7 Breakdown Rescue
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCenter(null);
                  }}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white hover:opacity-95"
                >
                  Save Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
