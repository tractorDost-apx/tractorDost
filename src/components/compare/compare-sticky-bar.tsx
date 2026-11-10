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
    <div className="bg-background/95 animate-fade-in-down fixed top-[4.25rem] sm:top-[4.75rem] right-0 left-0 z-30 border-b border-[var(--border-subtle)] shadow-xs backdrop-blur-xl transition-all">
      <div className="mx-auto flex w-full max-w-7xl px-3.5 sm:px-4 py-2.5 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain">
        {/* Empty left space to align with table headers */}
        <div className="hidden md:block md:w-1/4"></div>
        <div className={`flex flex-1 flex-row ${tractors.length >= 3 ? 'min-w-[560px] md:min-w-0' : ''}`}>
          {tractors.map((tractor, idx) => (
            <div
              key={idx}
              className="flex flex-1 items-center justify-center gap-3 border-r border-[var(--border-subtle)] px-4 last:border-r-0 md:justify-start"
            >
              {tractor.primaryMedia?.url && (
                <div className="bg-foreground/5 hidden h-10 w-10 items-center justify-center rounded-full p-1 lg:flex">
                  <img
                    src={tractor.primaryMedia.url}
                    alt={tractor.modelName}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-[10px] leading-none font-black tracking-wider text-[var(--color-brand-orange)] uppercase">
                  {tractor.brand?.name}
                </span>
                <span className="text-foreground max-w-[120px] truncate text-sm leading-tight font-black sm:max-w-[180px]">
                  {tractor.modelName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
