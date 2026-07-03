'use client';

import React, { useState, useEffect } from 'react';
import { showroomAPI, Showroom } from '@/lib/api/showrooms';
import { brandAPI, Brand } from '@/lib/api/brands';
import { Search, MapPin, Map, Phone, Navigation, Star, Filter, Store, LayoutList, Car, SquareParking, X, CalendarCheck } from 'lucide-react';

export default function ShowroomsPage() {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced UI States
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating');
  const [testDriveModalOpen, setTestDriveModalOpen] = useState<Showroom | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [needsTestDrive, setNeedsTestDrive] = useState(false);
  const [needsParking, setNeedsParking] = useState(false);

  // Fixed list of states for demo
  const indianStates = ['Maharashtra', 'Punjab', 'Madhya Pradesh', 'Haryana', 'Uttar Pradesh'];

  useEffect(() => {
    brandAPI.getAllBrands({ limit: 50 }).then(res => {
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
            data = data.sort((a, b) => b.rating - a.rating);
          } else {
            data = data.sort((a, b) => b.reviewsCount - a.reviewsCount);
          }

          // Apply Boolean filters
          if (needsTestDrive) {
            data = data.filter(s => s.testDriveAvailable);
          }
          if (needsParking) {
            data = data.filter(s => s.parkingAvailable);
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
    alert(`Test Drive booked successfully at ${testDriveModalOpen?.showroomName}! You will receive a confirmation shortly.`);
    setTestDriveModalOpen(null);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen py-10 px-4 sm:px-6 relative">
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center justify-center p-3 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-2xl mb-4">
          <Store size={28} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
          Visit a <span className="text-[var(--color-brand-green)]">Tractor Showroom</span>
        </h1>
        <p className="text-muted font-bold text-lg max-w-2xl">
          Experience the latest tractors in person. Find authorized showrooms with test drive facilities and expert staff.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Filters */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6 animate-slide-in">
          <div className="spatial-panel rounded-3xl p-6 sticky top-24 border border-foreground/5 bg-background/50 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6 text-foreground font-black">
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <h3>Showroom Filters</h3>
              </div>
              <button 
                 onClick={() => { setSearchQuery(''); setSelectedBrand(null); setSelectedState(''); setNeedsTestDrive(false); setNeedsParking(false); }}
                 className="text-xs text-muted hover:text-[var(--color-brand-green)] underline"
               >
                 Clear All
               </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">Search Showroom</label>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="text"
                  placeholder="Showroom name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-foreground/5 border-none rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none"
                />
              </div>
            </div>

            {/* State Filter */}
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">Location</label>
              <select 
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-3 bg-foreground/5 border-none rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none"
              >
                <option value="">All States</option>
                {indianStates.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Facility Toggles */}
            <div className="mb-6 flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent bg-foreground/5 hover:bg-foreground/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={needsTestDrive}
                  onChange={(e) => setNeedsTestDrive(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background"
                />
                <span className="font-bold text-sm text-foreground flex items-center gap-2"><Car size={16} className="text-amber-500" /> Test Drive Available</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent bg-foreground/5 hover:bg-foreground/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={needsParking}
                  onChange={(e) => setNeedsParking(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background"
                />
                <span className="font-bold text-sm text-foreground flex items-center gap-2"><SquareParking size={16} className="text-emerald-500" /> Customer Parking</span>
              </label>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-3 block">Exclusive Brands</label>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <button 
                  onClick={() => setSelectedBrand(null)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${!selectedBrand ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner' : 'border-transparent bg-foreground/5 text-foreground hover:bg-foreground/10'}`}
                >
                  <span className="font-bold text-sm">All Brands</span>
                </button>
                {brands.map(brand => (
                  <button 
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedBrand === brand.id ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner' : 'border-transparent bg-foreground/5 text-foreground hover:bg-foreground/10'}`}
                  >
                    {brand.logoUrl ? (
                       <img src={brand.logoUrl} alt={brand.name} className="w-6 h-6 object-contain mix-blend-multiply dark:mix-blend-normal bg-white rounded-sm p-0.5" />
                    ) : (
                       <div className="w-6 h-6 bg-foreground/10 rounded-full flex items-center justify-center text-[10px] font-black">{brand.name.charAt(0)}</div>
                    )}
                    <span className="font-bold text-sm truncate">{brand.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Showroom List */}
        <div className="w-full lg:w-3/4">
          
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 animate-fade-in bg-foreground/5 p-2 rounded-2xl">
            <div className="flex items-center gap-2 w-full sm:w-auto px-4">
              <span className="text-sm font-black text-muted uppercase tracking-widest">
                <span className="text-foreground text-lg">{showrooms.length}</span> Showrooms Found
              </span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-background border-none rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none shadow-sm"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
              </select>

              <div className="flex bg-background rounded-xl p-1 shadow-sm">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-foreground/10 text-foreground' : 'text-muted hover:text-foreground'}`}
                >
                  <LayoutList size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'text-muted hover:text-[var(--color-brand-green)]'}`}
                >
                  <Map size={18} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="w-full flex justify-center py-32">
              <div className="w-12 h-12 border-4 border-foreground/10 border-t-[var(--color-brand-green)] rounded-full animate-spin" />
            </div>
          ) : showrooms.length === 0 ? (
            <div className="spatial-panel rounded-3xl p-16 text-center flex flex-col items-center justify-center animate-fade-in border border-foreground/5 bg-background/50 backdrop-blur-xl">
               <Store size={64} className="text-muted mb-6 opacity-40" />
               <h3 className="text-2xl font-black text-foreground mb-3">No Showrooms Found</h3>
               <p className="text-muted font-bold text-base max-w-md mb-8">Try adjusting your advanced filters or searching for a different area to find a showroom near you.</p>
               <button 
                 onClick={() => { setSearchQuery(''); setSelectedBrand(null); setSelectedState(''); setNeedsTestDrive(false); setNeedsParking(false); }}
                 className="px-8 py-4 bg-[var(--color-brand-green)] text-white font-black rounded-2xl hover:bg-[var(--color-brand-green)]/90 transition-transform hover:-translate-y-1 shadow-lg shadow-[var(--color-brand-green)]/20"
               >
                 Reset All Filters
               </button>
            </div>
          ) : viewMode === 'map' ? (
            // MAP VIEW MOCKUP
            <div className="spatial-panel rounded-3xl h-[600px] border border-foreground/5 bg-foreground/5 relative overflow-hidden flex items-center justify-center animate-fade-in">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-foreground) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
              <div className="text-center z-10 p-8 bg-background/80 backdrop-blur-md rounded-3xl shadow-2xl border border-foreground/10 max-w-sm">
                <Map size={48} className="mx-auto text-[var(--color-brand-green)] mb-4" />
                <h3 className="text-xl font-black mb-2">Interactive Map Integration</h3>
                <p className="text-sm font-bold text-muted mb-6">This section is architected to inject Google Maps or Mapbox SDK to render {showrooms.length} active showrooms instantly.</p>
                <button onClick={() => setViewMode('list')} className="w-full py-3 bg-foreground/10 hover:bg-foreground/20 rounded-xl font-black text-sm transition-colors">Return to List View</button>
              </div>
            </div>
          ) : (
            // LIST VIEW
            <div className="flex flex-col gap-6 animate-fade-in">
              {showrooms.map((showroom) => (
                <div key={showroom.id} className="spatial-panel rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 border border-foreground/5 bg-background/50 hover:bg-foreground/[0.02] hover:shadow-2xl hover:shadow-[var(--color-brand-green)]/5 backdrop-blur-xl transition-all duration-300 group">
                  
                  {/* Info Section */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h2 className="text-2xl font-black text-foreground group-hover:text-[var(--color-brand-green)] transition-colors">{showroom.showroomName}</h2>
                        
                        {showroom.brand && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-background rounded-lg border border-foreground/10 shadow-sm">
                            {showroom.brand.logoUrl && <img src={showroom.brand.logoUrl} alt={showroom.brand.name} className="w-4 h-4 object-contain mix-blend-multiply dark:mix-blend-normal" />}
                            <span className="text-xs font-black text-foreground">{showroom.brand.name}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-xs font-black border border-amber-500/20">
                          <Star size={14} className="fill-amber-500" /> {showroom.rating} ({showroom.reviewsCount})
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 text-muted font-bold text-sm mb-4 max-w-lg">
                        <div className="p-2 bg-foreground/5 rounded-full mt-0.5"><MapPin size={14} className="text-[var(--color-brand-green)]" /></div>
                        <p className="leading-relaxed">{showroom.address}, {showroom.district}, {showroom.state} - {showroom.pincode}</p>
                      </div>

                      {showroom.description && (
                         <p className="text-sm font-bold text-muted mb-4 line-clamp-2 italic">"{showroom.description}"</p>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {showroom.testDriveAvailable && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-xl text-xs font-black text-amber-600 border border-amber-500/20">
                            <Car size={14} /> Test Drive Available
                          </span>
                        )}
                        {showroom.parkingAvailable && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-xl text-xs font-black text-emerald-600 border border-emerald-500/20">
                            <SquareParking size={14} /> Customer Parking
                          </span>
                        )}
                        {showroom.totalArea && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/5 rounded-xl text-xs font-black text-foreground border border-foreground/10">
                            <Store size={14} className="text-muted" /> {showroom.totalArea}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="flex flex-col gap-3 w-full md:w-56 shrink-0 justify-center">
                    {showroom.testDriveAvailable && (
                      <button 
                        onClick={() => setTestDriveModalOpen(showroom)}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/90 text-white font-black rounded-2xl shadow-xl shadow-[var(--color-brand-green)]/20 transition-all hover:-translate-y-1 active:translate-y-0 group-hover:animate-pulse-subtle"
                      >
                        <CalendarCheck size={18} />
                        Book Test Drive
                      </button>
                    )}
                    
                    {showroom.phone && (
                      <a href={`tel:${showroom.phone}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-foreground/5 hover:bg-foreground/10 text-foreground font-black rounded-2xl transition-colors">
                        <Phone size={18} />
                        Call {showroom.phone.split(' ')[0]}***
                      </a>
                    )}
                    
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(showroom.showroomName + ' ' + showroom.district + ' ' + showroom.state)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 bg-foreground/5 hover:bg-foreground/10 text-foreground font-black rounded-2xl transition-colors">
                      <Navigation size={18} />
                      Directions
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* TEST DRIVE MODAL */}
      {testDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setTestDriveModalOpen(null)} />
          <div className="relative w-full max-w-lg bg-background rounded-[2.5rem] border border-foreground/10 shadow-2xl p-8 overflow-hidden animate-slide-up">
            
            <button onClick={() => setTestDriveModalOpen(null)} className="absolute top-6 right-6 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors">
              <X size={20} />
            </button>

            <div className="mb-8 pr-12">
              <h3 className="text-2xl font-black text-foreground mb-2">Book a Test Drive</h3>
              <p className="text-sm font-bold text-muted">Schedule your visit to <span className="text-[var(--color-brand-green)]">{testDriveModalOpen.showroomName}</span> to experience the power firsthand.</p>
            </div>

            <form onSubmit={handleTestDriveSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Your Name</label>
                <input required type="text" placeholder="John Doe" className="w-full px-4 py-3.5 bg-foreground/5 border-none rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none" />
              </div>
              
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Mobile Number</label>
                <input required type="tel" placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3.5 bg-foreground/5 border-none rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none" />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Preferred Date</label>
                <input required type="date" className="w-full px-4 py-3.5 bg-foreground/5 border-none rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none" />
              </div>

              <button type="submit" className="w-full py-4 mt-2 bg-[var(--color-brand-green)] text-white font-black rounded-2xl shadow-lg shadow-[var(--color-brand-green)]/30 hover:-translate-y-1 transition-all active:translate-y-0">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
