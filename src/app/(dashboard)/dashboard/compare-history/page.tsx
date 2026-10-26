'use client';

import React from 'react';
import { History, ArrowRightLeft, Tractor, Trash2, Gauge, IndianRupee, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useCompare } from '@/hooks/ui/use-compare';

export default function CompareHistoryPage() {
  const { compareItems, removeFromCompare, clearCompare, count } = useCompare();

  return (
    <div className="animate-fade-in flex h-full flex-col space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground mb-1 text-3xl font-black">Compare History</h1>
          <p className="text-muted text-xs font-medium sm:text-sm">
            Tractors you have recently selected for side-by-side comparison.
          </p>
        </div>

        {count > 0 && (
          <div className="flex items-center gap-3">
            <Link
              href="/compare"
              className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 active:scale-95"
            >
              <ArrowRightLeft size={16} /> Compare Now ({count})
            </Link>
            <button
              type="button"
              onClick={clearCompare}
              className="text-muted hover:text-red-500 hover:bg-red-500/10 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold transition-all"
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>
        )}
      </div>

      {count === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] mb-4">
            <ArrowRightLeft size={32} />
          </div>
          <h3 className="text-foreground text-lg font-bold">No Tractors in Compare List</h3>
          <p className="text-muted mt-1 max-w-sm text-xs font-medium">
            You haven&apos;t added any tractors to compare yet. Compare models, engine horsepower, and prices easily.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tractors"
              className="rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md hover:opacity-90"
            >
              Explore New Tractors
            </Link>
            <Link
              href="/compare"
              className="rounded-xl border border-[var(--border-subtle)] bg-background px-5 py-2.5 text-xs font-black tracking-wider text-foreground uppercase hover:border-[var(--color-brand-green)]"
            >
              Open Comparison Tool
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {compareItems.map((item) => (
            <div
              key={item.id || item.slug}
              className="glass-panel group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-5 transition-all hover:border-[var(--color-brand-green)]/40 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="bg-foreground/5 relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.modelName}
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <Tractor size={32} className="text-muted/40" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-muted text-[10px] font-bold tracking-widest uppercase">
                    {item.brandName}
                  </span>
                  <h3 className="text-foreground line-clamp-1 text-base font-black">
                    {item.modelName}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                    {item.hp && (
                      <span className="flex items-center gap-1 text-muted">
                        <Gauge size={13} /> {item.hp} HP
                      </span>
                    )}
                    {item.price && (
                      <span className="text-foreground flex items-center font-black">
                        ₹{(item.price / 100000).toFixed(2)} Lakh
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                <Link
                  href={`/tractors/${item.id || item.slug}`}
                  className="text-muted hover:text-[var(--color-brand-green)] flex items-center gap-1 text-xs font-bold transition-colors"
                >
                  <span>View Details</span>
                  <ExternalLink size={12} />
                </Link>

                <button
                  type="button"
                  onClick={() => removeFromCompare(item.id || item.slug)}
                  className="text-muted hover:text-red-500 rounded-lg p-1.5 transition-colors"
                  title="Remove from comparison"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
