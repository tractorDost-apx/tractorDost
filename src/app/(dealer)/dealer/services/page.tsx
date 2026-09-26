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
  const [newServiceType, setNewServiceType] = useState<ServiceBooking['serviceType']>('PERIODIC_MAINTENANCE');
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
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  const getStatusBadge = (status: ServiceBooking['status']) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending Audit', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'IN_WORKSHOP':
        return { label: 'In Workshop', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'COMPLETED':
        return { label: 'Completed & Delivered', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'CANCELLED':
        return { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Sleek Admin Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 shrink-0">
            <Wrench size={26} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Service & Workshop Management
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 uppercase tracking-wider">
                3S Facility Active
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-muted mt-0.5">
              Manage tractor maintenance requests, workshop bookings, and spare parts service logs.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[var(--color-brand-green)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus size={18} className="stroke-[3]" /> Book Service Request
        </button>
      </div>

      {/* KPI Stat Strip Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shrink-0 border border-[var(--color-brand-green)]/20">
            <Wrench size={22} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{totalBookings}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Total Bookings</div>
          </div>
        </div>

        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 border border-amber-500/20">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{pendingCount}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Pending Service</div>
          </div>
        </div>

        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0 border border-blue-500/20">
            <Tractor size={22} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{inWorkshopCount}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">In Workshop</div>
          </div>
        </div>

        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0 border border-emerald-500/20">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{completedCount}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Delivered</div>
          </div>
        </div>
      </div>

      {/* Facility Operational Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-[var(--color-brand-green)] tracking-wider flex items-center gap-2">
              <Building2 size={16} /> Dealership Service Center
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Open (9 AM - 7 PM)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-[var(--border-subtle)]">
            <div>
              <span className="text-muted block font-bold">Helpline Number</span>
              <span className="font-mono text-foreground font-bold">+91 98000 12345</span>
            </div>
            <div>
              <span className="text-muted block font-bold">Tractor Pickup Facility</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Truck size={12} /> Available
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-[var(--color-brand-green)] tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} /> OEM Spare Parts Availability
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
              Certified Stock
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-[var(--border-subtle)]">
            <div>
              <span className="text-muted block font-bold">Parts Inventory Rate</span>
              <span className="text-foreground font-bold">98.5% In Stock</span>
            </div>
            <div>
              <span className="text-muted block font-bold">Warranty Claims</span>
              <span className="text-[var(--color-brand-green)] font-bold">Fast-Track Processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or tractor model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-[var(--color-brand-green)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs">
            <Filter size={14} className="text-muted shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer"
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
      <div className="bg-foreground/5 p-4 sm:p-6 rounded-3xl border border-[var(--border-subtle)]">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-xs font-bold text-muted uppercase tracking-wider">
                <th className="py-3.5 px-4">Booking ID & Customer</th>
                <th className="py-3.5 px-4">Tractor Model</th>
                <th className="py-3.5 px-4">Service Type</th>
                <th className="py-3.5 px-4">Scheduled Date</th>
                <th className="py-3.5 px-4">Pickup</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm font-medium">
              {filteredBookings.map((b) => {
                const statusBadge = getStatusBadge(b.status);
                return (
                  <tr key={b.id} className="hover:bg-foreground/5 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 flex items-center justify-center font-bold shrink-0">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="font-black text-foreground text-sm tracking-tight">
                            {b.customerName}
                          </div>
                          <div className="text-xs text-muted font-mono mt-0.5">
                            {b.id} • {b.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <Tractor size={14} className="text-[var(--color-brand-green)] shrink-0" />
                        {b.tractorModel}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-foreground/5 text-foreground/80 border border-[var(--border-subtle)]">
                        {b.serviceType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs text-muted font-mono flex items-center gap-1">
                        <Calendar size={13} className="text-muted/70" />
                        {b.scheduledDate}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`text-xs font-bold ${b.pickupRequired ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
                        {b.pickupRequired ? 'Yes (Pickup)' : 'Self Drive'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <select
                        value={b.status}
                        onChange={(e) => handleUpdateStatus(b.id, e.target.value as any)}
                        className="bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-2.5 py-1 text-xs font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)] cursor-pointer"
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
        <div className="md:hidden space-y-4">
          {filteredBookings.map((b) => {
            const statusBadge = getStatusBadge(b.status);
            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 space-y-3 hover:border-[var(--color-brand-green)]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-black text-foreground text-sm leading-tight">
                      {b.customerName}
                    </h4>
                    <p className="text-xs text-muted font-mono mt-0.5">{b.id} • {b.phone}</p>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y border-[var(--border-subtle)] py-2">
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold">Model</span>
                    <span className="font-bold text-foreground">{b.tractorModel}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold">Scheduled</span>
                    <span className="font-medium text-foreground">{b.scheduledDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted">Est. Cost: <span className="font-bold text-[var(--color-brand-green)]">{b.estimatedCost}</span></span>

                  <select
                    value={b.status}
                    onChange={(e) => handleUpdateStatus(b.id, e.target.value as any)}
                    className="bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-2 py-1 text-xs font-bold text-foreground focus:outline-none"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/25 dark:bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--background)] text-foreground border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 relative [backdrop-filter:none]">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-foreground/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
                  <Wrench size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Book New Service Request
                  </h3>
                  <p className="text-xs font-medium text-muted mt-0.5">
                    Log maintenance booking for customer tractor.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted block">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prakash Patil"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-foreground text-sm font-medium focus:outline-none focus:border-[var(--color-brand-green)] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted block">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98220..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-foreground text-sm font-medium focus:outline-none focus:border-[var(--color-brand-green)] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted block">Tractor Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swaraj 855 FE"
                    value={newTractorModel}
                    onChange={(e) => setNewTractorModel(e.target.value)}
                    className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-foreground text-sm font-medium focus:outline-none focus:border-[var(--color-brand-green)] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted block">Service Type</label>
                  <select
                    value={newServiceType}
                    onChange={(e) => setNewServiceType(e.target.value as any)}
                    className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-foreground text-sm font-bold focus:outline-none focus:border-[var(--color-brand-green)]"
                  >
                    <option value="PERIODIC_MAINTENANCE">Periodic Maintenance</option>
                    <option value="ENGINE_OVERHAUL">Engine Overhaul</option>
                    <option value="WARRANTY_CLAIM">Warranty Claim</option>
                    <option value="EMERGENCY_REPAIR">Emergency Repair</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted block">Scheduled Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-foreground text-sm font-medium focus:outline-none focus:border-[var(--color-brand-green)]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-foreground/5 border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">Pickup & Drop Required</div>
                  <div className="text-[11px] text-muted">Vehicle towing / doorstep pickup</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNewPickup(!newPickup)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    newPickup ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-foreground/10 text-muted border border-[var(--border-subtle)]'
                  }`}
                >
                  {newPickup ? 'Yes' : 'No'}
                </button>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[var(--color-brand-green)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-md"
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
