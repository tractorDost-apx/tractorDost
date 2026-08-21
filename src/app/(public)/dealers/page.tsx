'use client';

import React, { useState, useEffect } from 'react';
import { dealerAPI, Dealer } from '@/lib/api/dealers';
import { brandAPI, Brand } from '@/lib/api/brands';
import { Search, MapPin, Map, Phone, MessageSquare, Navigation, Star, ShieldCheck, Filter, Wrench, Store, LayoutList, CheckCircle, Clock, X, Send } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced UI States
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating');
  const [inquiryModalOpen, setInquiryModalOpen] = useState<Dealer | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);

  // Fixed list of states for demo
  const indianStates = ['Maharashtra', 'Punjab', 'Madhya Pradesh', 'Haryana', 'Uttar Pradesh'];

  useEffect(() => {
    // Fetch brands for filter
    brandAPI.getAllBrands({ limit: 50 }).then(res => {
      if (res.success) {
        const list = (res.data as any).data || (res.data as any).brands || [];
        setBrands(list.filter((b: any) => b.isActive));
      }
    });
  }, []);

  useEffect(() => {
    const fetchDealers = async () => {
      setLoading(true);
      try {
        const res = await dealerAPI.getAllDealers({
          search: searchQuery,
          brandId: selectedBrand || undefined,
          state: selectedState || undefined,
        });
        
        if (res.success && res.data) {
          let data: Dealer[] = Array.isArray(res.data) ? [...res.data] : [...(res.data.data || [])];
          
          // Apply Frontend Sort
          if (sortBy === 'rating') {
            data = data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          } else {
            data = data.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
          }

          // Apply Open Now filter (mocking it randomly based on id for demo)
          if (showOnlyOpen) {
            data = data.filter(d => d.id % 2 !== 0); // Mock logic for "Open Now"
          }

          setDealers(data);
        }
      } catch (err) {
        console.error('Failed to fetch dealers', err);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchDealers, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedBrand, selectedState, sortBy, showOnlyOpen]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Inquiry sent to ${inquiryModalOpen?.businessName} successfully!`);
    setInquiryModalOpen(null);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen py-10 px-4 sm:px-6 relative">
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center justify-center p-3 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-2xl mb-4">
          <Store size={28} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
          Find a <span className="text-[var(--color-brand-green)]">Tractor Dealer</span>
        </h1>
        <p className="text-muted font-bold text-lg max-w-2xl">
          Locate certified showrooms, authorized service centers, and trusted used tractor dealers across India.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Filters */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6 animate-slide-in">
          <div className="spatial-panel rounded-3xl p-6 sticky top-24 border border-[var(--border-subtle)] bg-background/50 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6 text-foreground font-black">
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <h3>Advanced Filters</h3>
              </div>
              <button 
                 onClick={() => { setSearchQuery(''); setSelectedBrand(null); setSelectedState(''); setShowOnlyOpen(false); }}
                 className="text-xs text-muted hover:text-[var(--color-brand-green)] underline"
               >
                 Clear All
               </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">Search Dealership</label>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="text"
                  placeholder="Dealer name or city..."
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

            {/* Open Now Toggle */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent bg-foreground/5 hover:bg-foreground/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={showOnlyOpen}
                  onChange={(e) => setShowOnlyOpen(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background"
                />
                <span className="font-bold text-sm text-foreground flex items-center gap-2"><Clock size={16} className="text-green-500" /> Open Now</span>
              </label>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-3 block">Authorized Brands</label>
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

        {/* Right Column: Dealer List */}
        <div className="w-full lg:w-3/4">
          
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 animate-fade-in bg-foreground/5 p-2 rounded-2xl">
            <div className="flex items-center gap-2 w-full sm:w-auto px-4">
              <span className="text-sm font-black text-muted uppercase tracking-widest">
                <span className="text-foreground text-lg">{dealers.length}</span> Dealerships Found
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
              <TractorLoader size={48} className="text-[var(--color-brand-green)]" />
            </div>
          ) : dealers.length === 0 ? (
            <div className="spatial-panel rounded-3xl p-16 text-center flex flex-col items-center justify-center animate-fade-in border border-[var(--border-subtle)] bg-background/50 backdrop-blur-xl">
               <Store size={64} className="text-muted mb-6 opacity-40" />
               <h3 className="text-2xl font-black text-foreground mb-3">No Dealerships Found</h3>
               <p className="text-muted font-bold text-base max-w-md mb-8">Try adjusting your advanced filters or searching for a different area to find authorized dealers near you.</p>
               <button 
                 onClick={() => { setSearchQuery(''); setSelectedBrand(null); setSelectedState(''); setShowOnlyOpen(false); }}
                 className="px-8 py-4 bg-[var(--color-brand-green)] text-white font-black rounded-2xl hover:bg-[var(--color-brand-green)]/90 transition-transform hover:-translate-y-1 shadow-lg shadow-[var(--color-brand-green)]/20"
               >
                 Reset All Filters
               </button>
            </div>
          ) : viewMode === 'map' ? (
            // MAP VIEW MOCKUP
            <div className="spatial-panel rounded-3xl h-[600px] border border-[var(--border-subtle)] bg-foreground/5 relative overflow-hidden flex items-center justify-center animate-fade-in">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-foreground) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
              <div className="text-center z-10 p-8 bg-background/80 backdrop-blur-md rounded-3xl shadow-2xl border border-[var(--border-subtle)] max-w-sm">
                <Map size={48} className="mx-auto text-[var(--color-brand-green)] mb-4" />
                <h3 className="text-xl font-black mb-2">Interactive Map Integration</h3>
                <p className="text-sm font-bold text-muted mb-6">This section is architected to inject Google Maps or Mapbox SDK to render {dealers.length} active pins instantly.</p>
                <button onClick={() => setViewMode('list')} className="w-full py-3 bg-[var(--border-subtle)] hover:border-[var(--border-brand)] rounded-xl font-black text-sm transition-colors">Return to List View</button>
              </div>
            </div>
          ) : (
            // LIST VIEW
            <div className="flex flex-col gap-6 animate-fade-in">
              {dealers.slice((page - 1) * limit, page * limit).map((dealer) => (
                <div key={dealer.id} className="spatial-panel rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 border border-[var(--border-subtle)] bg-background/50 hover:bg-foreground/[0.02] hover:shadow-2xl hover:shadow-[var(--color-brand-green)]/5 backdrop-blur-xl transition-all duration-300 group">
                  
                  {/* Info Section */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h2 className="text-2xl font-black text-foreground group-hover:text-[var(--color-brand-green)] transition-colors">{dealer.businessName}</h2>
                        {dealer.isCertified && (
                          <div className="flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-600 rounded-lg text-xs font-black uppercase tracking-wider border border-green-500/20">
                            <ShieldCheck size={14} /> TractorDost Assured
                          </div>
                        )}
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-xs font-black border border-amber-500/20">
                          <Star size={14} className="fill-amber-500" /> {dealer.rating} ({dealer.reviewsCount})
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 text-muted font-bold text-sm mb-4 max-w-lg">
                        <div className="p-2 bg-foreground/5 rounded-full mt-0.5"><MapPin size={14} className="text-[var(--color-brand-green)]" /></div>
                        <p className="leading-relaxed">{dealer.address}, {dealer.district}, {dealer.state} - {dealer.pincode}</p>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(dealer.hasShowroom || !!dealer.showroom) && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 rounded-xl text-xs font-black text-blue-600 border border-blue-500/20">
                            <Store size={14} /> Sales Showroom
                          </span>
                        )}
                        {(dealer.hasServiceCenter || !!dealer.serviceCenter) && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 rounded-xl text-xs font-black text-purple-600 border border-purple-500/20">
                            <Wrench size={14} /> Service & Spares
                          </span>
                        )}
                        {/* Mock Open Now Badge */}
                        {dealer.id % 2 !== 0 && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-xl text-xs font-black text-green-600 border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Open Now
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Authorized Brands */}
                    {dealer.brands && dealer.brands.length > 0 && (
                      <div className="mt-auto">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Authorized Dealer For</p>
                        <div className="flex flex-wrap gap-2">
                          {dealer.brands.map(b => (
                            <div key={b.brandId} className="flex items-center gap-2 px-3 py-2 bg-background rounded-xl border border-[var(--border-subtle)] shadow-sm hover:border-[var(--color-brand-green)]/50 transition-colors cursor-default">
                              {b.brand.logoUrl && <img src={b.brand.logoUrl} alt={b.brand.name} className="w-5 h-5 object-contain mix-blend-multiply dark:mix-blend-normal" />}
                              <span className="text-xs font-black text-foreground">{b.brand.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Section */}
                  <div className="flex flex-col gap-3 w-full md:w-52 shrink-0 justify-center">
                    <button 
                      onClick={() => setInquiryModalOpen(dealer)}
                      className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/90 text-white font-black rounded-2xl shadow-xl shadow-[var(--color-brand-green)]/20 transition-all hover:-translate-y-1 active:translate-y-0 group-hover:animate-pulse-subtle"
                    >
                      <Send size={18} />
                      Request Callback
                    </button>
                    
                    <a href={`tel:${dealer.phone}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-foreground/5 hover:bg-foreground/10 text-foreground font-black rounded-2xl transition-colors">
                      <Phone size={18} />
                      Call {dealer.phone.split(' ')[0]}***
                    </a>
                    
                    {dealer.whatsapp && (
                      <a href={`https://wa.me/${dealer.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-black rounded-2xl transition-colors border border-[#25D366]/20">
                        <MessageSquare size={18} />
                        WhatsApp
                      </a>
                    )}
                    
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!loading && dealers.length > 0 && viewMode === 'list' && (
            <div className="mt-6">
              <Pagination
                page={page}
                limit={limit}
                totalCount={dealers.length}
                totalPages={Math.ceil(dealers.length / limit)}
                onPageChange={setPage}
                onLimitChange={(l) => { setLimit(l); setPage(1); }}
              />
            </div>
          )}
        </div>

      </div>

      {/* INQUIRY MODAL */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setInquiryModalOpen(null)} />
          <div className="relative w-full max-w-lg bg-background rounded-[2.5rem] border border-[var(--border-subtle)] shadow-2xl p-8 overflow-hidden animate-slide-up">
            
            <button onClick={() => setInquiryModalOpen(null)} className="absolute top-6 right-6 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors">
              <X size={20} />
            </button>

            <div className="mb-8 pr-12">
              <h3 className="text-2xl font-black text-foreground mb-2">Request Callback</h3>
              <p className="text-sm font-bold text-muted">A representative from <span className="text-[var(--color-brand-green)]">{inquiryModalOpen.businessName}</span> will contact you shortly.</p>
            </div>

            <form onSubmit={handleInquirySubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Your Name</label>
                <input required type="text" placeholder="John Doe" className="w-full px-4 py-3.5 bg-foreground/5 border-none rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none" />
              </div>
              
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Mobile Number</label>
                <input required type="tel" placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3.5 bg-foreground/5 border-none rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none" />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Interest / Query</label>
                <textarea rows={3} placeholder="I am interested in buying..." className="w-full px-4 py-3.5 bg-foreground/5 border-none rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none resize-none" />
              </div>

              <button type="submit" className="w-full py-4 mt-2 bg-[var(--color-brand-green)] text-white font-black rounded-2xl shadow-lg shadow-[var(--color-brand-green)]/30 hover:-translate-y-1 transition-all active:translate-y-0">
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
