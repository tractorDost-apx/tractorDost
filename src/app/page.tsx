import React from 'react';
import { Tractor, Handshake, CircleDollarSign, Landmark, Wrench } from 'lucide-react';
import Link from 'next/link';
import { AnimatedWord } from '@/components/ui/AnimatedWord';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto mt-6 gap-16 px-4">
      
      {/* =========================================
          HERO & SEARCH DASHBOARD
          ========================================= */}
      <section className="spatial-panel w-full p-10 md:p-20 flex flex-col items-center justify-center text-center relative overflow-hidden group">
        {/* Animated Ambient Glows */}
        <div className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-brand-green)]/30 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 group-hover:bg-[var(--color-brand-green)]/40 group-hover:scale-110 mix-blend-screen" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-brand-orange)]/20 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 group-hover:bg-[var(--color-brand-orange)]/30 mix-blend-screen" />
        
        {/* Abstract Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 dark:bg-white/10 border border-white/20 backdrop-blur-xl shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.4)] mb-8 transition-transform hover:scale-105 cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-orange)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-brand-orange)]"></span>
            </span>
            <span className="text-xs font-black tracking-[0.2em] uppercase text-foreground/90">India's #1 Tractor Marketplace</span>
          </div>
          
          <h1 className="flex flex-col items-center justify-center text-5xl md:text-[5.5rem] font-black text-foreground max-w-5xl tracking-[-0.04em] leading-[1.1]">
            <span className="mb-2 md:mb-4">Find the Perfect</span>
            <div className="h-[1.2em] flex items-center justify-center overflow-visible">
              <AnimatedWord />
            </div>
            <span className="mt-2 md:mt-4 text-3xl md:text-5xl text-muted font-bold tracking-tight opacity-80">
              for Your Farm
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted mt-8 max-w-2xl leading-relaxed">
            Discover, buy, and finance premium new and used tractors. Compare models and connect with verified dealers instantly.
          </p>

          {/* Spatial Search Bar */}
          <div className="mt-14 w-full max-w-3xl spatial-panel sm:spatial-pill flex flex-col sm:flex-row items-center p-2 sm:p-3 border border-white/20 shadow-[0_20px_50px_rgba(74,118,53,0.15)] focus-within:shadow-[0_30px_70px_rgba(74,118,53,0.3)] focus-within:border-[var(--color-brand-green)]/50 transition-all duration-500 hover:scale-[1.02] gap-3 sm:gap-0 rounded-3xl sm:rounded-full">
            <div className="flex-1 flex items-center px-4 sm:px-6 gap-3 sm:gap-4 w-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-brand-green)] opacity-80 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search Brand (e.g. Mahindra), HP, Budget..." 
                className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted/60 text-base sm:text-lg font-bold tracking-tight min-w-0"
              />
            </div>
            <button className="spatial-button w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-2xl sm:rounded-full text-base sm:text-lg shadow-xl shadow-[var(--color-brand-green)]/40 hover:shadow-[var(--color-brand-green)]/60">
              Explore
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-14">
            <QuickAction 
              icon={<Tractor className="w-6 h-6" strokeWidth={1.5} />}
              label="New Tractors" 
              href="/tractors" 
              brand="green"
            />
            <QuickAction 
              icon={<Handshake className="w-6 h-6" strokeWidth={1.5} />}
              label="Used Tractors" 
              href="/used-tractors" 
              brand="orange"
            />
            <QuickAction 
              icon={<CircleDollarSign className="w-6 h-6" strokeWidth={1.5} />}
              label="Sell Tractor" 
              href="/sell" 
              brand="green"
            />
            <QuickAction 
              icon={<Landmark className="w-6 h-6" strokeWidth={1.5} />}
              label="Tractor Loan" 
              href="/loan" 
              brand="orange"
            />
            <QuickAction 
              icon={<Wrench className="w-6 h-6" strokeWidth={1.5} />}
              label="Implements" 
              href="/implements" 
              brand="green"
            />
          </div>
        </div>
      </section>

      {/* =========================================
          MAIN MARKETPLACE CONTENT
          ========================================= */}
      <div className="w-full flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: Tractors & Finance */}
        <div className="flex-1 flex flex-col gap-12 min-w-0">
          
          {/* Featured New Tractors */}
          <section>
            <div className="flex items-end justify-between mb-8 px-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-2 w-8 rounded-full bg-[var(--color-brand-orange)]" />
                  <p className="text-sm font-bold text-[var(--color-brand-orange)] uppercase tracking-widest">Premium Selection</p>
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">Featured Tractors</h2>
              </div>
              <Link href="/tractors" className="text-sm font-bold text-[var(--color-brand-green)] hover:text-[var(--color-brand-orange)] transition-colors flex items-center gap-1">
                View All Catalog <span>→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TractorCard 
                brand="Mahindra" model="575 DI SP Plus" hp="47 HP" drive="2WD" 
                price="₹6.80 - 7.10 Lakh" rating="4.8"
                isPopular
              />
              <TractorCard 
                brand="Swaraj" model="744 FE" hp="48 HP" drive="2WD" 
                price="₹6.90 - 7.40 Lakh" rating="4.7"
              />
              <TractorCard 
                brand="John Deere" model="5310 GearPro" hp="55 HP" drive="4WD" 
                price="₹10.50 - 11.20 Lakh" rating="4.9"
              />
            </div>
          </section>

          {/* Used Tractors Highlight */}
          <section className="mt-4">
            <div className="flex items-end justify-between mb-8 px-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-2 w-8 rounded-full bg-[var(--color-brand-green)]" />
                  <p className="text-sm font-bold text-[var(--color-brand-green)] uppercase tracking-widest">Trusted Marketplace</p>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-[-0.03em]">Verified Used Tractors</h2>
              </div>
              <Link href="/used-tractors" className="text-sm font-bold text-[var(--color-brand-green)] hover:text-[var(--color-brand-orange)] transition-colors flex items-center gap-2 bg-[var(--color-brand-green)]/10 hover:bg-[var(--color-brand-orange)]/10 px-5 py-2.5 rounded-full">
                Browse Marketplace <span>→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <UsedTractorCard 
                title="Massey Ferguson 241 DI" year="2019" hours="2400 hrs" 
                location="Pune, Maharashtra" price="₹4.20 Lakh" condition="EXCELLENT"
              />
              <UsedTractorCard 
                title="Eicher 380 Prime" year="2021" hours="1200 hrs" 
                location="Ludhiana, Punjab" price="₹5.10 Lakh" condition="GOOD"
              />
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Sidebar Widgets (Finance & Dealers) */}
        <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 flex flex-col gap-10">
          
          {/* Finance & EMI Widget (Ultra Premium) */}
          <div className="rounded-[2.5rem] bg-gradient-to-br from-[var(--color-brand-green)] to-[#2a451c] p-10 shadow-[0_30px_60px_rgba(74,118,53,0.3)] text-white relative overflow-hidden flex flex-col gap-8 group cursor-pointer hover:shadow-[0_40px_70px_rgba(74,118,53,0.4)] transition-all duration-500">
            {/* Abstract 3D Shapes */}
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
    <Link href={href} className={`spatial-card px-7 py-5 flex items-center gap-4 border border-white/5 group/action shadow-sm transition-all duration-300 hover:-translate-y-1 ${hoverBorder} ${hoverBg} ${hoverShadow}`}>
      <div className={`h-12 w-12 rounded-full bg-white/5 dark:bg-black/20 border border-white/10 flex items-center justify-center group-hover/action:scale-110 group-hover/action:bg-white dark:group-hover/action:bg-white/10 transition-all shadow-sm ${iconColor}`}>
        {icon}
      </div>
      <span className={`font-bold text-foreground text-sm tracking-wide transition-colors ${hoverText}`}>{label}</span>
    </Link>
  );
}

