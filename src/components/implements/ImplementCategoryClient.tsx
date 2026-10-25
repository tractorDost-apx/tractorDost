'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Zap,
  SlidersHorizontal,
  ShieldCheck,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { implementAPI, Implement } from '@/lib/api/implements';
import { TractorLoader } from '@/components/ui/TractorLoader';
import { leadAPI } from '@/lib/api/leads';

interface ImplementCategoryClientProps {
  title: string;
  subtitle: string;
  badge: string;
  categoryTag?: 'popular' | 'latest' | 'electric' | 'cng';
  seoContent?: string;
}

export function ImplementCategoryClient({
  title,
  subtitle,
  badge,
  categoryTag,
  seoContent,
}: ImplementCategoryClientProps) {
  const [implementsList, setImplementsList] = useState<Implement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Inquiry Modal state
  const [selectedImplement, setSelectedImplement] = useState<Implement | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerMobile, setBuyerMobile] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await implementAPI.getAllImplements({ limit: 30, page: 1 });
        if (res.success && res.data) {
          const raw = res.data.implements || (res.data as any).data || [];
          setImplementsList(raw);
        } else {
          setImplementsList([]);
        }
      } catch (err) {
        console.error('Failed to load implements:', err);
        setImplementsList([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [categoryTag]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImplement || !buyerMobile.trim()) return;

    setSubmitting(true);
    try {
      await leadAPI.createLead({
        leadType: 'GET_PRICE' as any,
        targetType: 'IMPLEMENT',
        targetId: selectedImplement.id,
        name: buyerName.trim() || 'Farmer Lead',
        mobile: buyerMobile.replace(/\s+/g, '').replace(/^\+91/, ''),
        state: 'Maharashtra',
        interestedBrand: selectedImplement.brand?.name,
        interestedModel: selectedImplement.modelName,
        sourcePage: `/implements/${categoryTag || 'catalog'}`,
        message: `Inquiry for agricultural implement: ${selectedImplement.brand?.name || ''} ${selectedImplement.modelName}. Price: ₹${selectedImplement.price || 'On Request'}`.slice(0, 1000),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedImplement(null);
        setBuyerName('');
        setBuyerMobile('');
      }, 3000);
    } catch (err) {
      console.error('Failed to submit implement inquiry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = implementsList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.modelName?.toLowerCase().includes(q) ||
      item.brand?.name?.toLowerCase().includes(q) ||
      item.category?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link href="/implements" className="hover:text-foreground">
          Implements
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-semibold">{title}</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-background p-6 sm:p-10 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black tracking-wider text-emerald-400 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{badge}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/loan/implement"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white transition-all hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-600/25"
            >
              <span>Implement Loan &amp; Subsidy</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground">
            Available Equipment ({filtered.length})
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand, model, implement..."
            className="w-full rounded-xl border border-border/60 bg-card/60 pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <TractorLoader />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 p-12 text-center">
          <Wrench size={48} className="text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">No agricultural implements found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try clearing your search query or check all implements.</p>
          <Link
            href="/implements"
            className="mt-4 rounded-xl bg-muted px-4 py-2 text-xs font-bold text-foreground hover:bg-muted/80"
          >
            Browse All Implements
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5"
            >
              {/* Media Preview */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-background/50 flex items-center justify-center">
                <Wrench size={40} className="text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute top-2 left-2 rounded-full border border-border/40 bg-background/80 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-md">
                  {item.category?.name || 'Farm Implement'}
                </span>
              </div>

              {/* Info */}
              <div className="mt-4 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                  {item.brand?.name || 'Equipment'}
                </p>
                <h3 className="text-base font-extrabold text-foreground group-hover:text-emerald-400 transition-colors">
                  {item.modelName}
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div className="rounded-lg bg-background/40 p-1.5 border border-border/30">
                    <span className="block text-[10px] uppercase text-muted-foreground">Power Req.</span>
                    <span className="font-bold text-foreground">
                      {item.powerSource || '35-50 HP'}
                    </span>
                  </div>
                  <div className="rounded-lg bg-background/40 p-1.5 border border-border/30">
                    <span className="block text-[10px] uppercase text-muted-foreground">Subsidy</span>
                    <span className="font-bold text-emerald-400">Up to 50%</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-border/40 pt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Estimated Price</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {item.price ? `₹${Number(item.price).toLocaleString('en-IN')}*` : 'Get Best Price'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2">
                <Link
                  href={`/implements/${item.slug || item.id}`}
                  className="flex-1 text-center rounded-xl bg-muted/60 border border-border/60 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all active:scale-95"
                >
                  Specs
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedImplement(item)}
                  className="flex-1 rounded-xl bg-emerald-600/15 border border-emerald-500/30 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                >
                  Get Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEO Section */}
      {seoContent && (
        <div className="rounded-3xl border border-border/40 bg-card/40 p-6 sm:p-8 backdrop-blur-md">
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {seoContent}
          </div>
        </div>
      )}

      {/* Get Quote Modal */}
      {selectedImplement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedImplement(null)} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg font-black text-foreground">Get Best Price &amp; Subsidy Details</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedImplement.brand?.name} {selectedImplement.modelName}
            </p>

            {submitted ? (
              <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 size={48} className="text-emerald-400 mb-2 animate-bounce" />
                <h4 className="text-base font-bold text-foreground">Inquiry Received!</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Our certified agricultural equipment specialist will call you with dealer quotes and SMAM subsidy availability.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Your Name</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    value={buyerMobile}
                    onChange={(e) => setBuyerMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedImplement(null)}
                    className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImplementCategoryClient;
