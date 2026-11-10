'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import {
  LayoutDashboard,
  Users,
  Tractor,
  MessageSquareText,
  Landmark,
  Settings,
  BarChart,
  LogOut,
  Store,
  Search,
  Menu,
  X,
  Wrench,
  FileCheck,
  CreditCard,
  FileText,
  AlertTriangle,
  Tag,
  Layers,
  ChevronDown,
  FileSpreadsheet,
  IndianRupee,
  Image as ImageIcon,
  BarChart2,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  subItems?: NavSubItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Core',
    items: [{ label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Network & People',
    items: [
      { label: 'Users & Staff', href: '/admin/users', icon: Users },
      { label: 'Dealers & Showrooms', href: '/admin/dealers', icon: Store },
      { label: 'HR & Employees', href: '/admin/hr/employees', icon: Users },
      { label: 'Departments', href: '/admin/hr/departments', icon: Layers },
    ],
  },
  {
    title: 'Catalogs',
    items: [
      { label: 'Brands', href: '/admin/tractors/brands', icon: Tag },
      { label: 'Tractor Families', href: '/admin/tractors/families', icon: FolderOpen },
      { label: 'Tractor Categories', href: '/admin/tractors/categories', icon: Layers },
      { label: 'Tractors', href: '/admin/tractors', icon: Tractor },
      { label: 'Tractor Specs', href: '/admin/tractors/specs', icon: FileSpreadsheet },
      { label: 'State Pricing', href: '/admin/tractors/price-by-state', icon: IndianRupee },
      { label: 'Media Gallery', href: '/admin/media', icon: ImageIcon },
      { label: 'Compare Analytics', href: '/admin/compare', icon: BarChart2 },
    ],
  },
  {
    title: 'Ecosystem',
    items: [
      { label: 'Equipment Brands', href: '/admin/equipment/brands', icon: Tag },
      { label: 'Implement Families', href: '/admin/implements/families', icon: FolderOpen },
      { label: 'Implement Categories', href: '/admin/implements/categories', icon: Layers },
      { label: 'Implements', href: '/admin/implements', icon: Wrench },
    ],
  },
  {
    title: 'Marketplace',
    items: [
      { label: 'Used Listings', href: '/admin/used-listings', icon: Search },
      { label: 'Used Enquiries', href: '/admin/used-listings/enquiries', icon: MessageSquareText },
      { label: 'Inspections & Valuations', href: '/admin/valuation', icon: FileCheck },
      { label: 'Listing Boosts', href: '/admin/listing-boosts', icon: Layers },
      { label: 'Reviews', href: '/admin/reviews', icon: FileCheck },
    ],
  },
  {
    title: 'Sales & Finance',
    items: [
      { label: 'Leads & Enquiries', href: '/admin/leads', icon: MessageSquareText },
      { label: 'Loans & EMI', href: '/admin/finance/loan-applications', icon: Landmark },
      { label: 'Subscriptions & Billing', href: '/admin/finance/subscriptions', icon: CreditCard },
    ],
  },
  {
    title: 'Capitalization',
    items: [
      { label: 'All EMI Records', href: '/admin/finance/emi-calculations', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Content & Support',
    items: [
      {
        label: 'CMS',
        icon: FileText,
        subItems: [
          { label: 'Categories', href: '/admin/cms/categories' },
          { label: 'Blog Posts', href: '/admin/cms/posts' },
          { label: 'FAQs', href: '/admin/content/faqs' },
        ],
      },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
      { label: 'Grievances', href: '/admin/grievances', icon: AlertTriangle },
      { label: 'SEO Management', href: '/admin/seo', icon: Search },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Access Control', href: '/admin/access-control', icon: ShieldCheck },
      { label: 'Audit Logs', href: '/admin/settings/audit-logs', icon: FileText },
      { label: 'Reports', href: '/admin/reports', icon: BarChart },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Hydrate collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tractordost:admin_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (_) {}
  }, []);

  // Automatically close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle escape key to close mobile drawer
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
        localStorage.setItem('tractordost:admin_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  // Find active group and auto open it on route change
  useEffect(() => {
    const activeGroup = NAV_GROUPS.find((group) =>
      group.items.some((item) =>
        item.subItems
          ? item.subItems.some(
              (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
            )
          : item.href
            ? pathname === item.href || pathname.startsWith(item.href + '/')
            : false
      )
    );
    if (activeGroup) {
      setOpenGroups((prev) => Array.from(new Set([...prev, activeGroup.title, 'Core'])));
    } else {
      setOpenGroups(['Core']);
    }

    // Auto open dropdown if child is active
    NAV_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        if (
          item.subItems?.some(
            (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
          )
        ) {
          setOpenDropdowns((prev) => Array.from(new Set([...prev, item.label])));
        }
      });
    });
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  // Compute active page title for mobile top bar
  const activePageTitle = useMemo(() => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (item.subItems) {
          const sub = item.subItems.find(
            (s) => pathname === s.href || pathname.startsWith(s.href + '/')
          );
          if (sub) return `${item.label} • ${sub.label}`;
        } else if (
          item.href &&
          (pathname === item.href || pathname.startsWith(item.href + '/'))
        ) {
          return item.label;
        }
      }
    }
    return 'Dashboard';
  }, [pathname]);

  // Filter groups if searchFilter is entered
  const filteredGroups = useMemo(() => {
    if (!searchFilter.trim()) return NAV_GROUPS;
    const q = searchFilter.toLowerCase();
    return NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((item) => {
        if (item.label.toLowerCase().includes(q)) return true;
        if (item.subItems?.some((sub) => sub.label.toLowerCase().includes(q))) return true;
        return false;
      }),
    })).filter((g) => g.items.length > 0);
  }, [searchFilter]);

  // Reusable Nav Content Builder
  const renderNavContent = (collapsed: boolean, onSelect?: () => void) => (
    <div className="flex flex-col gap-2">
      {filteredGroups.map((group) => {
        const isOpen = searchFilter.trim() ? true : openGroups.includes(group.title);
        const hasActiveChild = group.items.some((item) =>
          item.subItems
            ? item.subItems.some(
                (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
              )
            : item.href
              ? pathname === item.href || pathname.startsWith(item.href + '/')
              : false
        );

        return (
          <div key={group.title} className="flex flex-col">
            <button
              type="button"
              onClick={() => !collapsed && toggleGroup(group.title)}
              title={collapsed ? group.title : undefined}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-black tracking-widest uppercase transition-all cursor-pointer ${
                isOpen || hasActiveChild
                  ? 'text-foreground font-black'
                  : 'text-muted hover:bg-foreground/5 hover:text-foreground'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              {!collapsed ? (
                <>
                  <span className="overflow-hidden whitespace-nowrap opacity-90">
                    {group.title}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 text-muted ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </>
              ) : (
                <span className="w-full truncate text-center text-[10px] opacity-80 font-black">
                  {group.title.substring(0, 3)}
                </span>
              )}
            </button>

            <div
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen || collapsed
                  ? 'mt-1 mb-2 grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <nav
                className={`flex flex-col gap-1 overflow-hidden ${collapsed ? 'px-0' : 'px-1'}`}
              >
                {group.items.map((item) => {
                  const Icon = item.icon;

                  // SubItem Dropdown
                  if (item.subItems && item.subItems.length > 0) {
                    const isSubActive = item.subItems.some(
                      (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
                    );
                    const isDropdownOpen = searchFilter.trim()
                      ? true
                      : openDropdowns.includes(item.label);

                    if (collapsed) {
                      return (
                        <Link
                          key={item.label}
                          href={item.subItems[0].href}
                          onClick={onSelect}
                          title={item.label}
                          className={`flex items-center justify-center rounded-xl py-2.5 text-sm font-bold transition-all ${
                            isSubActive
                              ? 'bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)] shadow-inner'
                              : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                          }`}
                        >
                          <Icon
                            size={18}
                            className={
                              isSubActive
                                ? 'shrink-0 text-[var(--color-brand-green)]'
                                : 'shrink-0 opacity-70'
                            }
                          />
                        </Link>
                      );
                    }

                    return (
                      <div key={item.label} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => toggleDropdown(item.label)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            isSubActive
                              ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] font-black'
                              : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              size={18}
                              className={
                                isSubActive
                                  ? 'shrink-0 text-[var(--color-brand-green)]'
                                  : 'shrink-0 opacity-70'
                              }
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 text-muted ${
                              isDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        <div
                          className={`grid transition-all duration-200 ease-in-out ${
                            isDropdownOpen
                              ? 'mt-1 mb-1 grid-rows-[1fr] opacity-100'
                              : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="flex flex-col gap-1 overflow-hidden border-l-2 border-[var(--color-brand-green)]/30 ml-4 pl-2.5">
                            {item.subItems.map((sub) => {
                              const isCurrent =
                                pathname === sub.href || pathname.startsWith(sub.href + '/');
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={onSelect}
                                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                                    isCurrent
                                      ? 'bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] font-black shadow-2xs'
                                      : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isCurrent
                                        ? 'bg-[var(--color-brand-green)]'
                                        : 'bg-muted/50'
                                    }`}
                                  />
                                  <span className="truncate">{sub.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Single Nav Link
                  const isActive = item.href ? pathname === item.href : false;
                  return (
                    <Link
                      key={item.href || item.label}
                      href={item.href || '#'}
                      onClick={onSelect}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-xl py-2 text-xs sm:text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)] shadow-inner font-black'
                          : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                      } ${collapsed ? 'justify-center px-0' : 'px-3'}`}
                    >
                      <Icon
                        size={18}
                        className={
                          isActive
                            ? 'shrink-0 text-[var(--color-brand-green)]'
                            : 'shrink-0 opacity-70'
                        }
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* 1. MOBILE TOP ADMIN BAR (Visible on mobile/tablet < md only) */}
      <div className="flex md:hidden items-center justify-between p-2.5 sm:p-3 rounded-2xl glass-panel border border-[var(--border-subtle)] shadow-xs w-full mb-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)] font-black shadow-2xs">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-black text-foreground truncate">Admin Portal</h2>
            <p className="text-[10px] font-bold text-[var(--color-brand-green)] truncate">
              {activePageTitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-3 py-1.5 text-xs font-black text-white shadow-md active:scale-95 transition-all cursor-pointer hover:bg-[var(--color-brand-orange)]"
        >
          <Menu size={15} />
          <span>Admin Menu</span>
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[300px] max-w-[85vw] bg-background/98 dark:bg-[#0c100e]/98 border-r border-[var(--border-subtle)] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Admin Navigation</h3>
              <p className="text-[10px] text-muted font-bold">TractorDost Management</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close Admin Menu"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-muted hover:text-foreground active:scale-95 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Filter Input */}
        <div className="p-3 border-b border-[var(--border-subtle)]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search admin sections..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.04] py-1.5 pl-8 pr-3 text-xs font-bold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Drawer Scrollable Nav List */}
        <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
          {renderNavContent(false, () => setIsMobileOpen(false))}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-[var(--border-subtle)] p-3">
          <button
            type="button"
            onClick={() => {
              setIsMobileOpen(false);
              logout();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-xs font-black text-red-500 hover:bg-red-500/20 active:scale-98 transition-all cursor-pointer"
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
        <div className="glass-panel hidden-scrollbar flex flex-1 flex-col overflow-y-auto p-4">
          <div className="mt-1 mb-5 flex items-center justify-between px-2">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
                  <ShieldCheck size={16} />
                </div>
                <h2 className="text-foreground text-lg font-black tracking-tight">Admin Panel</h2>
              </div>
            )}
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className={`hover:bg-foreground/10 text-muted hover:text-foreground rounded-xl p-1.5 transition-all cursor-pointer ${
                isCollapsed ? 'mx-auto' : ''
              }`}
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Desktop Search Filter (when not collapsed) */}
          {!isCollapsed && (
            <div className="mb-3 px-1">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Quick filter..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] py-1 pl-7 pr-2.5 text-[11px] font-bold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>
            </div>
          )}

          {renderNavContent(isCollapsed)}
        </div>

        {/* Desktop Sign Out & Credit */}
        <div className="glass-panel p-3">
          <button
            type="button"
            onClick={() => logout()}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-xs font-bold text-red-500 transition-all hover:bg-red-500/10 cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'px-3'
            }`}
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Sign Out</span>}
          </button>
          {!isCollapsed && (
            <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-center text-[10px] text-muted">
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
