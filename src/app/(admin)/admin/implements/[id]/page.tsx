'use client';

import React, { useState, useEffect, use } from 'react';
import ImplementForm from '../components/ImplementForm';
import { implementAPI, Implement } from '@/lib/api/implements';
import { TractorLoader } from '@/components/ui/TractorLoader';

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
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
        <div className="text-muted flex flex-col items-center gap-4">
          <TractorLoader size={48} className="text-[var(--color-brand-green)]" />
          <p className="animate-pulse text-sm font-bold">Loading implement details...</p>
        </div>
      </div>
    );
  }

  if (!implement) {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-foreground mb-2 text-xl font-black">Implement Not Found</h2>
          <p className="text-muted text-sm">The implement you're trying to edit doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <ImplementForm initialData={implement} isEditing={true} />;
}
