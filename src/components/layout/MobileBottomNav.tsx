'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Tractor, Handshake, ArrowLeftRight, PlusCircle } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  const isDashboardRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dealer') ||
    pathname?.startsWith('/agent');

  if (isDashboardRoute) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'New',
      href: '/tractors',
      icon: Tractor,
      isActive: pathname === '/tractors' || pathname?.startsWith('/tractors/'),
    },
    {
      label: 'Compare',
      href: '/compare',
      icon: ArrowLeftRight,
      isActive: pathname?.startsWith('/compare'),
    },
    {
      label: 'Used',
      href: '/used-tractors',
      icon: Handshake,
      isActive: pathname?.startsWith('/used-tractors'),
    },
    {
      label: 'Sell',
      href: '/sell-used-tractor',
      icon: PlusCircle,
      isActive: pathname === '/sell-used-tractor',
      isCta: true,
    },
  ];

  return (
    <div className="fixed bottom-0 right-0 left-0 z-40 border-t border-black/10 bg-white/95 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all duration-300 md:hidden dark:border-white/10 dark:bg-[#0c100e]/95 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          if (item.isCta) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col items-center justify-center -translate-y-2"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--color-brand-orange)] to-[#d46b3f] text-white shadow-[0_4px_16px_rgba(186,91,52,0.45)] transition-transform duration-200 active:scale-90">
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className="mt-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-orange)] uppercase">
                  SELL
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-all duration-200 active:scale-95 ${
                active
                  ? 'text-[var(--color-brand-green)]'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-brand-green)] shadow-[0_0_6px_var(--color-brand-green)]" />
                )}
              </div>
              <span
                className={`mt-1 text-[10px] font-bold tracking-tight ${
                  active ? 'font-black text-[var(--color-brand-green)]' : ''
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

