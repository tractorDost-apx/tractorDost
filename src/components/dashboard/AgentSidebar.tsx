'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { LayoutDashboard, ClipboardCheck, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/agent/dashboard', icon: LayoutDashboard },
  { label: 'My Inspections', href: '/agent/inspections', icon: ClipboardCheck },
];

export default function AgentSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tractordost:agent_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (_) {}
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tractordost:agent_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === '/agent/dashboard' && pathname === '/agent/dashboard') return true;
    if (href !== '/agent/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed right-6 bottom-6 z-50 rounded-full bg-[var(--color-brand-green)] p-4 text-white shadow-[var(--color-brand-green)]/30 shadow-xl transition-transform active:scale-95 md:hidden"
        aria-label="Toggle Navigation"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="bg-background/80 animate-in fade-in fixed inset-0 z-40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div
        className={`glass-panel fixed top-0 left-0 z-40 flex h-[100dvh] w-[280px] shrink-0 flex-col overflow-hidden transition-all duration-300 md:relative md:h-full ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header */}
        <div className={`shrink-0 p-4 sm:p-5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <Link href="/" className="inline-block transition-transform duration-300 hover:scale-105">
              <h1 className="text-xl font-black tracking-tight leading-tight">
                Tractor<span className="text-[var(--color-brand-green)]">Dost</span>
                <span className="text-muted mt-0.5 block text-[10px] tracking-widest uppercase font-bold">
                  Field Agent
                </span>
              </h1>
            </Link>
          ) : (
            <span className="text-lg font-black text-[var(--color-brand-green)]">TD</span>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden md:flex rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-1.5 text-muted hover:text-foreground hover:bg-foreground/10 transition-all"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="hidden-scrollbar flex-1 space-y-1.5 overflow-y-auto px-3 pb-6 border-t border-[var(--border-subtle)] pt-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`group flex items-center rounded-2xl py-3 text-xs font-bold transition-all duration-300 ${
                  isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                } ${
                  active
                    ? 'bg-[var(--color-brand-green)] text-black shadow-md shadow-[var(--color-brand-green)]/20 font-black'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 2}
                  className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* User Footer */}
        <div className="shrink-0 p-3">
          <div className="bg-foreground/5 flex flex-col gap-2 rounded-2xl p-3 border border-[var(--border-subtle)]">
            {!isCollapsed && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-green)] to-[var(--color-brand-dark)] font-black text-black text-xs">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-black">{user?.fullName || 'Agent'}</p>
                  <p className="text-muted truncate text-[10px] font-mono">{user?.email}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={logout}
              title={isCollapsed ? 'Sign Out' : undefined}
              className={`flex items-center rounded-xl py-2 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-500/10 ${
                isCollapsed ? 'justify-center w-full px-0' : 'justify-center gap-2 w-full'
              }`}
            >
              <LogOut size={16} className="shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
