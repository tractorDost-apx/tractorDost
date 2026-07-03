import React from 'react';
import { History, ArrowRightLeft, Tractor } from 'lucide-react';

export default function CompareHistoryPage() {
  const dummyHistory = [
    { id: 1, tractor1: 'Mahindra 575 DI SP Plus', tractor2: 'Swaraj 744 FE', date: 'Yesterday' },
    { id: 2, tractor1: 'John Deere 5310', tractor2: 'New Holland 3230', date: '12 Oct 2023' },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">Compare History</h1>
        <p className="text-muted font-medium">Recently compared tractors.</p>
      </div>

      <div className="space-y-4">
        {dummyHistory.map((item) => (
          <div key={item.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-foreground/5 hover:border-[var(--color-brand-green)]/30 transition-colors">
            
            <div className="flex flex-1 items-center justify-between bg-foreground/5 rounded-xl p-4">
              <div className="flex flex-col items-center flex-1 text-center px-2">
                <Tractor size={24} className="text-muted mb-2" />
                <span className="font-bold text-sm line-clamp-2">{item.tractor1}</span>
              </div>
              
              <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-[var(--color-brand-green)] shadow-sm shrink-0 mx-2">
                <ArrowRightLeft size={18} />
              </div>
              
              <div className="flex flex-col items-center flex-1 text-center px-2">
                <Tractor size={24} className="text-muted mb-2" />
                <span className="font-bold text-sm line-clamp-2">{item.tractor2}</span>
              </div>
            </div>

            <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-3 min-w-[120px]">
              <span className="text-xs font-bold text-muted flex items-center gap-1">
                <History size={14} /> {item.date}
              </span>
              <button className="bg-[var(--color-brand-green)] text-black font-bold py-2 px-4 rounded-xl text-sm hover:bg-[var(--color-brand-green)]/90 transition-colors">
                Compare Again
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
