'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { compareAPI, CompareFrequencyRecord } from '@/lib/api/compare';
import { Tractor } from '@/lib/api/tractors';
import ComparePicker from '@/components/compare/compare-picker';
import CompareTable from '@/components/compare/compare-table';
import { ArrowLeft, Flame, Tractor as TractorIcon } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import { useAuth } from '@/store/AuthContext';
import Link from 'next/link';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idsParam = searchParams.get('ids');
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [comparisons, setComparisons] = useState<CompareFrequencyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const currentUrl =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/compare';
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [authLoading, isAuthenticated, router]);

  const ids = idsParam
    ? idsParam
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id))
    : [];

  useEffect(() => {
    const fetchComparison = async () => {
      if (!isAuthenticated) return;

      if (ids.length >= 2) {
        setLoading(true);
        setError(null);
        try {
          const res = await compareAPI.compareTractors(ids);
          if (res.success) {
            setTractors(res.data);
          } else {
            setError('Failed to fetch tractor comparison data.');
          }
        } catch (err: any) {
          if (err.response?.status === 401) {
            const currentUrl =
              typeof window !== 'undefined'
                ? window.location.pathname + window.location.search
                : '/compare';
            router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
            return;
          }
          setError(err.response?.data?.message || 'An error occurred while comparing tractors.');
        } finally {
          setLoading(false);
        }
      } else {
        setTractors([]);
      }
    };

    if (isAuthenticated) {
      fetchComparison();
    }
  }, [idsParam, user, isAuthenticated]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await compareAPI.getFrequencyOfCompare({ limit: 3, sort: 'desc' });
        if (res.success) {
          setComparisons(res.data.records);
        }
      } catch (err) {
        console.error('Failed to fetch trending comparisons:', err);
      }
    };
    if (ids.length < 2) {
      fetchTrending();
    }
  }, [idsParam]);

  const handleCompare = (selectedIds: number[]) => {
    router.push(`/compare?ids=${selectedIds.join(',')}`);
  };

  const handleClear = () => {
    router.push('/compare');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <TractorLoader className="text-[var(--color-brand-green)]" size={64} />
        <h2 className="text-muted text-sm font-black tracking-widest uppercase">
          Verifying access...
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] animate-pulse flex-col items-center justify-center gap-4 p-6 text-center">
        <TractorLoader className="text-[var(--color-brand-green)]" size={64} />
        <h2 className="text-muted text-xl font-black tracking-widest uppercase">
          Analyzing Tractors...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="max-w-lg rounded-3xl border-2 border-red-500/50 bg-red-500/10 p-8">
          <h2 className="mb-2 text-xl font-black text-red-500">Comparison Failed</h2>
          <p className="mb-6 text-sm font-medium text-red-400/80">{error}</p>
          <button
            onClick={handleClear}
            className="rounded-xl bg-red-500 px-6 py-2 font-bold tracking-wider text-white uppercase"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const maxFreq = comparisons.length > 0 ? Math.max(...comparisons.map((c) => c.frequency)) : 1;

  return (
    <div className="animate-fade-in mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      {tractors.length >= 2 ? (
        <div className="space-y-6">
          <button
            onClick={handleClear}
            className="text-muted hover:text-foreground flex items-center gap-2 text-sm font-bold transition-colors"
          >
            <ArrowLeft size={16} /> Back to Selection
          </button>
          <CompareTable
            tractors={tractors}
            onAddMore={() => router.push(`/compare?ids=${ids.join(',')},`)}
          />
        </div>
      ) : (
        <div className="space-y-16">
          <ComparePicker onCompare={handleCompare} initialIds={ids} />

          {comparisons.length > 0 && (
            <section className="from-foreground/5 relative mx-auto flex w-full max-w-4xl flex-col gap-8 overflow-hidden rounded-[3rem] border border-[var(--border-subtle)] bg-gradient-to-br to-transparent p-8 md:p-12">
              <div className="absolute top-0 right-0 -z-10 h-[300px] w-[300px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-orange)]/5 blur-[60px]" />

              <div className="mb-2 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                  <Flame size={24} className="animate-pulse text-red-500" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-foreground text-2xl font-black tracking-tight uppercase">
                    Popular Comparisons
                  </h2>
                  <p className="text-muted text-sm font-bold">
                    Trending side-by-side reviews among other farmers.
                  </p>
                </div>
              </div>

              <div className="z-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                {comparisons.map((comp, idx) => {
                  const hotness = (comp.frequency / maxFreq) * 100;
                  return (
                    <Link
                      key={idx}
                      href={`/compare?ids=${comp.tractorLeft?.id},${comp.tractorRight?.id}`}
                      className="bg-background group flex cursor-pointer flex-col gap-4 rounded-3xl border border-[var(--border-subtle)] p-6 shadow-sm transition-all hover:border-[var(--color-brand-orange)]/50 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        {/* Left Tractor */}
                        <div className="flex w-5/12 flex-col items-center text-center">
                          <div className="bg-foreground/5 mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-transparent p-1.5 transition-colors group-hover:border-[var(--border-subtle)]">
                            {comp.tractorLeft?.primaryMedia?.url ? (
                              <img
                                src={comp.tractorLeft.primaryMedia.url}
                                alt="L"
                                className="h-full w-full object-contain transition-transform group-hover:scale-110"
                              />
                            ) : (
                              <TractorIcon size={16} className="text-muted/50" />
                            )}
                          </div>
                          <span className="w-full truncate text-[9px] font-black text-[var(--color-brand-green)] uppercase">
                            {comp.tractorLeft?.brand?.name}
                          </span>
                          <span className="text-foreground w-full truncate text-xs leading-tight font-black">
                            {comp.tractorLeft?.modelName}
                          </span>
                        </div>

                        {/* VS Icon */}
                        <div className="relative flex w-2/12 flex-col items-center justify-center">
                          <div className="bg-background z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[10px] font-black text-[var(--color-brand-orange)] italic">
                            VS
                          </div>
                          <div className="bg-foreground/10 absolute z-0 h-[1px] w-full" />
                        </div>

                        {/* Right Tractor */}
                        <div className="flex w-5/12 flex-col items-center text-center">
                          <div className="bg-foreground/5 mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-transparent p-1.5 transition-colors group-hover:border-[var(--border-subtle)]">
                            {comp.tractorRight?.primaryMedia?.url ? (
                              <img
                                src={comp.tractorRight.primaryMedia.url}
                                alt="R"
                                className="h-full w-full object-contain transition-transform group-hover:scale-110"
                              />
                            ) : (
                              <TractorIcon size={16} className="text-muted/50" />
                            )}
                          </div>
                          <span className="w-full truncate text-[9px] font-black text-[var(--color-brand-green)] uppercase">
                            {comp.tractorRight?.brand?.name}
                          </span>
                          <span className="text-foreground w-full truncate text-xs leading-tight font-black">
                            {comp.tractorRight?.modelName}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-1">
                        <div className="text-muted flex justify-between text-[9px] font-black tracking-widest uppercase">
                          <span>Popularity Match</span>
                          <span>{Math.max(20, Math.round(hotness))}%</span>
                        </div>
                        <div className="bg-foreground/5 h-1 w-full overflow-hidden rounded-full">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-green)] to-[var(--color-brand-orange)] transition-all duration-1000"
                            style={{ width: `${Math.max(20, hotness)}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Decorative background element */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[50vh] bg-gradient-to-b from-[var(--color-brand-green)]/5 to-transparent" />

      <Suspense
        fallback={
          <div className="flex min-h-[80vh] items-center justify-center">
            <TractorLoader size={48} className="text-muted" />
          </div>
        }
      >
        <CompareContent />
      </Suspense>
    </div>
  );
}
