'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Calendar,
  User,
  Tractor,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  AlertCircle,
  Building2,
  X,
  Truck,
  Check,
} from 'lucide-react';

interface ServiceBooking {
  id: string;
  customerName: string;
  phone: string;
  tractorModel: string;
  serviceType: 'PERIODIC_MAINTENANCE' | 'ENGINE_OVERHAUL' | 'WARRANTY_CLAIM' | 'EMERGENCY_REPAIR';
  scheduledDate: string;
  pickupRequired: boolean;
  status: 'PENDING' | 'IN_WORKSHOP' | 'COMPLETED' | 'CANCELLED';
  estimatedCost: string;
  mechanicAssigned?: string;
}

const INITIAL_BOOKINGS: ServiceBooking[] = [
  {
    id: 'SRV-501',
    customerName: 'Prakash Patil',
    phone: '+91 98221 00112',
    tractorModel: 'Swaraj 855 FE',
    serviceType: 'PERIODIC_MAINTENANCE',
    scheduledDate: '2026-08-22',
    pickupRequired: true,
    status: 'PENDING',
    estimatedCost: '₹3,500',
    mechanicAssigned: 'Santosh Pawar',
  },
  {
    id: 'SRV-502',
    customerName: 'Mahesh Kulkarni',
    phone: '+91 97632 99881',
    tractorModel: 'Mahindra 275 DI',
    serviceType: 'ENGINE_OVERHAUL',
    scheduledDate: '2026-08-21',
    pickupRequired: false,
    status: 'IN_WORKSHOP',
    estimatedCost: '₹14,200',
    mechanicAssigned: 'Rajesh More',
  },
  {
    id: 'SRV-503',
    customerName: 'Balasaheb Thorat',
    phone: '+91 94220 55443',
    tractorModel: 'Eicher 551',
    serviceType: 'WARRANTY_CLAIM',
    scheduledDate: '2026-08-19',
    pickupRequired: true,
    status: 'COMPLETED',
    estimatedCost: '₹0 (Warranty)',
    mechanicAssigned: 'Santosh Pawar',
  },
  {
    id: 'SRV-504',
    customerName: 'Nitin Sawant',
    phone: '+91 98904 11223',
    tractorModel: 'John Deere 5105',
    serviceType: 'EMERGENCY_REPAIR',
    scheduledDate: '2026-08-18',
    pickupRequired: true,
    status: 'COMPLETED',
    estimatedCost: '₹5,800',
    mechanicAssigned: 'Rajesh More',
  },
];

