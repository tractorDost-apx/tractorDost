'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useDealerServices } from '@/hooks/dealers/use-dealer-services';
import {
  ServiceBookingStatus,
  AdminServiceBookingItem,
  AdminServiceBookingDetail,
  CreateServiceBookingPayload,
  serviceBookingAPI,
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
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  Check,
  ChevronDown,
  Eye,
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

function parseCoordinate(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('enc:') || trimmed === '') return null;
    const num = parseFloat(trimmed);
    return isNaN(num) ? null : num;
  }
  return null;
}

function cleanEncryptedText(text: unknown, fallback = ''): string {
  if (!text || typeof text !== 'string') return fallback;
  const trimmed = text.trim();
  if (trimmed.startsWith('enc:')) {
    return fallback;
  }
  return trimmed;
}

function formatCustomerPhone(phone: unknown): string {
  if (!phone || typeof phone !== 'string') return 'Not provided';
  const trimmed = phone.trim();
  if (trimmed.startsWith('enc:')) {
    return 'Registered Contact';
  }
  return trimmed;
}

function formatCoordinates(lat: unknown, lng: unknown): string | null {
  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);
  if (parsedLat !== null && parsedLng !== null && (parsedLat !== 0 || parsedLng !== 0)) {
    return `Lat: ${parsedLat.toFixed(4)}, Lng: ${parsedLng.toFixed(4)}`;
  }
  return null;
}

