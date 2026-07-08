'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { compareAPI } from '@/lib/api/compare';
import { Tractor } from '@/lib/api/tractors';
import ComparePicker from '@/components/compare/compare-picker';
import CompareTable from '@/components/compare/compare-table';
import { Loader2, ArrowLeft } from 'lucide-react';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idsParam = searchParams.get('ids');
  
  const [tractors, setTractors] = useState<Tractor[]>([]);
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
        <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={48} />
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
        <ComparePicker onCompare={handleCompare} initialIds={ids} />
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Decorative background element */}
      <div className="fixed top-0 inset-x-0 h-[50vh] bg-gradient-to-b from-[var(--color-brand-green)]/5 to-transparent pointer-events-none -z-10" />
      
      <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-muted" /></div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
