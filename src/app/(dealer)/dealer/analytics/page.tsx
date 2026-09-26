'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Tractor,
  Star,
  IndianRupee,
  Calendar,
  Award,
  Zap,
  ArrowUpRight,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'30_DAYS' | '90_DAYS' | 'YTD'>('30_DAYS');

  const funnelSteps = [
    { label: 'Total Inquiries Received', count: 124, percentage: 100, color: 'bg-[var(--color-brand-green)]' },
    { label: 'Followed Up & Contacted', count: 98, percentage: 79, color: 'bg-blue-500' },
    { label: 'Showroom / Test Drive Taken', count: 54, percentage: 43, color: 'bg-purple-500' },
    { label: 'Deals Finalized & Delivered', count: 32, percentage: 26, color: 'bg-emerald-500' },
  ];

  const hpSegments = [
    { segment: '35 HP & Below (Compact)', stock: 12, leads: 28, share: 22 },
    { segment: '36 - 50 HP (Utility Segment)', stock: 24, leads: 62, share: 50 },
    { segment: '51 - 60 HP (Heavy Duty)', stock: 8, leads: 24, share: 19 },
    { segment: '60+ HP (Commercial)', stock: 3, leads: 10, share: 9 },
  ];

  const topModels = [
    { model: 'Swaraj 744 FE', brand: 'Swaraj', inquiries: 38, stock: 6, demand: 'HIGH' },
    { model: 'Mahindra 575 DI SP Plus', brand: 'Mahindra', inquiries: 29, stock: 5, demand: 'HIGH' },
    { model: 'Eicher 380 Super DI', brand: 'Eicher', inquiries: 21, stock: 4, demand: 'STABLE' },
    { model: 'Farmtrac 60 Powermaxx', brand: 'Farmtrac', inquiries: 16, stock: 3, demand: 'STABLE' },
    { model: 'John Deere 5050 D', brand: 'John Deere', inquiries: 12, stock: 2, demand: 'MODERATE' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Sleek Admin Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 shrink-0">
            <BarChart3 size={26} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Dealership Analytics
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 uppercase tracking-wider">
                Live Insights
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-muted mt-0.5">
              Performance metrics, customer inquiry conversions, and stock velocity analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs">
            <Calendar size={14} className="text-muted shrink-0" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer"
            >
              <option value="30_DAYS">Last 30 Days</option>
              <option value="90_DAYS">Last 90 Days</option>
              <option value="YTD">Year to Date (2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stat Strip Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shrink-0 border border-[var(--color-brand-green)]/20">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight text-foreground">+18.4%</span>
              <span className="text-xs font-bold text-[var(--color-brand-green)] flex items-center">
                <ArrowUpRight size={14} />
              </span>
            </div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Lead Growth Rate</div>
          </div>
        </div>

        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0 border border-blue-500/20">
            <Tractor size={22} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">14 Days</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Stock Turnaround</div>
          </div>
        </div>

        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 border border-amber-500/20">
            <Star size={22} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight text-foreground">4.8</span>
              <span className="text-xs text-amber-500 font-bold">★</span>
            </div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Rating Score</div>
          </div>
        </div>

        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0 border border-emerald-500/20">
            <IndianRupee size={22} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">₹42.5 L</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Est. Monthly Deals</div>
          </div>
        </div>
      </div>

      {/* Analytics Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Conversion Funnel */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Users size={20} className="text-[var(--color-brand-green)]" /> Lead Conversion Funnel
              </h2>
              <p className="text-xs text-muted font-medium mt-0.5">Inquiry lifecycle efficiency from initial call to delivery.</p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
              25.8% Conversion
            </span>
          </div>

          <div className="space-y-4">
            {funnelSteps.map((step, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground">{step.label}</span>
                  <span className="font-mono text-muted">{step.count} ({step.percentage}%)</span>
                </div>
                <div className="h-3 rounded-full bg-foreground/5 border border-[var(--border-subtle)] overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full ${step.color} transition-all duration-500`}
                    style={{ width: `${step.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HP Segment Demand Breakdown */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Zap size={20} className="text-[var(--color-brand-green)]" /> HP Horsepower Segment Demand
              </h2>
              <p className="text-xs text-muted font-medium mt-0.5">Stock availability vs farmer demand across HP ranges.</p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              4 Segments
            </span>
          </div>

          <div className="space-y-4">
            {hpSegments.map((seg, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-foreground/5 border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-foreground">{seg.segment}</span>
                  <span className="text-[var(--color-brand-green)] font-mono font-bold">{seg.leads} Enquiries</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Stock Units: <strong className="text-foreground font-mono">{seg.stock}</strong></span>
                  <span>Market Share: <strong className="text-foreground font-mono">{seg.share}%</strong></span>
                </div>
                <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                  <div className="h-full bg-[var(--color-brand-green)] rounded-full" style={{ width: `${seg.share * 2}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Demanded Models Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <Award size={20} className="text-[var(--color-brand-green)]" /> Top Demanded Tractor Models
            </h2>
            <p className="text-xs text-muted font-medium mt-0.5">Most requested tractor models by farmers in your region.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-xs font-bold text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Tractor Model</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Total Inquiries</th>
                <th className="py-3 px-4">Stock Units</th>
                <th className="py-3 px-4 text-right">Demand Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm font-medium">
              {topModels.map((m, idx) => (
                <tr key={idx} className="hover:bg-foreground/5 transition-colors">
                  <td className="py-4 px-4 font-black text-foreground">{m.model}</td>
                  <td className="py-4 px-4 text-xs text-muted font-bold">{m.brand}</td>
                  <td className="py-4 px-4 font-mono font-bold text-[var(--color-brand-green)]">{m.inquiries}</td>
                  <td className="py-4 px-4 font-mono text-muted">{m.stock} pcs</td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        m.demand === 'HIGH'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : m.demand === 'STABLE'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          : 'bg-foreground/5 text-muted border-[var(--border-subtle)]'
                      }`}
                    >
                      {m.demand} DEMAND
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
