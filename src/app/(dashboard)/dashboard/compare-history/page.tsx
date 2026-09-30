import React from 'react';
import { History, ArrowRightLeft, Tractor } from 'lucide-react';

export default function CompareHistoryPage() {
  const dummyHistory = [
    { id: 1, tractor1: 'Mahindra 575 DI SP Plus', tractor2: 'Swaraj 744 FE', date: 'Yesterday' },
    { id: 2, tractor1: 'John Deere 5310', tractor2: 'New Holland 3230', date: '12 Oct 2023' },
  ];

  return (
    <div className="animate-fade-in flex h-full flex-col">
      <div className="mb-8">
        <h1 className="text-foreground mb-2 text-3xl font-black">Compare History</h1>
        <p className="text-muted font-medium">Recently compared tractors.</p>
      </div>

      <div className="space-y-4">
        {dummyHistory.map((item) => (
          <div
            key={item.id}
            className="glass-panel border-foreground/5 flex flex-col justify-between gap-6 rounded-2xl border p-6 transition-colors hover:border-[var(--color-brand-green)]/30 md:flex-row md:items-center"
          >
            <div className="bg-foreground/5 flex flex-1 items-center justify-between rounded-xl p-4">
              <div className="flex flex-1 flex-col items-center px-2 text-center">
                <Tractor size={24} className="text-muted mb-2" />
                <span className="line-clamp-2 text-sm font-bold">{item.tractor1}</span>
              </div>

              <div className="bg-background mx-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-brand-green)] shadow-sm">
                <ArrowRightLeft size={18} />
              </div>

              <div className="flex flex-1 flex-col items-center px-2 text-center">
                <Tractor size={24} className="text-muted mb-2" />
                <span className="line-clamp-2 text-sm font-bold">{item.tractor2}</span>
              </div>
            </div>

            <div className="flex min-w-[120px] items-center justify-between gap-3 md:flex-col md:items-end md:justify-center">
              <span className="text-muted flex items-center gap-1 text-xs font-bold">
                <History size={14} /> {item.date}
              </span>
              <button className="rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--color-brand-green)]/90">
                Compare Again
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
