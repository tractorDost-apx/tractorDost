'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  Building2,
  MapPin,
  Phone,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Truck,
  Zap,
  Package,
  Star,
  ShieldCheck,
  Send,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { MyReviewAction } from '@/components/reviews/my-review-action';
import { ReviewList } from '@/components/reviews/review-list';
import { serviceCenterAPI, NearbyServiceCenter } from '@/lib/api/serviceCenters';
import { serviceBookingAPI, ServiceBookingItem, CreateServiceBookingPayload } from '@/lib/api/serviceBookings';
import { dealerAPI, Dealer } from '@/lib/api/dealers';
import { formatDate, formatDateTime } from '@/lib/utils/format-date';

const SERVICE_TYPE_OPTIONS = [
  { value: 'general_maintenance', label: 'General Maintenance & Inspection' },
  { value: 'oil_change', label: 'Oil & Filter Change' },
  { value: 'engine_overhaul', label: 'Engine Overhaul & Repair' },
  { value: 'hydraulics_repair', label: 'Hydraulics & Lift Repair' },
  { value: 'transmission_repair', label: 'Transmission & Clutch Service' },
  { value: 'electrical', label: 'Electrical, Starter & Battery' },
  { value: 'tyre_fitting', label: 'Tyre Fitting & Alignment' },
  { value: 'body_work', label: 'Body Work & Paint Repair' },
  { value: 'spare_parts', label: 'Genuine Spare Parts Replacement' },
];

