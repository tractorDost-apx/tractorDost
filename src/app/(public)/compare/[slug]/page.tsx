'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Flame, Tractor as TractorIcon } from 'lucide-react';
import { compareAPI } from '@/lib/api/compare';
import { tractorAPI, Tractor } from '@/lib/api/tractors';
import CompareTable from '@/components/compare/compare-table';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function CompareSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const slug = resolvedParams.slug;

  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveComparison() {
      try {
        setLoading(true);
        setError(null);

        // Check if slug contains "-vs-"
        if (slug.includes('-vs-')) {
          const [slug1, slug2] = slug.split('-vs-');

          // Search or fetch by slugs
          const [res1, res2] = await Promise.all([
            tractorAPI.getAllTractors({ search: slug1.replace(/-/g, ' '), limit: 1 }),
            tractorAPI.getAllTractors({ search: slug2.replace(/-/g, ' '), limit: 1 }),
          ]);

          const list1 = (res1.data as any)?.tractors || (res1.data as any)?.data || [];
          const list2 = (res2.data as any)?.tractors || (res2.data as any)?.data || [];

          if (list1.length > 0 && list2.length > 0) {
            const id1 = list1[0].id;
            const id2 = list2[0].id;
            const compRes = await compareAPI.compareTractors([id1, id2]);
            if (compRes.success && compRes.data.length >= 2) {
              setTractors(compRes.data);
              return;
            }
          }
        }

        // Fallback: check top 2 tractors
        const topRes = await tractorAPI.getAllTractors({ limit: 2 });
        const topList = (topRes.data as any)?.tractors || (topRes.data as any)?.data || [];
        if (topList.length >= 2) {
          const compRes = await compareAPI.compareTractors([topList[0].id, topList[1].id]);
          if (compRes.success) {
            setTractors(compRes.data);
            return;
          }
        }

        setError('Unable to load specific comparison. Please select models from the comparison tool.');
      } catch (err: any) {
        console.error('Failed to load comparison slug:', err);
        setError('Comparison could not be completed at this time.');
      } finally {
        setLoading(false);
      }
    }

    resolveComparison();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <TractorLoader className="text-[var(--color-brand-green)]" size={64} />
        <h2 className="text-muted text-sm font-black tracking-widest uppercase">
          Comparing Tractor Specifications...
        </h2>
      </div>
    );
  }

  if (error || tractors.length < 2) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-foreground mb-3">Comparison Not Available</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {error || 'Select two or more models to see side-by-side technical specifications.'}
        </p>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-xs font-black uppercase text-white shadow-lg"
        >
          <ArrowLeft size={16} /> Open Compare Selector
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back to All Comparisons
        </Link>
        <span className="rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-[11px] font-black text-[var(--color-brand-green)] uppercase">
          Head-to-Head Comparison
        </span>
      </div>

      <CompareTable
        tractors={tractors}
        onAddMore={() => router.push('/compare')}
      />
    </div>
  );
}
