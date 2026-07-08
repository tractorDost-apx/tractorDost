import React from 'react';
import { Landmark, FileText, CheckCircle, Clock } from 'lucide-react';

export default function LoansPage() {
  const dummyLoans = [
    { id: 'LN-2023-8472', amount: '₹4,50,000', tractor: 'Mahindra 575 DI', financier: 'HDFC Bank', date: '12 Oct 2023', status: 'Approved', icon: CheckCircle, color: 'text-lime-500' },
    { id: 'LN-2023-9183', amount: '₹3,20,000', tractor: 'Swaraj 744 FE', financier: 'Mahindra Finance', date: '05 Nov 2023', status: 'In Progress', icon: Clock, color: 'text-amber-500' },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2">My Loans</h1>
          <p className="text-muted font-medium">Track your tractor loan applications.</p>
        </div>
        <button className="spatial-button h-12 px-6 rounded-xl flex items-center gap-2 whitespace-nowrap">
          <Landmark size={20} /> Apply for New Loan
        </button>
      </div>

      <div className="space-y-4">
        {dummyLoans.map((loan) => {
          const StatusIcon = loan.icon;
          return (
            <div key={loan.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[var(--border-subtle)] transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[var(--border-subtle)] flex items-center justify-center flex-shrink-0 text-muted">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground text-lg">{loan.tractor}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--border-subtle)] text-muted">
                      {loan.id}
                    </span>
                  </div>
                  <p className="text-muted font-medium text-sm">Financier: {loan.financier} • Applied: {loan.date}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t border-[var(--border-subtle)] md:border-t-0 pt-4 md:pt-0">
                <p className="text-2xl font-black text-foreground">{loan.amount}</p>
                <div className={`flex items-center gap-1.5 font-bold text-sm ${loan.color}`}>
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
