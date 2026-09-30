'use client';

import React from 'react';
import { Layers, Rocket, Zap, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminListingBoostsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-3 text-3xl font-black tracking-tight">
            <Rocket className="text-[var(--color-brand-green)]" size={32} />
            Listing Boosts
          </h1>
          <p className="text-muted mt-1 font-medium">
            Manage premium and boosted marketplace listings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-background border-foreground/10 flex flex-col items-center rounded-3xl border p-6 text-center shadow-sm">
          <div className="mb-4 rounded-full bg-amber-500/10 p-4 text-amber-500">
            <Zap size={32} />
          </div>
          <h3 className="mb-2 text-xl font-black">Active Boosts</h3>
          <p className="text-muted mb-4 font-medium">
            Currently boosted listings appearing at the top of search results.
          </p>
          <p className="mt-auto text-4xl font-black text-amber-500">12</p>
        </div>
        <div className="bg-background border-foreground/10 flex flex-col items-center rounded-3xl border p-6 text-center shadow-sm">
          <div className="mb-4 rounded-full bg-[var(--color-brand-green)]/10 p-4 text-[var(--color-brand-green)]">
            <Layers size={32} />
          </div>
          <h3 className="mb-2 text-xl font-black">Total Boost Revenue</h3>
          <p className="text-muted mb-4 font-medium">
            Revenue generated from sellers boosting their tractors.
          </p>
          <p className="mt-auto text-4xl font-black text-[var(--color-brand-green)]">₹48,000</p>
        </div>
        <div className="bg-background border-foreground/10 flex flex-col items-center rounded-3xl border p-6 text-center shadow-sm">
          <div className="mb-4 rounded-full bg-blue-500/10 p-4 text-blue-500">
            <Clock size={32} />
          </div>
          <h3 className="mb-2 text-xl font-black">Expiring Soon</h3>
          <p className="text-muted mb-4 font-medium">
            Boosts that will expire in the next 24 hours.
          </p>
          <p className="mt-auto text-4xl font-black text-blue-500">3</p>
        </div>
      </div>

      <div className="bg-background border-foreground/10 mt-8 rounded-3xl border p-8 text-center shadow-sm">
        <Rocket className="text-foreground/20 mx-auto mb-4" size={48} />
        <h3 className="mb-2 text-2xl font-black">Listing Boost Module</h3>
        <p className="text-muted mx-auto max-w-lg font-medium">
          The backend schema for <strong>ListingBoost</strong> is ready. This module allows sellers
          to pay for priority placement in the used tractor search results.
        </p>
        <Link
          href="/admin/used-listings"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-3 font-black text-white transition-all hover:scale-105 hover:bg-[var(--color-brand-green)]/90 active:scale-95"
        >
          View Used Listings <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
}
