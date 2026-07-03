'use client';

import React, { useState, useEffect, use } from 'react';
import ImplementForm from '../components/ImplementForm';
import { implementAPI, Implement } from '@/lib/api/implements';
import { Loader2 } from 'lucide-react';

export default function EditImplementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [implement, setImplement] = useState<Implement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImplement = async () => {
      try {
        const id = Number(resolvedParams.id);
        const res = await implementAPI.getImplementById(id);
        if (res.success) {
          setImplement(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch implement', error);
      } finally {
        setLoading(false);
      }
    };
    fetchImplement();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-muted">
          <Loader2 size={32} className="animate-spin text-[var(--color-brand-green)]" />
          <p className="text-sm font-bold animate-pulse">Loading implement details...</p>
        </div>
      </div>
    );
  }

  if (!implement) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-black text-foreground mb-2">Implement Not Found</h2>
          <p className="text-sm text-muted">The implement you're trying to edit doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <ImplementForm initialData={implement} isEditing={true} />;
}
