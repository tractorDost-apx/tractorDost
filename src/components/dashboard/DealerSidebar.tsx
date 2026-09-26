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
  Layers
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dealer/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/dealer/profile', icon: User },
  { label: 'Brand', href: '/dealer/brands', icon: Layers },
  { label: 'Inventory', href: '/dealer/inventory', icon: Tractor },
  { label: 'Leads & Enquiries', href: '/dealer/leads', icon: MessageSquareText },
  { label: 'Services', href: '/dealer/services', icon: Wrench },
  { label: 'Analytics', href: '/dealer/analytics', icon: BarChart },
];

export default function DealerSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-3 h-full">
      <div className="glass-panel p-4 flex-1 overflow-y-auto hidden-scrollbar">
        <div className="space-y-1 mb-6">
          <div className="px-3 py-2 mb-3 flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground leading-tight">Dealer Hub</h2>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Dealership Portal</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 shadow-sm' 
                      : 'text-muted hover:bg-foreground/5 hover:text-foreground border border-transparent'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[var(--color-brand-green)]' : 'text-muted/70'} />
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
          className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
