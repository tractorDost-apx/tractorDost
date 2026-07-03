import React from 'react';
import { Calculator, ArrowRight, IndianRupee } from 'lucide-react';

export default function MyValuationsPage() {
  const dummyValuations = [
    { id: 1, brand: 'Mahindra', model: '575 DI', year: '2019', condition: 'Excellent', estimatedValue: '₹4,80,000 - ₹5,10,000', date: '10 Nov 2023' },
    { id: 2, brand: 'Swaraj', model: '744 FE', year: '2021', condition: 'Good', estimatedValue: '₹5,20,000 - ₹5,60,000', date: '01 Nov 2023' },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2">My Valuations</h1>
          <p className="text-muted font-medium">History of your tractor price checks using TrueVal.</p>
        </div>
        <button className="spatial-button h-12 px-6 rounded-xl flex items-center gap-2 whitespace-nowrap">
          <Calculator size={20} /> Check New Price
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dummyValuations.map((val) => (
          <div key={val.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-foreground text-xl mb-1">{val.brand} {val.model}</h3>
                <div className="flex items-center gap-3 text-sm text-muted font-medium">
                  <span>Year: {val.year}</span>
                  <span className="w-1 h-1 rounded-full bg-muted/50" />
                  <span>Condition: {val.condition}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-muted bg-foreground/5 px-2 py-1 rounded-md">{val.date}</span>
            </div>
            
            <div className="bg-[var(--color-brand-green)]/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--color-brand-green)] mb-1 flex items-center gap-1">
                  <IndianRupee size={14} /> TrueVal Estimate
                </p>
                <p className="text-xl font-black text-foreground">{val.estimatedValue}</p>
              </div>
              <button className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center text-background hover:bg-[var(--color-brand-green)] transition-colors">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
