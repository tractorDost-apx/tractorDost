'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import {
  LayoutDashboard,
  Tractor,
  MessageSquareText,
  User,
  Wrench,
  BarChart,
  LogOut,
  Building2,
  Layers,
  Store,
  Inbox,
  Star,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dealer/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/dealer/profile', icon: User },
  { label: 'Brand', href: '/dealer/brands', icon: Layers },
  { label: 'Inventory', href: '/dealer/inventory', icon: Tractor },
  { label: 'Used Listings', href: '/dealer/used-listings', icon: Store },
  { label: 'Used Tractor Leads', href: '/dealer/used-leads', icon: Inbox },
  { label: 'Leads & Enquiries', href: '/dealer/leads', icon: MessageSquareText },
  { label: 'Services', href: '/dealer/services', icon: Wrench },
  { label: 'Reviews', href: '/dealer/reviews', icon: Star },
  { label: 'Analytics', href: '/dealer/analytics', icon: BarChart },
];

export default function DealerSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex h-full w-full flex-shrink-0 flex-col gap-3 md:w-64">
      <div className="glass-panel hidden-scrollbar flex-1 overflow-y-auto p-4">
        <div className="mb-6 space-y-1">
          <div className="mb-3 flex items-center gap-3 px-3 py-2">
            <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-foreground text-lg leading-tight font-black tracking-tight">
                Dealer Hub
              </h2>
              <p className="text-muted text-[10px] font-bold tracking-wider uppercase">
                Dealership Portal
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 border-t border-[var(--border-subtle)] pt-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-sm'
                      : 'text-muted hover:bg-foreground/5 hover:text-foreground border border-transparent'
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? 'text-[var(--color-brand-green)]' : 'text-muted/70'}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="glass-panel p-3">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-500 transition-all hover:bg-rose-500/10"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
