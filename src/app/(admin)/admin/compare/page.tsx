'use client';

import React, { useState, useEffect } from 'react';
import { compareAPI, CompareFrequencyRecord } from '@/lib/api/compare';
import { BarChart2, Search, ArrowRightLeft, Flame, Eye, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';


export default function CompareAnalyticsPage() {
  const [records, setRecords] = useState<CompareFrequencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await compareAPI.getFrequencyOfCompare({ page, limit: 12, search, sort: 'desc' });
      if (response.success) {
        setRecords(response.data.records);
        setTotalPages(Math.ceil(response.data.meta.total / response.data.meta.limit) || 1);
        setTotalCount(response.data.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch compare analytics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAnalytics();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  // Find max frequency to normalize progress bars
  const maxFreq = records.length > 0 ? Math.max(...records.map(r => r.frequency)) : 1;

  const TractorPortrait = ({ tractor, side }: { tractor: any, side: 'left' | 'right' }) => {
    return (
      <div className={`flex flex-col items-center text-center gap-3 w-1/2 ${side === 'left' ? 'pr-4' : 'pl-4'}`}>
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-foreground/5 flex items-center justify-center p-2 border-2 border-transparent hover:border-[var(--color-brand-green)] transition-all overflow-hidden shadow-inner group">
          {tractor?.primaryMedia?.url ? (
            <img 
              src={tractor.primaryMedia.url} 
              alt={tractor.modelName} 
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
            />
          ) : (
            <div className="flex flex-col items-center text-muted/50 gap-1">
              <ImageIcon size={24} />
              <span className="text-[9px] font-black uppercase tracking-widest">No IMG</span>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-[var(--color-brand-orange)] font-black uppercase tracking-wider mb-0.5">
            {tractor?.brand?.name || 'Unknown Brand'}
          </span>
          <span className="text-sm font-black text-foreground leading-tight">
            {tractor?.modelName || 'Unknown Model'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Compare Analytics</h1>
          <p className="text-sm font-bold text-muted mt-1">Deep analysis of user tractor comparison behaviors.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4 text-sm font-bold w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-4 py-2 rounded-xl">
            <BarChart2 size={18} />
            Total Unique Comparisons: {totalCount}
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search by tractor model..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-foreground/5 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="glass-panel rounded-2xl p-12 flex items-center justify-center">
          <span className="text-muted font-bold animate-pulse">Loading analytics matrix...</span>
        </div>
      ) : records.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-2">
          <ArrowRightLeft size={48} className="text-muted/30 mb-2" />
          <span className="text-foreground font-black text-lg">No comparison data found.</span>
          <span className="text-muted font-bold text-sm">Wait for users to start comparing tractors.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((item, idx) => {
            const hotness = (item.frequency / maxFreq) * 100;
            return (
              <div key={idx} className="glass-panel rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group hover:border-[var(--color-brand-green)]/30 transition-all shadow-sm hover:shadow-md">
                
                {/* Hotness Badge */}
                <div className="flex items-center justify-between border-b border-foreground/5 pb-4">
                  <div className="flex items-center gap-2 bg-foreground/5 px-3 py-1.5 rounded-lg">
                    <Flame size={16} className={hotness > 75 ? "text-red-500 animate-pulse" : hotness > 40 ? "text-[var(--color-brand-orange)]" : "text-[var(--color-brand-green)]"} />
                    <span className="text-xs font-black uppercase tracking-wider text-foreground">
                      {item.frequency} Times
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                    Rank #{((page - 1) * 12) + idx + 1}
                  </span>
                </div>

                {/* VS Arena */}
                <div className="flex items-center justify-between relative py-2">
                  <TractorPortrait tractor={item.tractorLeft} side="left" />
                  
                  {/* VS Badge */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-background border border-foreground/10 flex items-center justify-center shadow-md">
                      <span className="text-[10px] font-black text-[var(--color-brand-orange)] italic">VS</span>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  <div className="absolute left-1/4 right-1/4 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent -z-0"></div>

                  <TractorPortrait tractor={item.tractorRight} side="right" />
                </div>

                {/* Popularity Bar */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted">
                    <span>Popularity</span>
                    <span>{Math.round(hotness)}% relative</span>
                  </div>
                  <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${hotness > 75 ? 'bg-gradient-to-r from-[var(--color-brand-orange)] to-red-500' : 'bg-[var(--color-brand-green)]'}`}
                      style={{ width: `${Math.max(2, hotness)}%` }}
                    />
                  </div>
                </div>

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 z-20">
                  <span className="text-sm font-black text-foreground uppercase tracking-widest mb-2">View Details</span>
                  <div className="flex items-center gap-4">
                    <Link 
                      href={`/admin/tractors/${item.tractorLeft?.id}`}
                      className="px-4 py-2 bg-[var(--color-brand-green)] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[var(--color-brand-orange)] transition-colors shadow-lg flex items-center gap-2"
                    >
                      <Eye size={14} /> Left Tractor
                    </Link>
                    <Link 
                      href={`/admin/tractors/${item.tractorRight?.id}`}
                      className="px-4 py-2 bg-foreground/10 text-foreground text-xs font-black uppercase tracking-wider rounded-xl hover:bg-foreground/20 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <Eye size={14} /> Right Tractor
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
        />
    </div>
  );
}
