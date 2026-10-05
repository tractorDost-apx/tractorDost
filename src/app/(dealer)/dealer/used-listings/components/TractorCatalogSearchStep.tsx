'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { brandAPI } from '@/lib/api/brands';
import { tractorAPI, type Tractor } from '@/lib/api/tractors';

interface TractorCatalogSearchStepProps {
  onSelect: (tractor: Tractor) => void;
}

export function TractorCatalogSearchStep({ onSelect }: TractorCatalogSearchStepProps) {
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Brands state
  const [brands, setBrands] = useState<any[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandsError, setBrandsError] = useState<string | null>(null);

  // Tractors state
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [tractorsLoading, setTractorsLoading] = useState(false);
  const [tractorsError, setTractorsError] = useState<string | null>(null);

  // Fetch brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        setBrandsError(null);
        const data = await brandAPI.getAllBrands({ limit: 100 });
        setBrands(data?.data?.data || []);
      } catch (error: any) {
        console.error('Failed to fetch brands:', error);
        setBrandsError('Failed to load brands');
      } finally {
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Fetch tractors when brand is selected
  useEffect(() => {
    if (!selectedBrand) {
      setTractors([]);
      return;
    }

    const fetchTractors = async () => {
      try {
        setTractorsLoading(true);
        setTractorsError(null);
        const data = await tractorAPI.getAllTractors({
          brandId: selectedBrand,
          search: searchQuery || undefined,
          limit: 50,
        });
        setTractors((data?.data?.data || data?.data?.tractors || []) as Tractor[]);
      } catch (error: any) {
        console.error('Failed to fetch tractors:', error);
        setTractorsError('Failed to load models');
      } finally {
        setTractorsLoading(false);
      }
    };

    fetchTractors();
  }, [selectedBrand, searchQuery]);

  return (
    <div className="h-full flex flex-col">
      {/* Brand Selection */}
      <div className="border-b border-[var(--border-subtle)] p-6">
        <label className="block text-xs font-bold text-foreground mb-3 uppercase tracking-wide">
          1. Select Brand
        </label>
        {brandsLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={20} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => {
                  setSelectedBrand(brand.id);
                  setSearchQuery('');
                }}
                className={`rounded-xl p-3 text-xs font-bold transition-all text-center ${
                  selectedBrand === brand.id
                    ? 'bg-[var(--color-brand-green)] text-white shadow-md shadow-[var(--color-brand-green)]/20'
                    : 'border border-[var(--border-subtle)] bg-foreground/5 text-foreground hover:border-[var(--color-brand-green)]/30'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Model Search & Selection */}
      {selectedBrand && (
        <div className="flex-1 flex flex-col p-6 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-2 uppercase tracking-wide">
              2. Search & Select Model
            </label>
            <div className="relative">
              <Search size={16} className="absolute top-3.5 left-3.5 text-muted" />
              <input
                type="text"
                placeholder="Search model name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] py-2.5 pr-4 pl-10 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>
          </div>

          {/* Models List */}
          {tractorsLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={24} />
            </div>
          ) : tractorsError ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <AlertCircle size={24} className="text-rose-500 mx-auto" />
                <p className="text-xs font-medium text-muted">Failed to load models</p>
              </div>
            </div>
          ) : tractors.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-xs font-medium text-muted">No models found</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {tractors.map((tractor) => (
                <button
                  key={tractor.id}
                  onClick={() => onSelect(tractor)}
                  className="w-full text-left rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 transition-all hover:border-[var(--color-brand-green)] hover:bg-foreground/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">{tractor.modelName}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {tractor.hp && (
                          <span className="inline-block rounded px-2 py-0.5 bg-[var(--color-brand-green)]/10 text-[10px] font-semibold text-[var(--color-brand-green)]">
                            {tractor.hp} HP
                          </span>
                        )}
                        {tractor.fuelType && (
                          <span className="inline-block rounded px-2 py-0.5 bg-blue-500/10 text-[10px] font-semibold text-blue-500">
                            {tractor.fuelType}
                          </span>
                        )}
                        {tractor.spec?.engineCc && (
                          <span className="inline-block rounded px-2 py-0.5 bg-purple-500/10 text-[10px] font-semibold text-purple-500">
                            {tractor.spec.engineCc} cc
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
