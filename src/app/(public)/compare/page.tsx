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
  const { user } = useAuth();
  
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [comparisons, setComparisons] = useState<CompareFrequencyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ids = idsParam 
    ? idsParam.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id)) 
    : [];

  useEffect(() => {
    const fetchComparison = async () => {
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
          setError(err.response?.data?.message || 'An error occurred while comparing tractors.');
        } finally {
          setLoading(false);
        }
      } else {
        setTractors([]);
      }
    };
    
    fetchComparison();
  }, [idsParam, user]);

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

  if (loading) {
    return (
      <div className="flex flex-col min-h-[80vh] items-center justify-center p-6 text-center gap-4 animate-pulse">
        <TractorLoader className="text-[var(--color-brand-green)]" size={64} />
        <h2 className="text-xl font-black uppercase tracking-widest text-muted">Analyzing Tractors...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-[80vh] items-center justify-center p-6 text-center gap-4">
        <div className="p-8 bg-red-500/10 border-2 border-red-500/50 rounded-3xl max-w-lg">
          <h2 className="text-xl font-black text-red-500 mb-2">Comparison Failed</h2>
          <p className="text-sm font-medium text-red-400/80 mb-6">{error}</p>
          <button onClick={handleClear} className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold uppercase tracking-wider">Start Over</button>
        </div>
      </div>
    );
  }

  const maxFreq = comparisons.length > 0 ? Math.max(...comparisons.map(c => c.frequency)) : 1;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {tractors.length >= 2 ? (
        <div className="space-y-6">
          <button onClick={handleClear} className="flex items-center gap-2 text-muted hover:text-foreground transition-colors font-bold text-sm">
            <ArrowLeft size={16} /> Back to Selection
          </button>
          <CompareTable tractors={tractors} onAddMore={() => router.push(`/compare?ids=${ids.join(',')},`)} />
        </div>
      ) : (
        <div className="space-y-16">
          <ComparePicker onCompare={handleCompare} initialIds={ids} />
          
          {comparisons.length > 0 && (
            <section className="flex flex-col gap-8 bg-gradient-to-br from-foreground/5 to-transparent p-8 md:p-12 rounded-[3rem] border border-[var(--border-subtle)] relative overflow-hidden max-w-4xl mx-auto w-full">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--color-brand-orange)]/5 rounded-full blur-[60px] -z-10 translate-x-1/2 -translate-y-1/2" />
              
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                  <Flame size={24} className="text-red-500 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Popular Comparisons</h2>
                  <p className="text-muted text-sm font-bold">Trending side-by-side reviews among other farmers.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
                {comparisons.map((comp, idx) => {
                  const hotness = (comp.frequency / maxFreq) * 100;
                  return (
                    <Link key={idx} href={`/compare?ids=${comp.tractorLeft?.id},${comp.tractorRight?.id}`} className="bg-background rounded-3xl p-6 shadow-sm hover:shadow-xl border border-[var(--border-subtle)] hover:border-[var(--color-brand-orange)]/50 transition-all flex flex-col gap-4 group cursor-pointer">
                      
                      <div className="flex items-center justify-between">
                        {/* Left Tractor */}
                        <div className="flex flex-col items-center text-center w-5/12">
                           <div className="w-14 h-14 rounded-full bg-foreground/5 p-1.5 mb-2 flex items-center justify-center overflow-hidden border border-transparent group-hover:border-[var(--border-subtle)] transition-colors">
                              {comp.tractorLeft?.primaryMedia?.url ? (
                                <img src={comp.tractorLeft.primaryMedia.url} alt="L" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                              ) : (
                                <TractorIcon size={16} className="text-muted/50" />
                              )}
                           </div>
                           <span className="text-[9px] font-black text-[var(--color-brand-green)] uppercase truncate w-full">{comp.tractorLeft?.brand?.name}</span>
                           <span className="text-xs font-black text-foreground leading-tight truncate w-full">{comp.tractorLeft?.modelName}</span>
                        </div>

                        {/* VS Icon */}
                        <div className="flex flex-col items-center justify-center w-2/12 relative">
                          <div className="w-8 h-8 rounded-full bg-background border border-[var(--border-subtle)] flex items-center justify-center z-10 text-[var(--color-brand-orange)] font-black text-[10px] italic">
                            VS
                          </div>
                          <div className="h-[1px] w-full bg-foreground/10 absolute z-0" />
                        </div>

                        {/* Right Tractor */}
                        <div className="flex flex-col items-center text-center w-5/12">
                           <div className="w-14 h-14 rounded-full bg-foreground/5 p-1.5 mb-2 flex items-center justify-center overflow-hidden border border-transparent group-hover:border-[var(--border-subtle)] transition-colors">
                              {comp.tractorRight?.primaryMedia?.url ? (
                                <img src={comp.tractorRight.primaryMedia.url} alt="R" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                              ) : (
                                <TractorIcon size={16} className="text-muted/50" />
                              )}
                           </div>
                           <span className="text-[9px] font-black text-[var(--color-brand-green)] uppercase truncate w-full">{comp.tractorRight?.brand?.name}</span>
                           <span className="text-xs font-black text-foreground leading-tight truncate w-full">{comp.tractorRight?.modelName}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-1">
                        <div className="flex justify-between text-[9px] font-black uppercase text-muted tracking-widest">
                          <span>Popularity Match</span>
                          <span>{Math.max(20, Math.round(hotness))}%</span>
                        </div>
                        <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[var(--color-brand-green)] to-[var(--color-brand-orange)] rounded-full transition-all duration-1000" style={{ width: `${Math.max(20, hotness)}%` }} />
                        </div>
                      </div>
                    </Link>
                  )
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
    <div className="min-h-screen bg-background">
      {/* Decorative background element */}
      <div className="fixed top-0 inset-x-0 h-[50vh] bg-gradient-to-b from-[var(--color-brand-green)]/5 to-transparent pointer-events-none -z-10" />
      
      <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><TractorLoader size={48} className="text-muted" /></div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
