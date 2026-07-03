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
  Wrench,
  FileCheck,
  CreditCard,
  FileText,
  AlertTriangle,
  Tag,
  Layers,
  ChevronDown
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'Core',
    items: [
      { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Network & People',
    items: [
      { label: 'Users & Staff', href: '/admin/users', icon: Users },
      { label: 'Dealers & Showrooms', href: '/admin/dealers', icon: Store },
    ]
  },
  {
    title: 'Catalogs',
    items: [
      { label: 'Brands', href: '/admin/tractors/brands', icon: Tag },
      { label: 'Tractor Categories', href: '/admin/tractors/categories', icon: Layers },
      { label: 'Tractors', href: '/admin/tractors', icon: Tractor },
      { label: 'Implements', href: '/admin/implements', icon: Wrench },
    ]
  },
  {
    title: 'Marketplace',
    items: [
      { label: 'Used Listings', href: '/admin/used-listings', icon: Search },
      { label: 'Inspections & Valuations', href: '/admin/inspections', icon: FileCheck },
    ]
  },
  {
    title: 'Sales & Finance',
    items: [
      { label: 'Leads & Enquiries', href: '/admin/leads', icon: MessageSquareText },
      { label: 'Loans & EMI', href: '/admin/loans', icon: Landmark },
      { label: 'Subscriptions & Billing', href: '/admin/subscriptions', icon: CreditCard },
    ]
  },
  {
    title: 'Content & Support',
    items: [
      { label: 'CMS (Blogs/News)', href: '/admin/content', icon: FileText },
      { label: 'Grievances & Reviews', href: '/admin/grievances', icon: AlertTriangle },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Reports', href: '/admin/reports', icon: BarChart },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  // By default, open 'Core' and the group containing the active link
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    const activeGroup = NAV_GROUPS.find(group => 
      group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
    );
    if (activeGroup) {
      setOpenGroups(prev => Array.from(new Set([...prev, activeGroup.title, 'Core'])));
    } else {
      setOpenGroups(['Core']);
    }
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };
  
  const title = user?.role?.name === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Panel';

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2 h-full">
      <div className="glass-panel p-4 flex-1 overflow-y-auto hidden-scrollbar">
        <h2 className="text-xl font-black text-foreground px-2 mb-6 mt-2">{title}</h2>
        
        <div className="flex flex-col gap-2">
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups.includes(group.title);
            const hasActiveChild = group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

            return (
              <div key={group.title} className="flex flex-col">
                <button 
                  onClick={() => toggleGroup(group.title)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                    isOpen || hasActiveChild ? 'text-foreground' : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  <span className="opacity-80">{group.title}</span>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <div 
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 mt-1 mb-2' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <nav className="flex flex-col gap-1 overflow-hidden px-2">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            isActive 
                              ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner' 
                              : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                          }`}
                        >
                          <Icon size={18} className={isActive ? 'text-[var(--color-brand-green)]' : 'opacity-70'} />
                          {item.label}
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
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all text-sm"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
