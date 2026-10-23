'use client';

import React, { useState, useEffect } from 'react';
import { tractorAPI, TractorPriceByState } from '@/lib/api/tractors';
import {
  IndianRupee,
  Search,
  Edit2,
  MapPin,
  Calculator,
  Shield,
  Receipt,
  Landmark,
  Eye,
  X,
  ExternalLink,
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
  const [selectedPrice, setSelectedPrice] = useState<any | null>(null);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await tractorAPI.getAllTractorPricesByState({ search, page, limit });
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
  }, [search, page, limit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPrice(null);
      }
    };
    if (selectedPrice) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPrice]);

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return '₹ 0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="animate-fade-in flex flex-1 h-full w-full flex-col gap-6 pb-2">
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
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--color-brand-green)]/[0.04] group cursor-pointer transition-colors"
                    onClick={() => setSelectedPrice(item)}
                  >
                    <td className="text-muted px-6 py-4">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-muted transition-colors group-hover:bg-[var(--color-brand-green)]/15 group-hover:text-[var(--color-brand-green)]"
                        title="Click to view full price breakdown"
                      >
                        <Eye size={16} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-foreground text-base font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                          {item.tractor?.brand?.name ? `${item.tractor.brand.name} ` : ''}
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPrice(item);
                          }}
                          className="text-foreground/70 bg-foreground/5 inline-flex rounded-xl p-2 shadow-sm transition-colors hover:bg-[var(--color-brand-green)]/15 hover:text-[var(--color-brand-green)]"
                          title="View Price Breakdown Popup"
                        >
                          <Eye size={16} />
                        </button>
                        <Link
                          href={`/admin/tractors/${item.tractorId}?tab=pricing`}
                          className="text-foreground/70 bg-foreground/5 inline-flex rounded-xl p-2 shadow-sm transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)]"
                          title="Edit Pricing"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit2 size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
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

      {/* ON-ROAD PRICE BREAKDOWN POPUP MODAL */}
      {selectedPrice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setSelectedPrice(null)}
          />

          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/[0.02] p-5 sm:p-6">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-orange)]/15 text-[var(--color-brand-orange)] shadow-sm">
                  <Calculator size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-foreground text-xl font-black tracking-tight truncate">
                      {selectedPrice.tractor?.brand?.name ? `${selectedPrice.tractor.brand.name} ` : ''}
                      {selectedPrice.tractor?.modelName || `Tractor #${selectedPrice.tractorId}`}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-orange)]/15 px-2.5 py-0.5 text-xs font-black text-[var(--color-brand-orange)]">
                      <MapPin size={12} />
                      {selectedPrice.state}
                    </span>
                  </div>
                  <p className="text-muted text-xs font-semibold mt-0.5">
                    Official On-Road Cost Breakdown & Taxes • Tractor ID: #{selectedPrice.tractorId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPrice(null)}
                className="text-muted hover:text-foreground hover:bg-foreground/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all cursor-pointer"
                title="Close modal (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Formula Flow Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Base Ex-Showroom */}
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[var(--color-brand-green)] mb-1">
                      <Landmark size={15} />
                      <span className="text-[10px] font-black tracking-wider uppercase">
                        Ex-Showroom Price
                      </span>
                    </div>
                    <div className="text-foreground text-xl font-black mt-2">
                      {formatPrice(selectedPrice.exShowroom)}
                    </div>
                  </div>
                  <span className="text-muted text-[11px] font-semibold mt-3 pt-2 border-t border-[var(--border-subtle)]">
                    Base Factory / Dealer Price
                  </span>
                </div>

                {/* RTO Taxes */}
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                      <Receipt size={15} />
                      <span className="text-[10px] font-black tracking-wider uppercase">
                        RTO & State Road Tax
                      </span>
                    </div>
                    <div className="text-foreground text-xl font-black mt-2">
                      {formatPrice(selectedPrice.rtoCharges)}
                    </div>
                  </div>
                  <span className="text-muted text-[11px] font-semibold mt-3 pt-2 border-t border-[var(--border-subtle)]">
                    Mandatory Vehicle Registration
                  </span>
                </div>

                {/* Insurance */}
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-purple-500 mb-1">
                      <Shield size={15} />
                      <span className="text-[10px] font-black tracking-wider uppercase">
                        Insurance Estimate
                      </span>
                    </div>
                    <div className="text-foreground text-xl font-black mt-2">
                      {formatPrice(selectedPrice.insuranceEst)}
                    </div>
                  </div>
                  <span className="text-muted text-[11px] font-semibold mt-3 pt-2 border-t border-[var(--border-subtle)]">
                    Comprehensive Annual Coverage
                  </span>
                </div>

                {/* Dealer / Logistics */}
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                      <IndianRupee size={15} />
                      <span className="text-[10px] font-black tracking-wider uppercase">
                        Dealer Charges
                      </span>
                    </div>
                    <div className="text-foreground text-xl font-black mt-2">
                      {formatPrice(selectedPrice.dealerCharges || 0)}
                    </div>
                  </div>
                  <span className="text-muted text-[11px] font-semibold mt-3 pt-2 border-t border-[var(--border-subtle)]">
                    Handling, Fastag & Logistics
                  </span>
                </div>
              </div>

              {/* Total On-Road Banner */}
              <div className="rounded-3xl border border-[var(--color-brand-orange)]/30 bg-gradient-to-r from-[var(--color-brand-orange)]/10 via-[var(--color-brand-orange)]/5 to-transparent p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[var(--color-brand-orange)] font-black text-xs uppercase tracking-wider">
                      <IndianRupee size={18} />
                      Total Estimated On-Road Price ({selectedPrice.state})
                    </div>
                    <p className="text-muted text-xs font-semibold mt-1">
                      Calculated as: Ex-Showroom ({formatPrice(selectedPrice.exShowroom)}) + RTO ({formatPrice(selectedPrice.rtoCharges)}) + Insurance ({formatPrice(selectedPrice.insuranceEst)}) {selectedPrice.dealerCharges ? `+ Dealer Charges (${formatPrice(selectedPrice.dealerCharges)})` : ''}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-3xl sm:text-4xl font-black text-[var(--color-brand-orange)] tracking-tight">
                      {formatPrice(selectedPrice.onRoadPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* State Notice & Details */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4 text-xs font-medium text-muted space-y-1">
                <p className="text-foreground font-bold">Important Pricing Notice:</p>
                <p>
                  On-road prices may vary marginally based on specific regional RTO sub-zones, dealer delivery logistics, seasonal state subsidies, and optional equipment accessories selected by the buyer.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-foreground/[0.02] p-4 sm:p-6">
              <span className="text-muted text-xs font-bold">
                State: <strong className="text-foreground">{selectedPrice.state}</strong>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPrice(null)}
                  className="rounded-xl border border-[var(--border-subtle)] bg-background px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-foreground/5 cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href={`/admin/tractors/${selectedPrice.tractorId}?tab=pricing`}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:bg-[var(--color-brand-orange)]"
                >
                  <Edit2 size={14} /> Edit Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
