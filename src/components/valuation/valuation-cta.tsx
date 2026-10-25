'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, DollarSign, ShieldCheck, Tractor } from 'lucide-react';

interface ValuationCtaProps {
  brand?: string;
  model?: string;
  estimatedPrice?: number;
}

export function ValuationCta({ brand, model, estimatedPrice }: ValuationCtaProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 backdrop-blur-md">
        <div>
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <Tractor className="h-5 w-5" />
          </div>
          <h4 className="text-base font-extrabold text-foreground">Sell Your Tractor Now</h4>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            List {brand ? `${brand} ${model || ''}` : 'your tractor'} for verified buyers across
            India with 0% brokerage.
          </p>
        </div>
        <Link
          href="/sell-used-tractor"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-500 active:scale-95"
        >
          <span>List Tractor for Sale</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 backdrop-blur-md">
        <div>
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <h4 className="text-base font-extrabold text-foreground">Get Instant Loan</h4>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Borrow up to 70% of this tractor&apos;s value without selling it. Fast approval in 24 hours.
          </p>
        </div>
        <Link
          href="/loan/loan-against-tractor"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-amber-500 active:scale-95"
        >
          <span>Apply for Loan</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default ValuationCta;
