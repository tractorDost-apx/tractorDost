'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, Info, Sparkles } from 'lucide-react';
import { ImplementFamilySummary } from '@/lib/api/implements';

interface ImplementFamilyPopoverProps {
  family: ImplementFamilySummary;
  brandName?: string;
  brandSlug?: string;
  brandId?: number;
}

export default function ImplementFamilyPopover({
  family,
  brandName,
  brandSlug,
  brandId,
}: ImplementFamilyPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Close on outside click for touch/mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  const exploreUrl = `/implements?family=${family.id}${brandSlug ? `&brand=${brandSlug}` : brandId ? `&brand=${brandId}` : ''}`;

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Family Name Badge Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'border-blue-500 bg-blue-500/20 text-blue-500 shadow-sm shadow-blue-500/10'
            : 'border-blue-500/30 bg-blue-500/10 text-blue-500 hover:border-blue-500/60 hover:bg-blue-500/15'
        }`}
      >
        <Layers size={12} className="text-blue-500 transition-transform group-hover:scale-110" />
        <span>{family.name}</span>
      </button>

      {/* Popover Card */}
      <div
        className={`absolute top-full left-0 z-50 mt-2 w-72 sm:w-80 rounded-2xl border border-[var(--border-subtle)] bg-background/95 p-4 shadow-xl backdrop-blur-xl transition-all duration-200 ease-out origin-top-left ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
        }`}
        role="tooltip"
      >
        {/* Subtle accent top border */}
        <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-blue-500/60 via-blue-400/80 to-transparent rounded-full" />

        <div className="flex flex-col gap-3">
          {/* Popover Header */}
          <div className="flex items-start gap-3">
            {family.logoUrl ? (
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-1">
                <img
                  src={family.logoUrl}
                  alt={family.name}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Layers size={20} />
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase">
                {brandName ? `${brandName} Series` : 'Implement Series'}
              </span>
              <h4 className="text-foreground truncate text-sm font-black tracking-tight">
                {family.name}
              </h4>
            </div>
          </div>

          {/* Popover Description */}
          {family.description ? (
            <p className="text-muted text-xs leading-relaxed font-medium line-clamp-3">
              {family.description}
            </p>
          ) : family.seoDescription ? (
            <p className="text-muted text-xs leading-relaxed font-medium line-clamp-3">
              {family.seoDescription}
            </p>
          ) : (
            <p className="text-muted text-xs leading-relaxed font-medium">
              Official {brandName || ''} {family.name} implement family series with high-performance agricultural engineering.
            </p>
          )}

          {/* Quick Stats or Footer Link */}
          <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 mt-0.5">
            <span className="text-muted/70 text-[10px] font-bold tracking-wider uppercase">
              Family Details
            </span>

            <Link
              href={exploreUrl}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
            >
              <span>Explore Series</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
