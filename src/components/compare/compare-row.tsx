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
    const nums = values.map((v) => (typeof v === 'number' ? v : parseFloat(String(v || '0')) || 0));
    const max = Math.max(...nums);
    if (max > 0) {
      nums.forEach((n, i) => {
        if (n === max) winnerIndices.push(i);
      });
    }
  } else if (highlightBest === 'lowest') {
    const nums = values.map((v) =>
      typeof v === 'number' ? v : parseFloat(String(v || '0')) || Infinity
    );
    const min = Math.min(...nums);
    if (min < Infinity) {
      nums.forEach((n, i) => {
        if (n === min) winnerIndices.push(i);
      });
    }
  } else if (highlightBest === 'boolean') {
    values.forEach((v, i) => {
      if (v === true) winnerIndices.push(i);
    });
  }

  const renderValue = (val: any) => {
    if (val === true)
      return <Check size={20} className="mx-auto text-[var(--color-brand-green)]" />;
    if (val === false) return <X size={20} className="mx-auto text-red-500 opacity-50" />;
    if (val === null || val === undefined || val === '')
      return <span className="text-muted opacity-50">-</span>;
    return val;
  };

  return (
    <div className="hover:bg-foreground/5 flex flex-col border-b border-[var(--border-subtle)] transition-colors md:flex-row">
      <div className="bg-background/50 flex w-full items-center border-[var(--border-subtle)] p-4 md:w-1/4 md:border-r md:p-5">
        <span className="text-muted text-sm font-bold">{label}</span>
      </div>
      <div className="flex flex-1 flex-row">
        {values.map((val, idx) => {
          const isWinner = winnerIndices.includes(idx) && winnerIndices.length !== values.length; // Only highlight if it's uniquely better or tied better, not all tied
          return (
            <div
              key={idx}
              className={`flex flex-1 items-center justify-center border-r border-[var(--border-subtle)] p-4 text-center transition-colors last:border-r-0 md:p-5 ${
                isWinner ? 'bg-[var(--color-brand-green)]/10' : ''
              }`}
            >
              <span
                className={`text-sm font-black md:text-base ${isWinner ? 'text-[var(--color-brand-green)]' : 'text-foreground'}`}
              >
                {renderValue(val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
