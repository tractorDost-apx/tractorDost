'use client';

import React, { useState } from 'react';
import { TractorPriceByState } from '@/lib/api/tractors';
import { Plus, Trash2 } from 'lucide-react';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
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
    if (prices.some(p => p.state === newState)) {
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
      [field]: parseFloat(value) || 0
    };
    onChange(newPrices);
  };

  const availableStates = INDIAN_STATES.filter(state => !prices.some(p => p.state === state));

  return (
    <div className="flex flex-col gap-6 animate-fade-in mt-8 pt-8 border-t border-foreground/10">
      <div>
        <h2 className="text-xl font-black text-foreground mb-1">State-wise Pricing</h2>
        <p className="text-sm font-bold text-muted">Manage exact on-road price estimates per state.</p>
      </div>

      {/* Add New State Price */}
      <div className="flex flex-col sm:flex-row gap-4 items-end p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
        <div className="flex flex-col gap-2 w-full sm:w-1/3">
          <label className="text-xs font-bold text-muted uppercase tracking-wider">Select State</label>
          <select 
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
            className="w-full bg-background border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all appearance-none"
          >
            <option value="">-- Choose State --</option>
            {availableStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col gap-2 w-full sm:w-1/3">
          <label className="text-xs font-bold text-muted uppercase tracking-wider">Ex-Showroom Price (₹)</label>
          <input 
            type="number"
            value={newExShowroom}
            onChange={(e) => setNewExShowroom(e.target.value)}
            placeholder="e.g. 500000"
            className="w-full bg-background border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
          />
        </div>

        <button
          type="button"
          onClick={handleAddPrice}
          disabled={!newState || !newExShowroom}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-brand-green)] text-white font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Existing State Prices Table */}
      {prices.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-foreground/10">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-foreground/5 text-muted uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3 w-32">Ex-Showroom</th>
                <th className="px-4 py-3 w-28">RTO Est.</th>
                <th className="px-4 py-3 w-28">Insurance</th>
                <th className="px-4 py-3 w-28">Dealer Chg.</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5 bg-background">
              {prices.map((price, idx) => (
                <tr key={idx} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">{price.state}</td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      value={price.exShowroom || ''}
                      onChange={(e) => handleChange(idx, 'exShowroom', e.target.value)}
                      className="w-full bg-transparent border-b border-dashed border-foreground/20 px-1 py-1 text-sm font-bold focus:outline-none focus:border-[var(--color-brand-green)]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      value={price.rtoCharges || ''}
                      onChange={(e) => handleChange(idx, 'rtoCharges', e.target.value)}
                      className="w-full bg-transparent border-b border-dashed border-foreground/20 px-1 py-1 text-sm font-bold focus:outline-none focus:border-[var(--color-brand-green)]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      value={price.insuranceEst || ''}
                      onChange={(e) => handleChange(idx, 'insuranceEst', e.target.value)}
                      className="w-full bg-transparent border-b border-dashed border-foreground/20 px-1 py-1 text-sm font-bold focus:outline-none focus:border-[var(--color-brand-green)]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      value={price.dealerCharges || ''}
                      onChange={(e) => handleChange(idx, 'dealerCharges', e.target.value)}
                      className="w-full bg-transparent border-b border-dashed border-foreground/20 px-1 py-1 text-sm font-bold focus:outline-none focus:border-[var(--color-brand-green)]"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      type="button"
                      onClick={() => handleRemovePrice(idx)}
                      className="p-1.5 rounded-lg text-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors inline-flex"
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
