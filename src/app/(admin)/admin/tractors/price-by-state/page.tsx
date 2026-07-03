'use client';

import React, { useState, useEffect } from 'react';
import { tractorAPI, TractorPriceByState } from '@/lib/api/tractors';
import { IndianRupee, Search, Edit2, MapPin, ChevronDown, ChevronUp, Calculator, Shield, Receipt, Landmark } from 'lucide-react';
import Link from 'next/link';

export default function TractorPriceByStatePage() {
  const [prices, setPrices] = useState<TractorPriceByState[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await tractorAPI.getAllTractorPricesByState({ search, page });
      if (response.success) {
        setPrices(response.data as any);
      }
    } catch (error) {
      console.error('Failed to fetch prices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPrices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return '₹ 0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">State Pricing Master</h1>
          <p className="text-sm font-bold text-muted mt-1">Deep analysis & exact on-road price breakdowns across states.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4 text-sm font-bold w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-4 py-2 rounded-xl">
            <IndianRupee size={18} />
            Total Pricing Records
          </div>
          <p className="text-xs text-muted font-medium ml-2 hidden sm:block">Click on any row for full price breakdown.</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search by state or tractor ID..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-foreground/5 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-foreground/5 text-muted uppercase text-[11px] font-black tracking-wider">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">Tractor Model</th>
                <th className="px-6 py-4">State Location</th>
                <th className="px-6 py-4">Ex-Showroom</th>
                <th className="px-6 py-4">On-Road Est.</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">Loading pricing data...</td>
                </tr>
              ) : prices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">No pricing records found.</td>
                </tr>
              ) : (
                prices.map((item: any) => (
                  <React.Fragment key={item.id}>
                    <tr 
                      className={`hover:bg-foreground/5 transition-colors cursor-pointer ${expandedId === item.id ? 'bg-foreground/5' : ''}`}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <td className="px-6 py-4 text-muted">
                        {expandedId === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-black text-foreground text-base">
                            {item.tractor?.modelName || `Tractor #${item.tractorId}`}
                          </span>
                          <span className="text-[10px] font-black text-muted uppercase tracking-wider">
                            Tractor ID: {item.tractorId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-foreground/5 text-foreground font-bold text-xs">
                          <MapPin size={14} className="text-[var(--color-brand-orange)]" />
                          {item.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-[var(--color-brand-green)]">
                        {formatPrice(item.exShowroom)}
                      </td>
                      <td className="px-6 py-4 font-black text-foreground/80">
                        {item.onRoadPrice ? formatPrice(item.onRoadPrice) : <span className="text-xs text-muted font-bold tracking-wider">CALCULATING...</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/tractors/${item.tractorId}?tab=pricing`}
                          className="inline-flex p-2 rounded-xl text-foreground/70 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors shadow-sm bg-foreground/5"
                          title="Edit Pricing"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit2 size={16} />
                        </Link>
                      </td>
                    </tr>

                    {/* DEEP ANALYSIS VIEW */}
                    {expandedId === item.id && (
                      <tr>
                        <td colSpan={6} className="px-0 py-0 bg-foreground/[0.02]">
                          <div className="p-6 md:p-8 flex flex-col gap-6 animate-fade-in border-b-2 border-[var(--color-brand-orange)] shadow-inner">
                            <div className="flex items-center gap-3">
                              <Calculator size={24} className="text-[var(--color-brand-orange)]" />
                              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">On-Road Price Breakdown</h2>
                            </div>
                            
                            <div className="bg-background rounded-2xl border border-foreground/10 p-6 shadow-sm">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                
                                {/* Base Price */}
                                <div className="flex flex-col gap-2 relative">
                                  <div className="flex items-center gap-2 text-[var(--color-brand-green)]">
                                    <Landmark size={16} />
                                    <span className="text-xs font-black uppercase tracking-wider">Base Price</span>
                                  </div>
                                  <span className="text-2xl font-black text-foreground">{formatPrice(item.exShowroom)}</span>
                                  <span className="text-[10px] text-muted font-bold uppercase">Ex-Showroom Price</span>
                                  
                                  {/* Plus icon connector for md screens */}
                                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-foreground/5 items-center justify-center font-black text-muted z-10">
                                    +
                                  </div>
                                </div>

                                {/* RTO */}
                                <div className="flex flex-col gap-2 relative">
                                  <div className="flex items-center gap-2 text-blue-500">
                                    <Receipt size={16} />
                                    <span className="text-xs font-black uppercase tracking-wider">Taxes</span>
                                  </div>
                                  <span className="text-2xl font-black text-foreground">{formatPrice(item.rtoCharges)}</span>
                                  <span className="text-[10px] text-muted font-bold uppercase">RTO Charges</span>

                                  {/* Plus icon connector for md screens */}
                                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-foreground/5 items-center justify-center font-black text-muted z-10">
                                    +
                                  </div>
                                </div>

                                {/* Insurance */}
                                <div className="flex flex-col gap-2 relative">
                                  <div className="flex items-center gap-2 text-purple-500">
                                    <Shield size={16} />
                                    <span className="text-xs font-black uppercase tracking-wider">Protection</span>
                                  </div>
                                  <span className="text-2xl font-black text-foreground">{formatPrice(item.insuranceEst)}</span>
                                  <span className="text-[10px] text-muted font-bold uppercase">Insurance Est.</span>

                                  {/* Plus icon connector for md screens */}
                                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] items-center justify-center font-black z-10">
                                    =
                                  </div>
                                </div>

                                {/* Total */}
                                <div className="flex flex-col gap-2 bg-[var(--color-brand-orange)]/10 p-4 rounded-xl -m-4 ml-0 md:ml-2 border border-[var(--color-brand-orange)]/20">
                                  <div className="flex items-center gap-2 text-[var(--color-brand-orange)]">
                                    <IndianRupee size={16} />
                                    <span className="text-xs font-black uppercase tracking-wider">Final Price</span>
                                  </div>
                                  <span className="text-3xl font-black text-[var(--color-brand-orange)]">
                                    {formatPrice(item.onRoadPrice)}
                                  </span>
                                  <span className="text-[10px] text-[var(--color-brand-orange)]/80 font-bold uppercase">Est. On-Road Price</span>
                                </div>

                              </div>
                            </div>
                            
                            {item.dealerCharges > 0 && (
                              <div className="flex justify-end mt-2">
                                <span className="text-xs font-bold text-muted bg-foreground/5 px-3 py-1.5 rounded-lg border border-foreground/10">
                                  * Note: Includes Dealer Charges of {formatPrice(item.dealerCharges)}
                                </span>
                              </div>
                            )}

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Simplified pagination area - adjust if API natively supports page mapping later */}
        <div className="mt-auto p-4 border-t border-foreground/5 flex items-center justify-between z-10 bg-background relative">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-bold text-muted">Page {page}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
