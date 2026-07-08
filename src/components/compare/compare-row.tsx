'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface CompareRowProps {
  label: string;
  values: (string | number | boolean | null | undefined)[];
  highlightBest?: 'highest' | 'lowest' | 'boolean';
}

export default function CompareRow({ label, values, highlightBest }: CompareRowProps) {
  // Determine winner if numeric or boolean
  let winnerIndices: number[] = [];
  
  if (highlightBest === 'highest') {
    const nums = values.map(v => (typeof v === 'number' ? v : parseFloat(String(v || '0')) || 0));
    const max = Math.max(...nums);
    if (max > 0) {
      nums.forEach((n, i) => { if (n === max) winnerIndices.push(i); });
    }
  } else if (highlightBest === 'lowest') {
    const nums = values.map(v => (typeof v === 'number' ? v : parseFloat(String(v || '0')) || Infinity));
    const min = Math.min(...nums);
    if (min < Infinity) {
      nums.forEach((n, i) => { if (n === min) winnerIndices.push(i); });
    }
  } else if (highlightBest === 'boolean') {
    values.forEach((v, i) => { if (v === true) winnerIndices.push(i); });
  }

  const renderValue = (val: any) => {
    if (val === true) return <Check size={20} className="text-[var(--color-brand-green)] mx-auto" />;
    if (val === false) return <X size={20} className="text-red-500 mx-auto opacity-50" />;
    if (val === null || val === undefined || val === '') return <span className="text-muted opacity-50">-</span>;
    return val;
  };

  return (
    <div className="flex flex-col md:flex-row border-b border-[var(--border-subtle)] hover:bg-foreground/5 transition-colors">
      <div className="w-full md:w-1/4 p-4 md:p-5 flex items-center md:border-r border-[var(--border-subtle)] bg-background/50">
        <span className="text-sm font-bold text-muted">{label}</span>
      </div>
      <div className="flex-1 flex flex-row">
        {values.map((val, idx) => {
          const isWinner = winnerIndices.includes(idx) && winnerIndices.length !== values.length; // Only highlight if it's uniquely better or tied better, not all tied
          return (
            <div 
              key={idx} 
              className={`flex-1 p-4 md:p-5 flex items-center justify-center text-center border-r last:border-r-0 border-[var(--border-subtle)] transition-colors ${
                isWinner ? 'bg-[var(--color-brand-green)]/10' : ''
              }`}
            >
              <span className={`text-sm md:text-base font-black ${isWinner ? 'text-[var(--color-brand-green)]' : 'text-foreground'}`}>
                {renderValue(val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
