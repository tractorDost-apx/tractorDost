'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  Phone,
  MapPin,
  Car,
  AlertCircle,
  RefreshCw,
  Building2,
  Check,
  X,
  Loader2,
  Navigation,
} from 'lucide-react';
import { dealerAPI } from '@/lib/api/dealers';
import { Dealer } from '@/types/models/dealer';
import { INDIAN_STATES } from '@/lib/constants/states-districts';

interface AdminShowroomItem {
  id: number;
  dealerId: number;
  dealerName: string;
  showroomName: string;
  brandName: string;
  address: string;
  state: string;
  district: string;
  phone: string;
  testDriveAvailable: boolean;
  parkingAvailable: boolean;
  totalArea: string;
  isActive: boolean;
}

export default function ShowroomsAdminPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [showrooms, setShowrooms] = useState<AdminShowroomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingShowroom, setEditingShowroom] = useState<AdminShowroomItem | null>(null);

  // Form
  const [formData, setFormData] = useState({
    dealerId: 0,
    showroomName: '',
    brandName: 'Mahindra',
    address: '',
    state: 'Maharashtra',
    district: 'Pune',
    phone: '',
    testDriveAvailable: true,
    parkingAvailable: true,
    totalArea: '4,500 sq.ft',
    isActive: true,
  });

  const loadData = async () => {
    try {
      setRefreshing(true);
      const res = await dealerAPI.getAllDealers({ limit: 100 });
      const dealerList: Dealer[] = res?.data?.data || res?.data?.dealers || [];
      setDealers(dealerList);

      // Map existing dealer data into comprehensive showroom records
      const showroomList: AdminShowroomItem[] = dealerList.map((d, index) => ({
        id: index + 1,
        dealerId: d.id,
        dealerName: d.businessName,
        showroomName: `${d.businessName} Flagship Showroom`,
        brandName: d.brands?.[0]?.brand?.name || 'Mahindra',
        address: `${d.address || 'Highway Road, MIDC Industrial Area'}`,
        state: d.state || 'Maharashtra',
        district: d.district || 'Pune',
        phone: d.phone || '9822123456',
        testDriveAvailable: true,
        parkingAvailable: true,
        totalArea: `${3500 + index * 500} sq.ft`,
        isActive: d.isActive !== false,
      }));

      setShowrooms(showroomList);
      if (dealerList.length > 0 && formData.dealerId === 0) {
        setFormData((prev) => ({ ...prev, dealerId: dealerList[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load showrooms:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = (id: number) => {
    setShowrooms((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    setSuccessMsg('Showroom status updated successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveShowroom = (e: React.FormEvent) => {
    e.preventDefault();
    const dealer = dealers.find((d) => d.id === Number(formData.dealerId));

    if (editingShowroom) {
      setShowrooms((prev) =>
        prev.map((s) =>
          s.id === editingShowroom.id
            ? {
                ...s,
                showroomName: formData.showroomName,
                brandName: formData.brandName,
                address: formData.address,
                state: formData.state,
                district: formData.district,
                phone: formData.phone,
                testDriveAvailable: formData.testDriveAvailable,
                parkingAvailable: formData.parkingAvailable,
                totalArea: formData.totalArea,
                isActive: formData.isActive,
              }
            : s
        )
      );
      setSuccessMsg('Showroom details updated successfully!');
      setEditingShowroom(null);
    } else {
      const newItem: AdminShowroomItem = {
        id: Date.now(),
        dealerId: Number(formData.dealerId),
        dealerName: dealer?.businessName || 'Dealership Network',
        showroomName: formData.showroomName,
        brandName: formData.brandName,
        address: formData.address,
        state: formData.state,
        district: formData.district,
        phone: formData.phone,
        testDriveAvailable: formData.testDriveAvailable,
        parkingAvailable: formData.parkingAvailable,
        totalArea: formData.totalArea,
        isActive: formData.isActive,
      };
      setShowrooms((prev) => [newItem, ...prev]);
      setSuccessMsg('New showroom added to network!');
      setIsAddModalOpen(false);
    }
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const openEdit = (s: AdminShowroomItem) => {
    setEditingShowroom(s);
    setFormData({
      dealerId: s.dealerId,
      showroomName: s.showroomName,
      brandName: s.brandName,
      address: s.address,
      state: s.state,
      district: s.district,
      phone: s.phone,
      testDriveAvailable: s.testDriveAvailable,
      parkingAvailable: s.parkingAvailable,
      totalArea: s.totalArea,
      isActive: s.isActive,
    });
  };

  const filteredShowrooms = useMemo(() => {
    return showrooms.filter((s) => {
      const matchesSearch =
        !search ||
        s.showroomName.toLowerCase().includes(search.toLowerCase()) ||
        s.dealerName.toLowerCase().includes(search.toLowerCase()) ||
        s.brandName.toLowerCase().includes(search.toLowerCase()) ||
        s.district.toLowerCase().includes(search.toLowerCase());

      const matchesState = stateFilter === 'ALL' || s.state === stateFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && s.isActive) ||
        (statusFilter === 'INACTIVE' && !s.isActive);

      return matchesSearch && matchesState && matchesStatus;
    });
  }, [showrooms, search, stateFilter, statusFilter]);

  // KPIs
  const totalCount = showrooms.length;
  const activeCount = showrooms.filter((s) => s.isActive).length;
  const testDriveCount = showrooms.filter((s) => s.testDriveAvailable).length;
  const statesCovered = new Set(showrooms.map((s) => s.state)).size;

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 shadow-sm">
              <Store size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Dealer Showrooms Directory
                </h1>
                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black text-emerald-500">
                  Network Outlets
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Manage authorized brand tractor dealerships, flagship display centers, and test drive yards.
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
              setEditingShowroom(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Add Showroom</span>
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
            Total Showrooms
          </span>
          <div className="text-foreground mt-1 text-2xl font-black">{totalCount}</div>
          <span className="text-muted text-xs font-semibold">Active Dealership Outlets</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Live Display Yards
          </span>
          <div className="text-emerald-400 mt-1 text-2xl font-black">{activeCount}</div>
          <span className="text-muted text-xs font-semibold">Open for Farmers</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Test Drive Ready
          </span>
          <div className="text-blue-400 mt-1 text-2xl font-black">{testDriveCount}</div>
          <span className="text-muted text-xs font-semibold">Tractor Demo Tracks</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            State Coverage
          </span>
          <div className="text-purple-400 mt-1 text-2xl font-black">{statesCovered}</div>
          <span className="text-muted text-xs font-semibold">Indian States Reached</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search showroom name, brand, or district..."
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
            <option value="ACTIVE">Active Showrooms</option>
            <option value="INACTIVE">Inactive Outlets</option>
          </select>
        </div>
      </div>

      {/* Showrooms Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Showroom & Dealership</th>
                <th className="px-5 py-4">Brand</th>
                <th className="px-5 py-4">Address & Location</th>
                <th className="px-5 py-4">Facility Features</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-500" />
                    <span>Loading showrooms...</span>
                  </td>
                </tr>
              ) : filteredShowrooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    No showrooms found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredShowrooms.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-foreground/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-foreground text-xs font-black">
                          {s.showroomName}
                        </span>
                        <span className="text-[10px] text-muted font-semibold">
                          Managed by: {s.dealerName}
                        </span>
                        <a
                          href={`tel:${s.phone}`}
                          className="font-mono text-[11px] text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <Phone size={10} />
                          +91 {s.phone}
                        </a>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-black text-amber-500 uppercase">
                        {s.brandName}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col max-w-xs text-xs font-medium text-foreground">
                        <span className="line-clamp-1">{s.address}</span>
                        <span className="text-muted text-[11px] font-semibold">
                          {s.district}, {s.state}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {s.testDriveAvailable && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                            <Car size={10} /> Test Drive
                          </span>
                        )}
                        <span className="inline-flex items-center rounded-md bg-foreground/5 px-2 py-0.5 text-[10px] font-bold text-muted">
                          {s.totalArea}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(s.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase transition-all ${
                          s.isActive
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            s.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {s.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="text-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-foreground/5 hover:bg-foreground/10"
                        title="Edit Showroom"
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

      {/* ADD / EDIT SHOWROOM MODAL */}
      {(isAddModalOpen || editingShowroom) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-2">
                <Store size={18} className="text-emerald-500" />
                <h3 className="text-foreground text-base font-black">
                  {editingShowroom ? 'Edit Showroom' : 'Add Brand Showroom'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingShowroom(null);
                }}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveShowroom} className="p-5 space-y-4">
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
                    Showroom Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.showroomName}
                    onChange={(e) =>
                      setFormData({ ...formData, showroomName: e.target.value })
                    }
                    placeholder="e.g. Kisan Tractors Hub"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Primary Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brandName}
                    onChange={(e) =>
                      setFormData({ ...formData, brandName: e.target.value })
                    }
                    placeholder="e.g. Mahindra, Swaraj"
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

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Full Street Address
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Contact Phone
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
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Showroom Floor Area
                  </label>
                  <input
                    type="text"
                    value={formData.totalArea}
                    onChange={(e) =>
                      setFormData({ ...formData, totalArea: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.testDriveAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        testDriveAvailable: e.target.checked,
                      })
                    }
                    className="rounded text-[var(--color-brand-green)]"
                  />
                  Test Drive Track Available
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
                  Active Outlet
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingShowroom(null);
                  }}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white hover:opacity-95"
                >
                  Save Showroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
