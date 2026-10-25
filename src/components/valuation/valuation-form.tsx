'use client';

import React, { useState } from 'react';
import { ConditionGrade } from '@/types/enums/condition-grades';
import { POPULAR_TRACTOR_BRANDS } from '@/lib/constants/brands';

export interface ValuationFormValues {
  brand: string;
  model: string;
  year: number;
  hours: number;
  condition: ConditionGrade;
}

interface ValuationFormProps {
  onSubmit: (values: ValuationFormValues) => void;
  isLoading?: boolean;
}

export function ValuationForm({ onSubmit, isLoading = false }: ValuationFormProps) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState<ValuationFormValues>({
    brand: 'Mahindra',
    model: '',
    year: currentYear - 3,
    hours: 1200,
    condition: ConditionGrade.GOOD,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tractor Brand</label>
        <select
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
        >
          {POPULAR_TRACTOR_BRANDS.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tractor Model</label>
        <input
          type="text"
          required
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          placeholder="e.g. 575 DI, 744 XT, 5310"
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Year</label>
          <input
            type="number"
            min={1990}
            max={currentYear}
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hours Used</label>
          <input
            type="number"
            min={0}
            max={50000}
            value={formData.hours}
            onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overall Condition</label>
        <select
          value={formData.condition}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value as ConditionGrade })}
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
        >
          <option value={ConditionGrade.EXCELLENT}>Excellent (Like New, Low Hours)</option>
          <option value={ConditionGrade.GOOD}>Good (Regularly Serviced, Good Tyres)</option>
          <option value={ConditionGrade.FAIR}>Fair (Normal Farm Wear, Usable Tyres)</option>
          <option value={ConditionGrade.POOR}>Poor (Requires Major Maintenance)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
      >
        {isLoading ? 'Calculating Fair Value...' : 'Check Market Valuation'}
      </button>
    </form>
  );
}

export default ValuationForm;
