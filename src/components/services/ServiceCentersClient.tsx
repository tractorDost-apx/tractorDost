'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  X,
  Search,
  Filter,
  ArrowRight,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { serviceCenterAPI, NearbyServiceCenter } from '@/lib/api/serviceCenters';
import { serviceBookingAPI } from '@/lib/api/serviceBookings';
import { leadAPI } from '@/lib/api/leads';
import { TractorLoader } from '@/components/ui/TractorLoader';

const CURATED_SERVICE_CENTERS = [
  {
    serviceCenterId: 101,
    dealerId: 1,
    dealerName: 'Mahindra Krishi Seva Kendra',
    serviceName: 'Mahindra Authorized Super Service Workshop',
    address: 'Old Pune-Bangalore Highway, Near Market Yard, Kolhapur',
    state: 'Maharashtra',
    district: 'Kolhapur',
    phone: '+91 98220 12345',
    emergencyPhone: '+91 98220 12346',
    supportedBrands: ['Mahindra', 'Swaraj'],
    servicesAvailable: ['General Service & Oil Change', 'Hydraulic Pump Overhaul', 'Engine Reboring', 'Mobile Field Van Service', 'Genuine Spares'],
    hasPickupService: true,
    hasEmergencySupport: true,
    is24x7: false,
    distanceKm: 4.2,
    rating: 4.8,
    reviewsCount: 142,
    workingHours: '8:30 AM - 7:30 PM (Mon-Sat)',
    isActive: true,
  },
  {
    serviceCenterId: 102,
    dealerId: 2,
    dealerName: 'Swaraj Kisan Tractor Workshop',
    serviceName: 'Swaraj Authorized Regional Service Center',
    address: 'Plot 45, MIDC Industrial Area, Satara Road, Pune',
    state: 'Maharashtra',
    district: 'Pune',
    phone: '+91 98230 54321',
    emergencyPhone: '+91 98230 54322',
    supportedBrands: ['Swaraj', 'Mahindra'],
    servicesAvailable: ['Fuel Injection Calibration', 'Clutch Plate Replacement', 'Brake Lining Repair', 'Rotavator Servicing', '24x7 Breakdown'],
    hasPickupService: true,
    hasEmergencySupport: true,
    is24x7: true,
    distanceKm: 6.8,
    rating: 4.9,
    reviewsCount: 198,
    workingHours: '24 Hours Emergency Support',
    isActive: true,
  },
  {
    serviceCenterId: 103,
    dealerId: 3,
    dealerName: 'John Deere Farm Hub',
    serviceName: 'John Deere Precision Service Station',
    address: 'GT Road, Near Canal Bridge, Karnal',
    state: 'Haryana',
    district: 'Karnal',
    phone: '+91 98765 43210',
    emergencyPhone: '+91 98765 43211',
    supportedBrands: ['John Deere'],
    servicesAvailable: ['PowerTech Engine Diagnostics', 'Electronic Sensor Calibration', 'AC Cabin Service', 'Transmission Overhaul'],
    hasPickupService: true,
    hasEmergencySupport: true,
    is24x7: false,
    distanceKm: 8.5,
    rating: 4.9,
    reviewsCount: 164,
    workingHours: '9:00 AM - 6:30 PM (Mon-Sat)',
    isActive: true,
  },
  {
    serviceCenterId: 104,
    dealerId: 4,
    dealerName: 'Sonalika ITL Service Care',
    serviceName: 'Sonalika Heavy Duty Care Center',
    address: 'National Highway 44, Ludhiana Bypass, Ludhiana',
    state: 'Punjab',
    district: 'Ludhiana',
    phone: '+91 98140 11223',
    emergencyPhone: '+91 98140 11224',
    supportedBrands: ['Sonalika', 'Solis'],
    servicesAvailable: ['CRDS Common Rail Servicing', 'Heavy Haulage Inspection', 'Free Pre-Harvest Camp', 'Original Oil & Filters'],
    hasPickupService: false,
    hasEmergencySupport: true,
    is24x7: false,
    distanceKm: 11.0,
    rating: 4.7,
    reviewsCount: 110,
    workingHours: '8:00 AM - 7:00 PM',
    isActive: true,
  },
  {
    serviceCenterId: 105,
    dealerId: 5,
    dealerName: 'TAFE Massey Ferguson Service Point',
    serviceName: 'Massey Ferguson Authorized Workshop',
    address: 'Indore-Ujjain Main Road, Sanwer, Indore',
    state: 'Madhya Pradesh',
    district: 'Indore',
    phone: '+91 94250 99887',
    emergencyPhone: '+91 94250 99888',
    supportedBrands: ['Massey Ferguson', 'Eicher'],
    servicesAvailable: ['Ferguson System Hydraulic Tuning', 'Differential Lock Repair', 'Electrical Wiring Overhaul', 'Doorstep Mobile Van'],
    hasPickupService: true,
    hasEmergencySupport: true,
    is24x7: false,
    distanceKm: 14.2,
    rating: 4.8,
    reviewsCount: 89,
    workingHours: '9:00 AM - 7:00 PM',
    isActive: true,
  },
];

