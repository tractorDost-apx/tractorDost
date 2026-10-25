'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { User as UserIcon, LogOut, Bell, Search, Settings, Heart, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function DashboardNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="bg-background/90 sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] shadow-sm backdrop-blur-xl transition-all">
      <nav className="flex w-full items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <img src="/TD%20Black.png" alt="TractorDost Logo" className="logo-light h-8 w-auto" />
            <img src="/TD%20White.png" alt="TractorDost Logo" className="logo-dark h-8 w-auto" />
          </div>
          <span className="ml-2 hidden rounded-md border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase sm:block">
            Portal
          </span>
        </Link>

        {/* Center - Global Search (Optional / Hidden on small screens) */}
        <div className="mx-6 hidden max-w-md flex-1 md:flex">
          <div className="group relative w-full">
            <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              suppressHydrationWarning
              className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-full border border-transparent py-1.5 pr-4 pl-9 text-sm font-medium transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 md:ml-0">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <Link
            href="/"
            title="Back to Website"
            className="bg-foreground/5 text-foreground/80 hover:text-foreground hover:bg-foreground/10 flex h-9 w-9 items-center justify-center rounded-full transition-all"
          >
            <Globe size={18} />
          </Link>

          <button
            type="button"
            suppressHydrationWarning
            className="bg-foreground/5 text-foreground/80 hover:text-foreground hover:bg-foreground/10 relative flex h-9 w-9 items-center justify-center rounded-full transition-all"
          >
            <Bell size={18} />
            <span className="border-background absolute top-2 right-2 h-2 w-2 rounded-full border bg-[var(--color-brand-orange)] shadow-sm" />
          </button>

          <div className="bg-foreground/10 mx-1 hidden h-5 w-[1px] sm:block" />

          {/* Profile Dropdown */}
          <div className="group relative ml-1">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() =>
                router.push(
                  user?.role?.name === 'ADMIN'
                    ? '/admin/dashboard'
                    : user?.role?.name === 'DEALER'
                      ? '/dealer/dashboard'
                      : '/dashboard'
                )
              }
              className="flex cursor-pointer items-center justify-center rounded-full focus:outline-none"
            >
              <UserAvatar photoUrl={user?.profilePhoto} name={user?.fullName} size={40} />
            </button>
            <div className="absolute top-full right-0 h-4 w-full" />

            <div
              className="pointer-events-none absolute top-[calc(100%+0.5rem)] right-0 z-50 flex w-60 translate-y-4 scale-95 flex-col gap-1 rounded-2xl p-2 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--panel-border)',
                boxShadow: 'var(--card-shadow-hover)',
              }}
            >
              <div className="bg-foreground/5 mb-1 rounded-xl border-b border-[var(--border-subtle)] px-3 py-3">
                <p className="text-foreground truncate text-sm font-black tracking-tight">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-muted mt-0.5 truncate text-xs font-medium">
                  {user?.email || (user?.mobile ? `+91 ${user.mobile}` : '')}
                </p>
                <div className="mt-2 inline-flex">
                  <span className="rounded border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2 py-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                    {user?.role?.name || 'Customer'}
                  </span>
                </div>
              </div>
              <Link
                href="/profile?edit=true"
                className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
              >
                <UserIcon size={16} /> Edit Profile
              </Link>
              <Link
                href="/settings"
                className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
              >
                <Settings size={16} /> Account Settings
              </Link>
              <button
                type="button"
                suppressHydrationWarning
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-500/10"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
