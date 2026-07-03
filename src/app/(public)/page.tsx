'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Flame, ArrowRightLeft, Star } from 'lucide-react';
import { tractorAPI, Tractor } from '@/lib/api/tractors';
import { brandAPI, Brand } from '@/lib/api/brands';
import { compareAPI, CompareFrequencyRecord } from '@/lib/api/compare';

export default function PublicHomePage() {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [comparisons, setComparisons] = useState<CompareFrequencyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Smart Matcher State
  const [budget, setBudget] = useState('');
  const [hp, setHp] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [tractorsRes, brandsRes, compareRes] = await Promise.all([
          tractorAPI.getAllTractors({ limit: 6 }), // Fetch latest for featured
          brandAPI.getAllBrands({ limit: 8 }),
          compareAPI.getFrequencyOfCompare({ limit: 3, sort: 'desc' })
        ]);

        if (tractorsRes.success) setTractors(tractorsRes.data.data);
        if (brandsRes.success) setBrands(brandsRes.data.data);
        if (compareRes.success) setComparisons(compareRes.data.records);

      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on Request';
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    return `₹ ${price.toLocaleString()}`;
  };

  const maxFreq = comparisons.length > 0 ? Math.max(...comparisons.map(c => c.frequency)) : 1;

  return (
    <div className="w-full flex flex-col gap-16 pb-20 animate-fade-in overflow-hidden">
      
      {/* 1. HERO SECTION WITH SMART MATCHER */}
      <section className="relative w-full h-[600px] flex items-center justify-center bg-black overflow-hidden">
        {/* Background Overlay & Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background z-10" />
        
        {/* Abstract shapes / Image placeholder (In real app, a tractor video/image goes here) */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-brand-green)] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-brand-orange)] rounded-full blur-[120px]" />
        </div>

        <div className="relative z-20 w-full max-w-6xl mx-auto px-6 flex flex-col items-center text-center gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight uppercase leading-tight">
              Find Your <span className="text-[var(--color-brand-orange)]">Perfect</span> Tractor
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto">
              India's most trusted platform for comparing, finding, and buying the best tractors at the exact on-road price.
            </p>
          </div>

          {/* Smart Tractor Matcher Wizard */}
          <div className="w-full max-w-4xl bg-background/20 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
            
            <div className="flex-1 w-full bg-background/50 rounded-2xl flex items-center px-4 py-3 border border-white/5 focus-within:border-[var(--color-brand-green)]/50 transition-colors">
              <Search className="text-[var(--color-brand-green)] mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Search by brand or model (e.g., Mahindra 575)" 
                className="w-full bg-transparent border-none text-white placeholder:text-white/40 focus:outline-none text-lg font-bold"
              />
            </div>

            <div className="flex w-full md:w-auto gap-4">
              <select className="bg-background/50 border border-white/5 rounded-2xl px-6 py-3 text-white font-bold appearance-none outline-none focus:border-[var(--color-brand-green)]/50">
                <option value="">Any Budget</option>
                <option value="under5">Under 5 Lakh</option>
                <option value="5to8">5 - 8 Lakh</option>
                <option value="over8">Above 8 Lakh</option>
              </select>
              
              <select className="bg-background/50 border border-white/5 rounded-2xl px-6 py-3 text-white font-bold appearance-none outline-none focus:border-[var(--color-brand-green)]/50">
                <option value="">Any HP</option>
                <option value="under30">Under 30 HP</option>
                <option value="30to50">30 - 50 HP</option>
                <option value="over50">Above 50 HP</option>
              </select>
            </div>

            <button className="w-full md:w-auto px-8 py-4 bg-[var(--color-brand-green)] text-white font-black text-lg uppercase tracking-wider rounded-2xl hover:bg-[var(--color-brand-orange)] transition-all shadow-lg shadow-[var(--color-brand-green)]/30 shrink-0">
              Find Now
            </button>
          </div>
        </div>
      </section>

      <div className="w-full max-w-7xl mx-auto px-6 flex flex-col gap-24">
        
        {/* 2. TOP BRANDS CAROUSEL */}
        <section className="flex flex-col gap-8">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Explore Top Brands</h2>
              <p className="text-muted font-bold">Discover the most trusted manufacturers in India.</p>
            </div>
            <Link href="/brands" className="hidden md:flex items-center gap-2 text-sm font-bold text-[var(--color-brand-green)] hover:text-[var(--color-brand-orange)] transition-colors uppercase tracking-wider">
              View All Brands <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-foreground/5 rounded-2xl animate-pulse" />
              ))
            ) : brands.map((brand) => (
              <Link key={brand.id} href={`/tractors?brand=${brand.id}`} className="aspect-square bg-background border border-foreground/10 rounded-2xl flex flex-col items-center justify-center p-4 hover:border-[var(--color-brand-orange)] hover:shadow-lg transition-all group">
                <div className="w-16 h-16 relative flex items-center justify-center mb-2">
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                  ) : (
                    <span className="font-black text-2xl text-foreground/20">{brand.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-xs font-black text-foreground uppercase tracking-wider text-center">{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. FEATURED TRACTORS */}
        <section className="flex flex-col gap-8">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Featured Tractors</h2>
              <p className="text-muted font-bold">Handpicked high-performance machines for your farm.</p>
            </div>
            <Link href="/tractors" className="hidden md:flex items-center gap-2 text-sm font-bold text-[var(--color-brand-green)] hover:text-[var(--color-brand-orange)] transition-colors uppercase tracking-wider">
              View Inventory <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 bg-foreground/5 rounded-3xl animate-pulse" />
              ))
            ) : tractors.map((tractor) => (
              <Link key={tractor.id} href={`/tractors/${tractor.id}`} className="glass-panel rounded-3xl overflow-hidden group hover:border-[var(--color-brand-green)]/30 transition-all shadow-sm hover:shadow-xl flex flex-col relative">
                
                {/* Image Section */}
                <div className="h-56 bg-gradient-to-b from-foreground/5 to-transparent relative p-6 flex items-center justify-center overflow-hidden">
                  <div className="absolute top-4 left-4 bg-[var(--color-brand-orange)] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full z-10 flex items-center gap-1">
                    <Star size={12} className="fill-white" /> Top Rated
                  </div>
                  <img 
                    src={tractor.media && tractor.media.length > 0 ? (tractor.media.find(m => m.isPrimary)?.url || tractor.media[0].url) : 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image'} 
                    alt={tractor.modelName} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 relative z-0 mix-blend-multiply dark:mix-blend-normal"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image' }}
                  />
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1 bg-background">
                  <span className="text-xs font-black text-[var(--color-brand-green)] uppercase tracking-widest mb-1">{tractor.brand?.name || 'Brand'}</span>
                  <h3 className="text-xl font-black text-foreground mb-4 line-clamp-1">{tractor.modelName}</h3>
                  
                  {/* Quick Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="flex flex-col gap-1 p-2 bg-foreground/5 rounded-xl text-center">
                      <span className="text-lg font-black text-foreground">{tractor.hp || '--'}</span>
                      <span className="text-[9px] uppercase font-bold text-muted tracking-widest">Engine HP</span>
                    </div>
                    <div className="flex flex-col gap-1 p-2 bg-foreground/5 rounded-xl text-center">
                      <span className="text-lg font-black text-foreground">{tractor.fuelType === 'DIESEL' ? 'DSL' : tractor.fuelType}</span>
                      <span className="text-[9px] uppercase font-bold text-muted tracking-widest">Fuel</span>
                    </div>
                    <div className="flex flex-col gap-1 p-2 bg-foreground/5 rounded-xl text-center">
                      <span className="text-lg font-black text-foreground">{tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}</span>
                      <span className="text-[9px] uppercase font-bold text-muted tracking-widest">Drive</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-foreground/10 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Starting Price</span>
                      <span className="text-lg font-black text-[var(--color-brand-green)]">{formatPrice(tractor.exShowroomPriceMin)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-[var(--color-brand-green)] group-hover:text-white transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. TRENDING COMPARISONS (HOT VS BATTLES) */}
        <section className="flex flex-col gap-8 bg-gradient-to-br from-foreground/5 to-transparent p-8 md:p-12 rounded-[3rem] border border-foreground/10 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-brand-orange)]/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
              <Flame size={24} className="text-red-500 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Hot Comparisons</h2>
              <p className="text-muted font-bold">See which tractors other farmers are comparing right now.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10">
            {loading ? (
               Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-background/50 rounded-3xl animate-pulse" />
              ))
            ) : comparisons.map((comp, idx) => {
              const hotness = (comp.frequency / maxFreq) * 100;
              return (
                <Link key={idx} href={`/compare?left=${comp.tractorLeft?.id}&right=${comp.tractorRight?.id}`} className="bg-background rounded-3xl p-6 shadow-sm hover:shadow-xl border border-foreground/5 hover:border-[var(--color-brand-orange)]/50 transition-all flex flex-col gap-4 group cursor-pointer">
                  
                  <div className="flex items-center justify-between">
                    {/* Left Tractor */}
                    <div className="flex flex-col items-center text-center w-5/12">
                       <div className="w-16 h-16 rounded-full bg-foreground/5 p-2 mb-2 flex items-center justify-center overflow-hidden border border-transparent group-hover:border-foreground/10 transition-colors">
                          {comp.tractorLeft?.primaryMedia?.url ? (
                            <img src={comp.tractorLeft.primaryMedia.url} alt="L" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-foreground/20" />
                          )}
                       </div>
                       <span className="text-[10px] font-black text-[var(--color-brand-green)] uppercase truncate w-full">{comp.tractorLeft?.brand?.name}</span>
                       <span className="text-xs font-black text-foreground leading-tight truncate w-full">{comp.tractorLeft?.modelName}</span>
                    </div>

                    {/* VS Icon */}
                    <div className="flex flex-col items-center justify-center w-2/12">
                      <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center z-10 text-[var(--color-brand-orange)] font-black text-[10px] italic">
                        VS
                      </div>
                      <div className="h-[1px] w-full bg-foreground/10 absolute z-0" />
                    </div>

                    {/* Right Tractor */}
                    <div className="flex flex-col items-center text-center w-5/12">
                       <div className="w-16 h-16 rounded-full bg-foreground/5 p-2 mb-2 flex items-center justify-center overflow-hidden border border-transparent group-hover:border-foreground/10 transition-colors">
                          {comp.tractorRight?.primaryMedia?.url ? (
                            <img src={comp.tractorRight.primaryMedia.url} alt="R" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-foreground/20" />
                          )}
                       </div>
                       <span className="text-[10px] font-black text-[var(--color-brand-green)] uppercase truncate w-full">{comp.tractorRight?.brand?.name}</span>
                       <span className="text-xs font-black text-foreground leading-tight truncate w-full">{comp.tractorRight?.modelName}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] font-black uppercase text-muted tracking-widest">
                      <span>Popularity Match</span>
                      <span>{Math.max(20, Math.round(hotness))}%</span>
                    </div>
                    <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[var(--color-brand-green)] to-[var(--color-brand-orange)] rounded-full transition-all duration-1000" style={{ width: `${Math.max(20, hotness)}%` }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
