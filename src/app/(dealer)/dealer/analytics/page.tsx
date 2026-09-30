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
    {
      label: 'Total Inquiries Received',
      count: 124,
      percentage: 100,
      color: 'bg-[var(--color-brand-green)]',
    },
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
    {
      model: 'Mahindra 575 DI SP Plus',
      brand: 'Mahindra',
      inquiries: 29,
      stock: 5,
      demand: 'HIGH',
    },
    { model: 'Eicher 380 Super DI', brand: 'Eicher', inquiries: 21, stock: 4, demand: 'STABLE' },
    {
      model: 'Farmtrac 60 Powermaxx',
      brand: 'Farmtrac',
      inquiries: 16,
      stock: 3,
      demand: 'STABLE',
    },
    {
      model: 'John Deere 5050 D',
      brand: 'John Deere',
      inquiries: 12,
      stock: 2,
      demand: 'MODERATE',
    },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Sleek Admin Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
            <BarChart3 size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Dealership Analytics
              </h1>
              <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                Live Insights
              </span>
            </div>
            <p className="text-muted mt-0.5 text-xs font-bold sm:text-sm">
              Performance metrics, customer inquiry conversions, and stock velocity analytics.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-start sm:self-auto">
          <div className="bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs">
            <Calendar size={14} className="text-muted shrink-0" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-foreground cursor-pointer bg-transparent font-bold focus:outline-none"
            >
              <option value="30_DAYS">Last 30 Days</option>
              <option value="90_DAYS">Last 90 Days</option>
              <option value="YTD">Year to Date (2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stat Strip Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-3 text-[var(--color-brand-green)]">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-foreground text-2xl font-black tracking-tight">+18.4%</span>
              <span className="flex items-center text-xs font-bold text-[var(--color-brand-green)]">
                <ArrowUpRight size={14} />
              </span>
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Lead Growth Rate
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-500">
            <Tractor size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">14 Days</div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Stock Turnaround
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500">
            <Star size={22} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-foreground text-2xl font-black tracking-tight">4.8</span>
              <span className="text-xs font-bold text-amber-500">★</span>
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Rating Score
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-500">
            <IndianRupee size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">₹42.5 L</div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Est. Monthly Deals
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Card Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Lead Conversion Funnel */}
        <div className="glass-panel space-y-6 rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
                <Users size={20} className="text-[var(--color-brand-green)]" /> Lead Conversion
                Funnel
              </h2>
              <p className="text-muted mt-0.5 text-xs font-medium">
                Inquiry lifecycle efficiency from initial call to delivery.
              </p>
            </div>
            <span className="rounded-md border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
              25.8% Conversion
            </span>
          </div>

          <div className="space-y-4">
            {funnelSteps.map((step, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground">{step.label}</span>
                  <span className="text-muted font-mono">
                    {step.count} ({step.percentage}%)
                  </span>
                </div>
                <div className="bg-foreground/5 h-3 overflow-hidden rounded-full border border-[var(--border-subtle)] p-0.5">
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
        <div className="glass-panel space-y-6 rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
                <Zap size={20} className="text-[var(--color-brand-green)]" /> HP Horsepower Segment
                Demand
              </h2>
              <p className="text-muted mt-0.5 text-xs font-medium">
                Stock availability vs farmer demand across HP ranges.
              </p>
            </div>
            <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-purple-600 uppercase dark:text-purple-400">
              4 Segments
            </span>
          </div>

          <div className="space-y-4">
            {hpSegments.map((seg, idx) => (
              <div
                key={idx}
                className="bg-foreground/5 space-y-2 rounded-2xl border border-[var(--border-subtle)] p-3.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-black">{seg.segment}</span>
                  <span className="font-mono font-bold text-[var(--color-brand-green)]">
                    {seg.leads} Enquiries
                  </span>
                </div>
                <div className="text-muted flex items-center justify-between text-[11px]">
                  <span>
                    Stock Units: <strong className="text-foreground font-mono">{seg.stock}</strong>
                  </span>
                  <span>
                    Market Share:{' '}
                    <strong className="text-foreground font-mono">{seg.share}%</strong>
                  </span>
                </div>
                <div className="bg-foreground/10 h-2 overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-[var(--color-brand-green)]"
                    style={{ width: `${seg.share * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Demanded Models Table */}
      <div className="glass-panel space-y-6 rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-lg font-black">
              <Award size={20} className="text-[var(--color-brand-green)]" /> Top Demanded Tractor
              Models
            </h2>
            <p className="text-muted mt-0.5 text-xs font-medium">
              Most requested tractor models by farmers in your region.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-muted border-b border-[var(--border-subtle)] text-xs font-bold tracking-wider uppercase">
                <th className="px-4 py-3">Tractor Model</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Total Inquiries</th>
                <th className="px-4 py-3">Stock Units</th>
                <th className="px-4 py-3 text-right">Demand Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm font-medium">
              {topModels.map((m, idx) => (
                <tr key={idx} className="hover:bg-foreground/5 transition-colors">
                  <td className="text-foreground px-4 py-4 font-black">{m.model}</td>
                  <td className="text-muted px-4 py-4 text-xs font-bold">{m.brand}</td>
                  <td className="px-4 py-4 font-mono font-bold text-[var(--color-brand-green)]">
                    {m.inquiries}
                  </td>
                  <td className="text-muted px-4 py-4 font-mono">{m.stock} pcs</td>
                  <td className="px-4 py-4 text-right">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase ${
                        m.demand === 'HIGH'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : m.demand === 'STABLE'
                            ? 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'
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
