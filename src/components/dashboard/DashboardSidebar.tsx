'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Menu,
  X,
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hydrate collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tractordost:user_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (_) {}
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const activeItem = useMemo(() => {
    const found = NAV_ITEMS.find((item) =>
      item.href === '/dashboard'
        ? pathname === item.href
        : pathname.startsWith(item.href)
    );
    return found ? found.label : 'Overview';
  }, [pathname]);

  const renderNavLinks = (collapsed: boolean, onSelect?: () => void) => (
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
            onClick={onSelect}
            title={collapsed ? item.label : undefined}
            className={`flex items-center rounded-xl py-2.5 text-xs font-bold transition-all ${
              collapsed ? 'justify-center px-0' : 'gap-3 px-3'
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
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* 1. MOBILE TOP USER BAR (Visible on mobile/tablet < md only) */}
      <div className="flex md:hidden items-center justify-between p-2.5 sm:p-3 rounded-2xl glass-panel border border-[var(--border-subtle)] shadow-xs w-full mb-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)] font-black shadow-2xs">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-black text-foreground truncate">{dashboardTitle}</h2>
            <p className="text-[10px] font-bold text-[var(--color-brand-green)] truncate">
              {activeItem}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-3 py-1.5 text-xs font-black text-white shadow-md active:scale-95 transition-all cursor-pointer hover:bg-[var(--color-brand-orange)]"
        >
          <Menu size={15} />
          <span>Hub Menu</span>
        </button>
      </div>

      {/* 2. MOBILE DRAWER BACKDROP OVERLAY */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm md:hidden animate-fade-in transition-opacity"
        />
      )}

      {/* 3. MOBILE OFF-CANVAS SLIDE-OVER DRAWER */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[280px] max-w-[85vw] bg-background/98 dark:bg-[#0c100e]/98 border-r border-[var(--border-subtle)] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">{dashboardTitle}</h3>
              <p className="text-[10px] text-muted font-bold">{dashboardSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close Hub Menu"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-muted hover:text-foreground active:scale-95 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Switcher Cards inside Mobile Drawer */}
        <div className="px-3 pt-3">
          {isAdmin && (
            <div className="mb-2 rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 p-2.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-green)]">
                  Admin Account
                </span>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg bg-[var(--color-brand-green)] px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs"
                >
                  Admin Panel →
                </Link>
              </div>
            </div>
          )}

          {isDealer && (
            <div className="mb-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-2.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                  Dealer Account
                </span>
                <Link
                  href="/dealer/dashboard"
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg bg-blue-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs"
                >
                  Dealer Hub →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
          {renderNavLinks(false, () => setIsMobileOpen(false))}
        </div>

        <div className="border-t border-[var(--border-subtle)] p-3">
          <button
            type="button"
            onClick={() => {
              setIsMobileOpen(false);
              logout();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/10 py-2.5 text-xs font-black text-rose-500 hover:bg-rose-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 4. DESKTOP PERMANENT SIDEBAR (Hidden on mobile, visible on md and up) */}
      <aside
        className={`hidden md:flex h-full flex-shrink-0 flex-col gap-2 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
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
                className={`rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-1.5 text-muted hover:text-foreground hover:bg-foreground/10 transition-all cursor-pointer ${
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
            {renderNavLinks(isCollapsed)}
          </div>
        </div>

        {/* Footer / Sign Out */}
        <div className="glass-panel p-2.5 sm:p-3">
          <button
            type="button"
            onClick={() => logout()}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={`flex w-full items-center rounded-xl py-2.5 text-xs font-bold text-rose-500 transition-all hover:bg-rose-500/10 cursor-pointer ${
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
    </>
  );
}
