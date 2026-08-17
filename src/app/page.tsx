'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Flame, Star, Tractor, Handshake, CircleDollarSign, Landmark, Wrench } from 'lucide-react';
import { tractorAPI, Tractor as TractorModel } from '@/lib/api/tractors';
import { brandAPI, Brand } from '@/lib/api/brands';
import { compareAPI, CompareFrequencyRecord } from '@/lib/api/compare';
import { AnimatedWord } from '@/components/ui/AnimatedWord';

export default function HomePage() {
  const [tractors, setTractors] = useState<TractorModel[]>([]);
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

        if (tractorsRes.success) {
          const tPayload = tractorsRes.data as any;
          setTractors(tPayload.tractors || tPayload.data || []);
        }
        if (brandsRes.success) {
          const bPayload = brandsRes.data as any;
          setBrands(bPayload.brands || bPayload.data || []);
        }
        if (compareRes.success) {
          const cPayload = compareRes.data as any;
          setComparisons(cPayload.records || cPayload || []);
        }

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
    <div className="flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto mt-6 gap-20 px-4 pb-24 animate-fade-in">
      
      {/* =========================================
          HERO & SEARCH DASHBOARD
          ========================================= */}
      <section className="w-full p-8 md:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden group rounded-[2.5rem] mt-2">
        {/* Refined Ambient Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-[var(--color-brand-green)]/15 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 group-hover:bg-[var(--color-brand-green)]/20" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[var(--color-brand-orange)]/10 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 group-hover:bg-[var(--color-brand-orange)]/15" />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Professional Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--color-brand-green)]/5 border border-[var(--border-brand)] backdrop-blur-md mb-8 transition-all duration-300 hover:bg-[var(--color-brand-green)]/10 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand-green)]"></span>
            </span>
            <span className="text-xs font-semibold tracking-widest uppercase text-foreground/80">India's Premium Tractor Network</span>
          </div>
          
          <h1 className="flex flex-col items-center justify-center text-4xl md:text-[5.5rem] font-bold text-foreground max-w-5xl tracking-tight leading-[1.1]">
            <span className="mb-2 md:mb-3">Find the Perfect</span>
            <div className="h-[1.1em] flex items-center justify-center overflow-visible text-[var(--color-brand-green)]">
              <AnimatedWord />
            </div>
            <span className="mt-2 md:mt-3 text-2xl md:text-5xl text-muted font-medium tracking-tight opacity-90">
              for Your Farm
            </span>
          </h1>
          <p className="text-base md:text-xl text-muted mt-8 max-w-2xl leading-relaxed font-normal">
            Discover, buy, and finance premium new and used tractors. Compare models and connect with verified dealers instantly.
          </p>

          {/* Unified Professional Search Bar */}
          <div className="mt-12 w-full max-w-4xl bg-background/60 backdrop-blur-xl rounded-[1.5rem] border border-[var(--border-brand)] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center focus-within:border-[var(--color-brand-green)]/40 focus-within:shadow-[0_8px_40px_rgba(74,118,53,0.08)] transition-all duration-300 hover:shadow-lg">
            
            <div className="flex-1 w-full flex items-center px-4 py-3 md:py-4">
              <Search className="text-[var(--color-brand-green)] opacity-80 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Search Brand, HP, Budget..." 
                className="w-full bg-transparent border-none text-foreground placeholder:text-muted/60 focus:outline-none text-base md:text-lg font-medium"
                suppressHydrationWarning
              />
            </div>

            <div className="hidden md:block w-[1px] h-10 bg-foreground/10 mx-2" />

            <div className="flex w-full md:w-auto border-t md:border-t-0 border-[var(--border-subtle)] md:border-none pt-2 md:pt-0">
              <select className="flex-1 md:flex-none bg-transparent px-4 py-3 md:py-4 text-foreground text-sm md:text-base font-medium appearance-none outline-none cursor-pointer transition-colors border-r border-[var(--border-subtle)] md:border-none" suppressHydrationWarning>
                <option value="" className="bg-background text-foreground">Any Budget</option>
                <option value="under5" className="bg-background text-foreground">Under 5 Lakh</option>
                <option value="5to8" className="bg-background text-foreground">5 - 8 Lakh</option>
                <option value="over8" className="bg-background text-foreground">Above 8 Lakh</option>
              </select>
              
              <div className="hidden md:block w-[1px] h-10 bg-foreground/10 mx-2" />

              <select className="flex-1 md:flex-none bg-transparent px-4 py-3 md:py-4 text-foreground text-sm md:text-base font-medium appearance-none outline-none cursor-pointer transition-colors" suppressHydrationWarning>
                <option value="" className="bg-background text-foreground">Any HP</option>
                <option value="under30" className="bg-background text-foreground">Under 30 HP</option>
                <option value="30to50" className="bg-background text-foreground">30 - 50 HP</option>
                <option value="over50" className="bg-background text-foreground">Above 50 HP</option>
              </select>
            </div>

            <button className="w-full md:w-auto px-10 py-4 mt-2 md:mt-0 md:ml-2 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-dark)] text-white text-sm md:text-base font-semibold uppercase tracking-wider rounded-[1.2rem] transition-colors shrink-0" suppressHydrationWarning>
              Explore
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <QuickAction 
              icon={<Tractor className="w-5 h-5" strokeWidth={2} />}
              label="New Tractors" 
              href="/tractors" 
              brand="green"
            />
            <QuickAction 
              icon={<Handshake className="w-5 h-5" strokeWidth={2} />}
              label="Used Tractors" 
              href="/used-tractors" 
              brand="orange"
            />
            <QuickAction 
              icon={<CircleDollarSign className="w-5 h-5" strokeWidth={2} />}
              label="Sell Tractor" 
              href="/sell" 
              brand="green"
            />
            <QuickAction 
              icon={<Landmark className="w-5 h-5" strokeWidth={2} />}
              label="Tractor Loan" 
              href="/loan" 
              brand="orange"
            />
            <QuickAction 
              icon={<Wrench className="w-5 h-5" strokeWidth={2} />}
              label="Implements" 
              href="/implements" 
              brand="green"
            />
          </div>
        </div>
      </section>

      {/* =========================================
          DYNAMIC MAIN CONTENT (Synced with Backend)
          ========================================= */}
      <div className="w-full flex flex-col gap-20">
        
        {/* 1. TOP BRANDS CAROUSEL */}
        <section className="flex flex-col gap-8">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Explore Top Brands</h2>
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
              <Link key={brand.id} href={`/tractors?brand=${brand.id}`} className="aspect-square bg-background/40 backdrop-blur-sm border border-[var(--border-subtle)] shadow-sm rounded-2xl flex flex-col items-center justify-center p-4 hover:bg-background hover:border-[var(--border-brand)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 relative flex items-center justify-center mb-3">
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100" />
                  ) : (
                    <span className="font-bold text-2xl text-foreground/30 group-hover:text-[var(--color-brand-green)] transition-colors">{brand.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-muted uppercase tracking-widest text-center group-hover:text-foreground transition-colors">{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="w-full flex flex-col lg:flex-row gap-10">
          {/* LEFT COLUMN: Featured Tractors */}
          <div className="flex-1 flex flex-col gap-12 min-w-0">
            <section>
              <div className="flex items-end justify-between mb-8 px-2">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-2 w-8 rounded-full bg-[var(--color-brand-orange)]" />
                    <p className="text-xs font-black text-[var(--color-brand-orange)] uppercase tracking-widest">Premium Selection</p>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Featured Tractors</h2>
                </div>
                <Link href="/tractors" className="text-sm font-bold text-[var(--color-brand-green)] hover:text-[var(--color-brand-orange)] transition-colors flex items-center gap-1">
                  View All Catalog <span>→</span>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-[400px] bg-foreground/5 rounded-[2.5rem] animate-pulse" />
                  ))
                ) : tractors.map((tractor) => {
                  const primaryImage = tractor.media && tractor.media.length > 0 
                    ? (tractor.media.find(m => m.isPrimary)?.url || tractor.media[0].url) 
                    : null;
                  
                  return (
                    <Link key={tractor.id} href={`/tractors/${tractor.id}`} className="flex flex-col overflow-hidden relative group cursor-pointer p-4 rounded-[2rem] bg-background/50 border border-[var(--border-subtle)] hover:border-[var(--border-brand)] hover:shadow-lg hover:-translate-y-1 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      
                      <div className="absolute top-6 right-6 z-10 bg-background/80 backdrop-blur-md border border-[var(--border-subtle)] text-foreground text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        Premium
                      </div>
                      
                      <div className="h-52 w-full rounded-2xl bg-foreground/5 flex items-center justify-center relative mb-5 overflow-hidden group/img p-4">
                        {primaryImage ? (
                          <img 
                            src={primaryImage} 
                            alt={tractor.modelName} 
                            className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-500 relative z-0 mix-blend-multiply dark:mix-blend-normal"
                          />
                        ) : (
                          <Tractor className="w-20 h-20 text-foreground/20 group-hover/img:scale-105 transition-all duration-500" strokeWidth={1} />
                        )}
                      </div>

                      <div className="px-2 flex flex-col gap-3">
                        <div>
                          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">{tractor.brand?.name}</p>
                          <h3 className="text-xl md:text-2xl font-bold text-foreground mt-1 tracking-tight truncate">{tractor.modelName}</h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-[11px] font-medium mt-1">
                          <span className="bg-foreground/5 text-foreground/80 px-2.5 py-1 rounded-md">{tractor.hp || '--'} HP</span>
                          <span className="bg-foreground/5 text-foreground/80 px-2.5 py-1 rounded-md">{tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}</span>
                          <span className="bg-[var(--color-brand-orange)]/5 text-[var(--color-brand-orange)] border border-[var(--color-brand-orange)]/10 px-2.5 py-1 rounded-md flex items-center gap-1"><Star size={10} fill="currentColor" /> 4.8</span>
                        </div>
                        
                        <div className="mt-4 border-t border-[var(--border-subtle)] pt-4 flex items-end justify-between">
                          <div>
                            <p className="text-[10px] text-muted font-medium mb-1 uppercase tracking-wider">Starting Price</p>
                            <p className="text-xl font-bold text-foreground tracking-tight">{formatPrice(tractor.exShowroomPriceMin)}</p>
                          </div>
                          <div className="h-10 w-10 rounded-full border border-[var(--border-subtle)] flex items-center justify-center group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-all duration-300">
                            <ChevronRight size={18} strokeWidth={2} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
            
            {/* 4. TRENDING COMPARISONS (HOT VS BATTLES) */}
            <section className="mt-4 flex flex-col gap-6 bg-background/40 backdrop-blur-sm border border-[var(--border-subtle)] p-8 md:p-10 rounded-[2.5rem]">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center border border-[var(--border-subtle)]">
                  <Handshake size={24} className="text-[var(--color-brand-orange)]" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Popular Comparisons</h2>
                  <p className="text-sm text-muted font-medium mt-1">Data-driven insights from farmer choices.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {loading ? (
                   Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-40 bg-foreground/5 rounded-2xl animate-pulse" />
                  ))
                ) : comparisons.map((comp, idx) => {
                  const hotness = (comp.frequency / maxFreq) * 100;
                  return (
                    <Link key={idx} href={`/compare?ids=${comp.tractorLeft?.id},${comp.tractorRight?.id}`} className="bg-background rounded-2xl p-5 border border-[var(--border-subtle)] hover:border-[var(--border-brand-alt)] hover:shadow-md hover:-translate-y-1 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col gap-4 group cursor-pointer">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center text-center w-5/12">
                           <div className="w-16 h-16 rounded-xl bg-foreground/5 p-2 mb-2 flex items-center justify-center overflow-hidden transition-colors">
                              {comp.tractorLeft?.primaryMedia?.url ? (
                                <img src={comp.tractorLeft.primaryMedia.url} alt="L" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                              ) : (
                                <Tractor size={20} className="text-muted" />
                              )}
                           </div>
                           <span className="text-[9px] font-semibold text-muted uppercase tracking-wider truncate w-full">{comp.tractorLeft?.brand?.name}</span>
                           <span className="text-xs font-bold text-foreground leading-tight truncate w-full mt-0.5">{comp.tractorLeft?.modelName}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center w-2/12 relative">
                          <div className="w-8 h-8 rounded-full bg-background border border-[var(--border-subtle)] flex items-center justify-center z-10 text-muted font-bold text-[10px]">
                            VS
                          </div>
                          <div className="h-[1px] w-full bg-foreground/5 absolute z-0" />
                        </div>

                        <div className="flex flex-col items-center text-center w-5/12">
                           <div className="w-16 h-16 rounded-xl bg-foreground/5 p-2 mb-2 flex items-center justify-center overflow-hidden transition-colors">
                              {comp.tractorRight?.primaryMedia?.url ? (
                                <img src={comp.tractorRight.primaryMedia.url} alt="R" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                              ) : (
                                <Tractor size={20} className="text-muted" />
                              )}
                           </div>
                           <span className="text-[9px] font-semibold text-muted uppercase tracking-wider truncate w-full">{comp.tractorRight?.brand?.name}</span>
                           <span className="text-xs font-bold text-foreground leading-tight truncate w-full mt-0.5">{comp.tractorRight?.modelName}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-medium text-muted">
                          <span>Match Rate</span>
                          <span className="font-bold text-foreground">{Math.max(20, Math.round(hotness))}%</span>
                        </div>
                        <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--color-brand-green)]/80 rounded-full transition-all duration-1000" style={{ width: `${Math.max(20, hotness)}%` }} />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Sidebar Widgets (Finance & Dealers) */}
          <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 flex flex-col gap-10 mt-16 lg:mt-0">
            
            {/* Finance & EMI Widget (Ultra Premium) */}
            {/* Finance & EMI Widget (Professional) */}
            <div className="rounded-[2.5rem] bg-[var(--color-spatial-bg-dark)] p-8 md:p-10 text-white relative overflow-hidden flex flex-col gap-8 group cursor-pointer border border-[var(--border-subtle)] hover:border-[var(--border-brand)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
              {/* Subtle Lighting */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--color-brand-green)]/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex items-center justify-between z-10">
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/5">
                  <Landmark strokeWidth={2} className="w-5 h-5 text-white" />
                </div>
                <div className="bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] text-[10px] font-bold px-3 py-1 rounded-full border border-[var(--color-brand-green)]/30">
                  Verified Partners
                </div>
              </div>
              
              <div className="z-10 mt-2">
                <h3 className="text-3xl font-bold leading-tight tracking-tight text-white">Seamless <br/>Tractor Loans</h3>
                <p className="text-sm text-white/60 mt-2 font-medium">Quick approval, minimal documentation.</p>
              </div>
              
              <div className="z-10 bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-white/50 block mb-1 uppercase tracking-wider">Starting At</span>
                    <span className="text-2xl font-bold text-white">8.5<span className="text-base text-white/70">%</span></span>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10"></div>
                  <div>
                    <span className="text-[10px] font-medium text-white/50 block mb-1 uppercase tracking-wider">Max Tenure</span>
                    <span className="text-xl font-bold text-white">7 Yrs</span>
                  </div>
              </div>
              
              <button className="z-10 w-full py-4 mt-2 bg-white text-black font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors" suppressHydrationWarning>
                Check Eligibility
              </button>
            </div>

            {/* Top Dealers Sidebar */}
            <div className="bg-background/40 backdrop-blur-sm border border-[var(--border-subtle)] p-8 flex flex-col gap-6 rounded-[2.5rem]">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
                <h3 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                  Premium Dealers
                </h3>
                <span className="text-muted text-[10px] font-medium uppercase tracking-wider">Near You</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <DealerRow name="Kisan Tractors" type="BRAND_DEALER" brands="Mahindra, Swaraj" rating="4.9" />
                <DealerRow name="Shetkari Auto" type="USED_DEALER" brands="Multi-Brand" rating="4.6" />
                <DealerRow name="Punjab Motors" type="BRAND_DEALER" brands="John Deere" rating="4.8" />
              </div>
              
              <Link href="/dealers" className="text-center text-sm font-bold text-[var(--color-brand-orange)] mt-4 hover:underline">
                Find More Dealers →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   COMPONENTS
   ========================================= */

function QuickAction({ icon, label, href, brand = "green" }: { icon: React.ReactNode; label: string; href: string; brand?: "green" | "orange" }) {
  const isGreen = brand === "green";
  const iconColor = isGreen ? "text-[var(--color-brand-green)]" : "text-[var(--color-brand-orange)]";
  const defaultBorder = isGreen ? "border-[var(--border-brand)]" : "border-[var(--border-brand-alt)]";
  const hoverBorder = isGreen ? "hover:border-[var(--color-brand-green)]/40" : "hover:border-[var(--color-brand-orange)]/40";
  const hoverBg = isGreen ? "hover:bg-[var(--color-brand-green)]/10" : "hover:bg-[var(--color-brand-orange)]/10";
  const iconBg = isGreen ? "bg-[var(--color-brand-green)]/10" : "bg-[var(--color-brand-orange)]/10";

  return (
    <Link href={href} className={`bg-background/60 backdrop-blur-md px-6 py-4 flex items-center gap-4 border ${defaultBorder} group/action transition-all duration-300 rounded-[1.2rem] hover:shadow-sm ${hoverBorder} ${hoverBg}`}>
      <div className={`h-10 w-10 rounded-lg ${iconBg} border ${defaultBorder} flex items-center justify-center transition-all duration-300 ${iconColor}`}>
        {icon}
      </div>
      <span className={`font-semibold text-foreground text-sm tracking-wide transition-colors`}>{label}</span>
    </Link>
  );
}

function DealerRow({ name, type, brands, rating }: any) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-foreground/5 p-3 rounded-xl transition-colors cursor-pointer group">
      <div className="h-12 w-12 rounded-xl bg-foreground/5 border border-[var(--border-subtle)] flex items-center justify-center font-bold text-lg text-foreground/70 transition-transform duration-300">
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <h4 className="text-base font-bold text-foreground">{name}</h4>
        <p className="text-[10px] text-muted font-medium mt-0.5 tracking-wide">{brands}</p>
      </div>
      <div className="text-right flex flex-col items-end">
        <span className="text-xs font-bold text-foreground flex items-center gap-1">
          <Star size={10} className="text-[var(--color-brand-orange)]" fill="currentColor" /> {rating}
        </span>
        <p className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mt-1.5 ${type === 'BRAND_DEALER' ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-foreground/10 text-foreground/70'}`}>
          {type === 'BRAND_DEALER' ? 'Authorized' : 'Verified'}
        </p>
      </div>
    </div>
  );
}
