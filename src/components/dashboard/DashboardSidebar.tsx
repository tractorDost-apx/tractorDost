'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import {
  LayoutDashboard,
  User,
  MessageSquareText,
  Wrench,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tractor,
  Inbox,
  Landmark,
  Calculator,
  ArrowRightLeft,
  Heart,
  Bell,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Listings', href: '/dashboard/my-listings', icon: Tractor },
  { label: 'Received Enquiries', href: '/dashboard/listing-enquiries', icon: Inbox },
  { label: 'My Enquiries', href: '/dashboard/my-enquiries', icon: MessageSquareText },
  { label: 'Tractor Repair', href: '/dashboard/tractor-repair', icon: Wrench },
  { label: 'My Loans', href: '/dashboard/loans', icon: Landmark },
  { label: 'Valuations', href: '/dashboard/my-valuations', icon: Calculator },
  { label: 'Compare History', href: '/dashboard/compare-history', icon: ArrowRightLeft },
  { label: 'Favorites', href: '/dashboard/favorites', icon: Heart },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Hydrate collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tractordost:user_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (_) {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tractordost:user_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  const userRole = user?.role?.name?.toUpperCase();
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  const isDealer = userRole === 'DEALER' || userRole === 'DEALER_STAFF' || userRole === 'SELLER';
  const isAgent = userRole === 'AGENT';

  // Determine dashboard title based on role
  let dashboardTitle = 'Customer Hub';
  let dashboardSubtitle = 'Farmer Portal';
  if (isAdmin) {
    dashboardTitle = 'Personal Hub';
    dashboardSubtitle = 'Customer View';
  } else if (isDealer) {
    dashboardTitle = 'Personal Hub';
    dashboardSubtitle = 'Customer View';
  } else if (isAgent) {
    dashboardTitle = 'Personal Hub';
    dashboardSubtitle = 'Customer View';
  }

  return (
    <aside
      className={`flex h-full flex-shrink-0 flex-col gap-2 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-full md:w-64'
      }`}
    >
      <div className="glass-panel hidden-scrollbar flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mb-4 space-y-1">
          {/* Header & Toggle */}
          <div
            className={`mb-3 flex items-center ${
              isCollapsed ? 'flex-col justify-center gap-2 py-1' : 'justify-between px-2 py-1'
            }`}
          >
            <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2 text-[var(--color-brand-green)] shadow-sm">
                <Sparkles size={isCollapsed ? 18 : 20} />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h2 className="text-foreground text-base leading-tight font-black tracking-tight truncate">
                    {dashboardTitle}
                  </h2>
                  <p className="text-muted text-[10px] font-bold tracking-wider uppercase truncate">
                    {dashboardSubtitle}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleCollapse}
              className={`rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-1.5 text-muted hover:text-foreground hover:bg-foreground/10 transition-all ${
                isCollapsed ? 'mt-1' : ''
              }`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Admin Switcher Card */}
          {!isCollapsed && isAdmin && (
            <div className="mb-3 rounded-2xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 p-2.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-green)]">
                  Admin Account
                </span>
                <Link
                  href="/admin/dashboard"
                  className="rounded-lg bg-[var(--color-brand-green)] px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-xs hover:scale-105 transition-all"
                >
                  Admin Panel →
                </Link>
              </div>
              <p className="mt-1 text-[10px] font-medium text-muted">
                Viewing personal customer activities.
              </p>
            </div>
          )}

          {/* Dealer Switcher Card */}
          {!isCollapsed && isDealer && (
            <div className="mb-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-2.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                  Dealer Account
                </span>
                <Link
                  href="/dealer/dashboard"
                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-xs hover:scale-105 transition-all"
                >
                  Dealer Hub →
                </Link>
              </div>
              <p className="mt-1 text-[10px] font-medium text-muted">
                Viewing personal customer activities.
              </p>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 border-t border-[var(--border-subtle)] pt-2.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl py-2.5 text-xs font-bold transition-all ${
                    isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                  } ${
                    isActive
                      ? 'border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)] shadow-sm font-black'
                      : 'text-muted hover:bg-foreground/5 hover:text-foreground border border-transparent'
                  }`}
                >
                  <Icon
                    size={17}
                    className={`shrink-0 ${isActive ? 'text-[var(--color-brand-green)]' : 'text-muted/70'}`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Sign Out */}
      <div className="glass-panel p-2.5 sm:p-3">
        <button
          type="button"
          onClick={() => logout()}
          title={isCollapsed ? 'Sign Out' : undefined}
          className={`flex w-full items-center rounded-xl py-2.5 text-xs font-bold text-rose-500 transition-all hover:bg-rose-500/10 ${
            isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      
        {!isCollapsed && (
          <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-center text-[10px] text-muted">
            <span>Engineered by </span>
            <a
              href="https://www.apxteck.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-bold text-[var(--color-brand-green)] hover:underline"
            >
              APXTECK
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
