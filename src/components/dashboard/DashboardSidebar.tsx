'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { 
  LayoutDashboard, 
  User, 
  Tractor, 
  Heart, 
  Landmark, 
  MessageSquareText, 
  Calculator,
  Search,
  History,
  Bell,
  LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'My Listings', href: '/dashboard/my-listings', icon: Tractor },
  { label: 'Favorites', href: '/dashboard/favorites', icon: Heart },
  { label: 'Loans', href: '/dashboard/loans', icon: Landmark },
  { label: 'Enquiries', href: '/dashboard/my-enquiries', icon: MessageSquareText },
  { label: 'Valuations', href: '/dashboard/my-valuations', icon: Calculator },
  { label: 'Saved Searches', href: '/dashboard/saved-searches', icon: Search },
  { label: 'Compare History', href: '/dashboard/compare-history', icon: History },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
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
    <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2 h-full">
      <div className="glass-panel p-4 flex-1 overflow-y-auto hidden-scrollbar">
        <div className="space-y-1 mb-6">
          <h2 className="text-xl font-black text-foreground px-4 mb-1">{dashboardTitle}</h2>
          <p className="text-xs font-bold text-muted px-4 mb-4 uppercase tracking-wider">Your Control Center</p>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner' 
                      : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-[var(--color-brand-green)]' : 'opacity-70'} />
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
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
