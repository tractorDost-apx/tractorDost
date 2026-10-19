'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useDealerServices } from '@/hooks/dealers/use-dealer-services';
import {
  ServiceBookingStatus,
  AdminServiceBookingItem,
  AdminServiceBookingDetail,
  CreateServiceBookingPayload,
} from '@/lib/api/serviceBookings';
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
  MapPin,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Navigation,
} from 'lucide-react';

const SERVICE_TYPE_LABELS: Record<string, string> = {
  oil_change: 'Oil & Filter Change',
  engine_overhaul: 'Engine Overhaul',
  tyre_fitting: 'Tyre Fitting & Alignment',
  hydraulics_repair: 'Hydraulics Repair',
  spare_parts: 'Spare Parts Replacement',
  body_work: 'Body Work & Paint',
  electrical: 'Electrical System Repair',
  transmission_repair: 'Transmission Repair',
  general_maintenance: 'General Maintenance',
  PERIODIC_MAINTENANCE: 'Periodic Maintenance',
  ENGINE_OVERHAUL: 'Engine Overhaul',
  WARRANTY_CLAIM: 'Warranty Claim',
  EMERGENCY_REPAIR: 'Emergency Repair',
};

function formatServiceType(type: string): string {
  if (!type) return 'General Service';
  return (
    SERVICE_TYPE_LABELS[type] ||
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function getGoogleMapsUrl(
  latitude?: number | null,
  longitude?: number | null,
  address?: string | null
): string | null {
  if (
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    (latitude !== 0 || longitude !== 0)
  ) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }
  if (address && address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address.trim()
    )}`;
  }
  return null;
}

export default function ServicesPage() {
  const { user } = useAuth();
  const {
    dealerName,
    serviceCenter,
    serviceCenterId,
    bookings,
    pagination,
    loadingDealer,
    loadingBookings,
    isUpdating,
    isCreating,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    sortBy,
    setSortBy,
    refetch,
    updateStatus,
    cancelBooking,
    createBooking,
    getBookingDetail,
  } = useDealerServices();

  // Toast feedback state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailModalBooking, setDetailModalBooking] = useState<AdminServiceBookingDetail | null>(
    null
  );
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status update notes modal state
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    bookingId: number;
    newStatus: ServiceBookingStatus;
    notes: string;
  } | null>(null);

  // New Booking Form State
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formTractorBrand, setFormTractorBrand] = useState('');
  const [formTractorModel, setFormTractorModel] = useState('');
  const [formServiceType, setFormServiceType] = useState('general_maintenance');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLatitude, setFormLatitude] = useState<number>(serviceCenter?.latitude || 18.5204);
  const [formLongitude, setFormLongitude] = useState<number>(serviceCenter?.longitude || 73.8567);
  const [formNotes, setFormNotes] = useState('');

  // Contact / Center details
  const helplinePhone =
    serviceCenter?.phone ||
    user?.dealer?.phone ||
    user?.dealer?.contactPersonPhone ||
    (user?.mobile ? String(user.mobile) : null) ||
    'Contact Support';

  // Client-side filtering for immediate responsive search
  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      b.name.toLowerCase().includes(query) ||
      b.mobile.includes(query) ||
      b.tractorModel.toLowerCase().includes(query) ||
      b.tractorBrand.toLowerCase().includes(query) ||
      (b.address && b.address.toLowerCase().includes(query)) ||
      String(b.bookingId).includes(query)
    );
  });

  // KPI Metrics
  const totalCount = pagination.total || bookings.length;
  const scheduledCount = bookings.filter((b) => b.status === 'SCHEDULED').length;
  const inProgressCount = bookings.filter((b) => b.status === 'IN_PROGRESS').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

  const handleOpenDetailModal = async (bookingId: number) => {
    setLoadingDetail(true);
    const detail = await getBookingDetail(bookingId);
    setLoadingDetail(false);
    if (detail) {
      setDetailModalBooking(detail);
    } else {
      showToast('error', 'Failed to load booking details');
    }
  };

  const handleStatusSelectChange = (
    bookingId: number,
    currentStatus: ServiceBookingStatus,
    selectedStatus: ServiceBookingStatus
  ) => {
    if (selectedStatus === currentStatus) return;

    // Prompt with notes modal for smooth updates
    setStatusChangeTarget({
      bookingId,
      newStatus: selectedStatus,
      notes: '',
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeTarget) return;
    const { bookingId, newStatus, notes } = statusChangeTarget;

    const res = await updateStatus(bookingId, newStatus, notes.trim() || undefined);
    if (res.success) {
      showToast('success', res.message);
      if (detailModalBooking && detailModalBooking.bookingId === bookingId) {
        setDetailModalBooking({
          ...detailModalBooking,
          status: newStatus,
          notes: notes || detailModalBooking.notes,
        });
      }
    } else {
      showToast('error', res.message);
    }
    setStatusChangeTarget(null);
  };

  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formName ||
      !formMobile ||
      !formTractorBrand ||
      !formTractorModel ||
      !formDescription ||
      !formDate ||
      !formAddress
    ) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const payload: CreateServiceBookingPayload = {
      name: formName.trim(),
      mobile: formMobile.trim(),
      tractorBrand: formTractorBrand.trim(),
      tractorModel: formTractorModel.trim(),
      serviceType: formServiceType,
      description: formDescription.trim(),
      preferredDate: new Date(formDate).toISOString(),
      address: formAddress.trim(),
      latitude: Number(formLatitude) || 18.5204,
      longitude: Number(formLongitude) || 73.8567,
      notes: formNotes.trim() || undefined,
    };

    const res = await createBooking(payload);
    if (res.success) {
      showToast('success', res.message);
      setIsCreateModalOpen(false);
      // Reset form
      setFormName('');
      setFormMobile('');
      setFormTractorBrand('');
      setFormTractorModel('');
      setFormServiceType('general_maintenance');
      setFormDescription('');
      setFormDate('');
      setFormAddress('');
      setFormNotes('');
    } else {
      showToast('error', res.message);
    }
  };

  const getStatusBadge = (status: ServiceBookingStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          dot: 'bg-blue-500',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: status,
          color: 'bg-foreground/10 text-muted border-[var(--border-subtle)]',
          dot: 'bg-muted',
        };
    }
  };

  const getAllowedTransitions = (currentStatus: ServiceBookingStatus): ServiceBookingStatus[] => {
    switch (currentStatus) {
      case 'SCHEDULED':
        return ['SCHEDULED', 'IN_PROGRESS', 'CANCELLED'];
      case 'IN_PROGRESS':
        return ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      case 'COMPLETED':
        return ['COMPLETED'];
      case 'CANCELLED':
        return ['CANCELLED'];
      default:
        return [currentStatus];
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 lg:gap-3 rounded-2xl border px-5 py-3 shadow-xl backdrop-blur-md transition-all ${
            toast.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200'
              : 'border-rose-500/30 bg-rose-950/80 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="text-rose-400" />
          )}
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
            <Wrench size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Service & Workshop Management
              </h1>
              {serviceCenter ? (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                  {serviceCenter.serviceName || 'Service Center Active'}
                </span>
              ) : (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-black tracking-wider text-amber-600 uppercase dark:text-amber-400">
                  No Center Linked
                </span>
              )}
            </div>
            <p className="text-muted mt-0.5 text-xs font-bold sm:text-sm">
              Live customer service requests, workshop maintenance jobs, and status tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => refetch()}
            disabled={loadingBookings || !serviceCenterId}
            className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-foreground/10 disabled:opacity-50"
            title="Refresh Bookings"
          >
            <RefreshCw size={15} className={loadingBookings ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!serviceCenterId}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 disabled:opacity-50"
          >
            <Plus size={18} className="stroke-[3]" /> Book Service Request
          </button>
        </div>
      </div>

      {/* Dealer or Center Missing Warning Banner */}
      {!loadingDealer && !serviceCenterId && (
        <div className="flex items-start gap-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-700 dark:text-amber-300">
          <AlertTriangle size={24} className="shrink-0 text-amber-500" />
          <div className="space-y-1 text-xs">
            <h4 className="text-sm font-black">No Service Center Linked to Dealership</h4>
            <p className="font-medium">
              To receive and manage customer service requests, your dealership profile must have an
              active Service Center. Please contact the platform administrator or update your
              dealership profile settings.
            </p>
          </div>
        </div>
      )}

      {/* KPI Stat Strip Layout */}
      <div className="grid grid-cols-2 gap-2 lg:gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-foreground/5 flex items-center gap-2 lg:gap-3.5 rounded-2xl border border-[var(--border-subtle)] p-4">
          <div className="shrink-0 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
            <Wrench size={20} />
          </div>
          <div>
            <div className="text-foreground text-xl font-black tracking-tight">{totalCount}</div>
            <div className="text-muted text-[11px] font-bold tracking-wider uppercase">
              Total Bookings
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-2 lg:gap-3.5 rounded-2xl border border-[var(--border-subtle)] p-4">
          <div className="shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-amber-500">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-foreground text-xl font-black tracking-tight">{scheduledCount}</div>
            <div className="text-muted text-[11px] font-bold tracking-wider uppercase">Scheduled</div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-2 lg:gap-3.5 rounded-2xl border border-[var(--border-subtle)] p-4">
          <div className="shrink-0 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-blue-500">
            <Tractor size={20} />
          </div>
          <div>
            <div className="text-foreground text-xl font-black tracking-tight">{inProgressCount}</div>
            <div className="text-muted text-[11px] font-bold tracking-wider uppercase">
              In Progress
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-2 lg:gap-3.5 rounded-2xl border border-[var(--border-subtle)] p-4">
          <div className="shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-emerald-500">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-foreground text-xl font-black tracking-tight">{completedCount}</div>
            <div className="text-muted text-[11px] font-bold tracking-wider uppercase">Completed</div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-2 lg:gap-3.5 rounded-2xl border border-[var(--border-subtle)] p-4 col-span-2 lg:col-span-1">
          <div className="shrink-0 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-500">
            <X size={20} />
          </div>
          <div>
            <div className="text-foreground text-xl font-black tracking-tight">{cancelledCount}</div>
            <div className="text-muted text-[11px] font-bold tracking-wider uppercase">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Facility Operational Info Grid */}
      {serviceCenter && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="glass-panel space-y-3 rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                <Building2 size={16} /> {serviceCenter.serviceName || dealerName}
              </h3>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-600 uppercase dark:text-emerald-400">
                {serviceCenter.is24x7 ? '24x7 Operational' : 'Open (9 AM - 7 PM)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 lg:gap-3 border-t border-[var(--border-subtle)] pt-2 text-xs">
              <div>
                <span className="text-muted block font-bold">Helpline Number</span>
                <span className="text-foreground font-mono font-bold">{helplinePhone}</span>
              </div>
              <div>
                <span className="text-muted block font-bold">Pickup Facility</span>
                <span
                  className={`flex items-center gap-1 font-bold ${
                    serviceCenter.hasPickupService
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted'
                  }`}
                >
                  <Truck size={12} /> {serviceCenter.hasPickupService ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel space-y-3 rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                <ShieldCheck size={16} /> Certified Service Station
              </h3>
              <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-[10px] font-black text-[var(--color-brand-green)] uppercase">
                {serviceCenter.sparePartsAvailable ? 'OEM Spares In Stock' : 'Verified Station'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 lg:gap-3 border-t border-[var(--border-subtle)] pt-2 text-xs">
              <div>
                <span className="text-muted block font-bold">Center Location</span>
                <span className="text-foreground font-bold truncate block">
                  {serviceCenter.address || 'Address provided'}
                </span>
              </div>
              <div>
                <span className="text-muted block font-bold">Emergency Support</span>
                <span
                  className={`font-bold ${
                    serviceCenter.hasEmergencySupport ? 'text-[var(--color-brand-green)]' : 'text-muted'
                  }`}
                >
                  {serviceCenter.hasEmergencySupport
                    ? '24/7 Breakdown Assistance'
                    : 'Standard Hours'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={18} className="text-muted absolute top-3 left-3.5" />
          <input
            type="text"
            placeholder="Search customer name, contact phone, tractor model, or booking #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] py-2 pr-4 pl-10 text-xs font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <div className="bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs">
            <Filter size={14} className="text-muted shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-foreground cursor-pointer bg-transparent font-bold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs">
            <span className="text-muted font-bold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-foreground cursor-pointer bg-transparent font-bold focus:outline-none"
            >
              <option value="createdAt">Booking Date</option>
              <option value="preferredDate">Preferred Service Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Service Bookings Table */}
      <div className="bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] p-4 sm:p-6">
        {loadingBookings ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 size={32} className="animate-spin text-[var(--color-brand-green)]" />
            <p className="text-muted text-xs font-bold">Loading customer service requests...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="mx-auto my-6 max-w-md space-y-4 py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <Wrench size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="text-foreground text-base font-black tracking-tight">
                No Service Bookings Found
              </h4>
              <p className="text-muted text-xs leading-relaxed font-medium">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No service requests match your search or filter criteria.'
                  : 'You have not received any customer service bookings yet. Click "Book Service Request" to schedule a job.'}
              </p>
            </div>
            {serviceCenterId && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90"
              >
                <Plus size={16} /> Book Service Request
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="text-muted border-b border-[var(--border-subtle)] text-xs font-bold tracking-wider uppercase">
                    <th className="w-8 px-2 lg:px-3 py-3 text-center">#</th>
                    <th className="px-2 lg:px-3 py-3">Customer & Phone</th>
                    <th className="px-2 lg:px-3 py-3">Tractor Model</th>
                    <th className="px-2 lg:px-3 py-3">Service Type</th>
                    <th className="px-2 lg:px-3 py-3">Preferred Date</th>
                    <th className="px-2 lg:px-3 py-3">Customer Location & Map</th>
                    <th className="px-2 lg:px-3 py-3">Status</th>
                    <th className="px-2 lg:px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-medium">
                  {filteredBookings.map((b) => {
                    const statusBadge = getStatusBadge(b.status);
                    const allowed = getAllowedTransitions(b.status);
                    const isFinal = b.status === 'COMPLETED' || b.status === 'CANCELLED';
                    const mapUrl = getGoogleMapsUrl(b.latitude, b.longitude, b.address);

                    return (
                      <tr key={b.bookingId} className="hover:bg-foreground/5 group transition-colors">
                        <td className="px-2 lg:px-3 py-3 text-center">
                          <span className="text-muted/80 font-mono text-xs font-bold">
                            #{b.bookingId}
                          </span>
                        </td>

                        <td className="px-2 lg:px-3 py-3">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 font-bold text-[var(--color-brand-green)]">
                              <User size={18} />
                            </div>
                            <div>
                              <div className="text-foreground text-sm font-black tracking-tight">
                                {b.name}
                              </div>
                              <a
                                href={`tel:${b.mobile}`}
                                className="text-foreground hover:text-[var(--color-brand-green)] mt-0.5 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
                                title="Click to Call Customer"
                              >
                                <Phone size={11} className="text-[var(--color-brand-green)] shrink-0" />
                                <span>{b.mobile}</span>
                              </a>
                            </div>
                          </div>
                        </td>

                        <td className="px-2 lg:px-3 py-3">
                          <div className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                            <Tractor
                              size={14}
                              className="shrink-0 text-[var(--color-brand-green)]"
                            />
                            {b.tractorBrand} {b.tractorModel}
                          </div>
                        </td>

                        <td className="px-2 lg:px-3 py-3">
                          <span className="bg-foreground/5 text-foreground/90 rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-bold">
                            {formatServiceType(b.serviceType)}
                          </span>
                        </td>

                        <td className="px-2 lg:px-3 py-3">
                          <div className="text-muted flex items-center gap-1 font-mono text-xs">
                            <Calendar size={13} className="text-muted/70" />
                            {b.preferredDate
                              ? new Date(b.preferredDate).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </td>

                        <td className="px-2 lg:px-3 py-3 max-w-[140px] lg:max-w-[200px]">
                          <div
                            className="text-foreground truncate text-xs font-medium"
                            title={b.address || 'Location provided'}
                          >
                            {b.address ||
                              (b.latitude && b.longitude
                                ? `Lat: ${b.latitude.toFixed(4)}, Lng: ${b.longitude.toFixed(4)}`
                                : 'On-site')}
                          </div>
                          {mapUrl && (
                            <a
                              href={mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/20 transition-all shadow-xs"
                              title="Open Customer Location in Google Maps"
                            >
                              <MapPin size={12} className="shrink-0" />
                              <span>Google Maps</span>
                              <ExternalLink size={10} className="shrink-0 opacity-80" />
                            </a>
                          )}
                        </td>

                        <td className="px-2 lg:px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge.color}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                            {statusBadge.label}
                          </span>
                        </td>

                        <td className="px-2 lg:px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDetailModal(b.bookingId)}
                              className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-2.5 py-1 text-xs font-bold text-foreground hover:bg-foreground/10 transition-colors"
                              title="View Details"
                            >
                              Details
                            </button>

                            {!isFinal ? (
                              <select
                                value={b.status}
                                onChange={(e) =>
                                  handleStatusSelectChange(
                                    b.bookingId,
                                    b.status,
                                    e.target.value as ServiceBookingStatus
                                  )
                                }
                                disabled={isUpdating}
                                className="bg-foreground/5 text-foreground cursor-pointer rounded-xl border border-[var(--border-subtle)] px-2.5 py-1 text-xs font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                              >
                                {allowed.map((st) => (
                                  <option key={st} value={st}>
                                    {st === 'SCHEDULED'
                                      ? 'Scheduled'
                                      : st === 'IN_PROGRESS'
                                      ? 'In Progress'
                                      : st === 'COMPLETED'
                                      ? 'Completed'
                                      : 'Cancelled'}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-muted text-xs italic px-1 font-medium">
                                Final
                              </span>
                            )}
                          </div>
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
                const allowed = getAllowedTransitions(b.status);
                const isFinal = b.status === 'COMPLETED' || b.status === 'CANCELLED';
                const mapUrl = getGoogleMapsUrl(b.latitude, b.longitude, b.address);

                return (
                  <div
                    key={b.bookingId}
                    className="bg-foreground/5 space-y-3 rounded-2xl border border-[var(--border-subtle)] p-4 transition-all hover:border-[var(--color-brand-green)]/30"
                  >
                    <div className="flex items-start justify-between gap-2 lg:gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted font-mono text-xs font-bold">
                            #{b.bookingId}
                          </span>
                          <h4 className="text-foreground text-sm leading-tight font-black">
                            {b.name}
                          </h4>
                        </div>
                        <a
                          href={`tel:${b.mobile}`}
                          className="text-foreground hover:text-[var(--color-brand-green)] mt-1 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Phone size={12} className="text-[var(--color-brand-green)] shrink-0" />
                          <span>{b.mobile}</span>
                        </a>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge.color}`}
                      >
                        <span className={`h-1 w-1 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-y border-[var(--border-subtle)] py-2.5 text-xs">
                      <div>
                        <span className="text-muted block text-[10px] font-bold uppercase">
                          Tractor
                        </span>
                        <span className="text-foreground font-bold">
                          {b.tractorBrand} {b.tractorModel}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px] font-bold uppercase">
                          Service Type
                        </span>
                        <span className="text-foreground font-medium">
                          {formatServiceType(b.serviceType)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px] font-bold uppercase">
                          Preferred Date
                        </span>
                        <span className="text-foreground font-medium">
                          {b.preferredDate
                            ? new Date(b.preferredDate).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px] font-bold uppercase">
                          Location
                        </span>
                        <span className="text-foreground truncate block font-medium">
                          {b.address || 'On-site'}
                        </span>
                      </div>
                    </div>

                    {mapUrl && (
                      <div className="pt-0.5">
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 py-2 px-3 text-xs font-bold text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/20 transition-all"
                        >
                          <MapPin size={14} /> Open Customer Location in Google Maps{' '}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleOpenDetailModal(b.bookingId)}
                        className="text-xs font-bold text-[var(--color-brand-green)] hover:underline"
                      >
                        View Full Details →
                      </button>

                      {!isFinal ? (
                        <select
                          value={b.status}
                          onChange={(e) =>
                            handleStatusSelectChange(
                              b.bookingId,
                              b.status,
                              e.target.value as ServiceBookingStatus
                            )
                          }
                          disabled={isUpdating}
                          className="bg-foreground/5 text-foreground rounded-xl border border-[var(--border-subtle)] px-2 py-1 text-xs font-bold focus:outline-none"
                        >
                          {allowed.map((st) => (
                            <option key={st} value={st}>
                              {st === 'SCHEDULED'
                                ? 'Scheduled'
                                : st === 'IN_PROGRESS'
                                ? 'In Progress'
                                : st === 'COMPLETED'
                                ? 'Completed'
                                : 'Cancelled'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-muted text-xs italic font-medium">Closed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 mt-4 text-xs font-bold">
                <span className="text-muted">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1 || loadingBookings}
                    className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1.5 hover:bg-foreground/10 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNextPage || loadingBookings}
                    className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1.5 hover:bg-foreground/10 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Detail Modal */}
      {detailModalBooking && (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="text-foreground relative max-h-[80vh] overflow-y-auto flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl">
            <div className="bg-foreground/5 flex items-center justify-between border-b border-[var(--border-subtle)] p-6">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
                  <Wrench size={22} />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-black tracking-tight">
                    Booking #{detailModalBooking.bookingId} Details
                  </h3>
                  <p className="text-muted mt-0.5 text-xs font-medium">
                    Requested for {detailModalBooking.serviceCenterName || 'Service Station'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDetailModalBooking(null)}
                className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6 text-xs max-h-[75vh] overflow-y-auto">
              {/* Status Header Strip */}
              <div className="flex items-center justify-between rounded-2xl bg-foreground/5 p-4 border border-[var(--border-subtle)]">
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Current Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold mt-1 ${
                      getStatusBadge(detailModalBooking.status).color
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        getStatusBadge(detailModalBooking.status).dot
                      }`}
                    />
                    {getStatusBadge(detailModalBooking.status).label}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-muted block text-[10px] font-bold uppercase">Created At</span>
                  <span className="text-foreground font-mono font-bold">
                    {new Date(detailModalBooking.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Customer & Tractor Info Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-foreground/5 p-4 border border-[var(--border-subtle)]">
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Customer Name
                  </span>
                  <span className="text-foreground font-black text-sm">{detailModalBooking.name}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Customer Contact Phone
                  </span>
                  <a
                    href={`tel:${detailModalBooking.mobile}`}
                    className="text-foreground hover:text-[var(--color-brand-green)] font-mono font-bold text-sm flex items-center gap-1.5 mt-0.5 transition-colors"
                  >
                    <Phone size={13} className="text-[var(--color-brand-green)]" />
                    <span>{detailModalBooking.mobile}</span>
                  </a>
                </div>
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Tractor Brand & Model
                  </span>
                  <span className="text-foreground font-bold">
                    {detailModalBooking.tractorBrand} {detailModalBooking.tractorModel}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Preferred Service Date
                  </span>
                  <span className="text-foreground font-mono font-bold">
                    {detailModalBooking.preferredDate
                      ? new Date(detailModalBooking.preferredDate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Service Type & Issue Description */}
              <div className="space-y-3 rounded-2xl bg-foreground/5 p-4 border border-[var(--border-subtle)]">
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Service Requested
                  </span>
                  <span className="text-[var(--color-brand-green)] font-bold text-sm">
                    {formatServiceType(detailModalBooking.serviceType)}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Customer Description / Problem
                  </span>
                  <p className="text-foreground text-xs leading-relaxed mt-1 whitespace-pre-wrap font-medium">
                    {detailModalBooking.description || 'No detailed description provided.'}
                  </p>
                </div>
                {detailModalBooking.notes && (
                  <div>
                    <span className="text-muted block text-[10px] font-bold uppercase">
                      Workshop / Internal Notes
                    </span>
                    <p className="text-foreground text-xs leading-relaxed mt-1 font-medium bg-foreground/5 p-2 rounded-xl border border-[var(--border-subtle)]">
                      {detailModalBooking.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Location & Google Maps Redirection Button */}
              <div className="rounded-2xl bg-foreground/5 p-4 border border-[var(--border-subtle)] space-y-3">
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Customer Breakdown Location / Address
                  </span>
                  <p className="text-foreground font-medium mt-1">
                    {detailModalBooking.address || 'No physical address specified'}
                  </p>
                  {detailModalBooking.latitude && detailModalBooking.longitude && (
                    <p className="text-muted font-mono text-[11px] mt-0.5">
                      Coordinates: {detailModalBooking.latitude.toFixed(5)},{' '}
                      {detailModalBooking.longitude.toFixed(5)}
                    </p>
                  )}
                </div>

                {getGoogleMapsUrl(
                  detailModalBooking.latitude,
                  detailModalBooking.longitude,
                  detailModalBooking.address
                ) && (
                  <a
                    href={
                      getGoogleMapsUrl(
                        detailModalBooking.latitude,
                        detailModalBooking.longitude,
                        detailModalBooking.address
                      )!
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-2 lg:px-3 py-3 text-xs font-bold text-white uppercase tracking-wider shadow-md hover:opacity-90 transition-all"
                  >
                    <Navigation size={16} /> Open Customer Location in Google Maps{' '}
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-[var(--border-subtle)] p-4">
              <button
                onClick={() => setDetailModalBooking(null)}
                className="rounded-xl bg-foreground/10 px-5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-foreground/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Transition & Notes Prompt Modal */}
      {statusChangeTarget && (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="text-foreground relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black">Confirm Status Update</h3>
              <button
                onClick={() => setStatusChangeTarget(null)}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to update Booking #{statusChangeTarget.bookingId} status to{' '}
              <strong className="text-foreground">{statusChangeTarget.newStatus}</strong>?
            </p>

            <div className="space-y-1 text-xs">
              <label className="text-muted block font-bold">
                Workshop Notes / Reason (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Tractor inspected, spare parts ordered, or ready for customer pickup..."
                value={statusChangeTarget.notes}
                onChange={(e) =>
                  setStatusChangeTarget({ ...statusChangeTarget, notes: e.target.value })
                }
                className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] p-3 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 lg:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusChangeTarget(null)}
                className="text-muted hover:text-foreground rounded-xl px-4 py-2 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={isUpdating}
                className="rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-bold text-white uppercase shadow-md transition-all hover:opacity-90 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Service Modal */}
      {isCreateModalOpen && (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="text-foreground relative max-h-[80vh] overflow-y-auto flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl max-h-[80vh]">
            <div className="bg-foreground/5 flex items-center justify-between border-b border-[var(--border-subtle)] p-6">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
                  <Wrench size={22} />
                </div>
                <div>
                  <h3 className="text-foreground text-xl font-black tracking-tight">
                    Book New Service Request
                  </h3>
                  <p className="text-muted mt-0.5 text-xs font-medium">
                    Log a maintenance or repair job for customer tractor.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit} className="space-y-4 p-6 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted block font-bold">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted block font-bold">Customer Mobile *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted block font-bold">Tractor Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahindra / Swaraj"
                    value={formTractorBrand}
                    onChange={(e) => setFormTractorBrand(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted block font-bold">Tractor Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 575 DI / 855 FE"
                    value={formTractorModel}
                    onChange={(e) => setFormTractorModel(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted block font-bold">Service Type *</label>
                  <select
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                  >
                    <option value="general_maintenance">General Maintenance</option>
                    <option value="oil_change">Oil & Filter Change</option>
                    <option value="engine_overhaul">Engine Overhaul</option>
                    <option value="tyre_fitting">Tyre Fitting & Alignment</option>
                    <option value="hydraulics_repair">Hydraulics Repair</option>
                    <option value="spare_parts">Spare Parts Replacement</option>
                    <option value="body_work">Body Work & Denting</option>
                    <option value="electrical">Electrical System Repair</option>
                    <option value="transmission_repair">Transmission Repair</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted block font-bold">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Breakdown Address / Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Village Farm, Taluka, District, State"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">
                  Description of Issue / Work Needed *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the symptoms, repair needed, or routine maintenance scope (min 5 characters)..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] p-3 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Workshop Internal Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested morning slot"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 lg:gap-3 border-t border-[var(--border-subtle)] pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl px-5 py-2.5 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isCreating ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
