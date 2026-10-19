'use client';

import React, { useState, useEffect } from 'react';
import { showroomAPI, Showroom } from '@/lib/api/showrooms';
import { brandAPI, Brand } from '@/lib/api/brands';
import {
  Search,
  MapPin,
  Map,
  Phone,
  Navigation,
  Star,
  Filter,
  Store,
  LayoutList,
  Car,
  SquareParking,
  X,
  CalendarCheck,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Pagination from '@/components/shared/Pagination';

export default function ShowroomsPage() {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced UI States
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating');
  const [testDriveModalOpen, setTestDriveModalOpen] = useState<Showroom | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [needsTestDrive, setNeedsTestDrive] = useState(false);
  const [needsParking, setNeedsParking] = useState(false);

  // Fixed list of states for demo
  const indianStates = ['Maharashtra', 'Punjab', 'Madhya Pradesh', 'Haryana', 'Uttar Pradesh'];

  useEffect(() => {
    brandAPI.getAllBrands({ limit: 50 }).then((res) => {
      if (res.success) {
        const list = (res.data as any).data || (res.data as any).brands || [];
        setBrands(list.filter((b: any) => b.isActive));
      }
    });
  }, []);

  useEffect(() => {
    const fetchShowrooms = async () => {
      setLoading(true);
      try {
        const res = await showroomAPI.getAllShowrooms({
          search: searchQuery,
          brandId: selectedBrand || undefined,
          state: selectedState || undefined,
        });

        if (res.success && Array.isArray(res.data)) {
          let data = res.data;

          // Apply Frontend Sort
          if (sortBy === 'rating') {
            data = data.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
          } else {
            data = data.sort((a, b) => (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0));
          }

          // Apply Boolean filters
          if (needsTestDrive) {
            data = data.filter((s) => s.testDriveAvailable);
          }
          if (needsParking) {
            data = data.filter((s) => s.parkingAvailable);
          }

          setShowrooms(data);
        }
      } catch (err) {
        console.error('Failed to fetch showrooms', err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchShowrooms, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedBrand, selectedState, sortBy, needsTestDrive, needsParking]);

  const handleTestDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Test Drive booked successfully at ${testDriveModalOpen?.showroomName}! You will receive a confirmation shortly.`
    );
    setTestDriveModalOpen(null);
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1400px] px-4 py-10 sm:px-6">
      {/* Header Section */}
      <div className="animate-fade-in mb-12 flex flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 p-3 text-[var(--color-brand-green)]">
          <Store size={28} />
        </div>
        <h1 className="text-foreground mb-4 text-4xl font-black tracking-tight md:text-5xl">
          Visit a <span className="text-[var(--color-brand-green)]">Tractor Showroom</span>
        </h1>
        <p className="text-muted max-w-2xl text-lg font-bold">
          Experience the latest tractors in person. Find authorized showrooms with test drive
          facilities and expert staff.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left Column: Filters */}
        <div className="animate-slide-in flex w-full flex-col gap-6 lg:w-1/4">
          <div className="spatial-panel bg-background/50 sticky top-24 rounded-3xl border border-[var(--border-subtle)] p-6 backdrop-blur-xl">
            <div className="text-foreground mb-6 flex items-center justify-between font-black">
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <h3>Showroom Filters</h3>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand(null);
                  setSelectedState('');
                  setNeedsTestDrive(false);
                  setNeedsParking(false);
                }}
                className="text-muted text-xs underline hover:text-[var(--color-brand-green)]"
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <label className="text-muted mb-2 block text-[10px] font-black tracking-widest uppercase">
                Search Showroom
              </label>
              <div className="relative">
                <Search size={18} className="text-muted absolute top-1/2 left-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Showroom name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border-none py-3 pr-4 pl-12 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                />
              </div>
            </div>

            {/* State Filter */}
            <div className="mb-6">
              <label className="text-muted mb-2 block text-[10px] font-black tracking-widest uppercase">
                Location
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-foreground/5 text-foreground w-full appearance-none rounded-xl border-none px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
              >
                <option value="">All States</option>
                {indianStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Facility Toggles */}
            <div className="mb-6 flex flex-col gap-3">
              <label className="bg-foreground/5 hover:bg-foreground/10 flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 transition-colors">
                <input
                  type="checkbox"
                  checked={needsTestDrive}
                  onChange={(e) => setNeedsTestDrive(e.target.checked)}
                  className="bg-background h-5 w-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                />
                <span className="text-foreground flex items-center gap-2 text-sm font-bold">
                  <Car size={16} className="text-amber-500" /> Test Drive Available
                </span>
              </label>

              <label className="bg-foreground/5 hover:bg-foreground/10 flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 transition-colors">
                <input
                  type="checkbox"
                  checked={needsParking}
                  onChange={(e) => setNeedsParking(e.target.checked)}
                  className="bg-background h-5 w-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                />
                <span className="text-foreground flex items-center gap-2 text-sm font-bold">
                  <SquareParking size={16} className="text-emerald-500" /> Customer Parking
                </span>
              </label>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-muted mb-3 block text-[10px] font-black tracking-widest uppercase">
                Exclusive Brands
              </label>
              <div className="custom-scrollbar flex max-h-60 flex-col gap-2 overflow-y-auto pr-2">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${!selectedBrand ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner' : 'bg-foreground/5 text-foreground hover:bg-foreground/10 border-transparent'}`}
                >
                  <span className="text-sm font-bold">All Brands</span>
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${selectedBrand === brand.id ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner' : 'bg-foreground/5 text-foreground hover:bg-foreground/10 border-transparent'}`}
                  >
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-6 w-6 rounded-sm bg-white object-contain p-0.5 mix-blend-multiply dark:mix-blend-normal"
                      />
                    ) : (
                      <div className="bg-foreground/10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    <span className="truncate text-sm font-bold">{brand.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Showroom List */}
        <div className="w-full lg:w-3/4">
          {/* Top Control Bar */}
          <div className="animate-fade-in bg-foreground/5 mb-6 flex flex-col items-center justify-between gap-4 rounded-2xl p-2 sm:flex-row">
            <div className="flex w-full items-center gap-2 px-4 sm:w-auto">
              <span className="text-muted text-sm font-black tracking-widest uppercase">
                <span className="text-foreground text-lg">{showrooms.length}</span> Showrooms Found
              </span>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-background text-foreground appearance-none rounded-xl border-none px-4 py-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
              </select>

              <div className="bg-background flex rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg p-2 transition-colors ${viewMode === 'list' ? 'bg-foreground/10 text-foreground' : 'text-muted hover:text-foreground'}`}
                >
                  <LayoutList size={18} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`rounded-lg p-2 transition-colors ${viewMode === 'map' ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'text-muted hover:text-[var(--color-brand-green)]'}`}
                >
                  <Map size={18} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex w-full justify-center py-32">
              <TractorLoader size={48} className="text-[var(--color-brand-green)]" />
            </div>
          ) : showrooms.length === 0 ? (
            <div className="spatial-panel animate-fade-in bg-background/50 flex flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] p-16 text-center backdrop-blur-xl">
              <Store size={64} className="text-muted mb-6 opacity-40" />
              <h3 className="text-foreground mb-3 text-2xl font-black">No Showrooms Found</h3>
              <p className="text-muted mb-8 max-w-md text-base font-bold">
                Try adjusting your advanced filters or searching for a different area to find a
                showroom near you.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand(null);
                  setSelectedState('');
                  setNeedsTestDrive(false);
                  setNeedsParking(false);
                }}
                className="rounded-2xl bg-[var(--color-brand-green)] px-8 py-4 font-black text-white shadow-[var(--color-brand-green)]/20 shadow-lg transition-transform hover:-translate-y-1 hover:bg-[var(--color-brand-green)]/90"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'map' ? (
            // MAP VIEW MOCKUP
            <div className="spatial-panel bg-foreground/5 animate-fade-in relative flex h-[600px] items-center justify-center overflow-hidden rounded-3xl border border-[var(--border-subtle)]">
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 2px 2px, var(--color-foreground) 1px, transparent 0)',
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="bg-background/80 z-10 max-w-sm rounded-3xl border border-[var(--border-subtle)] p-8 text-center shadow-2xl backdrop-blur-md">
                <Map size={48} className="mx-auto mb-4 text-[var(--color-brand-green)]" />
                <h3 className="mb-2 text-xl font-black">Interactive Map Integration</h3>
                <p className="text-muted mb-6 text-sm font-bold">
                  This section is architected to inject Google Maps or Mapbox SDK to render{' '}
                  {showrooms.length} active showrooms instantly.
                </p>
                <button
                  onClick={() => setViewMode('list')}
                  className="bg-foreground/10 hover:bg-foreground/20 w-full rounded-xl py-3 text-sm font-black transition-colors"
                >
                  Return to List View
                </button>
              </div>
            </div>
          ) : (
            // LIST VIEW
            <div className="animate-fade-in flex flex-col gap-6">
              {showrooms.slice((page - 1) * limit, page * limit).map((showroom) => (
                <div
                  key={showroom.id}
                  className="spatial-panel bg-background/50 hover:bg-foreground/[0.02] group flex flex-col gap-6 rounded-[2rem] border border-[var(--border-subtle)] p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-[var(--color-brand-green)]/5 hover:shadow-2xl sm:p-8 md:flex-row md:gap-8"
                >
                  {/* Info Section */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h2 className="text-foreground text-2xl font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                          {showroom.showroomName}
                        </h2>

                        {showroom.brand && (
                          <div className="bg-background flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-1 shadow-sm">
                            {showroom.brand.logoUrl && (
                              <img
                                src={showroom.brand.logoUrl}
                                alt={showroom.brand.name}
                                className="h-4 w-4 object-contain mix-blend-multiply dark:mix-blend-normal"
                              />
                            )}
                            <span className="text-foreground text-xs font-black">
                              {showroom.brand.name}
                            </span>
                          </div>
                        )}

                        {showroom.reviewsCount ? (
                          <div className="flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-600">
                            <Star size={14} className="fill-amber-500" /> {showroom.rating} (
                            {showroom.reviewsCount})
                          </div>
                        ) : (
                          <div className="text-muted rounded-lg px-2.5 py-1 text-xs font-bold">No reviews yet</div>
                        )}
                      </div>

                      <div className="text-muted mb-4 flex max-w-lg items-start gap-3 text-sm font-bold">
                        <div className="bg-foreground/5 mt-0.5 rounded-full p-2">
                          <MapPin size={14} className="text-[var(--color-brand-green)]" />
                        </div>
                        <p className="leading-relaxed">
                          {showroom.address}, {showroom.district}, {showroom.state} -{' '}
                          {showroom.pincode}
                        </p>
                      </div>

                      {showroom.description && (
                        <p className="text-muted mb-4 line-clamp-2 text-sm font-bold italic">
                          "{showroom.description}"
                        </p>
                      )}

                      {/* Badges */}
                      <div className="mb-6 flex flex-wrap gap-2">
                        {showroom.testDriveAvailable && (
                          <span className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-black text-amber-600">
                            <Car size={14} /> Test Drive Available
                          </span>
                        )}
                        {showroom.parkingAvailable && (
                          <span className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-600">
                            <SquareParking size={14} /> Customer Parking
                          </span>
                        )}
                        {showroom.totalArea && (
                          <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-black">
                            <Store size={14} className="text-muted" /> {showroom.totalArea}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="flex w-full shrink-0 flex-col justify-center gap-3 md:w-56">
                    {showroom.testDriveAvailable && (
                      <button
                        onClick={() => setTestDriveModalOpen(showroom)}
                        className="group-hover:animate-pulse-subtle flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-4 font-black text-white shadow-[var(--color-brand-green)]/20 shadow-xl transition-all hover:-translate-y-1 hover:bg-[var(--color-brand-green)]/90 active:translate-y-0"
                      >
                        <CalendarCheck size={18} />
                        Book Test Drive
                      </button>
                    )}

                    {showroom.phone && (
                      <a
                        href={`tel:${showroom.phone}`}
                        className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-black transition-colors"
                      >
                        <Phone size={18} />
                        Call {showroom.phone.split(' ')[0]}***
                      </a>
                    )}

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(showroom.showroomName + ' ' + showroom.district + ' ' + showroom.state)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-black transition-colors"
                    >
                      <Navigation size={18} />
                      Directions
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && showrooms.length > 0 && viewMode === 'list' && (
            <div className="mt-6">
              <Pagination
                page={page}
                limit={limit}
                totalCount={showrooms.length}
                totalPages={Math.ceil(showrooms.length / limit)}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* TEST DRIVE MODAL */}
      {testDriveModalOpen && (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all dark:bg-black/75"
            onClick={() => setTestDriveModalOpen(null)}
          />
          <div className="animate-slide-up relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-[#121814]">
            <button
              onClick={() => setTestDriveModalOpen(null)}
              className="absolute top-6 right-6 rounded-full border border-zinc-200 bg-zinc-100 p-2 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="mb-8 pr-12">
              <h3 className="mb-2 text-2xl font-black text-zinc-900 dark:text-white">Book a Test Drive</h3>
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                Schedule your visit to{' '}
                <span className="text-[var(--color-brand-green)]">
                  {testDriveModalOpen.showroomName}
                </span>{' '}
                to experience the power firsthand.
              </p>
            </div>

            <form onSubmit={handleTestDriveSubmit} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-xs font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                  Your Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-[var(--color-brand-green)] focus:bg-white focus:ring-2 focus:ring-[var(--color-brand-green)]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-400 dark:focus:ring-lime-400/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                  Mobile Number
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-[var(--color-brand-green)] focus:bg-white focus:ring-2 focus:ring-[var(--color-brand-green)]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-400 dark:focus:ring-lime-400/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                  Preferred Date
                </label>
                <input
                  required
                  type="date"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-[var(--color-brand-green)] focus:bg-white focus:ring-2 focus:ring-[var(--color-brand-green)]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-400 dark:focus:ring-lime-400/20"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-2xl bg-[var(--color-brand-green)] py-4 font-black text-white shadow-lg shadow-[var(--color-brand-green)]/30 transition-all hover:-translate-y-1 hover:brightness-105 active:translate-y-0"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
