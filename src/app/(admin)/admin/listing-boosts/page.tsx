'use client';

import React from 'react';
import { Layers, Rocket, Zap, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminListingBoostsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Rocket className="text-[var(--color-brand-green)]" size={32} />
            Listing Boosts
          </h1>
          <p className="text-muted font-medium mt-1">Manage premium and boosted marketplace listings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-background rounded-3xl border border-foreground/10 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full mb-4">
            <Zap size={32} />
          </div>
          <h3 className="text-xl font-black mb-2">Active Boosts</h3>
          <p className="text-muted mb-4 font-medium">Currently boosted listings appearing at the top of search results.</p>
          <p className="text-4xl font-black text-amber-500 mt-auto">12</p>
        </div>
        <div className="bg-background rounded-3xl border border-foreground/10 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="p-4 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full mb-4">
            <Layers size={32} />
          </div>
          <h3 className="text-xl font-black mb-2">Total Boost Revenue</h3>
          <p className="text-muted mb-4 font-medium">Revenue generated from sellers boosting their tractors.</p>
          <p className="text-4xl font-black text-[var(--color-brand-green)] mt-auto">₹48,000</p>
        </div>
        <div className="bg-background rounded-3xl border border-foreground/10 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="p-4 bg-blue-500/10 text-blue-500 rounded-full mb-4">
            <Clock size={32} />
          </div>
          <h3 className="text-xl font-black mb-2">Expiring Soon</h3>
          <p className="text-muted mb-4 font-medium">Boosts that will expire in the next 24 hours.</p>
          <p className="text-4xl font-black text-blue-500 mt-auto">3</p>
        </div>
      </div>

      <div className="bg-background rounded-3xl border border-foreground/10 shadow-sm p-8 text-center mt-8">
        <Rocket className="text-foreground/20 mx-auto mb-4" size={48} />
        <h3 className="text-2xl font-black mb-2">Listing Boost Module</h3>
        <p className="text-muted max-w-lg mx-auto font-medium">
          The backend schema for <strong>ListingBoost</strong> is ready. This module allows sellers to pay for priority placement in the used tractor search results.
        </p>
        <Link href="/admin/used-listings" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/90 text-white font-black rounded-xl transition-all hover:scale-105 active:scale-95">
          View Used Listings <ChevronRight size={18} />
        </Link>
      </div>

    </div>
  );
}
