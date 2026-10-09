'use client';

import React, { useState } from 'react';
import { TractorPriceByState } from '@/lib/api/tractors';
import { Plus, Trash2 } from 'lucide-react';

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

  const handleAddPrice = () => {
    if (!newState || !newExShowroom) return;

    // Check if state already exists
    if (prices.some((p) => p.state === newState)) {
      alert('Price for this state already exists!');
      return;
    }

    const newPrice: TractorPriceByState = {
      state: newState,
      exShowroom: parseFloat(newExShowroom),
      rtoCharges: 0,
      insuranceEst: 0,
      dealerCharges: 0,
    };

    onChange([...prices, newPrice]);
    setNewState('');
    setNewExShowroom('');
  };

  const handleRemovePrice = (index: number) => {
    const newPrices = [...prices];
    newPrices.splice(index, 1);
    onChange(newPrices);
  };

  const handleChange = (index: number, field: keyof TractorPriceByState, value: string) => {
    const newPrices = [...prices];
    newPrices[index] = {
      ...newPrices[index],
      [field]: parseFloat(value) || 0,
    };
    onChange(newPrices);
  };

  const availableStates = INDIAN_STATES.filter((state) => !prices.some((p) => p.state === state));

  return (
    <div className="animate-fade-in mt-8 flex flex-col gap-6 border-t border-[var(--border-subtle)] pt-8">
      <div>
        <h2 className="text-foreground mb-1 text-xl font-black">State-wise Pricing</h2>
        <p className="text-muted text-sm font-bold">
          Manage exact on-road price estimates per state.
        </p>
      </div>

      {/* Add New State Price */}
      <div className="bg-foreground/5 flex flex-col items-end gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:flex-row">
        <div className="flex w-full flex-col gap-2 sm:w-1/3">
          <label className="text-muted text-xs font-bold tracking-wider uppercase">
            Select State
          </label>
          <select
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
            className="bg-background text-foreground w-full appearance-none rounded-xl border border-transparent px-4 py-2.5 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
          >
            <option value="">-- Choose State --</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-1/3">
          <label className="text-muted text-xs font-bold tracking-wider uppercase">
            Ex-Showroom Price (₹)
          </label>
          <input
            type="number"
            value={newExShowroom}
            onChange={(e) => setNewExShowroom(e.target.value)}
            placeholder="e.g. 500000"
            className="bg-background text-foreground w-full rounded-xl border border-transparent px-4 py-2.5 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
          />
        </div>

        <button
          type="button"
          onClick={handleAddPrice}
          disabled={!newState || !newExShowroom}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 sm:w-auto"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Existing State Prices Table */}
      {prices.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-foreground/5 text-muted text-[10px] font-black tracking-wider uppercase">
              <tr>
                <th className="px-2 lg:px-3 py-3">State</th>
                <th className="w-32 px-2 lg:px-3 py-3">Ex-Showroom</th>
                <th className="w-28 px-2 lg:px-3 py-3">RTO Est.</th>
                <th className="w-28 px-2 lg:px-3 py-3">Insurance</th>
                <th className="w-28 px-2 lg:px-3 py-3">Dealer Chg.</th>
                <th className="px-2 lg:px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-[var(--border-subtle)]">
              {prices.map((price, idx) => (
                <tr key={idx} className="transition-colors hover:bg-[var(--border-subtle)]">
                  <td className="text-foreground px-2 lg:px-3 py-3 font-bold">{price.state}</td>
                  <td className="px-2 lg:px-3 py-3">
                    <input
                      type="number"
                      value={price.exShowroom || ''}
                      onChange={(e) => handleChange(idx, 'exShowroom', e.target.value)}
                      className="w-full border-b border-dashed border-[var(--border-brand)] bg-transparent px-1 py-1 text-sm font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                    />
                  </td>
                  <td className="px-2 lg:px-3 py-3">
                    <input
                      type="number"
                      value={price.rtoCharges || ''}
                      onChange={(e) => handleChange(idx, 'rtoCharges', e.target.value)}
                      className="w-full border-b border-dashed border-[var(--border-brand)] bg-transparent px-1 py-1 text-sm font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                    />
                  </td>
                  <td className="px-2 lg:px-3 py-3">
                    <input
                      type="number"
                      value={price.insuranceEst || ''}
                      onChange={(e) => handleChange(idx, 'insuranceEst', e.target.value)}
                      className="w-full border-b border-dashed border-[var(--border-brand)] bg-transparent px-1 py-1 text-sm font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                    />
                  </td>
                  <td className="px-2 lg:px-3 py-3">
                    <input
                      type="number"
                      value={price.dealerCharges || ''}
                      onChange={(e) => handleChange(idx, 'dealerCharges', e.target.value)}
                      className="w-full border-b border-dashed border-[var(--border-brand)] bg-transparent px-1 py-1 text-sm font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                    />
                  </td>
                  <td className="px-2 lg:px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemovePrice(idx)}
                      className="text-foreground/50 inline-flex rounded-lg p-1.5 transition-colors hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
