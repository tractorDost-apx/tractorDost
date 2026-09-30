import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const dummyNotifications = [
    {
      id: 1,
      title: 'Loan Approved!',
      message: 'Your loan application for Mahindra 575 DI has been approved by HDFC Bank.',
      time: '2 hours ago',
      type: 'success',
      read: false,
    },
    {
      id: 2,
      title: 'Price Alert',
      message: 'A tractor matching your saved search is now available under ₹5L.',
      time: '1 day ago',
      type: 'info',
      read: true,
    },
    {
      id: 3,
      title: 'Listing Expiring Soon',
      message: 'Your listing for Swaraj 744 FE will expire in 3 days. Renew it now.',
      time: '2 days ago',
      type: 'warning',
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-lime-500" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={24} />;
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };

  return (
    <div className="animate-fade-in mx-auto flex h-full w-full max-w-3xl flex-col">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2 flex items-center gap-2 text-3xl font-black">
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
            className={`glass-panel flex gap-4 rounded-2xl p-5 transition-all ${
              !note.read
                ? 'bg-foreground/[0.03] border-l-4 border-l-[var(--color-brand-green)]'
                : 'border-foreground/5 border opacity-70'
            }`}
          >
            <div className="mt-1 flex-shrink-0">{getIcon(note.type)}</div>
            <div className="flex-1">
              <div className="mb-1 flex items-start justify-between">
                <h3
                  className={`text-base ${!note.read ? 'text-foreground font-black' : 'text-muted font-bold'}`}
                >
                  {note.title}
                </h3>
                <span className="text-muted ml-4 text-xs font-bold whitespace-nowrap">
                  {note.time}
                </span>
              </div>
              <p
                className={`text-sm ${!note.read ? 'text-foreground/80 font-medium' : 'text-muted'}`}
              >
                {note.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
