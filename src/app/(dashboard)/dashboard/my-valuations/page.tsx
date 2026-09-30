import React from 'react';
import { Calculator, ArrowRight, IndianRupee } from 'lucide-react';

export default function MyValuationsPage() {
  const dummyValuations = [
    {
      id: 1,
      brand: 'Mahindra',
      model: '575 DI',
      year: '2019',
      condition: 'Excellent',
      estimatedValue: '₹4,80,000 - ₹5,10,000',
      date: '10 Nov 2023',
    },
    {
      id: 2,
      brand: 'Swaraj',
      model: '744 FE',
      year: '2021',
      condition: 'Good',
      estimatedValue: '₹5,20,000 - ₹5,60,000',
      date: '01 Nov 2023',
    },
  ];

  return (
    <div className="animate-fade-in flex h-full flex-col">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-black">My Valuations</h1>
          <p className="text-muted font-medium">
            History of your tractor price checks using TrueVal.
          </p>
        </div>
        <button className="spatial-button flex h-12 items-center gap-2 rounded-xl px-6 whitespace-nowrap">
          <Calculator size={20} /> Check New Price
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {dummyValuations.map((val) => (
          <div key={val.id} className="glass-panel flex flex-col justify-between rounded-2xl p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-foreground mb-1 text-xl font-bold">
                  {val.brand} {val.model}
                </h3>
                <div className="text-muted flex items-center gap-3 text-sm font-medium">
                  <span>Year: {val.year}</span>
                  <span className="bg-muted/50 h-1 w-1 rounded-full" />
                  <span>Condition: {val.condition}</span>
                </div>
              </div>
              <span className="text-muted bg-foreground/5 rounded-md px-2 py-1 text-xs font-bold">
                {val.date}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[var(--color-brand-green)]/10 p-4">
              <div>
                <p className="mb-1 flex items-center gap-1 text-sm font-bold text-[var(--color-brand-green)]">
                  <IndianRupee size={14} /> TrueVal Estimate
                </p>
                <p className="text-foreground text-xl font-black">{val.estimatedValue}</p>
              </div>
              <button className="bg-foreground text-background flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-brand-green)]">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
