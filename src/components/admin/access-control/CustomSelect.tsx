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

export default function CustomSelect({ options, value, onChange, placeholder = 'Select an option', searchable = false }: CustomSelectProps) {
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

  const selectedOption = options.find(o => o.value === value);
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()) || o.subLabel?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full min-w-[280px]" ref={dropdownRef}>
      <div 
        className={`flex items-center justify-between w-full h-12 px-4 bg-background border rounded-xl cursor-pointer transition-all ${isOpen ? 'border-[var(--color-brand-green)] ring-2 ring-[var(--color-brand-green)]/20' : 'border-[var(--border-subtle)] hover:border-[var(--color-brand-green)]/50'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`font-bold truncate ${selectedOption ? 'text-foreground' : 'text-muted'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-brand-green)]' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden animate-fade-in-up origin-top">
          {searchable && (
            <div className="p-3 border-b border-[var(--border-subtle)] bg-foreground/5">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..." 
                  className="w-full h-10 pl-9 pr-4 bg-background border border-[var(--border-subtle)] rounded-lg text-sm font-bold focus:border-[var(--color-brand-green)] outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <div className="max-h-[300px] overflow-y-auto hidden-scrollbar py-2">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm font-bold text-muted">No results found.</div>
            ) : (
              filteredOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${value === option.value ? 'bg-[var(--color-brand-green)]/10' : 'hover:bg-foreground/5'}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <div className="flex flex-col">
                    <span className={`font-bold ${value === option.value ? 'text-[var(--color-brand-green)]' : 'text-foreground'}`}>{option.label}</span>
                    {option.subLabel && <span className="text-xs font-medium text-muted">{option.subLabel}</span>}
                  </div>
                  {value === option.value && <Check size={18} className="text-[var(--color-brand-green)]" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
