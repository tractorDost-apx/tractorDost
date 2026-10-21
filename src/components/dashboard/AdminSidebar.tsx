'use client';

import React, { useState, useEffect } from 'react';
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
      { label: 'Grievances', href: '/admin/grievances', icon: AlertTriangle },
      { label: 'Reviews', href: '/admin/reviews', icon: FileCheck },
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

  // By default, open 'Core' and the group containing the active link
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const title = 'Admin Panel';

  return (
    <aside
      className={`flex h-full flex-shrink-0 flex-col gap-2 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-full md:w-64'}`}
    >
      <div className="glass-panel hidden-scrollbar flex flex-1 flex-col overflow-y-auto p-4">
        <div className="mt-2 mb-6 flex items-center justify-between px-2">
          {!isCollapsed && (
            <h2 className="text-foreground overflow-hidden text-xl font-black whitespace-nowrap">
              {title}
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hover:bg-foreground/10 text-muted hover:text-foreground rounded-md p-1.5 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups.includes(group.title);
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
                  onClick={() => !isCollapsed && toggleGroup(group.title)}
                  title={isCollapsed ? group.title : undefined}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-black tracking-widest uppercase transition-all ${
                    isOpen || hasActiveChild
                      ? 'text-foreground'
                      : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  {!isCollapsed ? (
                    <>
                      <span className="overflow-hidden whitespace-nowrap opacity-80">
                        {group.title}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </>
                  ) : (
                    <span className="w-full truncate text-center text-[10px] opacity-80">
                      {group.title.substring(0, 3)}
                    </span>
                  )}
                </button>

                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen || isCollapsed
                      ? 'mt-1 mb-2 grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <nav
                    className={`flex flex-col gap-1 overflow-hidden ${isCollapsed ? 'px-0' : 'px-2'}`}
                  >
                    {group.items.map((item) => {
                      const Icon = item.icon;

                      // Item with subItems (dropdown)
                      if (item.subItems && item.subItems.length > 0) {
                        const isSubActive = item.subItems.some(
                          (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
                        );
                        const isDropdownOpen = openDropdowns.includes(item.label);

                        if (isCollapsed) {
                          // Collapsed mode: direct link to first subitem or icon
                          return (
                            <Link
                              key={item.label}
                              href={item.subItems[0].href}
                              title={item.label}
                              className={`flex items-center justify-center rounded-xl py-2.5 text-sm font-bold transition-all ${
                                isSubActive
                                  ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner'
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
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                                isSubActive
                                  ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                                  : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon
                                  size={18}
                                  className={
                                    isSubActive
                                      ? 'shrink-0 text-[var(--color-brand-green)]'
                                      : 'shrink-0 opacity-70'
                                  }
                                />
                                <span className="overflow-hidden whitespace-nowrap">
                                  {item.label}
                                </span>
                              </div>
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${
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
                              <div className="flex flex-col gap-1 overflow-hidden border-l border-white/10 ml-5 pl-2">
                                {item.subItems.map((sub) => {
                                  const isCurrent =
                                    pathname === sub.href || pathname.startsWith(sub.href + '/');
                                  return (
                                    <Link
                                      key={sub.href}
                                      href={sub.href}
                                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                                        isCurrent
                                          ? 'bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] font-bold shadow-sm'
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
                                      <span className="overflow-hidden whitespace-nowrap">
                                        {sub.label}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Standard single link
                      const isActive = item.href ? pathname === item.href : false;
                      return (
                        <Link
                          key={item.href || item.label}
                          href={item.href || '#'}
                          title={isCollapsed ? item.label : undefined}
                          className={`flex items-center gap-3 rounded-xl py-2.5 text-sm font-bold transition-all ${
                            isActive
                              ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner'
                              : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                          } ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
                        >
                          <Icon
                            size={18}
                            className={
                              isActive
                                ? 'shrink-0 text-[var(--color-brand-green)]'
                                : 'shrink-0 opacity-70'
                            }
                          />
                          {!isCollapsed && (
                            <span className="overflow-hidden whitespace-nowrap">{item.label}</span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-4">
        <button
          onClick={() => logout()}
          title={isCollapsed ? 'Sign Out' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500/10 ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
