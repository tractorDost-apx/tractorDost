import React from 'react';

export default function PublicPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[1400px] mx-auto mt-4">
      {/* Main Spatial Dashboard Panel */}
      <div className="spatial-panel w-full p-8 md:p-10 flex flex-col xl:flex-row gap-8">
        
        {/* Left Column (Main Stats) */}
        <div className="flex-1 flex flex-col gap-8">
          
          <div className="flex items-center gap-6 mb-2">
            <h2 className="text-xl font-bold text-foreground">Featured Tractors</h2>
            <h2 className="text-xl font-bold text-muted cursor-pointer hover:text-foreground transition-colors">Popular Brands</h2>
            <div className="h-2 w-2 rounded-full bg-[var(--color-spatial-accent-blue)] absolute mt-8 ml-8" />
          </div>

          {/* Top Row: Weather/Primary Card + Small Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Primary Accent Card (Mimics the blue weather card) */}
            <div className="col-span-1 md:col-span-2 row-span-2 rounded-[2rem] bg-gradient-to-b from-[#00a8ff] to-[#0076ff] p-6 shadow-[0_20px_40px_rgba(0,118,255,0.4)] text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-white">
                  <path d="M19 12h-2v3h-3v-3H8v3H5v-3H3v-2h18v2zM5 17h3v2H5v-2zm11 0h3v2h-3v-2zm-5-8V6h2v3h-2zm-4 0V6h2v3H7z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium opacity-90">Top Rated</p>
                <p className="text-sm opacity-75">Mahindra 575 DI</p>
              </div>
              <div className="flex items-end justify-between mt-12">
                <h1 className="text-6xl font-black">45<span className="text-3xl font-bold opacity-80">HP</span></h1>
                <div className="text-right">
                  <p className="text-sm font-medium">₹6.5 - 6.9L</p>
                  <p className="text-xs opacity-75">On-road price</p>
                </div>
              </div>
            </div>

            {/* Small Spatial Cards */}
            <SmallCard day="Sonalika" temp="DI 745" />
            <SmallCard day="Swaraj" temp="744 FE" />
            <SmallCard day="Eicher" temp="380 Prime" />
            <SmallCard day="John Deere" temp="5050 D" />
          </div>

          {/* Highlights Section */}
          <div className="mt-4">
            <h3 className="text-lg font-bold text-foreground mb-4">Market Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="spatial-card p-6 flex flex-col justify-between h-48">
                <p className="text-sm font-medium text-muted">Average Market Price</p>
                <div className="flex items-center justify-center flex-1">
                  <div className="relative w-32 h-32 rounded-full border-[12px] border-background flex items-center justify-center shadow-inner">
                    <div className="absolute inset-0 rounded-full border-[12px] border-t-[var(--color-spatial-accent-blue)] border-r-[var(--color-spatial-accent-blue)] rotate-45" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">₹5.2L</p>
                      <p className="text-xs text-muted">Avg/Tractor</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="spatial-card p-6 flex flex-col justify-between h-48">
                <p className="text-sm font-medium text-muted">Demand Index</p>
                <div className="flex items-center justify-center flex-1 relative overflow-hidden">
                  <div className="w-full h-[100px] bg-gradient-to-t from-[var(--color-spatial-accent-blue)]/20 to-transparent absolute bottom-0 rounded-b-xl" />
                  <div className="w-full border-b border-dashed border-muted/50 mb-4" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-3xl font-black text-foreground">8.4</p>
                    <p className="text-xs text-muted">High Demand</p>
                  </div>
                </div>
              </div>

              <div className="spatial-card p-6 flex flex-col justify-between h-48">
                <p className="text-sm font-medium text-muted">Interest Rates</p>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-3xl font-black text-foreground">8.5%</p>
                    <p className="text-xs text-muted mt-1">HDFC Bank</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-spatial-accent-yellow)]">
                    %
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (Sidebar equivalent in the image) */}
        <div className="w-full xl:w-80 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-foreground">Trending Categories</h3>
          
          <div className="spatial-card p-6 flex flex-col gap-4">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
              <div className="flex flex-col gap-1">
                <div className="w-6 h-32 bg-white/10 rounded-t-sm relative">
                  <div className="absolute bottom-0 w-full bg-[var(--color-spatial-accent-blue)] rounded-t-sm" style={{ height: '70%' }} />
                </div>
                <span className="text-xs text-muted text-center mt-2">Mini</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-6 h-32 bg-white/10 rounded-t-sm relative">
                  <div className="absolute bottom-0 w-full bg-[var(--color-spatial-accent-blue)] rounded-t-sm" style={{ height: '85%' }} />
                </div>
                <span className="text-xs text-muted text-center mt-2">Utility</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-6 h-32 bg-white/10 rounded-t-sm relative">
                  <div className="absolute bottom-0 w-full bg-[var(--color-spatial-accent-blue)] rounded-t-sm" style={{ height: '40%' }} />
                </div>
                <span className="text-xs text-muted text-center mt-2">Row</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-6 h-32 bg-white/10 rounded-t-sm relative">
                  <div className="absolute bottom-0 w-full bg-[var(--color-spatial-accent-blue)] rounded-t-sm" style={{ height: '60%' }} />
                </div>
                <span className="text-xs text-muted text-center mt-2">4WD</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-foreground mt-4">Top Locations</h3>
          
          <div className="flex flex-col gap-3">
            <LocationCard state="Maharashtra" label="High Demand" temp="5k+" />
            <LocationCard state="Punjab" label="Very High" temp="8k+" />
            <LocationCard state="Gujarat" label="Moderate" temp="3k+" />
          </div>

        </div>

      </div>
    </div>
  );
}

function SmallCard({ day, temp }: { day: string; temp: string }) {
  return (
    <div className="spatial-card flex flex-col items-center justify-between py-6 px-2">
      <p className="text-sm font-medium text-foreground text-center">{day}</p>
      <div className="h-10 w-10 my-4 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-spatial-accent-yellow)]">
        ★
      </div>
      <p className="text-lg font-bold text-foreground text-center">{temp}</p>
    </div>
  );
}

function LocationCard({ state, label, temp }: { state: string; label: string; temp: string }) {
  return (
    <div className="spatial-card p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted">India</p>
        <p className="text-lg font-bold text-foreground">{state}</p>
        <p className="text-xs text-muted mt-1">{label}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-foreground">{temp}</p>
        <p className="text-xs text-muted">Listings</p>
      </div>
    </div>
  );
}