function getGoogleMapsUrl(
  latitude?: unknown,
  longitude?: unknown,
  address?: string | null
): string | null {
  const parsedLat = parseCoordinate(latitude);
  const parsedLng = parseCoordinate(longitude);
  if (parsedLat !== null && parsedLng !== null && (parsedLat !== 0 || parsedLng !== 0)) {
    return `https://www.google.com/maps?q=${parsedLat},${parsedLng}`;
  }
  const cleanAddr = cleanEncryptedText(address);
  if (cleanAddr) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddr)}`;
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

  // Layout View Mode (Table or Cards)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Toast feedback state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailModalBooking, setDetailModalBooking] = useState<AdminServiceBookingDetail | null>(null);
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

  const handleOpenDetailModal = (booking: AdminServiceBookingItem | number) => {
    const item =
      typeof booking === 'number'
        ? bookings.find((b) => Number(b.bookingId) === Number(booking))
        : booking;

    if (!item) {
      showToast('error', 'Booking details not available');
      return;
    }

    // 1. Immediately display the modal with available item data (instant, zero delay!)
    setDetailModalBooking({
      bookingId: Number(item.bookingId),
      serviceCenterId: serviceCenterId || serviceCenter?.id || 1,
      serviceCenterName: serviceCenter?.serviceName || dealerName || 'Authorized Workshop',
      dealerId: serviceCenter?.dealerId || 1,
      dealerName: dealerName || 'Dealership',
      userId: null,
      name: item.name,
      mobile: item.mobile,
      tractorBrand: item.tractorBrand,
      tractorModel: item.tractorModel,
      serviceType: item.serviceType,
      description: item.notes || 'Customer service booking request',
      preferredDate: item.preferredDate,
      status: item.status,
      notes: item.notes,
      longitude: item.longitude,
      latitude: item.latitude,
      address: item.address,
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
    });

    // 2. Fetch full detail from backend in background to enhance description/notes if available
    const centerId = serviceCenterId || serviceCenter?.id;
    if (centerId && item.bookingId) {
      serviceBookingAPI
        .getAdminBookingDetail(centerId, Number(item.bookingId))
        .then((res: any) => {
          if (res?.success && res.data) {
            setDetailModalBooking(res.data);
          }
        })
        .catch((err: any) => {
          console.warn('Could not fetch extra booking details:', err);
        });
    }
  };

  const handleStatusSelectChange = (
    bookingId: number,
    currentStatus: ServiceBookingStatus,
    selectedStatus: ServiceBookingStatus
  ) => {
    if (selectedStatus === currentStatus) return;

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
          color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
          dot: 'bg-amber-500',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          color: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
          dot: 'bg-emerald-500',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
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
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[200] flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all ${
            toast.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
              : 'border-rose-500/30 bg-rose-950/90 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      {/* 1. TOP HEADER BAR: TITLE, ACTIONS */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 p-3 text-[var(--color-brand-green)] shadow-sm">
            <Wrench size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Workshop & Service Bookings
              </h1>
              {serviceCenter ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-black tracking-wider text-emerald-500 uppercase">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {serviceCenter.serviceName || 'Active Workshop'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-0.5 text-[11px] font-black tracking-wider text-amber-500 uppercase">
                  No Workshop Linked
                </span>
              )}
            </div>
            <p className="text-muted mt-1 text-xs font-semibold sm:text-sm">
              Live customer service requests, field repair jobs, and breakdown assistance tracking.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            onClick={() => refetch()}
            disabled={loadingBookings || !serviceCenterId}
            className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-foreground/10 hover:border-foreground/20 disabled:opacity-50"
            title="Refresh Bookings"
          >
            <RefreshCw size={14} className={loadingBookings ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!serviceCenterId}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2.5 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-[var(--color-brand-green)]/15 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>Book Service Request</span>
          </button>
        </div>
      </div>

      {/* Warning banner when no ServiceCenter is linked */}
      {!loadingDealer && !serviceCenterId && (
        <div className="flex items-start gap-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-700 dark:text-amber-300 shadow-sm">
          <AlertTriangle size={24} className="shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="text-sm font-black">No Service Center Linked to Dealership</h4>
            <p className="font-medium leading-relaxed">
              To receive and manage customer service requests, your dealership profile must have an
              active Service Center registered. Please contact the platform administrator or update
              your dealership profile settings.
            </p>
          </div>
        </div>
      )}

      {/* 2. FACILITY OPERATIONAL RIBBON BANNER */}
      {serviceCenter && (
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4 sm:p-5 backdrop-blur-sm shadow-sm transition-all">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Workshop & Location */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-sm">
                <Building2 size={22} />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-foreground text-sm font-black tracking-tight">
                    {serviceCenter.serviceName || dealerName || 'Authorized Workshop'}
                  </h3>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-500 tracking-wider">
                    Operational
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-[var(--color-brand-green)] shrink-0" />
                    <span className="truncate max-w-[280px] sm:max-w-md">
                      {serviceCenter.district
                        ? `${serviceCenter.district}, ${serviceCenter.state}`
                        : serviceCenter.address || 'Address registered'}
                    </span>
                  </span>
                  {serviceCenter.latitude && serviceCenter.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${serviceCenter.latitude},${serviceCenter.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-brand-green)] hover:underline inline-flex items-center gap-1 font-bold text-[11px]"
                      title="Open workshop location on Google Maps"
                    >
                      <span>View Map</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Helpline & Facilities Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <a
                href={`tel:${helplinePhone}`}
                className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:border-[var(--color-brand-green)]/40 hover:bg-foreground/10"
                title="Call Workshop Helpline"
              >
                <Phone size={13} className="text-[var(--color-brand-green)] shrink-0" />
                <span className="font-mono">{helplinePhone}</span>
              </a>

              <div
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold ${
                  serviceCenter.hasPickupService
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                    : 'border-[var(--border-subtle)] bg-foreground/5 text-muted'
                }`}
              >
                <Truck size={14} className={serviceCenter.hasPickupService ? 'text-emerald-500' : 'text-muted'} />
                <span>{serviceCenter.hasPickupService ? 'Pickup & Towing' : 'No Pickup'}</span>
              </div>

              <div
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold ${
                  serviceCenter.sparePartsAvailable
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                    : 'border-[var(--border-subtle)] bg-foreground/5 text-muted'
                }`}
              >
                <ShieldCheck size={14} className={serviceCenter.sparePartsAvailable ? 'text-emerald-500' : 'text-muted'} />
                <span>{serviceCenter.sparePartsAvailable ? 'OEM Spares' : 'Spares Limited'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. KPI METRIC CARDS DECK (INTERACTIVE 1-CLICK STATUS FILTERING) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {/* Total Bookings Card */}
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
            statusFilter === 'ALL'
              ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 ring-2 ring-[var(--color-brand-green)]/20 shadow-md'
              : 'border-[var(--border-subtle)] bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:border-foreground/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 p-2 text-[var(--color-brand-green)]">
              <Wrench size={18} />
            </div>
            {statusFilter === 'ALL' && (
              <span className="rounded-full bg-[var(--color-brand-green)]/20 px-2 py-0.5 text-[10px] font-black text-[var(--color-brand-green)] uppercase tracking-wider">
                Active
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-foreground text-2xl font-black tracking-tight">{totalCount}</div>
            <div className="text-muted text-[11px] font-bold tracking-wider uppercase mt-0.5">
              Total Requests
            </div>
          </div>
        </button>

        {/* Scheduled Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'SCHEDULED' ? 'ALL' : 'SCHEDULED')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
            statusFilter === 'SCHEDULED'
              ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-md'
              : 'border-[var(--border-subtle)] bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:border-foreground/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-500">
              <Clock size={18} />
            </div>
            {statusFilter === 'SCHEDULED' && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-500 uppercase tracking-wider">
                Active
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-foreground text-2xl font-black tracking-tight">{scheduledCount}</div>
            <div className="text-muted text-[11px] font-bold tracking-wider uppercase mt-0.5">
              Scheduled
            </div>
          </div>
        </button>

        {/* In Progress Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
            statusFilter === 'IN_PROGRESS'
              ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20 shadow-md'
              : 'border-[var(--border-subtle)] bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:border-foreground/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2 text-blue-500">
              <Tractor size={18} />
            </div>
            {statusFilter === 'IN_PROGRESS' && (
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-black text-blue-500 uppercase tracking-wider">
                Active
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-foreground text-2xl font-black tracking-tight">{inProgressCount}</div>
            <div className="text-muted text-[11px] font-bold tracking-wider uppercase mt-0.5">
              In Progress
            </div>
          </div>
        </button>

        {/* Completed Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
            statusFilter === 'COMPLETED'
              ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-md'
              : 'border-[var(--border-subtle)] bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:border-foreground/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-500">
              <CheckCircle2 size={18} />
            </div>
            {statusFilter === 'COMPLETED' && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-500 uppercase tracking-wider">
                Active
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-foreground text-2xl font-black tracking-tight">{completedCount}</div>
            <div className="text-muted text-[11px] font-bold tracking-wider uppercase mt-0.5">
              Completed
            </div>
          </div>
        </button>

        {/* Cancelled Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'CANCELLED' ? 'ALL' : 'CANCELLED')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all col-span-2 sm:col-span-1 lg:col-span-1 ${
            statusFilter === 'CANCELLED'
              ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20 shadow-md'
              : 'border-[var(--border-subtle)] bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:border-foreground/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-500">
              <X size={18} />
            </div>
            {statusFilter === 'CANCELLED' && (
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-black text-rose-500 uppercase tracking-wider">
                Active
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-foreground text-2xl font-black tracking-tight">{cancelledCount}</div>
            <div className="text-muted text-[11px] font-bold tracking-wider uppercase mt-0.5">
              Cancelled
            </div>
          </div>
        </button>
      </div>

      {/* 4. UNIFIED SEARCH, FILTER STATUS & VIEW CONTROLS TOOLBAR */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search Bar with Active Filter Pill */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[240px] max-w-lg">
            <Search size={16} className="text-muted absolute top-3 left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search customer, phone, tractor, address or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-foreground/5 text-foreground w-full rounded-2xl border border-[var(--border-subtle)] py-2.5 pr-9 pl-10 text-xs font-medium transition-colors focus:border-[var(--color-brand-green)]/60 focus:bg-foreground/[0.07] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-muted hover:text-foreground absolute top-2.5 right-3 p-1 rounded-md"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Active status filter indicator chip with 1-click clear */}
          {statusFilter !== 'ALL' && (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-3 py-2 text-xs font-bold text-[var(--color-brand-green)] animate-fade-in">
              <Filter size={12} />
              <span>Status: {statusFilter.replace('_', ' ')}</span>
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className="hover:bg-[var(--color-brand-green)]/20 rounded-md p-0.5 transition-colors"
                title="Clear filter"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Sort Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto shrink-0">
          <div className="text-muted text-xs font-semibold hidden sm:inline">
            Showing <strong className="text-foreground font-black">{filteredBookings.length}</strong> of{' '}
            <strong className="text-foreground font-black">{totalCount}</strong>
          </div>

          {/* Sort Selector */}
          <div className="bg-foreground/5 flex items-center gap-1.5 rounded-2xl border border-[var(--border-subtle)] px-3 py-2 text-xs">
            <ArrowUpDown size={13} className="text-muted shrink-0" />
            <span className="text-muted font-bold text-[11px] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-foreground cursor-pointer bg-transparent font-bold focus:outline-none text-xs"
            >
              <option value="createdAt" className="bg-[var(--background)]">
                Booking Date (Newest)
              </option>
              <option value="preferredDate" className="bg-[var(--background)]">
                Preferred Service Date
              </option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'table'
                  ? 'bg-[var(--color-brand-green)] text-black font-black shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
              title="Table View"
            >
              <LayoutList size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'cards'
                  ? 'bg-[var(--color-brand-green)] text-black font-black shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. MAIN CONTENT AREA: TABLE OR CARDS VIEW */}
      <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-foreground/[0.02] shadow-sm">
        {loadingBookings ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 size={36} className="animate-spin text-[var(--color-brand-green)]" />
            <p className="text-muted text-xs font-bold">Loading workshop service bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="mx-auto my-12 max-w-md space-y-4 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <Wrench size={30} />
            </div>
            <div className="space-y-1">
              <h4 className="text-foreground text-lg font-black tracking-tight">
                No Service Bookings Found
              </h4>
              <p className="text-muted text-xs leading-relaxed font-medium">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No service bookings match your active search or status filter. Try resetting filters.'
                  : 'You have not received any customer repair requests yet. Click "+ Book Service Request" to record a job.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {(searchQuery || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2 text-xs font-bold text-foreground hover:bg-foreground/10 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              {serviceCenterId && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black tracking-wider text-black uppercase shadow-md transition-all hover:opacity-90"
                >
                  <Plus size={15} /> Book Service Request
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW WITH PRECISE COLUMN ALIGNMENT */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-foreground/[0.03] text-[11px] font-black uppercase tracking-wider text-muted">
                  <th className="w-16 px-4 py-3.5 text-center">#ID</th>
                  <th className="w-60 px-4 py-3.5">Customer & Contact</th>
                  <th className="w-48 px-4 py-3.5">Tractor Model</th>
                  <th className="w-48 px-4 py-3.5">Service Requested</th>
                  <th className="w-36 px-4 py-3.5">Preferred Date</th>
                  <th className="w-56 px-4 py-3.5">Location & Map</th>
                  <th className="w-36 px-4 py-3.5 text-center">Status</th>
                  <th className="w-52 px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-medium">
                {filteredBookings.map((b) => {
                  const statusBadge = getStatusBadge(b.status);
                  const allowed = getAllowedTransitions(b.status);
                  const isFinal = b.status === 'COMPLETED' || b.status === 'CANCELLED';
                  const mapUrl = getGoogleMapsUrl(b.latitude, b.longitude, b.address);

                  return (
                    <tr
                      key={b.bookingId}
                      onClick={() => handleOpenDetailModal(b)}
                      className="group cursor-pointer transition-colors hover:bg-foreground/[0.04]"
                    >
                      {/* ID */}
                      <td className="px-4 py-3.5 text-center align-middle">
                        <span className="font-mono text-xs font-bold text-muted group-hover:text-foreground">
                          #{b.bookingId}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 font-bold text-[var(--color-brand-green)]">
                            <User size={15} />
                          </div>
                          <div className="truncate">
                            <div className="text-foreground text-xs font-black tracking-tight truncate">
                              {b.name}
                            </div>
                            {b.mobile && !b.mobile.startsWith('enc:') ? (
                              <a
                                href={`tel:${b.mobile}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-muted hover:text-[var(--color-brand-green)] font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors mt-0.5"
                                title="Call customer"
                              >
                                <Phone size={11} className="text-[var(--color-brand-green)] shrink-0" />
                                <span>{b.mobile}</span>
                              </a>
                            ) : (
                              <span className="text-muted font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                                <Phone size={11} className="text-muted/60 shrink-0" />
                                <span>{formatCustomerPhone(b.mobile)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tractor */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="text-foreground flex items-center gap-1.5 font-bold">
                          <Tractor size={14} className="shrink-0 text-[var(--color-brand-green)]" />
                          <span className="truncate">{b.tractorBrand} {b.tractorModel}</span>
                        </div>
                      </td>

                      {/* Service Type */}
                      <td className="px-4 py-3.5 align-middle">
                        <span className="inline-block rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2.5 py-1 text-[11px] font-bold text-foreground/90">
                          {formatServiceType(b.serviceType)}
                        </span>
                      </td>

                      {/* Preferred Date */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-muted">
                          <Calendar size={13} className="text-muted/70 shrink-0" />
                          <span>
                            {b.preferredDate
                              ? new Date(b.preferredDate).toLocaleDateString()
                              : 'Not set'}
                          </span>
                        </div>
                      </td>

                      {/* Location & Map */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="space-y-1">
                          <div
                            className="text-foreground truncate text-xs font-medium max-w-[200px]"
                            title={cleanEncryptedText(b.address) || 'Breakdown location provided'}
                          >
                            {cleanEncryptedText(b.address) || formatCoordinates(b.latitude, b.longitude) || 'On-site'}
                          </div>
                          {mapUrl && (
                            <a
                              href={mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-brand-green)] hover:underline"
                              title="Open in Google Maps"
                            >
                              <MapPin size={11} />
                              <span>View Map</span>
                              <ExternalLink size={9} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusBadge.color}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetailModal(b);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-[var(--color-brand-green)]/15 hover:text-[var(--color-brand-green)] hover:border-[var(--color-brand-green)]/30 transition-all shadow-xs"
                            title="View Full Booking Details"
                          >
                            <Eye size={13} className="text-[var(--color-brand-green)]" />
                            <span>Details</span>
                          </button>

                          {!isFinal ? (
                            <div className="relative inline-block">
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
                                className="appearance-none cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-1.5 pl-2.5 pr-7 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
                              >
                                {allowed.map((st) => (
                                  <option key={st} value={st} className="bg-[var(--background)]">
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
                              <ChevronDown
                                size={12}
                                className="pointer-events-none absolute right-2 top-2.5 text-muted"
                              />
                            </div>
                          ) : (
                            <span className="text-muted text-xs italic px-2 font-medium">
                              Closed
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
        ) : (
          /* CARDS GRID VIEW */
          <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((b) => {
              const statusBadge = getStatusBadge(b.status);
              const allowed = getAllowedTransitions(b.status);
              const isFinal = b.status === 'COMPLETED' || b.status === 'CANCELLED';
              const mapUrl = getGoogleMapsUrl(b.latitude, b.longitude, b.address);

              return (
                <div
                  key={b.bookingId}
                  onClick={() => handleOpenDetailModal(b)}
                  className="flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-5 transition-all hover:border-[var(--color-brand-green)]/30 hover:shadow-lg cursor-pointer"
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-muted">
                            #{b.bookingId}
                          </span>
                          <h4 className="text-foreground text-sm font-black tracking-tight leading-snug">
                            {b.name}
                          </h4>
                        </div>
                        {b.mobile && !b.mobile.startsWith('enc:') ? (
                          <a
                            href={`tel:${b.mobile}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted hover:text-[var(--color-brand-green)] font-mono text-xs font-bold flex items-center gap-1.5 transition-colors pt-0.5"
                          >
                            <Phone size={11} className="text-[var(--color-brand-green)] shrink-0" />
                            <span>{b.mobile}</span>
                          </a>
                        ) : (
                          <span className="text-muted font-mono text-xs font-bold flex items-center gap-1.5 pt-0.5">
                            <Phone size={11} className="text-muted/60 shrink-0" />
                            <span>{formatCustomerPhone(b.mobile)}</span>
                          </span>
                        )}
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusBadge.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] p-3 text-xs">
                      <div>
                        <span className="text-muted text-[10px] font-bold uppercase tracking-wider block">
                          Tractor
                        </span>
                        <span className="text-foreground font-black flex items-center gap-1 mt-0.5 truncate">
                          <Tractor size={12} className="text-[var(--color-brand-green)] shrink-0" />
                          <span className="truncate">{b.tractorBrand} {b.tractorModel}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-muted text-[10px] font-bold uppercase tracking-wider block">
                          Service
                        </span>
                        <span className="text-foreground font-bold truncate block mt-0.5">
                          {formatServiceType(b.serviceType)}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted text-[10px] font-bold uppercase tracking-wider block">
                          Preferred Date
                        </span>
                        <span className="text-foreground font-mono text-xs font-medium block mt-0.5">
                          {b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted text-[10px] font-bold uppercase tracking-wider block">
                          Location
                        </span>
                        <span className="text-foreground font-medium truncate block mt-0.5">
                          {cleanEncryptedText(b.address) || formatCoordinates(b.latitude, b.longitude) || 'On-site'}
                        </span>
                      </div>
                    </div>

                    {/* Google Maps Button */}
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 py-2 px-3 text-xs font-bold text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/20 transition-all"
                      >
                        <MapPin size={13} />
                        <span>Open in Google Maps</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3.5 mt-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetailModal(b);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-black text-[var(--color-brand-green)] hover:underline"
                    >
                      <Eye size={12} />
                      <span>View Details →</span>
                    </button>

                    {!isFinal ? (
                      <div className="relative inline-block">
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
                          className="appearance-none cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-1.5 pl-2.5 pr-7 text-xs font-bold text-foreground focus:outline-none"
                        >
                          {allowed.map((st) => (
                            <option key={st} value={st} className="bg-[var(--background)]">
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
                        <ChevronDown
                          size={12}
                          className="pointer-events-none absolute right-2 top-2 text-muted"
                        />
                      </div>
                    ) : (
                      <span className="text-muted text-xs italic font-medium">Closed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[var(--border-subtle)] p-4 text-xs font-bold bg-foreground/[0.01]">
            <span className="text-muted">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total bookings)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1 || loadingBookings}
                className="flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1.5 hover:bg-foreground/10 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage || loadingBookings}
                className="flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1.5 hover:bg-foreground/10 disabled:opacity-40 transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: BOOKING FULL DETAIL MODAL (WITH DIRECT STATUS ACTIONS) */}
      {detailModalBooking && (
        <div
          onClick={() => setDetailModalBooking(null)}
          className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="text-foreground relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="bg-foreground/5 flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
                  <Wrench size={22} />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-black tracking-tight">
                    Service Job #{detailModalBooking.bookingId}
                  </h3>
                  <p className="text-muted text-xs font-medium">
                    Assigned to {detailModalBooking.serviceCenterName || 'Authorized Workshop'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalBooking(null)}
                className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 overflow-y-auto p-6 text-xs flex-1">
              {/* Status Header Strip with Quick Update */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-foreground/5 p-4 border border-[var(--border-subtle)]">
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                    Job Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold mt-1 ${
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

                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right">
                    <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                      Booked On
                    </span>
                    <span className="text-foreground font-mono font-bold">
                      {new Date(detailModalBooking.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {detailModalBooking.status !== 'COMPLETED' && detailModalBooking.status !== 'CANCELLED' && (
                    <div className="relative inline-block ml-2">
                      <select
                        value={detailModalBooking.status}
                        onChange={(e) =>
                          handleStatusSelectChange(
                            detailModalBooking.bookingId,
                            detailModalBooking.status,
                            e.target.value as ServiceBookingStatus
                          )
                        }
                        disabled={isUpdating}
                        className="appearance-none cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-foreground/10 py-1.5 pl-3 pr-7 text-xs font-black text-foreground hover:bg-foreground/20 focus:outline-none"
                      >
                        {getAllowedTransitions(detailModalBooking.status).map((st) => (
                          <option key={st} value={st} className="bg-[var(--background)]">
                            Update: {st === 'SCHEDULED' ? 'Scheduled' : st === 'IN_PROGRESS' ? 'In Progress' : st === 'COMPLETED' ? 'Completed' : 'Cancelled'}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="pointer-events-none absolute right-2.5 top-2.5 text-muted"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Customer & Tractor Info Grid */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 rounded-2xl bg-foreground/5 p-4 border border-[var(--border-subtle)]">
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                    Customer Name
                  </span>
                  <span className="text-foreground font-black text-sm">{detailModalBooking.name}</span>
                </div>

                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                    Contact Phone
                  </span>
                  {detailModalBooking.mobile && !detailModalBooking.mobile.startsWith('enc:') ? (
                    <a
                      href={`tel:${detailModalBooking.mobile}`}
                      className="text-foreground hover:text-[var(--color-brand-green)] font-mono font-bold text-sm flex items-center gap-1.5 mt-0.5 transition-colors"
                    >
                      <Phone size={13} className="text-[var(--color-brand-green)]" />
                      <span>{detailModalBooking.mobile}</span>
                    </a>
                  ) : (
                    <span className="text-foreground font-mono font-bold text-sm flex items-center gap-1.5 mt-0.5">
                      <Phone size={13} className="text-muted" />
                      <span>{formatCustomerPhone(detailModalBooking.mobile)}</span>
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                    Tractor Model
                  </span>
                  <span className="text-foreground font-bold flex items-center gap-1.5 mt-0.5">
                    <Tractor size={14} className="text-[var(--color-brand-green)] shrink-0" />
                    <span>{detailModalBooking.tractorBrand} {detailModalBooking.tractorModel}</span>
                  </span>
                </div>

                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                    Preferred Service Date
                  </span>
                  <span className="text-foreground font-mono font-bold flex items-center gap-1.5 mt-0.5">
                    <Calendar size={13} className="text-muted shrink-0" />
                    <span>
                      {detailModalBooking.preferredDate
                        ? new Date(detailModalBooking.preferredDate).toLocaleDateString()
                        : 'Not specified'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Service & Issue Description */}
              <div className="space-y-3 rounded-2xl bg-foreground/5 p-4 border border-[var(--border-subtle)]">
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                    Service Requested
                  </span>
                  <span className="text-[var(--color-brand-green)] font-black text-sm">
                    {formatServiceType(detailModalBooking.serviceType)}
                  </span>
                </div>

                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                    Problem / Symptom Description
                  </span>
                  <p className="text-foreground text-xs leading-relaxed mt-1 whitespace-pre-wrap font-medium">
                    {detailModalBooking.description || 'No detailed description provided.'}
                  </p>
                </div>

                {detailModalBooking.notes && (
                  <div>
                    <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                      Internal Workshop Notes
                    </span>
                    <p className="text-foreground text-xs leading-relaxed mt-1 font-medium bg-foreground/5 p-2.5 rounded-xl border border-[var(--border-subtle)]">
                      {detailModalBooking.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Location & Google Maps Redirection Button */}
              <div className="rounded-2xl bg-foreground/5 p-4 border border-[var(--border-subtle)] space-y-3">
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                    Customer Breakdown / Service Location
                  </span>
                  <p className="text-foreground font-medium mt-1">
                    {cleanEncryptedText(detailModalBooking.address) || 'On-site breakdown location provided'}
                  </p>
                  {formatCoordinates(detailModalBooking.latitude, detailModalBooking.longitude) && (
                    <p className="text-muted font-mono text-[11px] mt-0.5">
                      Coordinates: {formatCoordinates(detailModalBooking.latitude, detailModalBooking.longitude)}
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
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2.5 text-xs font-black text-black uppercase tracking-wider shadow-md hover:opacity-90 transition-all"
                  >
                    <Navigation size={15} />
                    <span>Open Customer Location in Google Maps</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-[var(--border-subtle)] bg-foreground/5 p-4">
              <button
                type="button"
                onClick={() => setDetailModalBooking(null)}
                className="rounded-xl bg-foreground/10 px-5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-foreground/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: STATUS CHANGE NOTES MODAL */}
      {statusChangeTarget && (
        <div
          onClick={() => setStatusChangeTarget(null)}
          className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="text-foreground relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black">Confirm Status Update</h3>
              <button
                type="button"
                onClick={() => setStatusChangeTarget(null)}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to update Booking #{statusChangeTarget.bookingId} status to{' '}
              <strong className="text-foreground uppercase">{statusChangeTarget.newStatus.replace('_', ' ')}</strong>?
            </p>

            <div className="space-y-1 text-xs">
              <label className="text-muted block font-bold">
                Workshop Notes / Resolution Reason (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Tractor inspected, parts ordered, or ready for customer delivery..."
                value={statusChangeTarget.notes}
                onChange={(e) =>
                  setStatusChangeTarget({ ...statusChangeTarget, notes: e.target.value })
                }
                className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] p-3 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-subtle)]">
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
                className="rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-black uppercase shadow-md transition-all hover:opacity-90 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE NEW SERVICE BOOKING MODAL */}
      {isCreateModalOpen && (
        <div
          onClick={() => setIsCreateModalOpen(false)}
          className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="text-foreground relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl max-h-[90vh]"
          >
            <div className="bg-foreground/5 flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
                  <Wrench size={22} />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-black tracking-tight">
                    Book New Service Job
                  </h3>
                  <p className="text-muted text-xs font-medium">
                    Record a maintenance or repair request for a customer tractor.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit} className="space-y-4 p-6 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted block font-bold">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
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
                    placeholder="e.g. Mahindra, Swaraj"
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
                    placeholder="e.g. 575 DI, 744 FE"
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
                    <option value="general_maintenance" className="bg-[var(--background)]">General Maintenance</option>
                    <option value="oil_change" className="bg-[var(--background)]">Oil & Filter Change</option>
                    <option value="engine_overhaul" className="bg-[var(--background)]">Engine Overhaul</option>
                    <option value="tyre_fitting" className="bg-[var(--background)]">Tyre Fitting & Alignment</option>
                    <option value="hydraulics_repair" className="bg-[var(--background)]">Hydraulics Repair</option>
                    <option value="spare_parts" className="bg-[var(--background)]">Spare Parts Replacement</option>
                    <option value="body_work" className="bg-[var(--background)]">Body Work & Paint</option>
                    <option value="electrical" className="bg-[var(--background)]">Electrical System Repair</option>
                    <option value="transmission_repair" className="bg-[var(--background)]">Transmission Repair</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted block font-bold">Preferred Service Date *</label>
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
                <label className="text-muted block font-bold">Customer Breakdown / Service Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Village Farm, Taluka, District, State or PIN"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">
                  Problem Description / Scope of Work *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the tractor problem, repair scope, or parts needed..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] p-3 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Internal Workshop Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Assigned to senior mechanic, field visit scheduled"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
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
                  className="rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black tracking-wider text-black uppercase shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
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
