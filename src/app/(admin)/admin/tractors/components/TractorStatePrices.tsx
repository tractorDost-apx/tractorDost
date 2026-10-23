'use client';

import React, { useState } from 'react';
import { TractorPriceByState } from '@/lib/api/tractors';
import { Plus, Trash2, AlertCircle, IndianRupee, CheckCircle2 } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

interface TractorStatePricesProps {
  prices: TractorPriceByState[];
  onChange: (prices: TractorPriceByState[]) => void;
}

export default function TractorStatePrices({ prices, onChange }: TractorStatePricesProps) {
  const [newState, setNewState] = useState('');
  const [newExShowroom, setNewExShowroom] = useState('');
  const [priceError, setPriceError] = useState<string | null>(null);

  const handleExShowroomChange = (val: string) => {
    setNewExShowroom(val);

    if (!val || val.trim() === '') {
      setPriceError(null);
      return;
    }

    const num = parseFloat(val);
    if (isNaN(num)) {
      setPriceError('Please enter a valid numeric price');
    } else if (num < 0 || val.trim().startsWith('-')) {
      setPriceError('Ex-showroom price cannot be negative. Vehicle pricing must be a positive value.');
    } else if (num === 0) {
      setPriceError('Ex-showroom price must be greater than 0.');
    } else {
      setPriceError(null);
    }
  };

  const handleAddPrice = () => {
    if (!newState) {
      setPriceError('Please select an Indian state first.');
      return;
    }

    if (!newExShowroom || newExShowroom.trim() === '') {
      setPriceError('Please enter the ex-showroom price.');
      return;
    }

    const priceNum = parseFloat(newExShowroom);
    if (isNaN(priceNum) || priceNum <= 0 || newExShowroom.trim().startsWith('-')) {
      setPriceError('Ex-showroom price cannot be negative or zero. Please enter a valid positive price.');
      return;
    }

    // Check if state already exists
    if (prices.some((p) => p.state === newState)) {
      setPriceError(`Pricing for "${newState}" is already added to the list.`);
      return;
    }

    const newPrice: TractorPriceByState = {
      state: newState,
      exShowroom: priceNum,
      rtoCharges: 0,
      insuranceEst: 0,
      dealerCharges: 0,
    };

    onChange([...prices, newPrice]);
    setNewState('');
    setNewExShowroom('');
    setPriceError(null);
  };

  const handleRemovePrice = (index: number) => {
    const newPrices = [...prices];
    newPrices.splice(index, 1);
    onChange(newPrices);
  };

  const handleChange = (index: number, field: keyof TractorPriceByState, value: string) => {
    const newPrices = [...prices];
    let numVal = parseFloat(value);

    if (isNaN(numVal) || numVal < 0) {
      numVal = 0;
    }

    newPrices[index] = {
      ...newPrices[index],
      [field]: numVal,
    };
    onChange(newPrices);
  };

  const blockNegativeKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };

  const availableStates = INDIAN_STATES.filter((state) => !prices.some((p) => p.state === state));
  const hasInvalidExistingPrice = prices.some((p) => !p.exShowroom || Number(p.exShowroom) <= 0);

  return (
    <div className="animate-fade-in mt-8 flex flex-col gap-6 border-t border-[var(--border-subtle)] pt-8">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
            <IndianRupee size={16} />
          </div>
          <h2 className="text-foreground text-xl font-black">State-wise Pricing</h2>
        </div>
        <p className="text-muted mt-1 text-sm font-bold">
          Manage exact on-road price estimates per state. Negative price values are strictly prohibited.
        </p>
      </div>

      {/* Add New State Price */}
      <div className="bg-foreground/5 flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <div className="flex w-full flex-col gap-1.5 sm:w-1/3">
            <label className="text-muted text-xs font-bold tracking-wider uppercase">
              Select State *
            </label>
            <select
              value={newState}
              onChange={(e) => {
                setNewState(e.target.value);
                if (priceError?.includes('state')) setPriceError(null);
              }}
              className="bg-background text-foreground w-full appearance-none rounded-xl border border-transparent px-4 py-2.5 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
            >
              <option value="">-- Choose State --</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full flex-col gap-1.5 sm:w-1/3">
            <label className="text-muted text-xs font-bold tracking-wider uppercase">
              Ex-Showroom Price (₹) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                value={newExShowroom}
                onChange={(e) => handleExShowroomChange(e.target.value)}
                onKeyDown={blockNegativeKey}
                placeholder="e.g. 500000"
                className={`bg-background text-foreground w-full rounded-xl border px-4 py-2.5 text-sm font-bold transition-all focus:outline-none ${
                  priceError
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-transparent focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20'
                }`}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <button
              type="button"
              onClick={handleAddPrice}
              disabled={!newState || !newExShowroom || parseFloat(newExShowroom) <= 0 || !!priceError}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto cursor-pointer"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Clear Inline Validation Error Message */}
        {priceError && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-500 animate-in fade-in">
            <AlertCircle size={15} className="shrink-0 text-rose-500" />
            <span>{priceError}</span>
          </div>
        )}
      </div>

      {/* Warning if any existing state row has negative or zero price */}
      {hasInvalidExistingPrice && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-bold text-amber-600 dark:text-amber-400">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            Attention: One or more states have an invalid or missing Ex-Showroom Price. Please ensure all prices are greater than 0 before saving.
          </span>
        </div>
      )}

      {/* Existing State Prices Table */}
      {prices.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-foreground/5 text-muted text-[10px] font-black tracking-wider uppercase">
              <tr>
                <th className="px-3 py-3">State</th>
                <th className="w-36 px-3 py-3">Ex-Showroom (₹)</th>
                <th className="w-32 px-3 py-3">RTO Est. (₹)</th>
                <th className="w-32 px-3 py-3">Insurance (₹)</th>
                <th className="w-32 px-3 py-3">Dealer Chg. (₹)</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-[var(--border-subtle)]">
              {prices.map((price, idx) => {
                const isExShowroomInvalid = !price.exShowroom || Number(price.exShowroom) <= 0;
                return (
                  <tr key={idx} className="transition-colors hover:bg-[var(--border-subtle)]">
                    <td className="text-foreground px-3 py-3 font-bold">{price.state}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={price.exShowroom || ''}
                          onKeyDown={blockNegativeKey}
                          onChange={(e) => handleChange(idx, 'exShowroom', e.target.value)}
                          className={`w-full rounded-lg border bg-transparent px-2 py-1 text-sm font-bold transition-all focus:outline-none ${
                            isExShowroomInvalid
                              ? 'border-rose-500 text-rose-500 bg-rose-500/5'
                              : 'border-dashed border-[var(--border-brand)] text-foreground focus:border-[var(--color-brand-green)]'
                          }`}
                        />
                        {isExShowroomInvalid && (
                          <span className="text-[10px] font-bold text-rose-500 mt-0.5">
                            Must be &gt; 0
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={price.rtoCharges ?? 0}
                        onKeyDown={blockNegativeKey}
                        onChange={(e) => handleChange(idx, 'rtoCharges', e.target.value)}
                        className="w-full rounded-lg border border-dashed border-[var(--border-brand)] bg-transparent px-2 py-1 text-sm font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={price.insuranceEst ?? 0}
                        onKeyDown={blockNegativeKey}
                        onChange={(e) => handleChange(idx, 'insuranceEst', e.target.value)}
                        className="w-full rounded-lg border border-dashed border-[var(--border-brand)] bg-transparent px-2 py-1 text-sm font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={price.dealerCharges ?? 0}
                        onKeyDown={blockNegativeKey}
                        onChange={(e) => handleChange(idx, 'dealerCharges', e.target.value)}
                        className="w-full rounded-lg border border-dashed border-[var(--border-brand)] bg-transparent px-2 py-1 text-sm font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemovePrice(idx)}
                        className="text-foreground/50 inline-flex rounded-lg p-1.5 transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                        title="Remove state pricing"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
