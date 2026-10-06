'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import {
  LayoutDashboard,
  User,
  MessageSquareText,
  Wrench,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Enquiries', href: '/dashboard/my-enquiries', icon: MessageSquareText },
  { label: 'Tractor Repair', href: '/dashboard/tractor-repair', icon: Wrench },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // Determine dashboard title based on role
  let dashboardTitle = 'Customer Dashboard';
  if (user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPER_ADMIN') {
    dashboardTitle = 'Admin Dashboard';
  } else if (user?.role?.name === 'DEALER') {
    dashboardTitle = 'Dealer Dashboard';
  }

  return (
    <aside className="flex h-full w-full flex-shrink-0 flex-col gap-2 md:w-64">
      <div className="glass-panel hidden-scrollbar flex-1 overflow-y-auto p-4">
        <div className="mb-6 space-y-1">
          <h2 className="text-foreground mb-1 px-4 text-xl font-black">{dashboardTitle}</h2>
          <p className="text-muted mb-4 px-4 text-xs font-bold tracking-wider uppercase">
            Your Control Center
          </p>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner'
                      : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-[var(--color-brand-green)]' : 'opacity-70'}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="glass-panel p-4">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-500 transition-all hover:bg-red-500/10"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
