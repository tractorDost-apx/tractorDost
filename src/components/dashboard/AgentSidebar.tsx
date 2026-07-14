'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardCheck,
  LogOut,
  Menu,
  X
} from 'lucide-react';

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
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-[var(--color-brand-green)] text-white rounded-full shadow-xl shadow-[var(--color-brand-green)]/30 active:scale-95 transition-transform"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed md:relative top-0 left-0 h-[100dvh] md:h-full z-40
        w-[280px] md:w-64 shrink-0 
        glass-panel overflow-hidden flex flex-col
        transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 md:p-8 shrink-0">
          <Link href="/" className="inline-block hover:scale-105 transition-transform duration-300">
            <h1 className="text-2xl font-black tracking-tight">
              Tractor<span className="text-[var(--color-brand-green)]">Dost</span>
              <span className="block text-xs uppercase tracking-widest text-muted mt-1">Field Agent</span>
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto hidden-scrollbar px-4 pb-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group
                  ${active 
                    ? 'bg-[var(--color-brand-green)] text-white shadow-lg shadow-[var(--color-brand-green)]/20 scale-[1.02] translate-x-1' 
                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
                  }
                `}
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
        <div className="p-4 shrink-0">
          <div className="bg-foreground/5 rounded-[1.5rem] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-green)] to-[var(--color-brand-dark)] flex items-center justify-center text-white font-black shrink-0">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black truncate">{user?.fullName || 'Agent'}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
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
