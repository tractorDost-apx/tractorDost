'use client';

import React, { useState, useEffect } from 'react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { UsedTractorListing, ConditionGrade } from '@/lib/api/usedTractors';
import { brandAPI, Brand } from '@/lib/api/brands';
import { Search, MapPin, Filter, LayoutList, Calendar, Gauge, User, CheckCircle2, CircleDollarSign, X, MessageCircle, Info, Phone, ShieldCheck, ChevronRight } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';

export default function UsedTractorsPage() {
  const [tractors, setTractors] = useState<UsedTractorListing[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced UI States
  const [sortBy, setSortBy] = useState<'recent' | 'price_low' | 'price_high' | 'hours_low'>('recent');
  const [enquiryModalOpen, setEnquiryModalOpen] = useState<UsedTractorListing | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [isCertified, setIsCertified] = useState(false);
  const [financeAvailable, setFinanceAvailable] = useState(false);
  const [rcAvailable, setRcAvailable] = useState(false);
  const [maxHours, setMaxHours] = useState<number | undefined>(undefined);
  const [minYear, setMinYear] = useState<number | undefined>(undefined);
  const [ownership, setOwnership] = useState<number | undefined>(undefined);

  // Formatter
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const indianStates = ['Maharashtra', 'Punjab', 'Madhya Pradesh', 'Haryana', 'Uttar Pradesh'];
  const priceRanges = [
    { label: 'Any Price', value: undefined },
    { label: 'Under ₹3 Lakh', value: 300000 },
    { label: 'Under ₹5 Lakh', value: 500000 },
    { label: 'Under ₹7 Lakh', value: 700000 }
  ];
  const hoursRanges = [
    { label: 'Any Hours', value: undefined },
    { label: 'Under 1000 Hrs', value: 1000 },
    { label: 'Under 3000 Hrs', value: 3000 },
    { label: 'Under 5000 Hrs', value: 5000 }
  ];

  useEffect(() => {
    brandAPI.getAllBrands({ limit: 50 }).then(res => {
      if (res.success) {
        const list = (res.data as any).data || (res.data as any).brands || [];
        setBrands(list.filter((b: any) => b.isActive));
      }
    });
  }, []);

  useEffect(() => {
    const fetchTractors = async () => {
      setLoading(true);
      try {
        const res = await usedTractorListingAPI.getAllListings({
          tractorBrand: selectedBrand || undefined,
          state: selectedState || undefined,
          priceMax: maxPrice || undefined,
          isCertified: isCertified ? true : undefined,
          financeAvailable: financeAvailable ? true : undefined,
          yearMin: minYear || undefined
        });
        
        if (res.success) {
          // The backend wraps the array in a paginated object: res.data = { data: [...], total: ... }
          const dataArray = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
          let data = [...dataArray];
          
          // Apply Frontend Filters (For fields not supported by backend schema)
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(t => 
              (t.tractorBrand || '').toLowerCase().includes(query) || 
              (t.tractorModel || '').toLowerCase().includes(query) ||
              (t.villageCity || '').toLowerCase().includes(query)
            );
          }
          if (rcAvailable) {
            data = data.filter(t => t.rcAvailable === true);
          }
          if (maxHours) {
            data = data.filter(t => (t.hoursUsed || 0) <= maxHours);
          }
          if (ownership) {
            data = data.filter(t => t.ownership === ownership);
          }

          // Apply Frontend Sort
          if (sortBy === 'price_low') {
            data = data.sort((a: UsedTractorListing, b: UsedTractorListing) => (a.askingPrice || 0) - (b.askingPrice || 0));
          } else if (sortBy === 'price_high') {
            data = data.sort((a: UsedTractorListing, b: UsedTractorListing) => (b.askingPrice || 0) - (a.askingPrice || 0));
          } else if (sortBy === 'hours_low') {
            data = data.sort((a: UsedTractorListing, b: UsedTractorListing) => (a.hoursUsed || 99999) - (b.hoursUsed || 99999));
          } else {
            // Recent (Mock sorting by ID descending)
            data = data.sort((a: UsedTractorListing, b: UsedTractorListing) => b.id - a.id);
          }

          setTractors(data);
        }
      } catch (err) {
        console.error('Failed to fetch used tractors', err);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchTractors, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedBrand, selectedState, sortBy, maxPrice, isCertified, financeAvailable, rcAvailable, maxHours, minYear, ownership]);

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Your enquiry for ${enquiryModalOpen?.tractorBrand} ${enquiryModalOpen?.tractorModel} has been sent successfully. The seller will contact you shortly.`);
    setEnquiryModalOpen(null);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen py-10 px-4 sm:px-6 relative">
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center justify-center px-4 py-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full mb-4 font-black tracking-widest text-xs uppercase border border-[var(--color-brand-green)]/20">
          <ShieldCheck size={16} className="mr-2 inline" /> Verified Marketplace
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
          Find Your Perfect <span className="text-[var(--color-brand-green)]">Used Tractor</span>
        </h1>
        <p className="text-muted font-bold text-lg max-w-2xl">
          Browse thousands of certified, pre-owned tractors. Directly contact sellers and get the best deals on verified machines.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Filters */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6 animate-slide-in">
          <div className="bg-[var(--card-bg)] rounded-3xl p-6 sticky top-24 border border-[var(--border-subtle)] backdrop-blur-3xl shadow-[var(--card-shadow)]">
            <div className="flex items-center justify-between mb-6 text-foreground font-black">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-[var(--color-brand-green)]" />
                <h3>Smart Filters</h3>
              </div>
              <button 
                 onClick={() => { 
                   setSearchQuery(''); setSelectedBrand(null); setSelectedState(''); 
                   setIsCertified(false); setFinanceAvailable(false); setRcAvailable(false); setMaxPrice(undefined);
                   setMaxHours(undefined); setMinYear(undefined); setOwnership(undefined);
                 }}
                 className="text-xs text-muted hover:text-[var(--color-brand-green)] underline"
               >
                 Clear All
               </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">Search Listings</label>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="text"
                  placeholder="Model or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-foreground/5 border-none rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none transition-shadow"
                />
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">Max Price</label>
              <select 
                value={maxPrice || ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-3 bg-foreground/5 border-none rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none"
              >
                {priceRanges.map(p => (
                  <option key={p.label} value={p.value}>{p.label}</option>
                ))}
              </select>
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

            {/* Hours Filter */}
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">Hours Used</label>
              <select 
                value={maxHours || ''}
                onChange={(e) => setMaxHours(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-3 bg-foreground/5 border-none rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none"
              >
                {hoursRanges.map(h => (
                  <option key={h.label} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>

            {/* Ownership Filter */}
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">Ownership</label>
              <select 
                value={ownership || ''}
                onChange={(e) => setOwnership(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-3 bg-foreground/5 border-none rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none"
              >
                <option value="">Any Ownership</option>
                <option value="1">1st Owner</option>
                <option value="2">2nd Owner</option>
                <option value="3">3rd Owner +</option>
              </select>
            </div>

            {/* Trust Toggles */}
            <div className="mb-6 flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent bg-[var(--color-brand-green)]/5 hover:bg-[var(--color-brand-green)]/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={isCertified}
                  onChange={(e) => setIsCertified(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background"
                />
                <span className="font-bold text-sm text-foreground flex items-center gap-2"><CheckCircle2 size={16} className="text-[var(--color-brand-green)]" /> Certified Only</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent bg-foreground/5 hover:bg-foreground/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={financeAvailable}
                  onChange={(e) => setFinanceAvailable(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background"
                />
                <span className="font-bold text-sm text-foreground flex items-center gap-2"><CircleDollarSign size={16} className="text-blue-500" /> Finance Available</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent bg-foreground/5 hover:bg-foreground/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={rcAvailable}
                  onChange={(e) => setRcAvailable(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background"
                />
                <span className="font-bold text-sm text-foreground flex items-center gap-2">RC Available</span>
              </label>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-3 block">Brands</label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                <button 
                  onClick={() => setSelectedBrand(null)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left ${!selectedBrand ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner' : 'border-transparent bg-foreground/5 text-foreground hover:bg-background/80 hover:shadow-sm'}`}
                >
                  <span className="font-bold text-sm">All Brands</span>
                </button>
                {brands.map(brand => (
                  <button 
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.name)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left ${selectedBrand === brand.name ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner' : 'border-transparent bg-foreground/5 text-foreground hover:bg-background/80 hover:shadow-sm'}`}
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

        {/* Right Column: Listings */}
        <div className="w-full lg:w-3/4">
          
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 animate-fade-in bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-3 rounded-[1.5rem]">
            <div className="flex items-center gap-2 w-full sm:w-auto px-4">
              <span className="text-sm font-black text-muted uppercase tracking-widest">
                <span className="text-foreground text-lg">{tractors.length}</span> Tractors Found
              </span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-background border-none rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none shadow-sm"
              >
                <option value="recent">Recently Added</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="hours_low">Hours: Low to High</option>
              </select>

              <div className="flex bg-background rounded-xl p-1 shadow-sm">
                <button className="p-2 rounded-lg bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <LayoutList size={18} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="w-full flex justify-center py-32">
              <TractorLoader size={48} className="text-[var(--color-brand-green)]" />
            </div>
          ) : tractors.length === 0 ? (
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl shadow-[var(--card-shadow)] rounded-3xl p-16 text-center flex flex-col items-center justify-center animate-fade-in border border-[var(--border-subtle)]">
               <Search size={64} className="text-muted mb-6 opacity-40" />
               <h3 className="text-2xl font-black text-foreground mb-3">No Tractors Found</h3>
               <p className="text-muted font-bold text-base max-w-md mb-8">We couldn't find any used tractors matching your specific criteria. Try broadening your search.</p>
               <button 
                 onClick={() => { 
                    setSearchQuery(''); setSelectedBrand(null); setSelectedState(''); 
                    setIsCertified(false); setFinanceAvailable(false); setRcAvailable(false); setMaxPrice(undefined);
                    setMaxHours(undefined); setMinYear(undefined); setOwnership(undefined);
                 }}
                 className="px-8 py-4 bg-[var(--color-brand-green)] text-white font-black rounded-2xl hover:bg-[var(--color-brand-green)]/90 transition-transform hover:-translate-y-1 shadow-lg shadow-[var(--color-brand-green)]/20"
               >
                 Reset All Filters
               </button>
            </div>
          ) : (
            // LISTINGS VIEW
            <div className="flex flex-col gap-6 animate-fade-in">
              {tractors.slice((page - 1) * limit, page * limit).map((tractor) => (
                <div key={tractor.id} className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2rem] p-4 sm:p-6 flex flex-col md:flex-row gap-6 border border-[var(--border-subtle)] shadow-[var(--card-shadow)] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--color-brand-green)]/10 transition-all duration-400 group overflow-hidden relative">
                  
                  {tractor.isCertified && (
                     <div className="absolute top-0 right-0 bg-[var(--color-brand-green)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl z-10 shadow-md">
                       Certified
                     </div>
                  )}

                  {/* Image Section */}
                  <div className="w-full md:w-64 h-48 md:h-auto shrink-0 rounded-2xl overflow-hidden relative bg-foreground/5">
                    {tractor.imageUrl ? (
                      <img src={tractor.imageUrl} alt={`${tractor.tractorBrand} ${tractor.tractorModel}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
                    )}
                    <div className="absolute bottom-3 left-3 flex gap-2">
                       <span className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-black px-2 py-1 rounded-md shadow-sm border border-[var(--border-subtle)]">
                         {tractor.viewsCount} Views
                       </span>
                    </div>
                  </div>
                  
                  {/* Info Section */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <div>
                          <h2 className="text-2xl font-black text-foreground group-hover:text-[var(--color-brand-green)] transition-colors line-clamp-1">
                            {tractor.tractorBrand} {tractor.tractorModel}
                          </h2>
                          <div className="flex items-center gap-2 text-muted font-bold text-sm mt-1">
                            <MapPin size={14} className="text-[var(--color-brand-green)]" />
                            {tractor.villageCity ? `${tractor.villageCity}, ` : ''}{tractor.district}, {tractor.state}
                          </div>
                        </div>
                        
                        <div className="text-right">
                           <div className="text-2xl font-black text-[var(--color-brand-green)]">
                             {formatPrice(tractor.askingPrice)}
                           </div>
                           {tractor.negotiable && (
                             <div className="text-xs font-bold text-muted uppercase tracking-wider">Negotiable Price</div>
                           )}
                        </div>
                      </div>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-5">
                        <div className="bg-foreground/5 rounded-xl p-3 flex flex-col justify-center">
                          <span className="text-[10px] uppercase font-black tracking-widest text-muted flex items-center gap-1.5 mb-1"><Calendar size={12}/> Year</span>
                          <span className="font-black text-sm">{tractor.yearOfManufacture}</span>
                        </div>
                        <div className="bg-foreground/5 rounded-xl p-3 flex flex-col justify-center">
                          <span className="text-[10px] uppercase font-black tracking-widest text-muted flex items-center gap-1.5 mb-1"><Gauge size={12}/> Hours</span>
                          <span className="font-black text-sm">{tractor.hoursUsed ? `${tractor.hoursUsed} Hrs` : 'N/A'}</span>
                        </div>
                        <div className="bg-foreground/5 rounded-xl p-3 flex flex-col justify-center">
                          <span className="text-[10px] uppercase font-black tracking-widest text-muted flex items-center gap-1.5 mb-1"><User size={12}/> Owner</span>
                          <span className="font-black text-sm">{tractor.ownership}{tractor.ownership === 1 ? 'st' : tractor.ownership === 2 ? 'nd' : tractor.ownership === 3 ? 'rd' : 'th'}</span>
                        </div>
                        <div className="bg-foreground/5 rounded-xl p-3 flex flex-col justify-center">
                          <span className="text-[10px] uppercase font-black tracking-widest text-muted flex items-center gap-1.5 mb-1"><Info size={12}/> Condition</span>
                          <span className="font-black text-sm capitalize">{(tractor.conditionGrade || 'N/A').toLowerCase()}</span>
                        </div>
                        <div className="bg-foreground/5 rounded-xl p-3 flex flex-col justify-center">
                          <span className="text-[10px] uppercase font-black tracking-widest text-muted flex items-center gap-1.5 mb-1">Engine</span>
                          <span className="font-black text-sm text-[var(--color-brand-green)]">{tractor.engineConditionPct ? `${tractor.engineConditionPct}%` : 'N/A'}</span>
                        </div>
                      </div>

                      {/* Badges & Description */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                         <div className="flex flex-wrap gap-2">
                           {tractor.rcAvailable && (
                             <span className="px-2.5 py-1 bg-foreground/5 rounded-md text-xs font-bold text-foreground border border-[var(--border-subtle)] shadow-sm">RC Available</span>
                           )}
                           {tractor.loanClearanceStatus === 'CLEAR' && (
                             <span className="px-2.5 py-1 bg-foreground/5 rounded-md text-xs font-bold text-foreground border border-[var(--border-subtle)] shadow-sm">Loan Cleared</span>
                           )}
                           {tractor.financeAvailable && (
                             <span className="px-2.5 py-1 bg-blue-500/10 rounded-md text-xs font-bold text-blue-600 border border-blue-500/20 shadow-sm">Finance Available</span>
                           )}
                           {tractor.estimatedMarketPrice && tractor.askingPrice < tractor.estimatedMarketPrice && (
                             <span className="px-2.5 py-1 bg-emerald-500/10 rounded-md text-xs font-bold text-emerald-600 border border-emerald-500/20 shadow-sm">Great Price</span>
                           )}
                         </div>
                         
                         <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                           <button 
                             onClick={() => setEnquiryModalOpen(tractor)}
                             className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-background border border-[var(--color-brand-green)] text-[var(--color-brand-green)] font-black rounded-xl hover:bg-[var(--color-brand-green)]/10 transition-colors"
                           >
                             <MessageCircle size={16} />
                             Contact Seller
                           </button>
                           <Link 
                             href={`/used-tractors/details/${tractor.id}`}
                             className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/90 text-white font-black rounded-xl shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                           >
                             View Details
                             <ChevronRight size={16} />
                           </Link>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!loading && tractors.length > 0 && (
            <div className="mt-6">
              <Pagination
                page={page}
                limit={limit}
                totalCount={tractors.length}
                totalPages={Math.ceil(tractors.length / limit)}
                onPageChange={setPage}
                onLimitChange={(l) => { setLimit(l); setPage(1); }}
              />
            </div>
          )}
        </div>

      </div>

      {/* ENQUIRY MODAL */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setEnquiryModalOpen(null)} />
          <div className="relative w-full max-w-lg bg-background rounded-[2.5rem] border border-[var(--border-subtle)] shadow-2xl p-8 overflow-hidden animate-slide-up">
            
            <button onClick={() => setEnquiryModalOpen(null)} className="absolute top-6 right-6 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors">
              <X size={20} />
            </button>

            <div className="mb-8 pr-12">
              <h3 className="text-2xl font-black text-foreground mb-2">Contact Seller</h3>
              <p className="text-sm font-bold text-muted">You are inquiring about the <span className="text-[var(--color-brand-green)]">{enquiryModalOpen.tractorBrand} {enquiryModalOpen.tractorModel}</span>.</p>
            </div>

            <div className="flex items-center gap-4 p-4 bg-foreground/5 rounded-2xl mb-6">
               <div className="w-16 h-12 bg-background rounded-xl overflow-hidden shrink-0">
                  {enquiryModalOpen.imageUrl ? <img src={enquiryModalOpen.imageUrl} className="w-full h-full object-cover" /> : null}
               </div>
               <div>
                  <div className="font-black text-sm">{formatPrice(enquiryModalOpen.askingPrice)}</div>
                  <div className="text-xs font-bold text-muted">{enquiryModalOpen.yearOfManufacture} • {enquiryModalOpen.hoursUsed} Hrs</div>
               </div>
            </div>

            <form onSubmit={handleEnquirySubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Your Name</label>
                <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-foreground/5 border-none rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none" />
              </div>
              
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Mobile Number</label>
                <input required type="tel" placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3 bg-foreground/5 border-none rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none" />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Message (Optional)</label>
                <textarea rows={3} placeholder="Hi, I am interested in this tractor..." className="w-full px-4 py-3 bg-foreground/5 border-none rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none resize-none" />
              </div>

              <button type="submit" className="w-full py-4 mt-2 bg-[var(--color-brand-green)] text-white font-black rounded-2xl shadow-lg shadow-[var(--color-brand-green)]/30 hover:-translate-y-1 transition-all active:translate-y-0">
                Send Enquiry
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
