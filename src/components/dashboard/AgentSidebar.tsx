'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { LayoutDashboard, ClipboardCheck, LogOut, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/agent/dashboard', icon: LayoutDashboard },
  { label: 'My Inspections', href: '/agent/inspections', icon: ClipboardCheck },
];

export default function AgentSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const isActive = (href: string) => {
    if (href === '/agent/dashboard' && pathname === '/agent/dashboard') return true;
    if (href !== '/agent/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed right-6 bottom-6 z-50 rounded-full bg-[var(--color-brand-green)] p-4 text-white shadow-[var(--color-brand-green)]/30 shadow-xl transition-transform active:scale-95 md:hidden"
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
        className={`glass-panel fixed top-0 left-0 z-40 flex h-[100dvh] w-[280px] shrink-0 flex-col overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:relative md:h-full md:w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} `}
      >
        {/* Header */}
        <div className="shrink-0 p-6 md:p-8">
          <Link href="/" className="inline-block transition-transform duration-300 hover:scale-105">
            <h1 className="text-2xl font-black tracking-tight">
              Tractor<span className="text-[var(--color-brand-green)]">Dost</span>
              <span className="text-muted mt-1 block text-xs tracking-widest uppercase">
                Field Agent
              </span>
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <div className="hidden-scrollbar flex-1 space-y-2 overflow-y-auto px-4 pb-6">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
                  active
                    ? 'translate-x-1 scale-[1.02] bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/20 shadow-lg'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
                } `}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                  className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Footer */}
        <div className="shrink-0 p-4">
          <div className="bg-foreground/5 flex flex-col gap-3 rounded-[1.5rem] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-green)] to-[var(--color-brand-dark)] font-black text-white">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{user?.fullName || 'Agent'}</p>
                <p className="text-muted truncate text-xs">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-500/10"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
