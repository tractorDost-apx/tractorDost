'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Globe, Calendar, Tractor, Star } from 'lucide-react';
import { brandAPI, Brand } from '@/lib/api/brands';

export default function BrandsListingPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const res = await brandAPI.getAllBrands({ limit: 200 }); // Fetch all brands
        if (res.success) {
          const payload = res.data as any;
          setBrands(payload.brands || payload.data || []);
        }
      } catch (err) {
        console.error("Failed to load brands", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // Filter brands based on search
  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-screen flex flex-col pt-8 pb-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* HEADER / HERO SECTION */}
      <div className="bg-gradient-to-r from-[var(--color-brand-green)]/10 to-[var(--color-brand-orange)]/10 rounded-[2.5rem] p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between border border-[var(--border-subtle)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-green)]/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="z-10 flex flex-col gap-3">
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Explore Top Brands</h1>
          <p className="text-muted font-bold text-lg max-w-2xl">
            Discover the most trusted tractor manufacturers in India. Find the perfect machine for your farm from top brands.
          </p>
        </div>
        
        {/* Total Count Badge */}
        <div className="mt-6 md:mt-0 z-10 bg-background/80 backdrop-blur-md border border-[var(--border-subtle)] px-6 py-4 rounded-2xl flex flex-col items-center">
          <span className="text-3xl font-black text-[var(--color-brand-green)]">{brands.length}</span>
          <span className="text-[10px] uppercase font-black tracking-widest text-muted">Brands Found</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="w-full flex justify-end mb-8">
        <div className="relative w-full md:w-96">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text"
            placeholder="Search brands by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-[var(--border-subtle)] rounded-[1.5rem] pl-12 pr-4 py-4 text-base font-bold focus:outline-none focus:border-[var(--color-brand-green)]/50 focus:shadow-[0_4px_20px_rgba(74,118,53,0.1)] transition-all shadow-sm"
          />
        </div>
      </div>

      {/* BRANDS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-64 bg-foreground/5 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-muted" />
          </div>
          <h3 className="text-2xl font-black text-foreground mb-2">No brands found</h3>
          <p className="text-muted font-medium max-w-md">We couldn't find any brands matching "{searchQuery}". Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBrands.map((brand) => (
            <Link 
              key={brand.id} 
              href={`/tractors?brand=${brand.id}`} 
              className="flex flex-col overflow-hidden relative group cursor-pointer p-6 rounded-[2rem] bg-background/50 border border-[var(--border-subtle)] hover:border-[var(--border-brand)] hover:shadow-lg hover:-translate-y-1 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              {/* Logo Area */}
              <div className="h-40 w-full rounded-2xl bg-foreground/5 flex items-center justify-center relative mb-6 overflow-hidden group-hover:bg-background transition-colors p-4">
                {brand.isFeatured && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest z-10 flex items-center gap-1 shadow-sm">
                    <Star size={10} className="fill-current" /> Featured
                  </div>
                )}
                {brand.logoUrl ? (
                  <img 
                    src={brand.logoUrl} 
                    alt={brand.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-0 mix-blend-multiply dark:mix-blend-normal"
                  />
                ) : (
                  <span className="font-black text-5xl text-foreground/20 group-hover:text-[var(--color-brand-green)]/40 transition-colors">
                    {brand.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Brand Info */}
              <div className="flex flex-col flex-1">
                <h3 className="text-xl font-black text-foreground mb-3 group-hover:text-[var(--color-brand-green)] transition-colors line-clamp-1">
                  {brand.name}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {brand.country && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-muted bg-foreground/5 px-2 py-1 rounded-md">
                      <Globe size={12} /> {brand.country}
                    </span>
                  )}
                  {brand.foundedYear && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-muted bg-foreground/5 px-2 py-1 rounded-md">
                      <Calendar size={12} /> Est. {brand.foundedYear}
                    </span>
                  )}
                </div>

                {brand.aboutBrand ? (
                  <div 
                    className="text-sm font-medium text-muted line-clamp-2 mb-4 flex-1"
                    dangerouslySetInnerHTML={{ __html: brand.aboutBrand }}
                  />
                ) : (
                  <div className="flex-1" />
                )}

                <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-brand-green)] uppercase tracking-wider flex items-center gap-1.5">
                    <Tractor size={14} /> {brand.totalModels || 0} Models
                  </span>
                  <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-[var(--color-brand-green)] group-hover:text-white transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