function TractorCard({ brand, model, hp, drive, price, rating, isPopular = false }: any) {
  return (
    <div className="spatial-card flex flex-col overflow-hidden relative group cursor-pointer transition-all duration-500 rounded-[2rem] p-5 hover:border-[var(--color-brand-green)]/30 hover:shadow-[0_20px_40px_-10px_rgba(74,118,53,0.15)] hover:-translate-y-2">
      {isPopular && (
        <div className="absolute top-7 right-7 z-10 bg-[var(--color-brand-orange)] text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
          #1 Choice
        </div>
      )}
      
      {/* Exact Image Placeholder from Screenshot */}
      <div className="h-48 w-full rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 flex items-center justify-center relative mb-6 overflow-hidden group/img">
        <Tractor className="w-24 h-24 text-foreground/20 group-hover/img:scale-110 group-hover/img:text-[var(--color-brand-green)]/50 transition-all duration-500" strokeWidth={1} />
      </div>

      <div className="px-2 flex flex-col gap-3">
        <div>
          <p className="text-[10px] font-black text-[var(--color-brand-orange)] uppercase tracking-[0.2em]">{brand}</p>
          <h3 className="text-xl md:text-2xl font-black text-foreground mt-1 tracking-tight">{model}</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 text-[11px] font-bold mt-1">
          <span className="bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 px-3 py-1 rounded-md">{hp}</span>
          <span className="bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 px-3 py-1 rounded-md">{ drive }</span>
          <span className="bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] border border-[var(--color-brand-orange)]/20 px-3 py-1 rounded-md flex items-center gap-1">★ {rating}</span>
        </div>
        
        <div className="mt-5 border-t border-[var(--panel-border)] pt-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] text-muted font-bold mb-1 uppercase tracking-wider">On-Road Price</p>
            <p className="text-xl md:text-[22px] font-black text-foreground tracking-tight">{price}</p>
          </div>
          <button className="h-12 w-12 rounded-full bg-[var(--color-brand-green)] text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-lg shadow-[var(--color-brand-green)]/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function UsedTractorCard({ title, year, hours, location, price, condition }: any) {
  return (
    <div className="spatial-card p-5 flex flex-col sm:flex-row gap-6 cursor-pointer group hover:border-[var(--color-brand-green)]/30 hover:shadow-[0_20px_40px_-10px_rgba(74,118,53,0.15)] transition-all duration-500 rounded-[2.5rem] hover:-translate-y-2">
      <div className="h-40 w-full sm:w-40 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-white/10 group/img">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-green)]/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
        <Tractor className="w-16 h-16 text-foreground/20 group-hover/img:scale-110 group-hover/img:text-[var(--color-brand-green)]/50 transition-all duration-500" strokeWidth={1.5} />
      </div>
      
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-black text-foreground leading-tight group-hover:text-[var(--color-brand-green)] transition-colors pr-2">{title}</h3>
            <span className="text-[9px] font-black bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] border border-[var(--color-brand-orange)]/20 px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0">{condition}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted font-bold mt-3">
            <span className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-md">{year}</span>
            <span className="opacity-30">•</span>
            <span className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-md">{hours}</span>
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-[var(--color-brand-green)]"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              {location}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-5 pt-5 border-t border-[var(--panel-border)]">
          <p className="text-2xl font-black text-foreground tracking-tight">{price}</p>
          <button className="spatial-button px-7 py-3 text-sm rounded-xl">Contact Seller</button>
        </div>
      </div>
    </div>
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
