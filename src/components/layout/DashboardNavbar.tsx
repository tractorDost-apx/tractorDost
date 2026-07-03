'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { User as UserIcon, LogOut, Bell, Search, Settings, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 md:px-6 pt-4 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <nav className="spatial-panel !rounded-2xl flex items-center justify-between px-4 sm:px-6 py-2.5 w-full max-w-[1400px] pointer-events-auto shadow-lg backdrop-blur-xl border border-white/10"
        style={{ background: 'var(--nav-bg-scrolled)' }}
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <img src="/TD%20Black.png" alt="TractorDost Logo" className="h-8 w-auto logo-light" />
            <img src="/TD%20White.png" alt="TractorDost Logo" className="h-8 w-auto logo-dark" />
          </div>
          <span className="hidden sm:block text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 px-2 py-1 rounded-md border border-[var(--color-brand-green)]/20 ml-2">
            Portal
          </span>
        </Link>

        {/* Center - Global Search (Optional / Hidden on small screens) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-foreground/5 border border-transparent rounded-full py-1.5 pl-9 pr-4 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto md:ml-0">
          
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <button className="h-9 w-9 flex items-center justify-center rounded-full bg-foreground/5 text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-all relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--color-brand-orange)] border border-background shadow-sm" />
          </button>

          <div className="h-5 w-[1px] bg-foreground/10 mx-1 hidden sm:block" />

          {/* Profile Dropdown */}
          <div className="relative group ml-1">
            <button className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-foreground/10 overflow-hidden hover:border-[var(--color-brand-green)] transition-all bg-background">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={18} className="text-foreground/80" />
              )}
            </button>
            <div className="absolute top-full right-0 w-full h-4" />

            <div 
              className="absolute right-0 top-[calc(100%+0.5rem)] w-60 rounded-2xl opacity-0 translate-y-4 scale-95 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] p-2 flex flex-col gap-1 z-50"
              style={{ background: 'var(--background)', border: '1px solid var(--panel-border)', boxShadow: 'var(--card-shadow-hover)' }}
            >
              <div className="px-3 py-3 border-b border-foreground/5 mb-1 bg-foreground/5 rounded-xl">
                  <p className="text-sm font-black text-foreground tracking-tight truncate">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-muted font-medium mt-0.5 truncate">{user?.email || (user?.mobile ? `+91 ${user.mobile}` : '')}</p>
                  <div className="mt-2 inline-flex">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 px-2 py-0.5 rounded border border-[var(--color-brand-green)]/20">
                      {user?.role?.name || 'Customer'}
                    </span>
                  </div>
              </div>
              <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-foreground hover:bg-foreground/10 hover:text-[var(--color-brand-green)] rounded-xl transition-colors">
                <UserIcon size={16} /> Edit Profile
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-foreground hover:bg-foreground/10 hover:text-[var(--color-brand-green)] rounded-xl transition-colors">
                <Settings size={16} /> Account Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left w-full mt-1"
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
