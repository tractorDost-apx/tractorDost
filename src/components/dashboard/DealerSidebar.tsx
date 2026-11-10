'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hydrate collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tractordost:dealer_sidebar_collapsed');
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
        localStorage.setItem('tractordost:dealer_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  const activeItem = useMemo(() => {
    const found = NAV_ITEMS.find((item) =>
      item.href === '/dealer/dashboard'
        ? pathname === item.href
        : pathname.startsWith(item.href)
    );
    return found ? found.label : 'Dashboard';
  }, [pathname]);

  const renderNavLinks = (collapsed: boolean, onSelect?: () => void) => (
    <nav className="flex flex-col gap-1 border-t border-[var(--border-subtle)] pt-2.5">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dealer/dashboard' && pathname.startsWith(item.href + '/'));
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
              size={18}
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
      {/* 1. MOBILE TOP DEALER BAR (Visible on mobile/tablet < md only) */}
      <div className="flex md:hidden items-center justify-between p-2.5 sm:p-3 rounded-2xl glass-panel border border-[var(--border-subtle)] shadow-xs w-full mb-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)] font-black shadow-2xs">
            <Building2 size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-black text-foreground truncate">Dealer Hub</h2>
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
          <span>Dealer Menu</span>
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
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Dealer Hub</h3>
              <p className="text-[10px] text-muted font-bold">Dealership Management</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close Dealer Menu"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-muted hover:text-foreground active:scale-95 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
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
            <div
              className={`mb-3 flex items-center ${
                isCollapsed ? 'flex-col justify-center gap-2 py-1' : 'justify-between px-2 py-1'
              }`}
            >
              <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2 text-[var(--color-brand-green)] shadow-sm">
                  <Building2 size={isCollapsed ? 20 : 22} />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0">
                    <h2 className="text-foreground text-base leading-tight font-black tracking-tight truncate">
                      Dealer Hub
                    </h2>
                    <p className="text-muted text-[10px] font-bold tracking-wider uppercase truncate">
                      Dealership Portal
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