export default function TractorRepairPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'centers' | 'my-bookings'>('centers');

  // Centers & Dealers list state
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [centers, setCenters] = useState<NearbyServiceCenter[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('');

  // Bookings list state
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [myBookings, setMyBookings] = useState<ServiceBookingItem[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Booking Modal State
  const [selectedCenter, setSelectedCenter] = useState<{
    serviceCenterId: number;
    serviceName: string;
    dealerName: string;
    phone?: string;
    address?: string;
    servicesAvailable?: string[];
  } | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  // Read-only reviews viewer for a service center
  const [reviewsCenter, setReviewsCenter] = useState<{ serviceCenterId: number; serviceName: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Min date for booking: at least 2 days ahead to ensure it's safely > 24 hours
  const minBookingDate = useMemo(() => {
    const d = new Date(Date.now() + 36 * 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const customerName = user?.fullName || (user as any)?.name || '';
  const customerMobile = user?.mobile ? String(user.mobile) : (user as any)?.phone || '';

  const [bookingForm, setBookingForm] = useState({
    name: customerName,
    mobile: customerMobile,
    tractorBrand: '',
    tractorModel: '',
    serviceType: 'general_maintenance',
    preferredDate: minBookingDate,
    address: '',
    latitude: 18.5204,
    longitude: 73.8567,
    description: '',
    notes: '',
  });

  // Pre-fill user info when user context updates
  useEffect(() => {
    if (user) {
      const name = user.fullName || (user as any).name || '';
      const mobile = user.mobile ? String(user.mobile) : (user as any).phone || '';
      setBookingForm((prev) => ({
        ...prev,
        name: prev.name || name,
        mobile: prev.mobile || mobile,
      }));
    }
  }, [user]);

  // Helper to fetch live GPS coordinates silently upon submission
  const getLiveCoordinates = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        resolve({
          latitude: bookingForm.latitude || 18.5204,
          longitude: bookingForm.longitude || 73.8567,
        });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
          });
        },
        (err) => {
          console.warn('Geolocation unavailable, using default fallback coordinates:', err);
          resolve({
            latitude: bookingForm.latitude || 18.5204,
            longitude: bookingForm.longitude || 73.8567,
          });
        },
        { timeout: 4000, enableHighAccuracy: true, maximumAge: 60000 }
      );
    });
  };

  // Load Centers & Dealers
  const loadCentersAndDealers = async () => {
    try {
      setLoadingCenters(true);
      const [nearbyRes, dealersRes] = await Promise.allSettled([
        serviceCenterAPI.getNearbyServiceCenters({
          latitude: 18.5204,
          longitude: 73.8567,
          radius: 1000,
          limit: 50,
        }),
        dealerAPI.getAllDealers({ limit: 50, sortBy: 'positive_reviews' }),
      ]);

      let loadedCenters: NearbyServiceCenter[] = [];
      if (nearbyRes.status === 'fulfilled' && nearbyRes.value.success) {
        loadedCenters = nearbyRes.value.data.serviceCenters || [];
      }

      setCenters(loadedCenters);

      if (dealersRes.status === 'fulfilled' && dealersRes.value.success) {
        setDealers(dealersRes.value.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load service centers:', err);
    } finally {
      setLoadingCenters(false);
    }
  };

  // Load My Bookings
  const loadMyBookings = async () => {
    try {
      setLoadingBookings(true);
      setBookingError(null);
      const res = await serviceBookingAPI.getMyBookings({ limit: 50 });
      if (res.success && res.data) {
        setMyBookings(res.data.bookings || []);
      }
    } catch (err: any) {
      console.error('Failed to load my service bookings:', err);
      setBookingError(err?.response?.data?.message || 'Failed to load your service bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadCentersAndDealers();
    loadMyBookings();
  }, []);

  // Filter service centers
  const filteredCenters = useMemo(() => {
    return centers.filter((center) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        center.serviceName.toLowerCase().includes(q) ||
        center.dealerName.toLowerCase().includes(q) ||
        center.district.toLowerCase().includes(q) ||
        center.state.toLowerCase().includes(q) ||
        center.supportedBrands.some((b) => b.toLowerCase().includes(q));

      const matchesService =
        !selectedServiceFilter ||
        (Array.isArray(center.servicesAvailable) &&
          center.servicesAvailable.includes(selectedServiceFilter));

      return matchesSearch && matchesService;
    });
  }, [centers, searchQuery, selectedServiceFilter]);

  // Sort and filter dealers by number of positive reviews in descending order
  const sortedDealers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = dealers.filter((d) => {
      if (!q) return true;
      return (
        d.businessName?.toLowerCase().includes(q) ||
        d.district?.toLowerCase().includes(q) ||
        d.state?.toLowerCase().includes(q) ||
        d.dealerType?.toLowerCase().includes(q) ||
        d.phone?.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const aPos = Number(a.positiveReviewsCount ?? 0);
      const bPos = Number(b.positiveReviewsCount ?? 0);
      if (bPos !== aPos) return bPos - aPos;

      const aRating = Number(a.rating) || 0;
      const bRating = Number(b.rating) || 0;
      if (bRating !== aRating) return bRating - aRating;

      const aCount = Number(a.reviewsCount) || 0;
      const bCount = Number(b.reviewsCount) || 0;
      if (bCount !== aCount) return bCount - aCount;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [dealers, searchQuery]);

  // Handle opening booking modal for a center or dealer
  const handleOpenBooking = async (centerItem?: NearbyServiceCenter, dealerItem?: Dealer) => {
    setFormError(null);
    setFormSuccess(null);

    const name = user?.fullName || (user as any)?.name || '';
    const mobile = user?.mobile ? String(user.mobile) : (user as any)?.phone || '';

    if (centerItem) {
      const availableServices =
        Array.isArray(centerItem.servicesAvailable) && centerItem.servicesAvailable.length > 0
          ? centerItem.servicesAvailable
          : SERVICE_TYPE_OPTIONS.map((o) => o.value);

      setSelectedCenter({
        serviceCenterId: Number(centerItem.serviceCenterId),
        serviceName: centerItem.serviceName,
        dealerName: centerItem.dealerName,
        phone: centerItem.phone,
        address: `${centerItem.district}, ${centerItem.state}`,
        servicesAvailable: availableServices,
      });

      setBookingForm((prev) => ({
        ...prev,
        name: prev.name || name,
        mobile: prev.mobile || mobile,
        preferredDate: prev.preferredDate || minBookingDate,
        serviceType: availableServices.includes(prev.serviceType)
          ? prev.serviceType
          : availableServices[0] || 'general_maintenance',
      }));
    } else if (dealerItem) {
      try {
        // Fetch dealer's service center
        const scRes = await serviceCenterAPI.getServiceCenterByDealer(dealerItem.id);
        if (scRes.success && scRes.data) {
          const scId = Number((scRes.data as any).serviceCenterId || scRes.data.id);
          if (!scId || isNaN(scId)) {
            setFormError('This dealership does not have an active workshop ID configured yet.');
            return;
          }

          const availableServices =
            Array.isArray(scRes.data.servicesAvailable) && scRes.data.servicesAvailable.length > 0
              ? scRes.data.servicesAvailable
              : SERVICE_TYPE_OPTIONS.map((o) => o.value);

          setSelectedCenter({
            serviceCenterId: scId,
            serviceName: scRes.data.serviceName,
            dealerName: dealerItem.businessName,
            phone: scRes.data.phone || dealerItem.phone || '',
            address: `${dealerItem.district}, ${dealerItem.state}`,
            servicesAvailable: availableServices,
          });

          setBookingForm((prev) => ({
            ...prev,
            name: prev.name || name,
            mobile: prev.mobile || mobile,
            preferredDate: prev.preferredDate || minBookingDate,
            serviceType: availableServices.includes(prev.serviceType)
              ? prev.serviceType
              : availableServices[0] || 'general_maintenance',
          }));
        } else {
          setFormError('This dealership has not configured an active service center workshop yet.');
          return;
        }
      } catch (err: any) {
        setFormError('Unable to load service center details for this dealer.');
        return;
      }
    }
  };

  // Submit Booking
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter || !selectedCenter.serviceCenterId) {
      setFormError('Invalid or unassigned service center workshop');
      return;
    }

    setFormError(null);
    setFormSuccess(null);

    const name = bookingForm.name.trim();
    if (!name || name.length < 3) {
      setFormError('Please enter your full name (at least 3 characters)');
      return;
    }

    // Normalize mobile: remove non-digits
    let cleanMobile = bookingForm.mobile.replace(/\D/g, '');
    if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
      cleanMobile = cleanMobile.slice(2);
    }
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      return;
    }

    if (!bookingForm.tractorBrand.trim() || bookingForm.tractorBrand.trim().length < 2) {
      setFormError('Please enter the tractor brand name (e.g. Mahindra, Swaraj, John Deere)');
      return;
    }

    if (!bookingForm.tractorModel.trim() || bookingForm.tractorModel.trim().length < 1) {
      setFormError('Please enter the tractor model (e.g. 575 DI, 744 FE)');
      return;
    }

    if (!bookingForm.address.trim() || bookingForm.address.trim().length < 3) {
      setFormError('Please enter the tractor breakdown / service location address');
      return;
    }

    if (!bookingForm.description.trim() || bookingForm.description.trim().length < 5) {
      setFormError('Please provide a brief problem description (at least 5 characters)');
      return;
    }

    // Parse preferredDate robustly
    let scheduledDate = new Date();
    if (bookingForm.preferredDate) {
      const parts = bookingForm.preferredDate.split('-');
      if (parts.length === 3) {
        let y = Number(parts[0]);
        let m = Number(parts[1]) - 1;
        let d = Number(parts[2]);
        if (parts[2].length === 4) {
          y = Number(parts[2]);
          m = Number(parts[1]) - 1;
          d = Number(parts[0]);
        }
        scheduledDate = new Date(y, m, d, 10, 0, 0);
      } else {
        scheduledDate = new Date(bookingForm.preferredDate);
      }
    }
    if (isNaN(scheduledDate.getTime()) || scheduledDate.getTime() < Date.now()) {
      scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    try {
      setSubmittingBooking(true);

      // Silently capture live GPS coordinates upon submit
      const liveCoords = await getLiveCoordinates();

      const payload: CreateServiceBookingPayload = {
        name: name,
        mobile: cleanMobile,
        tractorBrand: bookingForm.tractorBrand.trim(),
        tractorModel: bookingForm.tractorModel.trim(),
        serviceType: bookingForm.serviceType,
        description: bookingForm.description.trim(),
        preferredDate: scheduledDate.toISOString(),
        address: bookingForm.address.trim(),
        latitude: liveCoords.latitude,
        longitude: liveCoords.longitude,
        notes: bookingForm.notes.trim() || undefined,
      };

      const res = await serviceBookingAPI.createBooking(selectedCenter.serviceCenterId, payload);

      if (res.success) {
        setFormSuccess('Tractor repair request submitted successfully!');
        loadMyBookings();
        setTimeout(() => {
          setSelectedCenter(null);
          setFormSuccess(null);
          setActiveTab('my-bookings');
        }, 1200);
      } else {
        setFormError(res.message || 'Failed to submit repair request');
      }
    } catch (err: any) {
      console.error('Error booking service:', err);
      const apiIssues = err?.response?.data?.error;
      const issueMsg = Array.isArray(apiIssues)
        ? apiIssues.map((i: any) => i.message).join(', ')
        : null;
      const errMsg =
        issueMsg ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit repair request';
      setFormError(errMsg);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
            <Clock size={12} /> Scheduled
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
            <Wrench size={12} className="animate-spin" /> In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400">
            <X size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1 text-xs font-bold text-muted">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-col pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-3 text-3xl font-black tracking-tight">
            <div className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
              <Wrench size={26} />
            </div>
            Tractor Repair & Service
          </h1>
          <p className="text-muted mt-1 text-sm font-medium">
            Book certified tractor repair, scheduled maintenance, and breakdown support with authorized dealers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-1.5">
          <button
            onClick={() => setActiveTab('centers')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'centers'
                ? 'bg-[var(--color-brand-green)] text-black shadow-lg shadow-[var(--color-brand-green)]/20'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Building2 size={14} /> Find Service Centers
          </button>
          <button
            onClick={() => {
              setActiveTab('my-bookings');
              loadMyBookings();
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'my-bookings'
                ? 'bg-[var(--color-brand-green)] text-black shadow-lg shadow-[var(--color-brand-green)]/20'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Calendar size={14} />
            <span>My Repair Requests</span>
            {myBookings.length > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                  activeTab === 'my-bookings' ? 'bg-black text-[var(--color-brand-green)]' : 'bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)]'
                }`}
              >
                {myBookings.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: FIND SERVICE CENTERS & DEALERS */}
      {activeTab === 'centers' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="glass-panel grid grid-cols-1 gap-4 rounded-3xl  p-5 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search
                size={18}
                className="text-muted pointer-events-none absolute top-3.5 left-4"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by dealership, workshop name, district, state, or brand..."
                className="text-foreground w-full rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 py-3 pr-4 pl-11 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={selectedServiceFilter}
                onChange={(e) => setSelectedServiceFilter(e.target.value)}
                className="text-foreground w-full rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-3 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
              >
                <option value="" className="bg-foreground/5">All Repair & Service Types</option>
                {SERVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-foreground/5">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Centers Grid */}
          {loadingCenters ? (
            <div className="flex flex-1 items-center justify-center py-24">
              <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={36} />
            </div>
          ) : filteredCenters.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredCenters.map((center) => (
                <div
                  key={center.serviceCenterId}
                  className="glass-panel group flex flex-col justify-between rounded-3xl  p-6 transition-all duration-300 hover:border-[var(--color-brand-green)]/30 hover:shadow-2xl hover:shadow-[var(--color-brand-green)]/5"
                >
                  <div className="space-y-4">
                    {/* Header: Title & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-foreground text-base font-black tracking-tight transition-colors group-hover:text-[var(--color-brand-green)]">
                          {center.serviceName}
                        </h3>
                        <p className="text-muted mt-0.5 text-xs font-bold">
                          By <span className="text-foreground">{center.dealerName}</span>
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 rounded-xl border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-400">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {center.rating ? Number(center.rating).toFixed(1) : 'New'}
                      </span>
                    </div>

                    {/* Location & Contact */}
                    <div className="space-y-1.5 text-xs">
                      <div className="text-foreground/90 flex items-center gap-2 font-bold">
                        <MapPin size={14} className="shrink-0 text-[var(--color-brand-green)]" />
                        <span>{center.district}, {center.state}</span>
                        {center.distanceKm && (
                          <span className="text-muted text-[10px] font-medium">
                            ({center.distanceKm} km away)
                          </span>
                        )}
                      </div>
                      {center.phone && (
                        <div className="text-muted flex items-center gap-2 font-medium">
                          <Phone size={13} className="shrink-0" />
                          <span>{center.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {center.hasPickupService && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand-green)]">
                          <Truck size={10} /> Pickup & Drop
                        </span>
                      )}
                      {center.hasEmergencySupport && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          <Zap size={10} /> Emergency Support
                        </span>
                      )}
                      {center.is24x7 && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                          <Clock size={10} /> 24x7 Open
                        </span>
                      )}
                    </div>

                    {/* Supported Brands */}
                    {center.supportedBrands && center.supportedBrands.length > 0 && (
                      <div className="border-t border-[var(--border-subtle)] pt-3">
                        <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                          Supported Brands:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {center.supportedBrands.map((b, idx) => (
                            <span
                              key={idx}
                              className="rounded-md border border-[var(--border-subtle)] bg-foreground/5 px-2 py-0.5 text-[10px] font-bold text-foreground/80"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 space-y-2 border-t border-[var(--border-subtle)] pt-4">
                    <button
                      onClick={() => handleOpenBooking(center)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] px-4 py-3 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-[var(--color-brand-green)]/10 transition-all duration-200 hover:opacity-95"
                    >
                      <Wrench size={15} /> Request Repair
                    </button>
                    <button
                      onClick={() => setReviewsCenter({ serviceCenterId: center.serviceCenterId, serviceName: center.serviceName })}
                      className="text-muted hover:text-foreground flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-colors"
                    >
                      <Star size={13} /> View reviews
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Fallback to authorized dealers list if nearby centers are not configured */
            <div className="space-y-4">
              <div className="glass-panel flex flex-col items-center justify-center p-10 text-center">
                <Wrench className="text-muted mb-3" size={36} />
                <h3 className="text-foreground text-base font-bold">
                  Choose from Authorized Dealership Network
                </h3>
                <p className="text-muted mt-1 max-w-md text-xs font-medium">
                  Select an authorized dealer in your area to submit your tractor repair and inspection request.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {sortedDealers.map((dealer) => (
                  <div
                    key={dealer.id}
                    className="glass-panel group flex flex-col justify-between rounded-3xl  p-6 transition-all hover:border-[var(--color-brand-green)]/30"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-foreground text-base font-black tracking-tight group-hover:text-[var(--color-brand-green)]">
                            {dealer.businessName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-muted text-[11px] font-bold">
                              {dealer.dealerType} • Certified
                            </span>
                            {Number((dealer as any).positiveReviewsCount || 0) > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-black text-amber-400">
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                {(dealer as any).positiveReviewsCount} {((dealer as any).positiveReviewsCount === 1) ? 'Positive Review' : 'Positive Reviews'}
                              </span>
                            )}
                          </div>
                        </div>
                        <ShieldCheck size={18} className="text-[var(--color-brand-green)] shrink-0" />
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-foreground/90 flex items-center gap-1.5 font-bold">
                          <MapPin size={13} className="text-[var(--color-brand-green)]" />
                          {dealer.district}, {dealer.state}
                        </div>
                        {dealer.phone && (
                          <div className="text-muted flex items-center gap-1.5">
                            <Phone size={12} />
                            {dealer.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[var(--border-subtle)] pt-4">
                      <button
                        onClick={() => handleOpenBooking(undefined, dealer)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] px-4 py-3 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-[var(--color-brand-green)]/10 transition-all hover:opacity-95"
                      >
                        <Wrench size={15} /> Book Repair Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY REPAIR REQUESTS */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          {loadingBookings ? (
            <div className="flex flex-1 items-center justify-center py-24">
              <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={36} />
            </div>
          ) : bookingError ? (
            <div className="glass-panel p-8 text-center">
              <p className="text-rose-400 mb-4 text-xs font-bold">{bookingError}</p>
              <button
                onClick={loadMyBookings}
                className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2 text-xs font-bold text-white hover:bg-foreground/10"
              >
                Try Again
              </button>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="glass-panel flex flex-col items-center p-12 text-center">
              <Wrench className="text-muted mb-4" size={42} />
              <h3 className="text-foreground text-lg font-bold">No Repair Requests Found</h3>
              <p className="text-muted mt-1 max-w-sm text-xs font-medium">
                You haven&apos;t submitted any tractor repair or service requests yet.
              </p>
              <button
                onClick={() => setActiveTab('centers')}
                className="mt-6 flex items-center gap-2 rounded-2xl bg-[var(--color-brand-green)] px-6 py-3 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-[var(--color-brand-green)]/10 transition-all hover:opacity-90"
              >
                <Sparkles size={14} /> Find Dealers & Book Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((b) => (
                <div
                  key={b.bookingId}
                  className="glass-panel flex flex-col justify-between gap-4 rounded-3xl  p-6 md:flex-row md:items-center"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-foreground text-lg font-black tracking-tight">
                        {b.tractorBrand} {b.tractorModel}
                      </span>
                      <span className="text-muted text-xs font-bold">•</span>
                      <span className="text-[var(--color-brand-green)] text-xs font-bold uppercase">
                        {b.serviceType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                      <span className="text-foreground/90 flex items-center gap-1.5 font-bold">
                        <Building2 size={13} className="text-muted" />
                        {b.serviceCenterName || b.dealerName}
                      </span>
                      <span className="text-muted flex items-center gap-1.5">
                        <Calendar size={13} />
                        Preferred Date: <strong className="text-foreground">{formatDate(b.preferredDate)}</strong>
                      </span>
                      {b.address && (
                        <span className="text-muted flex items-center gap-1.5">
                          <MapPin size={13} className="text-[var(--color-brand-green)]" />
                          <span className="text-foreground/90 font-medium truncate max-w-xs">{b.address}</span>
                        </span>
                      )}
                      <span className="text-muted text-[11px]">
                        Requested: {formatDateTime(b.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(b.status)}
                    {b.status === 'COMPLETED' && b.serviceCenterId && (
                      <MyReviewAction
                        targetType="SERVICE_CENTER"
                        targetId={b.serviceCenterId}
                        targetName={b.serviceCenterName}
                        canRate
                      />
                    )}
                    {b.mapUrl && (
                      <a
                        href={b.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted hover:text-foreground rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-2.5 transition-colors"
                        title="View Location on Google Maps"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: SERVICE CENTER REVIEWS (read-only) */}
      {reviewsCenter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="glass-panel max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground text-lg font-black">{reviewsCenter.serviceName} · Reviews</h2>
              <button onClick={() => setReviewsCenter(null)} className="glass-button p-2" aria-label="Close">
                <X size={14} />
              </button>
            </div>
            <ReviewList
              targetType="SERVICE_CENTER"
              targetId={reviewsCenter.serviceCenterId}
              currentUserId={user?.id}
            />
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT REPAIR REQUEST */}
      {selectedCenter && (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/25 dark:bg-black/80 p-4 backdrop-blur-md sm:p-6">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/5 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
                  <Wrench size={20} />
                </div>
                <div>
                  <h2 className="text-foreground text-lg font-black tracking-tight">
                    Request Tractor Repair
                  </h2>
                  <p className="text-muted text-xs font-bold">
                    {selectedCenter.serviceName} • <span className="text-foreground">{selectedCenter.dealerName}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCenter(null)}
                className="text-muted hover:text-foreground rounded-xl p-2 transition-colors hover:bg-foreground/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitBooking} className="flex-1 space-y-4 overflow-y-auto p-6">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-muted block text-xs font-bold">Your Full Name *</label>
                    {user?.fullName && (
                      <span className="text-[var(--color-brand-green)] text-[10px] font-bold">Auto-filled</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-muted block text-xs font-bold">Mobile Number *</label>
                    {user?.mobile && (
                      <span className="text-[var(--color-brand-green)] text-[10px] font-bold">Auto-filled</span>
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    value={bookingForm.mobile}
                    onChange={(e) => setBookingForm({ ...bookingForm, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted mb-1 block text-xs font-bold">Tractor Brand *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.tractorBrand}
                    onChange={(e) => setBookingForm({ ...bookingForm, tractorBrand: e.target.value })}
                    placeholder="e.g. Mahindra, Swaraj, John Deere"
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted mb-1 block text-xs font-bold">Tractor Model *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.tractorModel}
                    onChange={(e) => setBookingForm({ ...bookingForm, tractorModel: e.target.value })}
                    placeholder="e.g. 575 DI, 744 FE"
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted mb-1 block text-xs font-bold">Service / Repair Category *</label>
                  <select
                    value={bookingForm.serviceType}
                    onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  >
                    {SERVICE_TYPE_OPTIONS.map((opt) => {
                      const isOffered =
                        !selectedCenter?.servicesAvailable ||
                        selectedCenter.servicesAvailable.length === 0 ||
                        selectedCenter.servicesAvailable.includes(opt.value);
                      return (
                        <option key={opt.value} value={opt.value} className="bg-foreground/5">
                          {opt.label} {isOffered ? '' : '(Custom Request)'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-muted mb-1 block text-xs font-bold">Preferred Service Date *</label>
                  <input
                    type="date"
                    required
                    min={minBookingDate}
                    value={bookingForm.preferredDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                {/* MANDATORY BREAKDOWN LOCATION ADDRESS */}
                <div className="sm:col-span-2">
                  <label className="text-muted mb-1 flex items-center gap-1.5 text-xs font-bold">
                    <MapPin size={13} className="text-[var(--color-brand-green)]" />
                    Breakdown / Service Location Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.address}
                    onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                    placeholder="Enter breakdown landmark, farm field, village, district..."
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-muted mb-1 block text-xs font-bold">
                    Problem / Issue Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                    placeholder="Describe the tractor symptoms, breakdown location, or maintenance requirements in detail..."
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-muted mb-1 block text-xs font-bold">Additional Notes (Optional)</label>
                  <input
                    type="text"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="e.g. Please bring towing van / field pickup required"
                    className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-subtle)] bg-foreground/5 p-4">
              <button
                type="button"
                onClick={() => setSelectedCenter(null)}
                disabled={submittingBooking}
                className="text-muted hover:text-foreground rounded-xl px-5 py-2.5 text-xs font-bold transition-colors hover:bg-foreground/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitBooking}
                disabled={submittingBooking}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-[var(--color-brand-green)]/10 transition-all hover:opacity-90 disabled:opacity-50"
              >
                {submittingBooking ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} /> Submit Repair Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
