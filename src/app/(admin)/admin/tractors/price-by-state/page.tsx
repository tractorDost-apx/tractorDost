'use client';

import React, { useState, useEffect } from 'react';
import { tractorAPI, TractorPriceByState } from '@/lib/api/tractors';
import {
  IndianRupee,
  Search,
  Edit2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Calculator,
  Shield,
  Receipt,
  Landmark,
} from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';

export default function TractorPriceByStatePage() {
  const [prices, setPrices] = useState<TractorPriceByState[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">
            State Pricing Master
          </h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Deep analysis & exact on-road price breakdowns across states.
          </p>
        </div>
      </div>

      <div className="glass-panel flex flex-col items-center justify-between gap-4 rounded-2xl p-4 md:flex-row">
        <div className="flex w-full items-center gap-4 text-sm font-bold md:w-auto">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-4 py-2 text-[var(--color-brand-green)]">
            <IndianRupee size={18} />
            Total Pricing Records
          </div>
          <p className="text-muted ml-2 hidden text-xs font-medium sm:block">
            Click on any row for full price breakdown.
          </p>
        </div>

        <div className="group relative w-full md:w-80">
          <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by state or tractor ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-full border border-transparent py-2.5 pr-4 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-foreground/5 text-muted text-[11px] font-black tracking-wider uppercase">
              <tr>
                <th className="w-10 px-6 py-4"></th>
                <th className="px-6 py-4">Tractor Model</th>
                <th className="px-6 py-4">State Location</th>
                <th className="px-6 py-4">Ex-Showroom</th>
                <th className="px-6 py-4">On-Road Est.</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    Loading pricing data...
                  </td>
                </tr>
              ) : prices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    No pricing records found.
                  </td>
                </tr>
              ) : (
                prices.map((item: any) => (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`hover:bg-foreground/5 cursor-pointer transition-colors ${expandedId === item.id ? 'bg-foreground/5' : ''}`}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <td className="text-muted px-6 py-4">
                        {expandedId === item.id ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-foreground text-base font-black">
                            {item.tractor?.modelName || `Tractor #${item.tractorId}`}
                          </span>
                          <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                            Tractor ID: {item.tractorId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-foreground/5 text-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold">
                          <MapPin size={14} className="text-[var(--color-brand-orange)]" />
                          {item.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-[var(--color-brand-green)]">
                        {formatPrice(item.exShowroom)}
                      </td>
                      <td className="text-foreground/80 px-6 py-4 font-black">
                        {item.onRoadPrice ? (
                          formatPrice(item.onRoadPrice)
                        ) : (
                          <span className="text-muted text-xs font-bold tracking-wider">
                            CALCULATING...
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/tractors/${item.tractorId}?tab=pricing`}
                          className="text-foreground/70 bg-foreground/5 inline-flex rounded-xl p-2 shadow-sm transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)]"
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
                        <td colSpan={6} className="bg-foreground/[0.02] px-0 py-0">
                          <div className="animate-fade-in flex flex-col gap-6 border-b-2 border-[var(--color-brand-orange)] p-6 shadow-inner md:p-8">
                            <div className="flex items-center gap-3">
                              <Calculator size={24} className="text-[var(--color-brand-orange)]" />
                              <h2 className="text-foreground text-xl font-black tracking-tight uppercase">
                                On-Road Price Breakdown
                              </h2>
                            </div>

                            <div className="bg-background rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
                              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                {/* Base Price */}
                                <div className="relative flex flex-col gap-2">
                                  <div className="flex items-center gap-2 text-[var(--color-brand-green)]">
                                    <Landmark size={16} />
                                    <span className="text-xs font-black tracking-wider uppercase">
                                      Base Price
                                    </span>
                                  </div>
                                  <span className="text-foreground text-2xl font-black">
                                    {formatPrice(item.exShowroom)}
                                  </span>
                                  <span className="text-muted text-[10px] font-bold uppercase">
                                    Ex-Showroom Price
                                  </span>

                                  {/* Plus icon connector for md screens */}
                                  <div className="bg-foreground/5 text-muted absolute top-1/2 -right-3 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full font-black md:flex">
                                    +
                                  </div>
                                </div>

                                {/* RTO */}
                                <div className="relative flex flex-col gap-2">
                                  <div className="flex items-center gap-2 text-blue-500">
                                    <Receipt size={16} />
                                    <span className="text-xs font-black tracking-wider uppercase">
                                      Taxes
                                    </span>
                                  </div>
                                  <span className="text-foreground text-2xl font-black">
                                    {formatPrice(item.rtoCharges)}
                                  </span>
                                  <span className="text-muted text-[10px] font-bold uppercase">
                                    RTO Charges
                                  </span>

                                  {/* Plus icon connector for md screens */}
                                  <div className="bg-foreground/5 text-muted absolute top-1/2 -right-3 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full font-black md:flex">
                                    +
                                  </div>
                                </div>

                                {/* Insurance */}
                                <div className="relative flex flex-col gap-2">
                                  <div className="flex items-center gap-2 text-purple-500">
                                    <Shield size={16} />
                                    <span className="text-xs font-black tracking-wider uppercase">
                                      Protection
                                    </span>
                                  </div>
                                  <span className="text-foreground text-2xl font-black">
                                    {formatPrice(item.insuranceEst)}
                                  </span>
                                  <span className="text-muted text-[10px] font-bold uppercase">
                                    Insurance Est.
                                  </span>

                                  {/* Plus icon connector for md screens */}
                                  <div className="absolute top-1/2 -right-3 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-brand-orange)]/10 font-black text-[var(--color-brand-orange)] md:flex">
                                    =
                                  </div>
                                </div>

                                {/* Total */}
                                <div className="-m-4 ml-0 flex flex-col gap-2 rounded-xl border border-[var(--color-brand-orange)]/20 bg-[var(--color-brand-orange)]/10 p-4 md:ml-2">
                                  <div className="flex items-center gap-2 text-[var(--color-brand-orange)]">
                                    <IndianRupee size={16} />
                                    <span className="text-xs font-black tracking-wider uppercase">
                                      Final Price
                                    </span>
                                  </div>
                                  <span className="text-3xl font-black text-[var(--color-brand-orange)]">
                                    {formatPrice(item.onRoadPrice)}
                                  </span>
                                  <span className="text-[10px] font-bold text-[var(--color-brand-orange)]/80 uppercase">
                                    Est. On-Road Price
                                  </span>
                                </div>
                              </div>
                            </div>

                            {item.dealerCharges > 0 && (
                              <div className="mt-2 flex justify-end">
                                <span className="text-muted bg-foreground/5 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-bold">
                                  * Note: Includes Dealer Charges of{' '}
                                  {formatPrice(item.dealerCharges)}
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

        {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          totalCount={
            prices.length > 0
              ? page * limit + (prices.length === limit ? 1 : 0)
              : (page - 1) * limit
          }
          totalPages={prices.length === limit ? page + 1 : page}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
