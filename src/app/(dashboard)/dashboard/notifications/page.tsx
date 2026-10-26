'use client';

import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'info' | 'warning';
  read: boolean;
  href: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: 'Doorstep Service Booking Scheduled',
    message: 'Your tractor maintenance booking has been confirmed by our certified technician.',
    time: '2 hours ago',
    type: 'success',
    read: false,
    href: '/dashboard/tractor-repair',
  },
  {
    id: 2,
    title: 'New Buyer Enquiry Received',
    message: 'A farmer in Satara is interested in inspecting your Mahindra 575 DI listing.',
    time: '5 hours ago',
    type: 'info',
    read: false,
    href: '/dashboard/listing-enquiries',
  },
  {
    id: 3,
    title: 'TrueVal Price Update Alert',
    message: 'Market prices for Swaraj 744 FE tractors in Pune district have updated.',
    time: '1 day ago',
    type: 'info',
    read: true,
    href: '/used-tractor-valuation',
  },
  {
    id: 4,
    title: 'Loan Pre-Eligibility Approved',
    message: 'Your tractor loan request is ready for partner credit review.',
    time: '3 days ago',
    type: 'success',
    read: true,
    href: '/dashboard/loans',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-[var(--color-brand-green)]" size={22} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={22} />;
      default:
        return <Info className="text-blue-500" size={22} />;
    }
  };

  return (
    <div className="animate-fade-in mx-auto flex h-full w-full max-w-4xl flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground mb-1 flex items-center gap-2.5 text-3xl font-black">
            <Bell size={28} className="text-[var(--color-brand-green)]" /> Notifications
          </h1>
          <p className="text-muted text-xs font-medium sm:text-sm">
            Stay updated with tractor enquiries, doorstep repairs, and valuation alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-[var(--color-brand-green)] transition-opacity hover:opacity-80"
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
            filter === 'all'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
            filter === 'unread'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] p-12 text-center">
            <Bell size={40} className="text-muted/40 mb-3" />
            <p className="text-foreground text-sm font-bold">No Notifications</p>
            <p className="text-muted mt-1 text-xs">You are all caught up on all updates!</p>
          </div>
        ) : (
          filtered.map((note) => (
            <div
              key={note.id}
              className={`glass-panel group flex flex-col justify-between gap-4 rounded-2xl border p-5 transition-all sm:flex-row sm:items-center ${
                !note.read
                  ? 'border-l-4 border-l-[var(--color-brand-green)] border-[var(--border-subtle)] bg-[var(--color-brand-green)]/[0.03]'
                  : 'border-[var(--border-subtle)] opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 shrink-0">{getIcon(note.type)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm ${
                        !note.read ? 'text-foreground font-black' : 'text-muted font-bold'
                      }`}
                    >
                      {note.title}
                    </h3>
                    <span className="text-muted text-[11px] font-bold">• {note.time}</span>
                  </div>
                  <p className="text-muted mt-1 text-xs font-medium leading-relaxed">
                    {note.message}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link
                  href={note.href}
                  className="rounded-xl bg-[var(--color-brand-green)]/15 px-3 py-1.5 text-xs font-black text-[var(--color-brand-green)] transition-opacity hover:opacity-90"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => handleToggleRead(note.id)}
                  className="text-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                  title={note.read ? 'Mark as unread' : 'Mark as read'}
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="text-muted hover:text-red-500 rounded-lg p-1.5 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
