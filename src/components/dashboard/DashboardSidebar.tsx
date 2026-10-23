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

  // Determine dashboard title based on role
  let dashboardTitle = 'Customer Dashboard';
  if (user?.role?.name === 'ADMIN') {
    dashboardTitle = 'Admin Dashboard';
  } else if (user?.role?.name === 'DEALER') {
    dashboardTitle = 'Dealer Hub';
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
                    Control Center
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

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 border-t border-[var(--border-subtle)] pt-2.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
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
                    size={18}
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
      </div>
    </aside>
  );
}