const BRANDS = ['All Brands', 'Mahindra', 'Swaraj', 'John Deere', 'Sonalika', 'Massey Ferguson', 'Eicher'];

export function ServiceCentersClient() {
  const [centers, setCenters] = useState(CURATED_SERVICE_CENTERS);
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal
  const [selectedCenter, setSelectedCenter] = useState<any | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    mobile: '',
    tractorBrand: 'Mahindra',
    tractorModel: '',
    serviceType: 'Regular Scheduled Service',
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    address: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const filteredCenters = centers.filter((c) => {
    if (selectedBrand !== 'All Brands' && !c.supportedBrands.includes(selectedBrand)) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.serviceName.toLowerCase().includes(q) ||
        c.dealerName.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      // Try official service booking API
      await serviceBookingAPI.createBooking(selectedCenter.serviceCenterId, {
        name: bookingForm.name,
        mobile: bookingForm.mobile,
        tractorBrand: bookingForm.tractorBrand,
        tractorModel: bookingForm.tractorModel || 'Tractor',
        serviceType: bookingForm.serviceType,
        description: bookingForm.description || 'Service booking request',
        preferredDate: new Date(bookingForm.preferredDate).toISOString(),
        address: bookingForm.address || selectedCenter.district,
        latitude: 18.5204,
        longitude: 73.8567,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.warn('Booking API error, falling back to Lead API:', err);
      try {
        const cleanMobile = bookingForm.mobile.replace(/\s+/g, '').replace(/^\+91/, '');
        await leadAPI.createLead({
          leadType: 'SERVICE',
          dealerId: selectedCenter.dealerId || undefined,
          name: bookingForm.name.trim(),
          mobile: cleanMobile,
          state: selectedCenter.state || 'Maharashtra',
          district: selectedCenter.district || undefined,
          address: bookingForm.address || undefined,
          interestedBrand: bookingForm.tractorBrand || undefined,
          interestedModel: bookingForm.tractorModel || undefined,
          message: `Service booking for ${selectedCenter.serviceName} - ${bookingForm.serviceType} on ${bookingForm.preferredDate}. Notes: ${bookingForm.description || 'None'}`.slice(0, 1000),
          sourcePage: '/service-centers',
        });
        setSubmitted(true);
      } catch (leadErr: any) {
        console.error('Failed to book service:', leadErr);
        setErrorMessage(
          leadErr?.response?.data?.message || 'Failed to submit appointment. Please call the helpline.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <section className="relative flex flex-col items-center justify-center pt-8 pb-12 text-center">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <Wrench size={14} /> Authorized Service Workshops
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Find Tractor <span className="text-[var(--color-brand-green)]">Service Centers</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Locate authorized OEM repair workshops, genuine spare parts stockists, mobile doorstep repair vans, and 24x7 breakdown support.
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Filter and Search Bar */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBrand(b)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedBrand === b
                  ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                  : 'bg-card/60 text-muted-foreground hover:bg-secondary border border-border/40'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search size={16} className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by city, district or workshop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card/60 border-border/50 text-foreground w-full rounded-full border py-2 pl-9 pr-4 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>
      </div>

      {/* Service Centers List */}
      <div className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredCenters.map((center) => (
          <div
            key={center.serviceCenterId}
            className="group flex flex-col rounded-3xl border border-border/50 bg-card/40 p-6 shadow-sm transition-all duration-300 hover:border-[var(--color-brand-green)]/50 hover:shadow-xl"
          >
            {/* Header info */}
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-green)]">
                  {center.dealerName}
                </span>
                <h3 className="text-foreground text-xl font-black mt-0.5 leading-snug">
                  {center.serviceName}
                </h3>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500">
                <Star size={14} className="fill-amber-500" />
                {center.rating} ({center.reviewsCount})
              </div>
            </div>

            {/* Address & Timings */}
            <div className="mb-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--color-brand-green)]" />
                <span>{center.address}, {center.district}, {center.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="shrink-0 text-muted-foreground" />
                <span>{center.workingHours}</span>
              </div>
            </div>

            {/* Badges / Brands */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {center.supportedBrands.map((b) => (
                <span
                  key={b}
                  className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-bold text-foreground"
                >
                  Authorized: {b}
                </span>
              ))}
              {center.hasPickupService && (
                <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-500">
                  Doorstep Mobile Van
                </span>
              )}
              {center.is24x7 && (
                <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                  24x7 Breakdown Help
                </span>
              )}
            </div>

            {/* Services Available List */}
            <div className="mb-6 rounded-2xl bg-secondary/30 p-3.5 text-xs">
              <span className="text-muted-foreground mb-2 block font-bold text-[10px] uppercase">
                Services Offered:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {center.servicesAvailable.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-foreground">
                    <CheckCircle2 size={12} className="text-[var(--color-brand-green)] shrink-0" />
                    <span className="truncate">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto flex items-center gap-3 border-t border-border/30 pt-4">
              <a
                href={`tel:${center.phone}`}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-secondary"
              >
                <Phone size={14} /> Call Workshop
              </a>
              <button
                type="button"
                onClick={() => {
                  setSelectedCenter(center);
                  setSubmitted(false);
                  setErrorMessage('');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] py-2.5 text-xs font-black text-white uppercase tracking-wider shadow-md transition-all hover:bg-[var(--color-brand-green)]/90"
              >
                Book Appointment <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Booking Modal */}
      {selectedCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-card p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedCenter(null)}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>

            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)]">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-foreground text-2xl font-black mb-2">Service Booked!</h3>
                <p className="text-muted-foreground text-xs mx-auto max-w-xs mb-6">
                  {selectedCenter.serviceName} has received your appointment request for {bookingForm.preferredDate}. Service manager will call <span className="font-bold text-foreground">+91 {bookingForm.mobile}</span> to confirm the bay.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCenter(null)}
                  className="rounded-full bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6 border-b border-border/40 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-green)]">
                    Service Bay Booking
                  </span>
                  <h3 className="text-foreground text-xl font-black mt-1">
                    {selectedCenter.serviceName}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    {selectedCenter.district}, {selectedCenter.state} | {selectedCenter.phone}
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rameshwar Gavande"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile"
                        value={bookingForm.mobile}
                        onChange={(e) => setBookingForm((prev) => ({ ...prev, mobile: e.target.value }))}
                        className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingForm.preferredDate}
                        onChange={(e) => setBookingForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
                        className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                        Tractor Brand
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mahindra"
                        value={bookingForm.tractorBrand}
                        onChange={(e) => setBookingForm((prev) => ({ ...prev, tractorBrand: e.target.value }))}
                        className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                        Model
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 575 DI"
                        value={bookingForm.tractorModel}
                        onChange={(e) => setBookingForm((prev) => ({ ...prev, tractorModel: e.target.value }))}
                        className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                      Service Type
                    </label>
                    <select
                      value={bookingForm.serviceType}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, serviceType: e.target.value }))}
                      className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                    >
                      <option value="Regular Scheduled Service">Regular Scheduled Service & Oil Change</option>
                      <option value="Hydraulic System Repair">Hydraulic System Repair</option>
                      <option value="Engine Overhaul">Engine Overhaul</option>
                      <option value="Clutch & Brake Overhaul">Clutch & Brake Overhaul</option>
                      <option value="Mobile Van Doorstep Service">Mobile Van Doorstep Service at Farm</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[var(--color-brand-green)]/90 disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <TractorLoader size={16} /> Booking Appointment...
                      </>
                    ) : (
                      <>
                        Confirm Service Appointment &rarr;
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
