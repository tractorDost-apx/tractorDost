'use client';

import React from 'react';
import { Gauge } from 'lucide-react';

interface HoursMeterProps {
  hours: number;
  className?: string;
  showIcon?: boolean;
}

export function HoursMeter({ hours, className = '', showIcon = true }: HoursMeterProps) {
  const formatted = hours?.toLocaleString('en-IN') || '0';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/60 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-md ${className}`}
    >
      {showIcon && <Gauge className="h-3.5 w-3.5 text-muted-foreground" />}
      <span className="font-mono font-bold tracking-tight">{formatted}</span>
      <span className="text-[11px] text-muted-foreground">hrs</span>
    </div>
  );
}

export default HoursMeter;
