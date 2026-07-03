import React from 'react';
import { MessageSquareText, Calendar, Tractor } from 'lucide-react';

export default function MyEnquiriesPage() {
  const dummyEnquiries = [
    { id: 1, tractor: 'John Deere 5310', dealer: 'Kisan Motors', date: '2 hours ago', status: 'Awaiting Reply', message: 'Is this tractor available for a test drive this weekend?' },
    { id: 2, tractor: 'Eicher 380', dealer: 'Patil Tractors', date: '2 days ago', status: 'Answered', message: 'What is the final negotiable price?' },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">My Enquiries</h1>
        <p className="text-muted font-medium">Messages you've sent to sellers and dealers.</p>
      </div>

      <div className="space-y-4">
        {dummyEnquiries.map((enq) => (
          <div key={enq.id} className="glass-panel p-6 rounded-2xl border border-foreground/5 hover:border-[var(--color-brand-green)]/30 transition-colors cursor-pointer group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                  <Tractor size={18} className="text-[var(--color-brand-green)]" /> {enq.tractor}
                </h3>
                <p className="text-muted font-medium text-sm mt-1">To: {enq.dealer}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${enq.status === 'Answered' ? 'bg-lime-500/10 text-lime-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {enq.status}
                </span>
                <span className="text-xs font-bold text-muted flex items-center gap-1">
                  <Calendar size={14} /> {enq.date}
                </span>
              </div>
            </div>
            
            <div className="bg-foreground/5 rounded-xl p-4 flex gap-3">
              <MessageSquareText size={20} className="text-muted flex-shrink-0 mt-0.5" />
              <p className="text-foreground text-sm font-medium leading-relaxed">"{enq.message}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
