'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
  subLabel?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number | null;
  onChange: (val: any) => void;
  placeholder?: string;
  searchable?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.subLabel?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full min-w-[280px]" ref={dropdownRef}>
      <div
        className={`bg-background flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border px-4 transition-all ${isOpen ? 'border-[var(--color-brand-green)] ring-2 ring-[var(--color-brand-green)]/20' : 'border-[var(--border-subtle)] hover:border-[var(--color-brand-green)]/50'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate font-bold ${selectedOption ? 'text-foreground' : 'text-muted'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-brand-green)]' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="bg-background animate-fade-in-up absolute z-50 mt-2 w-full origin-top overflow-hidden rounded-xl border border-[var(--border-subtle)] shadow-2xl">
          {searchable && (
            <div className="bg-foreground/5 border-b border-[var(--border-subtle)] p-3">
              <div className="relative">
                <Search size={16} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-background h-10 w-full rounded-lg border border-[var(--border-subtle)] pr-4 pl-9 text-sm font-bold outline-none focus:border-[var(--color-brand-green)]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          <div className="hidden-scrollbar max-h-[300px] overflow-y-auto py-2">
            {filteredOptions.length === 0 ? (
              <div className="text-muted p-4 text-center text-sm font-bold">No results found.</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex cursor-pointer items-center justify-between px-4 py-3 transition-colors ${value === option.value ? 'bg-[var(--color-brand-green)]/10' : 'hover:bg-foreground/5'}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <div className="flex flex-col">
                    <span
                      className={`font-bold ${value === option.value ? 'text-[var(--color-brand-green)]' : 'text-foreground'}`}
                    >
                      {option.label}
                    </span>
                    {option.subLabel && (
                      <span className="text-muted text-xs font-medium">{option.subLabel}</span>
                    )}
                  </div>
                  {value === option.value && (
                    <Check size={18} className="text-[var(--color-brand-green)]" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
