import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const dummyNotifications = [
    { id: 1, title: 'Loan Approved!', message: 'Your loan application for Mahindra 575 DI has been approved by HDFC Bank.', time: '2 hours ago', type: 'success', read: false },
    { id: 2, title: 'Price Alert', message: 'A tractor matching your saved search is now available under ₹5L.', time: '1 day ago', type: 'info', read: true },
    { id: 3, title: 'Listing Expiring Soon', message: 'Your listing for Swaraj 744 FE will expire in 3 days. Renew it now.', time: '2 days ago', type: 'warning', read: true },
  ];

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle2 className="text-lime-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2 flex items-center gap-2">
            <Bell size={28} /> Notifications
          </h1>
          <p className="text-muted font-medium">Stay updated with your latest alerts.</p>
        </div>
        <button className="text-sm font-bold text-[var(--color-brand-green)] hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {dummyNotifications.map((note) => (
          <div 
            key={note.id} 
            className={`glass-panel p-5 rounded-2xl flex gap-4 transition-all ${
              !note.read ? 'border-l-4 border-l-[var(--color-brand-green)] bg-foreground/[0.03]' : 'border border-foreground/5 opacity-70'
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {getIcon(note.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-base ${!note.read ? 'font-black text-foreground' : 'font-bold text-muted'}`}>
                  {note.title}
                </h3>
                <span className="text-xs font-bold text-muted whitespace-nowrap ml-4">{note.time}</span>
              </div>
              <p className={`text-sm ${!note.read ? 'font-medium text-foreground/80' : 'text-muted'}`}>
                {note.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
