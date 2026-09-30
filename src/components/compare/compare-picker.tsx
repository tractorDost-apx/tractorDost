'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Tractor as TractorIcon, ArrowRightLeft } from 'lucide-react';
import { tractorAPI, Tractor } from '@/lib/api/tractors';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface ComparePickerProps {
  onCompare: (tractorIds: number[]) => void;
  initialIds?: number[];
}

export default function ComparePicker({ onCompare, initialIds = [] }: ComparePickerProps) {
  const [selectedTractors, setSelectedTractors] = useState<Tractor[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Tractor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch initial tractors if any
  useEffect(() => {
    const fetchInitial = async () => {
      if (initialIds.length > 0) {
        try {
          const promises = initialIds.map((id) => tractorAPI.getTractorById(id));
          const results = await Promise.all(promises);
          setSelectedTractors(results.filter((r) => r.success).map((r) => r.data));
        } catch (error) {
          console.error('Failed to fetch initial tractors', error);
        }
      }
    };
    fetchInitial();
  }, [initialIds]);

  // Handle Search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (search.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await tractorAPI.getAllTractors({ search, limit: 5 });
          if (res.success) {
            // The backend returns the array inside either res.data.tractors or res.data.data
            const resultsArray = (res.data as any).tractors || res.data.data || [];
            setSearchResults(resultsArray);
          }
        } catch (error) {
          console.error('Search failed', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const addTractor = (tractor: Tractor) => {
    if (selectedTractors.length < 4 && !selectedTractors.find((t) => t.id === tractor.id)) {
      setSelectedTractors([...selectedTractors, tractor]);
      setSearch('');
      setIsOpen(false);
    }
  };

  const removeTractor = (id: number) => {
    setSelectedTractors(selectedTractors.filter((t) => t.id !== id));
  };

  return (
    <div className="glass-panel relative mx-auto flex w-full max-w-5xl flex-col gap-8 overflow-hidden rounded-3xl p-6">
      <div className="pointer-events-none absolute top-[-20%] right-[-10%] h-[150px] w-[150px] rounded-full bg-[var(--color-brand-green)]/10 blur-[60px]" />

      <div className="relative z-10 space-y-2 text-center">
        <h2 className="text-foreground text-3xl font-black">Compare Tractors</h2>
        <p className="text-muted font-medium">
          Select up to 4 tractors to compare their specifications side-by-side.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => {
          const tractor = selectedTractors[index];

          return (
            <div key={index} className="flex flex-col gap-4">
              {tractor ? (
                <div className="bg-foreground/5 group relative flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-brand-green)]/30 p-4 text-center transition-all hover:shadow-[var(--color-brand-green)]/10 hover:shadow-lg">
                  <button
                    onClick={() => removeTractor(tractor.id)}
                    className="bg-background text-muted absolute top-3 right-3 rounded-full p-1.5 opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                  <div className="bg-background flex h-24 w-24 items-center justify-center rounded-full border-2 border-transparent p-2 transition-all group-hover:border-[var(--color-brand-green)]">
                    {tractor.primaryMedia?.url ? (
                      <img
                        src={tractor.primaryMedia.url}
                        alt={tractor.modelName}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <TractorIcon size={32} className="text-muted/50" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-black tracking-wider text-[var(--color-brand-orange)] uppercase">
                      {tractor.brand?.name}
                    </div>
                    <div className="text-foreground mt-0.5 text-sm leading-tight font-black">
                      {tractor.modelName}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`flex h-full min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all ${
                    index === 0 || selectedTractors.length === index
                      ? 'border-[var(--color-brand-green)]/50 bg-[var(--color-brand-green)]/5 text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/10'
                      : 'border-foreground/10 bg-foreground/5 text-muted hover:bg-foreground/10 opacity-50'
                  }`}
                  onClick={() => {
                    if (index === 0 || selectedTractors.length === index) setIsOpen(true);
                  }}
                >
                  <div className="bg-background flex h-12 w-12 items-center justify-center rounded-full shadow-sm">
                    <Plus size={20} />
                  </div>
                  <span className="text-sm font-bold">Add Tractor</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isOpen && (
        <div className="bg-background/95 animate-fade-in absolute inset-0 z-50 flex flex-col items-center p-8 backdrop-blur-md">
          <button
            onClick={() => setIsOpen(false)}
            className="bg-foreground/5 hover:bg-foreground/10 absolute top-6 right-6 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>

          <h3 className="mb-8 text-2xl font-black">Search for a Tractor</h3>

          <div className="relative w-full max-w-lg">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--color-brand-green)]">
              <Search size={20} />
            </div>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Mahindra 575 DI"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background h-14 w-full rounded-2xl border-2 border-[var(--color-brand-green)]/50 pr-4 pl-12 text-lg font-bold shadow-[0_0_20px_rgba(var(--color-brand-green-rgb),0.1)] outline-none focus:border-[var(--color-brand-green)]"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-4 flex items-center text-[var(--color-brand-green)]">
                <TractorLoader size={20} />
              </div>
            )}
          </div>

          <div className="hidden-scrollbar mt-4 flex max-h-[40vh] w-full max-w-lg flex-col gap-2 overflow-y-auto">
            {searchResults.map((t) => (
              <div
                key={t.id}
                onClick={() => addTractor(t)}
                className="bg-foreground/5 flex cursor-pointer items-center gap-4 rounded-xl p-4 transition-colors hover:bg-[var(--color-brand-green)]/10"
              >
                <div className="bg-background flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg p-1">
                  {t.primaryMedia?.url ? (
                    <img
                      src={t.primaryMedia.url}
                      alt={t.modelName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <TractorIcon size={20} className="text-muted/50" />
                  )}
                </div>
                <div className="flex flex-1 flex-col text-left">
                  <span className="text-[10px] font-black tracking-wider text-[var(--color-brand-orange)] uppercase">
                    {t.brand?.name}
                  </span>
                  <span className="text-foreground text-sm leading-tight font-black">
                    {t.modelName}
                  </span>
                </div>
                <Plus size={18} className="text-muted" />
              </div>
            ))}
            {search.length > 1 && searchResults.length === 0 && !isSearching && (
              <div className="text-muted p-8 text-center font-bold">
                No tractors found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 mt-4 flex justify-center">
        <button
          disabled={selectedTractors.length < 2}
          onClick={() => onCompare(selectedTractors.map((t) => t.id))}
          className="spatial-button flex items-center gap-2 rounded-full px-8 py-3 font-black tracking-wider uppercase disabled:pointer-events-none disabled:opacity-50"
        >
          <ArrowRightLeft size={18} />
          Compare Now
        </button>
      </div>
    </div>
  );
}
