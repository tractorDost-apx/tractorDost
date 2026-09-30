import React from 'react';
import { Landmark, FileText, CheckCircle, Clock } from 'lucide-react';

export default function LoansPage() {
  const dummyLoans = [
    {
      id: 'LN-2023-8472',
      amount: '₹4,50,000',
      tractor: 'Mahindra 575 DI',
      financier: 'HDFC Bank',
      date: '12 Oct 2023',
      status: 'Approved',
      icon: CheckCircle,
      color: 'text-lime-500',
    },
    {
      id: 'LN-2023-9183',
      amount: '₹3,20,000',
      tractor: 'Swaraj 744 FE',
      financier: 'Mahindra Finance',
      date: '05 Nov 2023',
      status: 'In Progress',
      icon: Clock,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="animate-fade-in flex h-full flex-col">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-black">My Loans</h1>
          <p className="text-muted font-medium">Track your tractor loan applications.</p>
        </div>
        <button className="spatial-button flex h-12 items-center gap-2 rounded-xl px-6 whitespace-nowrap">
          <Landmark size={20} /> Apply for New Loan
        </button>
      </div>

      <div className="space-y-4">
        {dummyLoans.map((loan) => {
          const StatusIcon = loan.icon;
          return (
            <div
              key={loan.id}
              className="glass-panel flex cursor-pointer flex-col justify-between gap-6 rounded-2xl p-6 transition-colors hover:border-[var(--border-subtle)] md:flex-row md:items-center"
            >
              <div className="flex items-center gap-4">
                <div className="text-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--border-subtle)]">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-foreground text-lg font-bold">{loan.tractor}</h3>
                    <span className="text-muted rounded bg-[var(--border-subtle)] px-2 py-0.5 text-xs font-bold">
                      {loan.id}
                    </span>
                  </div>
                  <p className="text-muted text-sm font-medium">
                    Financier: {loan.financier} • Applied: {loan.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-4 md:flex-col md:items-end md:border-t-0 md:pt-0">
                <p className="text-foreground text-2xl font-black">{loan.amount}</p>
                <div className={`flex items-center gap-1.5 text-sm font-bold ${loan.color}`}>
                  <StatusIcon size={16} /> {loan.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
