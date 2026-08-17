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
          const promises = initialIds.map(id => tractorAPI.getTractorById(id));
          const results = await Promise.all(promises);
          setSelectedTractors(results.filter(r => r.success).map(r => r.data));
        } catch (error) {
          console.error("Failed to fetch initial tractors", error);
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
          console.error("Search failed", error);
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
    if (selectedTractors.length < 4 && !selectedTractors.find(t => t.id === tractor.id)) {
      setSelectedTractors([...selectedTractors, tractor]);
      setSearch('');
      setIsOpen(false);
    }
  };

  const removeTractor = (id: number) => {
    setSelectedTractors(selectedTractors.filter(t => t.id !== id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 p-6 glass-panel rounded-3xl relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] h-[150px] w-[150px] rounded-full bg-[var(--color-brand-green)]/10 blur-[60px] pointer-events-none" />
      
      <div className="text-center space-y-2 relative z-10">
        <h2 className="text-3xl font-black text-foreground">Compare Tractors</h2>
        <p className="text-muted font-medium">Select up to 4 tractors to compare their specifications side-by-side.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {[0, 1, 2, 3].map((index) => {
          const tractor = selectedTractors[index];
          
          return (
            <div key={index} className="flex flex-col gap-4">
              {tractor ? (
                <div className="bg-foreground/5 border border-[var(--color-brand-green)]/30 rounded-2xl p-4 flex flex-col items-center text-center gap-3 relative group transition-all hover:shadow-lg hover:shadow-[var(--color-brand-green)]/10">
                  <button 
                    onClick={() => removeTractor(tractor.id)}
                    className="absolute top-3 right-3 p-1.5 bg-background text-muted hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                  <div className="w-24 h-24 bg-background rounded-full p-2 flex items-center justify-center border-2 border-transparent group-hover:border-[var(--color-brand-green)] transition-all">
                    {tractor.primaryMedia?.url ? (
                      <img src={tractor.primaryMedia.url} alt={tractor.modelName} className="w-full h-full object-contain" />
                    ) : (
                      <TractorIcon size={32} className="text-muted/50" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-orange)]">{tractor.brand?.name}</div>
                    <div className="text-sm font-black text-foreground leading-tight mt-0.5">{tractor.modelName}</div>
                  </div>
                </div>
              ) : (
                <div 
                  className={`border-2 border-dashed rounded-2xl h-full min-h-[180px] flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                    (index === 0 || selectedTractors.length === index) 
                      ? 'border-[var(--color-brand-green)]/50 bg-[var(--color-brand-green)]/5 hover:bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' 
                      : 'border-foreground/10 bg-foreground/5 text-muted hover:bg-foreground/10 opacity-50'
                  }`}
                  onClick={() => {
                    if (index === 0 || selectedTractors.length === index) setIsOpen(true);
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm">
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
        <div className="absolute inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col items-center p-8 animate-fade-in">
          <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors">
            <X size={20} />
          </button>
          
          <h3 className="text-2xl font-black mb-8">Search for a Tractor</h3>
          
          <div className="w-full max-w-lg relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--color-brand-green)]">
              <Search size={20} />
            </div>
            <input 
              autoFocus
              type="text" 
              placeholder="e.g. Mahindra 575 DI"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-background border-2 border-[var(--color-brand-green)]/50 focus:border-[var(--color-brand-green)] rounded-2xl text-lg font-bold shadow-[0_0_20px_rgba(var(--color-brand-green-rgb),0.1)] outline-none"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-4 flex items-center text-[var(--color-brand-green)]">
                <TractorLoader size={20} />
              </div>
            )}
          </div>

          <div className="w-full max-w-lg mt-4 flex flex-col gap-2 max-h-[40vh] overflow-y-auto hidden-scrollbar">
            {searchResults.map(t => (
              <div 
                key={t.id} 
                onClick={() => addTractor(t)}
                className="flex items-center gap-4 p-4 bg-foreground/5 hover:bg-[var(--color-brand-green)]/10 rounded-xl cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 bg-background rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                  {t.primaryMedia?.url ? (
                    <img src={t.primaryMedia.url} alt={t.modelName} className="w-full h-full object-contain" />
                  ) : (
                    <TractorIcon size={20} className="text-muted/50" />
                  )}
                </div>
                <div className="flex flex-col flex-1 text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-orange)]">{t.brand?.name}</span>
                  <span className="text-sm font-black text-foreground leading-tight">{t.modelName}</span>
                </div>
                <Plus size={18} className="text-muted" />
              </div>
            ))}
            {search.length > 1 && searchResults.length === 0 && !isSearching && (
              <div className="p-8 text-center text-muted font-bold">No tractors found matching "{search}"</div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-4 relative z-10">
        <button
          disabled={selectedTractors.length < 2}
          onClick={() => onCompare(selectedTractors.map(t => t.id))}
          className="spatial-button px-8 py-3 rounded-full font-black uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ArrowRightLeft size={18} />
          Compare Now
        </button>
      </div>
    </div>
  );
}