export default function ServicesPage() {
  const [bookings, setBookings] = useState<ServiceBooking[]>(INITIAL_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Booking Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTractorModel, setNewTractorModel] = useState('');
  const [newServiceType, setNewServiceType] =
    useState<ServiceBooking['serviceType']>('PERIODIC_MAINTENANCE');
  const [newDate, setNewDate] = useState('');
  const [newPickup, setNewPickup] = useState(false);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      b.tractorModel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const inWorkshopCount = bookings.filter((b) => b.status === 'IN_WORKSHOP').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newPhone || !newTractorModel) return;

    const newBooking: ServiceBooking = {
      id: `SRV-${Math.floor(100 + Math.random() * 900)}`,
      customerName: newCustomerName,
      phone: newPhone,
      tractorModel: newTractorModel,
      serviceType: newServiceType,
      scheduledDate: newDate || new Date().toISOString().split('T')[0],
      pickupRequired: newPickup,
      status: 'PENDING',
      estimatedCost: '₹3,000 (Est.)',
      mechanicAssigned: 'Auto Assigned',
    };

    setBookings([newBooking, ...bookings]);
    setIsModalOpen(false);

    // Reset Form
    setNewCustomerName('');
    setNewPhone('');
    setNewTractorModel('');
    setNewDate('');
    setNewPickup(false);
  };

  const handleUpdateStatus = (bookingId: string, newStatus: ServiceBooking['status']) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));
  };

  const getStatusBadge = (status: ServiceBooking['status']) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending Audit',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'IN_WORKSHOP':
        return {
          label: 'In Workshop',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
      case 'COMPLETED':
        return {
          label: 'Completed & Delivered',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'CANCELLED':
        return { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Sleek Admin Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
            <Wrench size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Service & Workshop Management
              </h1>
              <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                3S Facility Active
              </span>
            </div>
            <p className="text-muted mt-0.5 text-xs font-bold sm:text-sm">
              Manage tractor maintenance requests, workshop bookings, and spare parts service logs.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 sm:self-auto"
        >
          <Plus size={18} className="stroke-[3]" /> Book Service Request
        </button>
      </div>

      {/* KPI Stat Strip Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-3 text-[var(--color-brand-green)]">
            <Wrench size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">
              {totalBookings}
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Total Bookings
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">{pendingCount}</div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Pending Service
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-500">
            <Tractor size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">
              {inWorkshopCount}
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">In Workshop</div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-500">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">
              {completedCount}
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">Delivered</div>
          </div>
        </div>
      </div>

      {/* Facility Operational Info Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="glass-panel space-y-3 rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-[var(--color-brand-green)] uppercase">
              <Building2 size={16} /> Dealership Service Center
            </h3>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-600 uppercase dark:text-emerald-400">
              Open (9 AM - 7 PM)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-1 text-xs">
            <div>
              <span className="text-muted block font-bold">Helpline Number</span>
              <span className="text-foreground font-mono font-bold">+91 98000 12345</span>
            </div>
            <div>
              <span className="text-muted block font-bold">Tractor Pickup Facility</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <Truck size={12} /> Available
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel space-y-3 rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-[var(--color-brand-green)] uppercase">
              <ShieldCheck size={16} /> OEM Spare Parts Availability
            </h3>
            <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-[10px] font-black text-[var(--color-brand-green)] uppercase">
              Certified Stock
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-1 text-xs">
            <div>
              <span className="text-muted block font-bold">Parts Inventory Rate</span>
              <span className="text-foreground font-bold">98.5% In Stock</span>
            </div>
            <div>
              <span className="text-muted block font-bold">Warranty Claims</span>
              <span className="font-bold text-[var(--color-brand-green)]">
                Fast-Track Processing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={18} className="text-muted absolute top-3 left-3.5" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or tractor model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] py-2 pr-4 pl-10 text-xs font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs">
            <Filter size={14} className="text-muted shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-foreground cursor-pointer bg-transparent font-bold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Audit</option>
              <option value="IN_WORKSHOP">In Workshop</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Service Bookings Table */}
      <div className="bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] p-4 sm:p-6">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-muted border-b border-[var(--border-subtle)] text-xs font-bold tracking-wider uppercase">
                <th className="px-4 py-3.5">Booking ID & Customer</th>
                <th className="px-4 py-3.5">Tractor Model</th>
                <th className="px-4 py-3.5">Service Type</th>
                <th className="px-4 py-3.5">Scheduled Date</th>
                <th className="px-4 py-3.5">Pickup</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm font-medium">
              {filteredBookings.map((b) => {
                const statusBadge = getStatusBadge(b.status);
                return (
                  <tr key={b.id} className="hover:bg-foreground/5 group transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 font-bold text-[var(--color-brand-green)]">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="text-foreground text-sm font-black tracking-tight">
                            {b.customerName}
                          </div>
                          <div className="text-muted mt-0.5 font-mono text-xs">
                            {b.id} • {b.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                        <Tractor size={14} className="shrink-0 text-[var(--color-brand-green)]" />
                        {b.tractorModel}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="bg-foreground/5 text-foreground/80 rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] font-black tracking-wider uppercase">
                        {b.serviceType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-muted flex items-center gap-1 font-mono text-xs">
                        <Calendar size={13} className="text-muted/70" />
                        {b.scheduledDate}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-bold ${b.pickupRequired ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}
                      >
                        {b.pickupRequired ? 'Yes (Pickup)' : 'Self Drive'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <select
                        value={b.status}
                        onChange={(e) => handleUpdateStatus(b.id, e.target.value as any)}
                        className="bg-foreground/5 text-foreground cursor-pointer rounded-xl border border-[var(--border-subtle)] px-2.5 py-1 text-xs font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_WORKSHOP">In Workshop</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
          {filteredBookings.map((b) => {
            const statusBadge = getStatusBadge(b.status);
            return (
              <div
                key={b.id}
                className="bg-foreground/5 space-y-3 rounded-2xl border border-[var(--border-subtle)] p-4 transition-all hover:border-[var(--color-brand-green)]/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-foreground text-sm leading-tight font-black">
                      {b.customerName}
                    </h4>
                    <p className="text-muted mt-0.5 font-mono text-xs">
                      {b.id} • {b.phone}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge.color}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 border-y border-[var(--border-subtle)] py-2 text-xs">
                  <div>
                    <span className="text-muted block text-[10px] font-bold uppercase">Model</span>
                    <span className="text-foreground font-bold">{b.tractorModel}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] font-bold uppercase">
                      Scheduled
                    </span>
                    <span className="text-foreground font-medium">{b.scheduledDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted text-xs">
                    Est. Cost:{' '}
                    <span className="font-bold text-[var(--color-brand-green)]">
                      {b.estimatedCost}
                    </span>
                  </span>

                  <select
                    value={b.status}
                    onChange={(e) => handleUpdateStatus(b.id, e.target.value as any)}
                    className="bg-foreground/5 text-foreground rounded-xl border border-[var(--border-subtle)] px-2 py-1 text-xs font-bold focus:outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_WORKSHOP">In Workshop</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Book Service Modal */}
      {isModalOpen && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/25 p-4 dark:bg-black/60">
          <div className="text-foreground relative my-8 flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl [backdrop-filter:none]">
            <div className="bg-foreground/5 flex items-center justify-between border-b border-[var(--border-subtle)] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
                  <Wrench size={22} />
                </div>
                <div>
                  <h3 className="text-foreground text-xl font-black tracking-tight">
                    Book New Service Request
                  </h3>
                  <p className="text-muted mt-0.5 text-xs font-medium">
                    Log maintenance booking for customer tractor.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 p-6 text-xs">
              <div className="space-y-1">
                <label className="text-muted block font-bold">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prakash Patil"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted block font-bold">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98220..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted block font-bold">Tractor Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swaraj 855 FE"
                    value={newTractorModel}
                    onChange={(e) => setNewTractorModel(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted block font-bold">Service Type</label>
                  <select
                    value={newServiceType}
                    onChange={(e) => setNewServiceType(e.target.value as any)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-sm font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                  >
                    <option value="PERIODIC_MAINTENANCE">Periodic Maintenance</option>
                    <option value="ENGINE_OVERHAUL">Engine Overhaul</option>
                    <option value="WARRANTY_CLAIM">Warranty Claim</option>
                    <option value="EMERGENCY_REPAIR">Emergency Repair</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted block font-bold">Scheduled Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-foreground/5 flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3">
                <div>
                  <div className="text-foreground font-bold">Pickup & Drop Required</div>
                  <div className="text-muted text-[11px]">Vehicle towing / doorstep pickup</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNewPickup(!newPickup)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                    newPickup
                      ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-foreground/10 text-muted border border-[var(--border-subtle)]'
                  }`}
                >
                  {newPickup ? 'Yes' : 'No'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl px-5 py-2.5 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
