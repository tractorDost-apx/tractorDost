'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import TractorForm from '../components/TractorForm';
import { tractorAPI, Tractor } from '@/lib/api/tractors';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function EditTractorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id ? parseInt(params.id as string) : null;
  const initialTab = searchParams?.get('tab') || 'basic';
  
  const [tractor, setTractor] = useState<Tractor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTractor();
    }
  }, [id]);

  const fetchTractor = async () => {
    setLoading(true);
    try {
      const response = await tractorAPI.getTractorById(id!);
      if (response.success) {
        setTractor(response.data);
      }
    } catch (error) {
      console.error('Failed to load tractor details', error);
      alert('Failed to load tractor details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 text-muted">
        <TractorLoader size={48} className="text-[var(--color-brand-green)]" />
        <p className="font-bold mt-2">Loading Tractor Details...</p>
      </div>
    );
  }

  if (!tractor) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 text-red-500">
        <h2 className="text-2xl font-black">Tractor Not Found</h2>
        <p className="font-bold text-muted">The requested tractor does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Edit Tractor</h1>
        <p className="text-sm font-bold text-muted">Update catalog information for {tractor.modelName}.</p>
      </div>

      <TractorForm isEdit={true} initialData={tractor} initialTab={initialTab} />
    </div>
  );
}
