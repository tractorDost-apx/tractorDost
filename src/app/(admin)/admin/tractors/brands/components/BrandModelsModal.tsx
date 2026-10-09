import React, { useState, useEffect } from 'react';
import { X, Tractor as TractorIcon } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import { tractorAPI, Tractor } from '@/lib/api/tractors';
import { Brand } from '@/lib/api/brands';
import Link from 'next/link';

interface BrandModelsModalProps {
  brand: Brand;
  onClose: () => void;
}

export default function BrandModelsModal({ brand, onClose }: BrandModelsModalProps) {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brand.id) {
      fetchTractors();
    }
  }, [brand.id]);

  const fetchTractors = async () => {
    setLoading(true);
    try {
      const response = await tractorAPI.getAllTractors({ brandId: brand.id, limit: 100 });
      if (response.success) {
        const payload = response.data as any;
        setTractors(payload.tractors || payload.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch tractors for brand', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm sm:p-6">
      <div
        className="border-[var(--border-subtle)] flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border shadow-2xl"
        style={{ background: 'var(--background)' }}
      >
        <div className="border-[var(--border-subtle)] bg-background z-10 flex shrink-0 items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-2xl font-black tracking-tight">
              <TractorIcon className="text-[var(--color-brand-green)]" />
              {brand.name} Models
            </h2>
            <p className="text-muted mt-1 text-sm font-bold">
              Showing all tractors associated with {brand.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-foreground/[0.02] flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="text-muted flex flex-col items-center justify-center gap-3 py-12">
              <TractorLoader className="text-[var(--color-brand-green)]" size={48} />
              <span className="font-bold">Loading models...</span>
            </div>
          ) : tractors.length === 0 ? (
            <div className="text-muted flex flex-col items-center justify-center gap-2 py-12 text-center">
              <TractorIcon size={48} className="mb-2 opacity-20" />
              <p className="text-foreground/70 text-lg font-bold">No Models Found</p>
              <p className="text-sm font-medium">
                There are currently no tractors mapped to this brand.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tractors.map((tractor) => {
                const primaryImage = tractor.media?.find((m) => m.isPrimary) || tractor.media?.[0];
                return (
                  <Link
                    key={tractor.id}
                    href={`/admin/tractors/${tractor.id}`}
                    className="bg-background group flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 transition-all hover:border-[var(--color-brand-green)]/50 hover:shadow-md"
                  >
                    <div className="bg-foreground/5 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl p-1">
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={tractor.modelName}
                          className="h-full w-full object-contain transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <TractorIcon size={24} className="text-muted" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-foreground truncate font-black">
                        {tractor.modelName}
                      </span>
                      <span className="text-muted truncate text-xs font-bold">
                        {tractor.hp ? `${tractor.hp} HP` : 'HP N/A'} •{' '}
                        {tractor.driveType.replace('_', ' ')}
                      </span>
                      <span
                        className={`mt-1 inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[10px] font-black tracking-wide uppercase ${tractor.isActive ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-red-500/10 text-red-500'}`}
                      >
                        {tractor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
