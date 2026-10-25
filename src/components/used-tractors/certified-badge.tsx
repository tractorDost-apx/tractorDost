'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface CertifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CertifiedBadge({ className = '', size = 'md' }: CertifiedBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <div
      className={`inline-flex items-center font-black tracking-wider uppercase rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)] backdrop-blur-md ${sizeClasses} ${className}`}
    >
      <ShieldCheck size={iconSizes} className="text-emerald-400" />
      <span>120-Point Certified</span>
    </div>
  );
}

export default CertifiedBadge;
