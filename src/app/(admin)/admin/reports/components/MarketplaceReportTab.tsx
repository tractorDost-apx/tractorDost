'use client';

import React, { useState, useMemo } from 'react';
import { UsedTractorListing } from '@/types/models/used-listing';
import {
  Search,
  Download,
  Tractor,
  Tag,
  DollarSign,
  TrendingUp,
  Fuel,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { exportDataToCSV } from '../utils/reportExportUtils';

interface MarketplaceReportTabProps {
  listings: UsedTractorListing[];
  loading?: boolean;
}

export const MarketplaceReportTab: React.FC<MarketplaceReportTabProps> = ({
  listings,
  loading,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');

  // Compute marketplace analytics
  const analytics = useMemo(() => {
    let totalGrossValue = 0;
    let activeCount = 0;
    let soldCount = 0;
    let pendingCount = 0;

    const brandCounts: Record<string, number> = {};
    const priceBrackets = {
      under2L: 0,
      between2L_4L: 0,
      between4L_7L: 0,
      above7L: 0,
    };

    listings.forEach((item) => {
      const price = Number(item.askingPrice ?? item.price) || 0;
      totalGrossValue += price;

      if (item.listingStatus === 'ACTIVE') activeCount++;
      else if (item.listingStatus === 'SOLD') soldCount++;
      else pendingCount++;

      // Price brackets
      if (price < 200000) priceBrackets.under2L++;
      else if (price <= 400000) priceBrackets.between2L_4L++;
      else if (price <= 700000) priceBrackets.between4L_7L++;
      else priceBrackets.above7L++;

      const brandName = item.tractorBrand || 'Other';
      brandCounts[brandName] = (brandCounts[brandName] || 0) + 1;
    });

    const avgPrice = listings.length > 0 ? Math.round(totalGrossValue / listings.length) : 0;

    return {
      totalGrossValue,
      activeCount,
      soldCount,
      pendingCount,
      avgPrice,
      brandCounts,
      priceBrackets,
    };
  }, [listings]);

  // Unique brand list for filter dropdown
  const uniqueBrands = useMemo(() => {
    return Object.keys(analytics.brandCounts).sort();
  }, [analytics.brandCounts]);

  // Filtered listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const bName = item.tractorBrand || '';
      const mName = item.tractorModel || '';
      const loc = `${item.villageCity || ''} ${item.district || ''} ${item.state || ''}`;

      const matchesSearch =
        search === '' ||
        mName.toLowerCase().includes(search.toLowerCase()) ||
        bName.toLowerCase().includes(search.toLowerCase()) ||
        loc.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || item.listingStatus === statusFilter;
      const matchesBrand = brandFilter === 'ALL' || bName === brandFilter;

      return matchesSearch && matchesStatus && matchesBrand;
    });
  }, [listings, search, statusFilter, brandFilter]);

  const handleExportCSV = () => {
    const rows = filteredListings.map((item) => ({
      ID: item.id,
      Brand: item.tractorBrand || '-',
      Model: item.tractorModel || '-',
      Year: item.yearOfManufacture || '-',
      PriceINR: item.askingPrice ?? item.price ?? 0,
      HoursRun: item.hoursUsed ?? '-',
      Status: item.listingStatus,
      Condition: item.conditionGrade || '-',
      Location: item.villageCity || item.district || item.state || '-',
      CreatedAt: new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN'),
    }));
    exportDataToCSV(rows, 'Used_Marketplace_Report');
  };

  const formatPriceLakhs = (amt: number) => {
    if (amt >= 10000000) {
      return `₹${(amt / 10000000).toFixed(2)} Cr`;
    }
    if (amt >= 100000) {
      return `₹${(amt / 100000).toFixed(2)} Lakh`;
    }
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Marketplace Intelligence & Pricing Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Financial & Inventory Barometer */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Marketplace Valuation
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Inventory monetary volume & pricing
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/5 p-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Total Inventory Gross Value
              </span>
              <div className="mt-1 text-2xl font-black text-neutral-900 dark:text-white">
                {formatPriceLakhs(analytics.totalGrossValue)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-3">
                <span className="text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                  Avg. Asking Price
                </span>
                <div className="mt-1 text-sm font-black text-neutral-900 dark:text-white">
                  {formatPriceLakhs(analytics.avgPrice)}
                </div>
              </div>
              <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-3">
                <span className="text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                  Sold Tractors
                </span>
                <div className="mt-1 text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {analytics.soldCount} Units
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Bracket Breakdown */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Price Range Distribution
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Tractor volume by asking price bracket
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Under ₹2.00 Lakh', count: analytics.priceBrackets.under2L },
              { label: '₹2.00 - ₹4.00 Lakh', count: analytics.priceBrackets.between2L_4L },
              { label: '₹4.00 - ₹7.00 Lakh', count: analytics.priceBrackets.between4L_7L },
              { label: 'Above ₹7.00 Lakh', count: analytics.priceBrackets.above7L },
            ].map(({ label, count }) => {
              const pct = listings.length > 0 ? Math.round((count / listings.length) * 100) : 0;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {label}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {count} <span className="font-medium text-neutral-500">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Share */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Brand Market Share
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Top tractor manufacturers in stock
            </p>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
            {Object.entries(analytics.brandCounts).length === 0 ? (
              <p className="text-xs text-neutral-500">No brand data recorded</p>
            ) : (
              Object.entries(analytics.brandCounts).map(([brand, count]) => {
                const pct = listings.length > 0 ? Math.round((count / listings.length) * 100) : 0;
                return (
                  <div
                    key={brand}
                    className="flex items-center justify-between rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/40 px-3 py-2 text-xs"
                  >
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{brand}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-white">{count}</span>
                      <span className="rounded-md bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Data Table with Filters */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Used Tractors Inventory
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Showing {filteredListings.length} of {listings.length} listings
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search tractor model, brand, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 py-2 pl-9 pr-3 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs font-medium"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SOLD">Sold</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="DRAFT">Draft</option>
            </select>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs"
            >
              <option value="ALL">All Brands</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-200 shadow-2xs transition-all hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-neutral-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              <tr>
                <th className="py-3 pl-3">ID</th>
                <th className="py-3">Model</th>
                <th className="py-3">Brand</th>
                <th className="py-3">Year</th>
                <th className="py-3">Hours Run</th>
                <th className="py-3">Asking Price</th>
                <th className="py-3">Location</th>
                <th className="py-3">Status</th>
                <th className="py-3 pr-3">Listed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-500">
                    <p className="font-semibold">No tractor listings matching your search criteria</p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Try selecting All Brands or clearing search filters
                    </p>
                  </td>
                </tr>
              ) : (
                filteredListings.slice(0, 50).map((item) => {
                  const priceNum = Number(item.askingPrice ?? item.price) || 0;
                  return (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40"
                    >
                      <td className="py-3 pl-3 font-mono text-[11px] font-bold text-neutral-500">
                        #{item.id}
                      </td>
                      <td className="py-3 font-bold text-neutral-900 dark:text-white">
                        {item.tractorModel || 'Tractor'}
                      </td>
                      <td className="py-3 font-medium text-neutral-800 dark:text-neutral-200">
                        {item.tractorBrand || '-'}
                      </td>
                      <td className="py-3 text-neutral-600 dark:text-neutral-400 font-medium">
                        {item.yearOfManufacture || '-'}
                      </td>
                      <td className="py-3 text-neutral-600 dark:text-neutral-400 font-medium">
                        {item.hoursUsed ? `${item.hoursUsed} hrs` : '-'}
                      </td>
                      <td className="py-3 font-black text-emerald-600 dark:text-emerald-400">
                        ₹{priceNum.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-neutral-700 dark:text-neutral-300 font-medium">
                        {item.villageCity || item.district ? `${item.villageCity || item.district}, ` : ''}
                        {item.state || '-'}
                      </td>
                      <td className="py-3">
                        {item.listingStatus === 'ACTIVE' ? (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            Active
                          </span>
                        ) : item.listingStatus === 'SOLD' ? (
                          <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                            Sold
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            {item.listingStatus}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-neutral-500 dark:text-neutral-400 font-medium">
                        {new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
