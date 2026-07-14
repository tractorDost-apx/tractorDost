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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-foreground/10 overflow-hidden"
        style={{ background: 'var(--background)' }}
      >
        <div className="px-6 py-5 border-b border-foreground/10 flex justify-between items-center bg-background shrink-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <TractorIcon className="text-[var(--color-brand-green)]" />
              {brand.name} Models
            </h2>
            <p className="text-sm font-bold text-muted mt-1">
              Showing all tractors associated with {brand.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 flex-1 bg-foreground/[0.02]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted gap-3">
              <TractorLoader className="text-[var(--color-brand-green)]" size={48} />
              <span className="font-bold">Loading models...</span>
            </div>
          ) : tractors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted gap-2 text-center">
              <TractorIcon size={48} className="opacity-20 mb-2" />
              <p className="font-bold text-lg text-foreground/70">No Models Found</p>
              <p className="text-sm font-medium">There are currently no tractors mapped to this brand.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tractors.map((tractor) => {
                const primaryImage = tractor.media?.find(m => m.isPrimary) || tractor.media?.[0];
                return (
                  <Link
                    key={tractor.id}
                    href={`/admin/tractors/${tractor.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)]/50 hover:shadow-md transition-all group"
                  >
                    <div className="h-16 w-16 rounded-xl bg-foreground/5 flex items-center justify-center overflow-hidden p-1 shrink-0">
                      {primaryImage ? (
                        <img src={primaryImage.url} alt={tractor.modelName} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                      ) : (
                        <TractorIcon size={24} className="text-muted" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-foreground truncate">{tractor.modelName}</span>
                      <span className="text-xs font-bold text-muted truncate">{tractor.hp ? `${tractor.hp} HP` : 'HP N/A'} • {tractor.driveType.replace('_', ' ')}</span>
                      <span className={`inline-flex items-center w-fit mt-1 px-1.5 py-0.5 rounded text-[10px] font-black tracking-wide uppercase ${tractor.isActive ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-red-500/10 text-red-500'}`}>
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
