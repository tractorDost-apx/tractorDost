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
      <section className="spatial-panel w-full p-10 md:p-20 flex flex-col items-center justify-center text-center relative overflow-hidden group rounded-[3rem]">
        {/* Animated Ambient Glows */}
        <div className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-brand-green)]/30 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 group-hover:bg-[var(--color-brand-green)]/40 group-hover:scale-110 mix-blend-screen" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-brand-orange)]/20 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 group-hover:bg-[var(--color-brand-orange)]/30 mix-blend-screen" />
        
        {/* Abstract Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 dark:bg-white/10 border border-white/20 backdrop-blur-xl shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.4)] mb-8 transition-transform hover:scale-105 cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-orange)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-brand-orange)]"></span>
            </span>
            <span className="text-xs font-black tracking-[0.2em] uppercase text-foreground/90">India's #1 Tractor Marketplace</span>
          </div>
          
          <h1 className="flex flex-col items-center justify-center text-5xl md:text-[5.5rem] font-black text-foreground max-w-5xl tracking-[-0.04em] leading-[1.1]">
            <span className="mb-2 md:mb-4">Find the Perfect</span>
            <div className="h-[1.2em] flex items-center justify-center overflow-visible text-[var(--color-brand-green)]">
              <AnimatedWord />
            </div>
            <span className="mt-2 md:mt-4 text-3xl md:text-5xl text-muted font-bold tracking-tight opacity-80">
              for Your Farm
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted mt-8 max-w-2xl leading-relaxed font-medium">
            Discover, buy, and finance premium new and used tractors. Compare models and connect with verified dealers instantly.
          </p>

          {/* Smart Tractor Matcher Wizard */}
          <div className="mt-14 w-full max-w-4xl bg-background/40 backdrop-blur-2xl border border-foreground/10 rounded-[2rem] p-4 shadow-2xl flex flex-col md:flex-row gap-4 items-center focus-within:border-[var(--color-brand-green)]/40 transition-colors">
            
            <div className="flex-1 w-full bg-background rounded-2xl flex items-center px-4 py-4 border border-foreground/5 focus-within:border-[var(--color-brand-green)]/50 transition-colors">
              <Search className="text-[var(--color-brand-green)] mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Search Brand (e.g. Mahindra), HP, Budget..." 
                className="w-full bg-transparent border-none text-foreground placeholder:text-muted/60 focus:outline-none text-lg font-bold"
              />
            </div>

            <div className="flex w-full md:w-auto gap-4">
              <select className="bg-background border border-foreground/5 rounded-2xl px-6 py-4 text-foreground font-bold appearance-none outline-none focus:border-[var(--color-brand-green)]/50">
                <option value="">Any Budget</option>
                <option value="under5">Under 5 Lakh</option>
                <option value="5to8">5 - 8 Lakh</option>
                <option value="over8">Above 8 Lakh</option>
              </select>
              
              <select className="bg-background border border-foreground/5 rounded-2xl px-6 py-4 text-foreground font-bold appearance-none outline-none focus:border-[var(--color-brand-green)]/50">
                <option value="">Any HP</option>
                <option value="under30">Under 30 HP</option>
                <option value="30to50">30 - 50 HP</option>
                <option value="over50">Above 50 HP</option>
              </select>
            </div>

            <button className="w-full md:w-auto px-10 py-4 bg-[var(--color-brand-green)] text-white font-black text-lg uppercase tracking-wider rounded-2xl hover:bg-[var(--color-brand-orange)] transition-all shadow-lg shadow-[var(--color-brand-green)]/30 shrink-0">
              Explore
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
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
                <div key={i} className="aspect-square bg-foreground/5 rounded-[2rem] animate-pulse" />
              ))
            ) : brands.map((brand) => (
              <Link key={brand.id} href={`/tractors?brand=${brand.id}`} className="aspect-square bg-background border border-foreground/5 shadow-sm rounded-[2rem] flex flex-col items-center justify-center p-4 hover:border-[var(--color-brand-orange)]/50 hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 relative flex items-center justify-center mb-3">
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="font-black text-3xl text-foreground/20">{brand.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-xs font-black text-foreground uppercase tracking-widest text-center">{brand.name}</span>
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
                    <Link key={tractor.id} href={`/tractors/${tractor.id}`} className="spatial-card flex flex-col overflow-hidden relative group cursor-pointer transition-all duration-500 rounded-[2.5rem] p-5 hover:border-[var(--color-brand-green)]/30 hover:shadow-[0_20px_40px_-10px_rgba(74,118,53,0.15)] hover:-translate-y-2 bg-background">
                      
                      <div className="absolute top-7 right-7 z-10 bg-[var(--color-brand-orange)] text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                        #1 Choice
                      </div>
                      
                      <div className="h-48 w-full rounded-2xl bg-gradient-to-br from-foreground/5 to-transparent border border-foreground/5 flex items-center justify-center relative mb-6 overflow-hidden group/img p-4">
                        {primaryImage ? (
                          <img 
                            src={primaryImage} 
                            alt={tractor.modelName} 
                            className="w-full h-full object-contain group-hover/img:scale-110 transition-transform duration-500 relative z-0 mix-blend-multiply dark:mix-blend-normal"
                          />
                        ) : (
                          <Tractor className="w-24 h-24 text-foreground/20 group-hover/img:scale-110 transition-all duration-500" strokeWidth={1} />
                        )}
                      </div>

                      <div className="px-2 flex flex-col gap-3">
                        <div>
                          <p className="text-[10px] font-black text-[var(--color-brand-orange)] uppercase tracking-[0.2em]">{tractor.brand?.name}</p>
                          <h3 className="text-xl md:text-2xl font-black text-foreground mt-1 tracking-tight truncate">{tractor.modelName}</h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-[11px] font-bold mt-1">
                          <span className="bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 px-3 py-1 rounded-md">{tractor.hp || '--'} HP</span>
                          <span className="bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 px-3 py-1 rounded-md">{tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}</span>
                          <span className="bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] border border-[var(--color-brand-orange)]/20 px-3 py-1 rounded-md flex items-center gap-1">★ 4.8</span>
                        </div>
                        
                        <div className="mt-5 border-t border-[var(--panel-border)] pt-5 flex items-end justify-between">
                          <div>
                            <p className="text-[11px] text-muted font-bold mb-1 uppercase tracking-wider">Starting Price</p>
                            <p className="text-xl md:text-[22px] font-black text-foreground tracking-tight">{formatPrice(tractor.exShowroomPriceMin)}</p>
                          </div>
                          <button className="h-12 w-12 rounded-full bg-[var(--color-brand-green)] text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-lg shadow-[var(--color-brand-green)]/30">
                            <ChevronRight size={20} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
            
            {/* 4. TRENDING COMPARISONS (HOT VS BATTLES) */}
            <section className="mt-4 flex flex-col gap-8 bg-gradient-to-br from-foreground/5 to-transparent p-8 md:p-12 rounded-[3rem] border border-foreground/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-brand-orange)]/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
              
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                  <Flame size={24} className="text-red-500 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Hot Comparisons</h2>
                  <p className="text-muted font-bold">See what other farmers are comparing right now.</p>
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
                        <div className="flex flex-col items-center text-center w-5/12">
                           <div className="w-16 h-16 rounded-full bg-foreground/5 p-2 mb-2 flex items-center justify-center overflow-hidden border border-transparent group-hover:border-foreground/10 transition-colors">
                              {comp.tractorLeft?.primaryMedia?.url ? (
                                <img src={comp.tractorLeft.primaryMedia.url} alt="L" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                              ) : (
                                <Tractor size={20} className="text-muted" />
                              )}
                           </div>
                           <span className="text-[10px] font-black text-[var(--color-brand-green)] uppercase truncate w-full">{comp.tractorLeft?.brand?.name}</span>
                           <span className="text-xs font-black text-foreground leading-tight truncate w-full">{comp.tractorLeft?.modelName}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center w-2/12">
                          <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center z-10 text-[var(--color-brand-orange)] font-black text-[10px] italic">
                            VS
                          </div>
                          <div className="h-[1px] w-full bg-foreground/10 absolute z-0" />
                        </div>

                        <div className="flex flex-col items-center text-center w-5/12">
                           <div className="w-16 h-16 rounded-full bg-foreground/5 p-2 mb-2 flex items-center justify-center overflow-hidden border border-transparent group-hover:border-foreground/10 transition-colors">
                              {comp.tractorRight?.primaryMedia?.url ? (
                                <img src={comp.tractorRight.primaryMedia.url} alt="R" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                              ) : (
                                <Tractor size={20} className="text-muted" />
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

          {/* RIGHT COLUMN: Sidebar Widgets (Finance & Dealers) */}
          <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 flex flex-col gap-10 mt-16 lg:mt-0">
            
            {/* Finance & EMI Widget (Ultra Premium) */}
            <div className="rounded-[2.5rem] bg-gradient-to-br from-[var(--color-brand-green)] to-[#2a451c] p-10 shadow-[0_30px_60px_rgba(74,118,53,0.3)] text-white relative overflow-hidden flex flex-col gap-8 group cursor-pointer hover:shadow-[0_40px_70px_rgba(74,118,53,0.4)] transition-all duration-500">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-[30px] group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[var(--color-brand-orange)]/30 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="absolute top-8 right-8 bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="z-10 mt-4">
                <p className="text-xs font-black text-[var(--color-brand-orange)] tracking-widest uppercase mb-3">Tractor Finance</p>
                <h3 className="text-4xl font-black leading-tight tracking-tight">Zero Hassle <br/>Tractor Loans.</h3>
              </div>
              
              <div className="z-10 bg-black/20 rounded-[1.5rem] p-5 border border-white/10 backdrop-blur-md">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <span className="text-xs font-medium text-white/70 block mb-1">Starting Interest</span>
                    <span className="text-3xl font-black text-white">8.5<span className="text-xl">%</span></span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-white/70 block mb-1">Max Tenure</span>
                    <span className="text-xl font-bold text-white">7 Years</span>
                  </div>
                </div>
              </div>
              
              <button className="z-10 w-full py-4 mt-2 bg-white text-[var(--color-brand-green-dark)] font-black text-lg rounded-full shadow-lg group-hover:bg-[var(--color-brand-orange)] group-hover:text-white transition-all duration-300">
                Calculate EMI
              </button>
            </div>

            {/* Top Dealers Sidebar */}
            <div className="spatial-panel p-8 flex flex-col gap-6 rounded-[2.5rem]">
              <div className="flex items-center justify-between border-b border-[var(--panel-border)] pb-4">
                <h3 className="text-xl font-black text-foreground tracking-tight">
                  Top Rated Dealers
                </h3>
                <span className="bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] text-xs font-bold px-2 py-1 rounded-md">Nearby</span>
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
  const hoverBorder = isGreen ? "hover:border-[var(--color-brand-green)]/40" : "hover:border-[var(--color-brand-orange)]/40";
  const hoverBg = isGreen ? "hover:bg-[var(--color-brand-green)]/5" : "hover:bg-[var(--color-brand-orange)]/5";
  const hoverShadow = isGreen ? "hover:shadow-[0_10px_30px_rgba(74,118,53,0.15)]" : "hover:shadow-[0_10px_30px_rgba(186,91,52,0.15)]";
  const hoverText = isGreen ? "group-hover/action:text-[var(--color-brand-green)]" : "group-hover/action:text-[var(--color-brand-orange)]";

  return (
    <Link href={href} className={`bg-background/40 backdrop-blur-xl px-7 py-5 flex items-center gap-4 border border-foreground/5 group/action shadow-sm rounded-2xl transition-all duration-300 hover:-translate-y-1 ${hoverBorder} ${hoverBg} ${hoverShadow}`}>
      <div className={`h-12 w-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center group-hover/action:scale-110 group-hover/action:bg-background transition-all shadow-sm ${iconColor}`}>
        {icon}
      </div>
      <span className={`font-bold text-foreground text-sm tracking-wide transition-colors ${hoverText}`}>{label}</span>
    </Link>
  );
}

function DealerRow({ name, type, brands, rating }: any) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--panel-border)] last:border-0 hover:bg-foreground/5 p-4 rounded-2xl transition-colors cursor-pointer group">
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[var(--color-brand-green)]/10 to-[var(--color-brand-orange)]/10 border border-[var(--color-brand-green)]/20 flex items-center justify-center font-black text-2xl text-[var(--color-brand-green)] group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300">
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <h4 className="text-[17px] font-black text-foreground">{name}</h4>
        <p className="text-[11px] text-muted font-bold mt-1 tracking-wide">{brands}</p>
      </div>
      <div className="text-right flex flex-col items-end">
        <span className="text-sm font-black text-foreground flex items-center gap-1 bg-foreground/5 px-2 py-0.5 rounded-md">
          <span className="text-[var(--color-brand-orange)]">★</span> {rating}
        </span>
        <p className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mt-2 ${type === 'BRAND_DEALER' ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20' : 'bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] border border-[var(--color-brand-orange)]/20'}`}>
          {type === 'BRAND_DEALER' ? 'Authorized' : 'Verified'}
        </p>
      </div>
    </div>
  );
}
