'use client';

import React, { useEffect, useState } from 'react';
import { Tractor } from '@/lib/api/tractors';

interface CompareStickyBarProps {
  tractors: Tractor[];
  isSticky: boolean;
}

export default function CompareStickyBar({ tractors, isSticky }: CompareStickyBarProps) {
  if (!isSticky) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-[var(--border-subtle)] shadow-sm animate-fade-in-down transition-all">
      <div className="w-full max-w-7xl mx-auto px-4 py-3 flex">
        {/* Empty left space to align with table headers */}
        <div className="hidden md:block md:w-1/4"></div>
        <div className="flex-1 flex flex-row">
          {tractors.map((tractor, idx) => (
            <div key={idx} className="flex-1 flex items-center gap-3 px-4 border-r last:border-r-0 border-[var(--border-subtle)] justify-center md:justify-start">
              {tractor.primaryMedia?.url && (
                <div className="w-10 h-10 rounded-full bg-foreground/5 p-1 hidden lg:flex items-center justify-center">
                  <img src={tractor.primaryMedia.url} alt={tractor.modelName} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-orange)] leading-none">{tractor.brand?.name}</span>
                <span className="text-sm font-black text-foreground leading-tight truncate max-w-[120px] sm:max-w-[180px]">{tractor.modelName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
