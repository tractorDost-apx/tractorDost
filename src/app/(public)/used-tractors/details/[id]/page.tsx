'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Clock,
  User as UserIcon,
  Phone,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Wrench,
  AlertCircle,
  Share2,
  Heart,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
  Zap,
  Cpu,
  Layers,
  Fuel,
  Gauge,
  CircleDollarSign,
  FileCheck,
  Sparkles,
  Store,
  MessageCircle,
  Loader2,
  Compass,
} from 'lucide-react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import { formatINR } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import { TractorLoader } from '@/components/ui/TractorLoader';

type SpecTab = 'all' | 'non-technical' | 'technical';

export default function UsedTractorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = React.use(params);
  const [tractor, setTractor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<SpecTab>('all');

  // Enquiry Form State
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    mobile: '',
    offerPrice: '',
    message: '',
    longitude: null as number | null,
    latitude: null as number | null,
    city: '',
    state: '',
    country: '',
    pincode: '',
    zone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  useEffect(() => {
    usedTractorListingAPI.getListingById(unwrappedParams.id).then((res) => {
      if (res.success && res.data) {
        setTractor(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [unwrappedParams.id]);

  const getLocationAsync = async (): Promise<{ latitude: number | null; longitude: number | null; city: string; state: string; country: string; pincode: string; zone: string }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported');
        resolve({ latitude: null, longitude: null, city: '', state: '', country: '', pincode: '', zone: '' });
        return;
      }

      // Increased timeout to 10 seconds for geolocation
      const timeout = setTimeout(() => {
        console.warn('Geolocation timeout - resolving with null');
        resolve({ latitude: null, longitude: null, city: '', state: '', country: '', pincode: '', zone: '' });
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeout);
          const { latitude, longitude } = position.coords;
          console.log('Location captured:', latitude, longitude);

          try {
            // Try reverse geocoding with longer timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for geocoding

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { signal: controller.signal }
            );

            clearTimeout(timeoutId);
            const data = await response.json();
            const addressData = data.address || {};

            console.log('Address data:', addressData);

            resolve({
              latitude,
              longitude,
              city: addressData.city || addressData.town || addressData.village || '',
              state: addressData.state || '',
              country: addressData.country || '',
              pincode: addressData.postcode || '',
              zone: addressData.region || '',
            });
          } catch (err) {
            console.warn('Reverse geocoding error:', err);
            // Still send coordinates even if geocoding fails
            resolve({
              latitude,
              longitude,
              city: '',
              state: '',
              country: '',
              pincode: '',
              zone: '',
            });
          }
        },
        (error) => {
          clearTimeout(timeout);
          let errorMsg = 'Unknown geolocation error';
          if (error.code === 1) errorMsg = 'Permission denied';
          else if (error.code === 2) errorMsg = 'Position unavailable';
          else if (error.code === 3) errorMsg = 'Geolocation timeout';

          console.warn('Geolocation error:', errorMsg, error.code);
          resolve({ latitude: null, longitude: null, city: '', state: '', country: '', pincode: '', zone: '' });
        },
        {
          enableHighAccuracy: false, // Disable high accuracy to speed up
          timeout: 10000, // 10 second timeout
          maximumAge: 0, // Don't use cached position
        }
      );
    });
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tractor) return;

    setIsSubmitting(true);
    setEnquiryError(null);

    const cleanMobile = enquiryForm.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setEnquiryError('Please enter a valid 10-digit mobile number.');
      setIsSubmitting(false);
      return;
    }

    const messageParts = [
      enquiryForm.message.trim() || `I am interested in this ${tractor.tractorBrand} ${tractor.tractorModel}.`,
      enquiryForm.offerPrice ? `Buyer's price offer: ₹${enquiryForm.offerPrice}` : '',
    ].filter(Boolean);

    try {
      // Attempt to get user's location (will not block submission if GPS is off)
      console.log('Starting geolocation capture...');
      const locationData = await getLocationAsync();
      console.log('Location data received:', locationData);

      const res = await usedTractorEnquiryAPI.createEnquiry({
        listingId: tractor.id,
        name: enquiryForm.name.trim(),
        mobile: cleanMobile,
        message: messageParts.join('\n'),
        ...(locationData.longitude && { longitude: locationData.longitude }),
        ...(locationData.latitude && { latitude: locationData.latitude }),
        ...(locationData.city && { city: locationData.city }),
        ...(locationData.state && { state: locationData.state }),
        ...(locationData.country && { country: locationData.country }),
        ...(locationData.pincode && { pincode: locationData.pincode }),
        ...(locationData.zone && { zone: locationData.zone }),
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setEnquiryError(res.message || 'Failed to submit enquiry.');
      }
    } catch (err: any) {
      setEnquiryError('Network error. Unable to submit enquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <TractorLoader className="text-[var(--color-brand-green)]" size={64} />
      </div>
    );
  }

  if (!tractor) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-3xl font-black">Tractor Not Found</h1>
        <p className="text-muted text-sm mb-6">This used tractor listing may have been sold or removed.</p>
        <Link
          href="/used-tractors"
          className="bg-[var(--color-brand-green)] text-black rounded-xl px-6 py-2.5 font-bold text-sm"
        >
          Explore Other Used Tractors
        </Link>
      </div>
    );
  }

  const formatOrdinal = (val: number | undefined) => {
    if (!val || val === 1) return '1st';
    if (val === 2) return '2nd';
    if (val === 3) return '3rd';
    return `${val}th`;
  };

  const mediaList = tractor.media || [];
  const activeMediaUrl = mediaList[activeImage]?.url || null;
  const fullTitle = `${tractor.yearOfManufacture} ${tractor.tractorBrand} ${tractor.tractorModel}`;
  const spec = tractor.tractor?.spec || {};
  const catalogTractor = tractor.tractor || {};

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="mx-auto mb-6 max-w-7xl px-4">
        <div className="text-muted flex items-center text-xs sm:text-sm font-medium">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight size={14} className="mx-2" />
          <Link href="/used-tractors" className="hover:text-foreground">
            Used Tractors
          </Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-foreground font-bold truncate max-w-[200px] sm:max-w-none">
            {tractor.tractorBrand} {tractor.tractorModel}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-12">
        {/* LEFT COLUMN: Media & Detailed Specs */}
        <div className="space-y-8 lg:col-span-8">
          {/* Main Media Gallery */}
          <div className="bg-foreground/5 overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)]">
            <div className="group relative flex aspect-[16/10] items-center justify-center bg-black">
              {tractor.isCertified && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-[var(--color-brand-green)] px-3 py-1.5 text-xs font-black tracking-widest text-black uppercase shadow-lg">
                  <ShieldCheck size={14} /> Certified
                </div>
              )}
              {activeMediaUrl ? (
                <img
                  src={activeMediaUrl}
                  alt={fullTitle}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted">
                  <ImageIcon size={48} className="stroke-[1.5]" />
                  <span className="mt-2 text-xs font-medium">No Image Available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {mediaList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-4 custom-scrollbar">
                {mediaList.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      activeImage === idx
                        ? 'border-[var(--color-brand-green)] ring-2 ring-[var(--color-brand-green)]/20'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Overview Title & Key Highlights Card */}
          <div className="bg-foreground/[0.03] rounded-[2rem] border border-[var(--border-subtle)] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                  {fullTitle}
                </h1>
                <div className="text-muted mt-2 flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <MapPin size={15} className="text-[var(--color-brand-green)]" />
                  <span>
                    {tractor.villageCity ? `${tractor.villageCity}, ` : ''}
                    {tractor.district}, {tractor.state}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {tractor.negotiable && (
                  <span className="rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                    Negotiable
                  </span>
                )}
                {tractor.financeAvailable && (
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">
                    Loan Available
                  </span>
                )}
              </div>
            </div>

            {/* Key 4 Highlights */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="bg-background rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                <Calendar className="mx-auto mb-1.5 text-[var(--color-brand-green)]" size={22} />
                <p className="text-muted text-[10px] font-bold uppercase tracking-wider">Mfg Year</p>
                <p className="text-base sm:text-lg font-black text-foreground">{tractor.yearOfManufacture}</p>
              </div>
              <div className="bg-background rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                <Clock className="mx-auto mb-1.5 text-[var(--color-brand-green)]" size={22} />
                <p className="text-muted text-[10px] font-bold uppercase tracking-wider">Hours Run</p>
                <p className="text-base sm:text-lg font-black text-foreground">{tractor.hoursUsed ? `${tractor.hoursUsed} hrs` : 'N/A'}</p>
              </div>
              <div className="bg-background rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                <UserIcon className="mx-auto mb-1.5 text-[var(--color-brand-green)]" size={22} />
                <p className="text-muted text-[10px] font-bold uppercase tracking-wider">Ownership</p>
                <p className="text-base sm:text-lg font-black text-foreground">{formatOrdinal(tractor.ownership)} Owner</p>
              </div>
              <div className="bg-background rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                <Wrench className="mx-auto mb-1.5 text-[var(--color-brand-green)]" size={22} />
                <p className="text-muted text-[10px] font-bold uppercase tracking-wider">Condition</p>
                <p className="text-base sm:text-lg font-black text-foreground">{tractor.conditionGrade || 'Good'}</p>
              </div>
            </div>
          </div>

          {/* SPECIFICATION TABS CONTROLLER */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <h2 className="text-2xl font-black text-foreground">Tractor Specifications</h2>
              
              <div className="flex gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === 'all'
                      ? 'bg-[var(--color-brand-green)] text-black shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  All Specs
                </button>
                <button
                  onClick={() => setActiveTab('non-technical')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === 'non-technical'
                      ? 'bg-[var(--color-brand-green)] text-black shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Non-Technical
                </button>
                <button
                  onClick={() => setActiveTab('technical')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === 'technical'
                      ? 'bg-[var(--color-brand-green)] text-black shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Technical
                </button>
              </div>
            </div>

            {/* 1. NON-TECHNICAL SPECIFICATIONS SECTION */}
            {(activeTab === 'all' || activeTab === 'non-technical') && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                    <FileCheck size={16} />
                  </span>
                  <h3 className="text-lg font-black text-foreground">
                    Non-Technical & Operational Details
                  </h3>
                </div>

                {/* Grid of Non-Technical Parameters */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Provenance & Usage */}
                  <div className="bg-foreground/[0.02] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)]">
                      Usage & Ownership
                    </h4>
                    <ul className="space-y-2.5 text-xs">
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Manufacturing Year</span>
                        <span className="text-foreground font-black">{tractor.yearOfManufacture}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Number of Owners</span>
                        <span className="text-foreground font-black">{formatOrdinal(tractor.ownership)} Hand</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Hours Run on Meter</span>
                        <span className="text-foreground font-black">{tractor.hoursUsed ? `${tractor.hoursUsed} Hours` : 'N/A'}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Selling Urgency</span>
                        <span className="text-foreground font-black">{tractor.urgency?.replace('_', ' ') || 'Normal'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted font-semibold">Listing Verification</span>
                        <span className="text-foreground font-black text-lime-400 flex items-center gap-1">
                          <CheckCircle2 size={13} /> {tractor.isCertified ? 'Dealer Certified' : 'Verified'}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Documents & Legal Clearances */}
                  <div className="bg-foreground/[0.02] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)]">
                      Documents & Paperwork
                    </h4>
                    <ul className="space-y-2.5 text-xs">
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Registration (RC Book)</span>
                        <span className="text-foreground font-black">
                          {tractor.rcAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Insurance Validity</span>
                        <span className="text-foreground font-black">
                          {tractor.insuranceValidity ? formatDate(tractor.insuranceValidity) : 'Expired / None'}
                        </span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Loan / Hypothecation</span>
                        <span className="text-foreground font-black">{tractor.loanClearanceStatus ?? 'CLEAR'}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Finance Assistance</span>
                        <span className="text-foreground font-black">
                          {tractor.financeAvailable ? 'Available at Dealership' : 'Self Arranged'}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted font-semibold">RTO Location</span>
                        <span className="text-foreground font-black">{tractor.district}, {tractor.state}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Condition & Inspection Breakdown */}
                <div className="bg-foreground/[0.02] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)] flex items-center gap-1.5">
                    <Wrench size={14} /> Physical Condition Assessment
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3.5">
                      <span className="text-muted text-[10px] font-bold block">Engine Health</span>
                      <span className="text-foreground font-black text-sm block mt-0.5">
                        {tractor.engineConditionPct ? `${tractor.engineConditionPct}%` : 'Good'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3.5">
                      <span className="text-muted text-[10px] font-bold block">Tyres Grip</span>
                      <span className="text-foreground font-black text-sm block mt-0.5">{tractor.tyreCondition || 'Good'}</span>
                    </div>
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3.5">
                      <span className="text-muted text-[10px] font-bold block">Hydraulics</span>
                      <span className="text-foreground font-black text-sm block mt-0.5">{tractor.hydraulicsCondition || 'Good'}</span>
                    </div>
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3.5">
                      <span className="text-muted text-[10px] font-bold block">Clutch & Gear</span>
                      <span className="text-foreground font-black text-sm block mt-0.5">{tractor.clutchCondition || 'Good'}</span>
                    </div>
                  </div>
                </div>

                {/* Seller Description & Declared Repairs */}
                {tractor.description && (
                  <div className="bg-foreground/[0.02] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted">
                      Seller Highlights & Remarks
                    </h4>
                    <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line font-medium">
                      {tractor.description}
                    </p>
                  </div>
                )}

                {tractor.majorRepairs && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300 space-y-1">
                    <span className="font-black uppercase tracking-wider block">Declared Repair / Service History:</span>
                    <p className="font-medium">{tractor.majorRepairs}</p>
                  </div>
                )}
              </div>
            )}

            {/* 2. TECHNICAL SPECIFICATIONS SECTION */}
            {(activeTab === 'all' || activeTab === 'technical') && (
              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                    <Cpu size={16} />
                  </span>
                  <h3 className="text-lg font-black text-foreground">
                    Technical Specifications & Machinery
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Engine Specs */}
                  <div className="bg-foreground/[0.02] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)] flex items-center gap-1.5">
                      <Zap size={14} /> Engine & Power
                    </h4>
                    <ul className="space-y-2.5 text-xs">
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Horsepower (HP)</span>
                        <span className="text-foreground font-black">{catalogTractor.hp ? `${catalogTractor.hp} HP` : '45 - 55 HP Range'}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Engine Displacement</span>
                        <span className="text-foreground font-black">{spec.engineCc ? `${spec.engineCc} CC` : 'High Torque Diesel Engine'}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Number of Cylinders</span>
                        <span className="text-foreground font-black">{spec.cylinders ? `${spec.cylinders} Cylinders` : '3 - 4 Cylinders'}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Engine Rated RPM</span>
                        <span className="text-foreground font-black">{spec.ratedRpm ? `${spec.ratedRpm} RPM` : '2000 - 2200 RPM'}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Cooling System</span>
                        <span className="text-foreground font-black">{spec.coolingType?.replace('_', ' ') || 'Water Cooled'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted font-semibold">Max Torque</span>
                        <span className="text-foreground font-black">{spec.maxTorqueNm ? `${spec.maxTorqueNm} Nm` : 'Optimal Field Torque'}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Transmission Specs */}
                  <div className="bg-foreground/[0.02] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)] flex items-center gap-1.5">
                      <Gauge size={14} /> Transmission & PTO
                    </h4>
                    <ul className="space-y-2.5 text-xs">
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Gearbox Type</span>
                        <span className="text-foreground font-black">{spec.gearboxType || 'Constant Mesh / Partial Synchro'}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Gears (Fwd + Rev)</span>
                        <span className="text-foreground font-black">
                          {spec.forwardGears ? `${spec.forwardGears} Forward + ${spec.reverseGears || 2} Reverse` : '8 Forward + 2 Reverse'}
                        </span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Clutch Type</span>
                        <span className="text-foreground font-black">{spec.clutchType || 'Single / Dual Clutch'}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">PTO Power</span>
                        <span className="text-foreground font-black">{spec.ptoHp ? `${spec.ptoHp} HP` : 'Direct Drive PTO'}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">PTO RPM</span>
                        <span className="text-foreground font-black">{spec.ptoRpmOptions || '540 RPM @ Standard Engine RPM'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted font-semibold">Drive Type</span>
                        <span className="text-foreground font-black">{catalogTractor.driveType?.replace('_', '') || '2WD'}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Hydraulics & Brakes */}
                  <div className="bg-foreground/[0.02] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)] flex items-center gap-1.5">
                      <Layers size={14} /> Hydraulics & Brakes
                    </h4>
                    <ul className="space-y-2.5 text-xs">
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Lifting Capacity</span>
                        <span className="text-foreground font-black">
                          {spec.liftingCapacityKg ? `${spec.liftingCapacityKg} KG` : '1500 - 2000 KG'}
                        </span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">3-Point Linkage</span>
                        <span className="text-foreground font-black">{spec.linkageCategory || 'Category-II (ADDC)'}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Brake System</span>
                        <span className="text-foreground font-black">{spec.brakeType || 'Oil Immersed Disc Brakes (OIB)'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted font-semibold">Steering Type</span>
                        <span className="text-foreground font-black">{spec.steeringType || 'Power Steering / Mechanical'}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Dimensions & Capacity */}
                  <div className="bg-foreground/[0.02] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)] flex items-center gap-1.5">
                      <Fuel size={14} /> Fuel & Dimensions
                    </h4>
                    <ul className="space-y-2.5 text-xs">
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Fuel Tank Capacity</span>
                        <span className="text-foreground font-black">
                          {spec.fuelTankCapacityL ? `${spec.fuelTankCapacityL} Litres` : '50 - 65 Litres'}
                        </span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Front Tyre Size</span>
                        <span className="text-foreground font-black">{spec.frontTyreSize || '6.00 x 16'}</span>
                      </li>
                      <li className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-1.5">
                        <span className="text-muted font-semibold">Rear Tyre Size</span>
                        <span className="text-foreground font-black">{spec.rearTyreSize || '13.6 x 28 / 14.9 x 28'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted font-semibold">Total Tractor Weight</span>
                        <span className="text-foreground font-black">
                          {spec.totalWeightKg ? `${spec.totalWeightKg} KG` : 'Heavy Duty Chassis'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Price Card & Inquiry Form */}
        <div className="relative lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            {/* Pricing Box */}
            <div className="bg-foreground text-background relative overflow-hidden rounded-[2rem] p-6 sm:p-8 shadow-2xl">
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-[var(--color-brand-green)] opacity-20 blur-[50px]"></div>

              <div className="mb-2">
                <span className="text-background/60 text-xs font-bold tracking-widest uppercase">
                  Asking Price
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <h2 className="text-3xl sm:text-4xl font-black">{formatINR(tractor.askingPrice)}</h2>
                  {tractor.negotiable && (
                    <span className="rounded-md bg-foreground/10 px-2 py-0.5 text-[10px] font-black tracking-wider uppercase">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>

              {tractor.estimatedMarketPrice && (
                <div className="border-background/10 mt-4 flex items-center gap-3 border-t pt-4">
                  <TrendingUp size={18} className="text-[var(--color-brand-green)]" />
                  <div>
                    <p className="text-background/60 text-[11px] font-bold">Estimated Market Value</p>
                    <p className="text-sm font-black">{formatINR(tractor.estimatedMarketPrice)}</p>
                  </div>
                </div>
              )}

              {/* Dealership Yard / Location */}
              <div className="border-background/10 mt-4 border-t pt-4 text-xs">
                <span className="text-background/60 font-semibold block">Dealership Location:</span>
                <p className="font-bold mt-0.5 flex items-center gap-1">
                  <MapPin size={13} className="text-[var(--color-brand-green)] shrink-0" />
                  <span>{tractor.district}, {tractor.state}</span>
                </p>
              </div>
            </div>

            {/* Inquiry / Lead Generation Form */}
            <div className="bg-foreground/[0.03] rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Contact Verified Seller</h3>
                  <p className="text-muted text-[11px]">Instant callback & price negotiation</p>
                </div>
              </div>

              {submitted ? (
                <div className="py-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-3">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-base font-black text-foreground">Inquiry Sent Successfully!</h4>
                  <p className="text-muted text-xs mt-1">
                    The seller has received your details and will call you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnquiry} className="space-y-3.5">
                  {enquiryError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
                      <AlertCircle size={15} />
                      <span>{enquiryError}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-foreground block text-xs font-bold mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      className="bg-background w-full rounded-xl border border-[var(--border-subtle)] px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-foreground block text-xs font-bold mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={enquiryForm.mobile}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, mobile: e.target.value })}
                      className="bg-background w-full rounded-xl border border-[var(--border-subtle)] px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-foreground block text-xs font-bold mb-1">
                      Your Offer Price (₹) <span className="text-muted text-[10px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step={5000}
                      placeholder={`Asking: ${formatINR(tractor.askingPrice)}`}
                      value={enquiryForm.offerPrice}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, offerPrice: e.target.value })}
                      className="bg-background w-full rounded-xl border border-[var(--border-subtle)] px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-foreground block text-xs font-bold mb-1">
                      Message <span className="text-muted text-[10px] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      placeholder="Any specific queries or details..."
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      className="bg-background w-full rounded-xl border border-[var(--border-subtle)] px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[var(--color-brand-green)] hover:opacity-90 text-black flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-black shadow-lg shadow-[var(--color-brand-green)]/20 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Sending & Capturing Location...
                      </>
                    ) : (
                      <>
                        <MessageCircle size={15} /> Submit Buyer Inquiry
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
