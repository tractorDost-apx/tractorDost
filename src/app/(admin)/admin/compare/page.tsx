'use client';

import React, { useState, useEffect } from 'react';
import { compareAPI, CompareFrequencyRecord, CompareHistoryRecord } from '@/lib/api/compare';
import {
  BarChart2,
  Search,
  ArrowRightLeft,
  Flame,
  Eye,
  Image as ImageIcon,
  History,
  User as UserIcon,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';

export default function CompareAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'logs'>('analytics');

  // Analytics State
  const [records, setRecords] = useState<CompareFrequencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Logs State
  const [logs, setLogs] = useState<CompareHistoryRecord[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit, setLogsLimit] = useState(10);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotalCount, setLogsTotalCount] = useState(0);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await compareAPI.getFrequencyOfCompare({
        page,
        limit,
        search,
        sort: 'desc',
      });
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

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await compareAPI.getAllCompareHistory({
        page: logsPage,
        limit: logsLimit,
        search: logsSearch,
      });
      if (response.success) {
        setLogs(response.data.records);
        setLogsTotalPages(Math.ceil(response.data.meta.total / response.data.meta.limit) || 1);
        setLogsTotalCount(response.data.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch compare history logs', error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeTab === 'analytics') {
        fetchAnalytics();
      } else {
        fetchLogs();
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page, logsSearch, logsPage, activeTab]);

  // Find max frequency to normalize progress bars
  const maxFreq = records.length > 0 ? Math.max(...records.map((r) => r.frequency)) : 1;

  const TractorPortrait = ({ tractor, side }: { tractor: any; side: 'left' | 'right' }) => {
    return (
      <div
        className={`flex w-1/2 flex-col items-center gap-3 text-center ${side === 'left' ? 'pr-4' : 'pl-4'}`}
      >
        <div className="bg-foreground/5 group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-transparent p-2 shadow-inner transition-all hover:border-[var(--color-brand-green)] sm:h-28 sm:w-28">
          {tractor?.primaryMedia?.url ? (
            <img
              src={tractor.primaryMedia.url}
              alt={tractor.modelName}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="text-muted/50 flex flex-col items-center gap-1">
              <ImageIcon size={24} />
              <span className="text-[9px] font-black tracking-widest uppercase">No IMG</span>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="mb-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-orange)] uppercase">
            {tractor?.brand?.name || 'Unknown Brand'}
          </span>
          <span className="text-foreground text-sm leading-tight font-black">
            {tractor?.modelName || 'Unknown Model'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">Compare Analytics</h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Deep analysis of user tractor comparison behaviors.
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="border-[var(--border-subtle)] mt-2 flex gap-6 border-b">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`border-b-2 pb-3 text-sm font-black tracking-wider uppercase transition-all ${
            activeTab === 'analytics'
              ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)]'
              : 'text-muted hover:text-foreground border-transparent'
          }`}
        >
          Trending Analytics
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`border-b-2 pb-3 text-sm font-black tracking-wider uppercase transition-all ${
            activeTab === 'logs'
              ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)]'
              : 'text-muted hover:text-foreground border-transparent'
          }`}
        >
          All Comparison Logs
        </button>
      </div>

      <div className="glass-panel flex flex-col items-center justify-between gap-4 rounded-2xl p-4 md:flex-row">
        <div className="flex w-full items-center gap-4 text-sm font-bold md:w-auto">
          {activeTab === 'analytics' ? (
            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-4 py-2 text-[var(--color-brand-green)]">
              <BarChart2 size={18} />
              Total Unique Comparisons: {totalCount}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-4 py-2 text-[var(--color-brand-green)]">
              <History size={18} />
              Total Comparison Logs: {logsTotalCount}
            </div>
          )}
        </div>

        <div className="group relative w-full md:w-80">
          <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder={
              activeTab === 'analytics'
                ? 'Search by tractor model...'
                : 'Search by mobile or model...'
            }
            value={activeTab === 'analytics' ? search : logsSearch}
            onChange={(e) => {
              if (activeTab === 'analytics') {
                setSearch(e.target.value);
                setPage(1);
              } else {
                setLogsSearch(e.target.value);
                setLogsPage(1);
              }
            }}
            className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-full border border-transparent py-2.5 pr-4 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
          />
        </div>
      </div>

      {activeTab === 'analytics' ? (
        loading ? (
          <div className="glass-panel flex items-center justify-center rounded-2xl p-12">
            <span className="text-muted animate-pulse font-bold">Loading analytics matrix...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center gap-2 rounded-2xl p-12 text-center">
            <ArrowRightLeft size={48} className="text-muted/30 mb-2" />
            <span className="text-foreground text-lg font-black">No comparison data found.</span>
            <span className="text-muted text-sm font-bold">
              Wait for users to start comparing tractors.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {records.map((item, idx) => {
              const hotness = (item.frequency / maxFreq) * 100;
              return (
                <div
                  key={idx}
                  className="glass-panel group relative flex flex-col gap-6 overflow-hidden rounded-2xl p-6 shadow-sm transition-all hover:border-[var(--color-brand-green)]/30 hover:shadow-md"
                >
                  {/* Hotness Badge */}
                  <div className="border-foreground/5 flex items-center justify-between border-b pb-4">
                    <div className="bg-foreground/5 flex items-center gap-2 rounded-lg px-3 py-1.5">
                      <Flame
                        size={16}
                        className={
                          hotness > 75
                            ? 'animate-pulse text-red-500'
                            : hotness > 40
                              ? 'text-[var(--color-brand-orange)]'
                              : 'text-[var(--color-brand-green)]'
                        }
                      />
                      <span className="text-foreground text-xs font-black tracking-wider uppercase">
                        {item.frequency} Times
                      </span>
                    </div>
                    <span className="text-muted text-[10px] font-black tracking-widest uppercase">
                      Rank #{(page - 1) * 12 + idx + 1}
                    </span>
                  </div>

                  {/* VS Arena */}
                  <div className="relative flex items-center justify-between py-2">
                    <TractorPortrait tractor={item.tractorLeft} side="left" />

                    {/* VS Badge */}
                    <div className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                      <div className="bg-background border-[var(--border-subtle)] flex h-8 w-8 items-center justify-center rounded-full border shadow-md">
                        <span className="text-[10px] font-black text-[var(--color-brand-orange)] italic">
                          VS
                        </span>
                      </div>
                    </div>

                    {/* Connecting Line */}
                    <div className="via-foreground/20 absolute top-1/2 right-1/4 left-1/4 -z-0 h-[1px] -translate-y-1/2 bg-gradient-to-r from-transparent to-transparent"></div>

                    <TractorPortrait tractor={item.tractorRight} side="right" />
                  </div>

                  {/* Popularity Bar */}
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="text-muted flex justify-between text-[9px] font-black tracking-widest uppercase">
                      <span>Popularity</span>
                      <span>{Math.round(hotness)}% relative</span>
                    </div>
                    <div className="bg-foreground/5 h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${hotness > 75 ? 'bg-gradient-to-r from-[var(--color-brand-orange)] to-red-500' : 'bg-[var(--color-brand-green)]'}`}
                        style={{ width: `${Math.max(2, hotness)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions overlay */}
                  <div className="bg-background/95 absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <span className="text-foreground mb-2 text-sm font-black tracking-widest uppercase">
                      View Details
                    </span>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/tractors/${item.tractorLeft?.id}`}
                        className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black tracking-wider text-white uppercase shadow-lg transition-colors hover:bg-[var(--color-brand-orange)]"
                      >
                        <Eye size={14} /> Left Tractor
                      </Link>
                      <Link
                        href={`/admin/tractors/${item.tractorRight?.id}`}
                        className="bg-foreground/10 text-foreground hover:bg-foreground/20 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-wider uppercase shadow-sm transition-colors"
                      >
                        <Eye size={14} /> Right Tractor
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : logsLoading ? (
        <div className="glass-panel flex items-center justify-center rounded-2xl p-12">
          <span className="text-muted animate-pulse font-bold">
            Loading comparison log database...
          </span>
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center gap-2 rounded-2xl p-12 text-center">
          <History size={48} className="text-muted/30 mb-2" />
          <span className="text-foreground text-lg font-black">No comparison logs found.</span>
          <span className="text-muted text-sm font-bold">
            Comparison history will appear here once registered.
          </span>
        </div>
      ) : (
        <div className="glass-panel border-foreground/5 overflow-hidden rounded-2xl border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-foreground/5 border-[var(--border-subtle)] text-muted border-b text-xs font-black tracking-wider uppercase">
                  <th className="p-4 pl-6">Client / User Details</th>
                  <th className="p-4">Tractor VS Battle</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-foreground/5 divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                          <UserIcon size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-foreground text-sm font-black">
                            {log.user?.fullName || 'TractorDost User'}
                          </span>
                          <span className="text-muted text-xs font-bold">
                            {log.user?.mobile ? `+91 ${log.user.mobile}` : 'Guest User'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-[var(--color-brand-orange)] uppercase">
                          {log.tractorLeft?.modelName || 'Deleted Tractor'}
                        </span>
                        <span className="text-muted text-[10px] font-black italic">VS</span>
                        <span className="text-xs font-black text-[var(--color-brand-green)] uppercase">
                          {log.tractorRight?.modelName || 'Deleted Tractor'}
                        </span>
                      </div>
                    </td>
                    <td className="text-muted p-4 text-sm font-bold">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link
                        href={`/compare?ids=${log.tractorLeftId},${log.tractorRightId}`}
                        target="_blank"
                        className="bg-foreground/5 inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3.5 py-1.5 text-xs font-black tracking-wider uppercase transition-colors hover:border-[var(--color-brand-green)]/20 hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)]"
                      >
                        View Compare <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {activeTab === 'analytics' ? (
        <Pagination
          page={page}
          limit={limit}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      ) : (
        <Pagination
          page={logsPage}
          limit={logsLimit}
          totalCount={logsTotalCount}
          totalPages={logsTotalPages}
          onPageChange={setLogsPage}
          onLimitChange={(l) => {
            setLogsLimit(l);
            setLogsPage(1);
          }}
        />
      )}
    </div>
  );
}
