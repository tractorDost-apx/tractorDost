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
  ShieldCheck
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
      { label: 'HR & Employees', href: '/admin/hr/employees', icon: Users },
      { label: 'Departments', href: '/admin/hr/departments', icon: Layers },
    ]
  },
  {
    title: 'Catalogs',
    items: [
      { label: 'Brands', href: '/admin/tractors/brands', icon: Tag },
      { label: 'Tractor Categories', href: '/admin/tractors/categories', icon: Layers },
      { label: 'Tractors', href: '/admin/tractors', icon: Tractor },
      { label: 'Tractor Specs', href: '/admin/tractors/specs', icon: FileSpreadsheet },
      { label: 'State Pricing', href: '/admin/tractors/price-by-state', icon: IndianRupee },
      { label: 'Media Gallery', href: '/admin/media', icon: ImageIcon },
      { label: 'Compare Analytics', href: '/admin/compare', icon: BarChart2 },
    ]
  },
  {
    title: 'Ecosystem',
    items: [
      { label: 'Equipment Brands', href: '/admin/equipment/brands', icon: Tag },
      { label: 'Implement Categories', href: '/admin/implements/categories', icon: Layers },
      { label: 'Implements', href: '/admin/implements', icon: Wrench },
    ]
  },
  {
    title: 'Marketplace',
    items: [
      { label: 'Used Listings', href: '/admin/used-listings', icon: Search },
      { label: 'Used Enquiries', href: '/admin/used-listings/enquiries', icon: MessageSquareText },
      { label: 'Inspections & Valuations', href: '/admin/valuation', icon: FileCheck },
      { label: 'Listing Boosts', href: '/admin/listing-boosts', icon: Layers },
    ]
  },
  {
    title: 'Sales & Finance',
    items: [
      { label: 'Leads & Enquiries', href: '/admin/leads', icon: MessageSquareText },
      { label: 'Loans & EMI', href: '/admin/finance/loan-applications', icon: Landmark },
      { label: 'Subscriptions & Billing', href: '/admin/finance/subscriptions', icon: CreditCard },
    ]
  },
  {
    title: 'Content & Support',
    items: [
      { label: 'CMS (Blogs/News)', href: '/admin/content', icon: FileText },
      { label: 'FAQs', href: '/admin/content/faqs', icon: MessageSquareText },
      { label: 'Grievances', href: '/admin/grievances', icon: AlertTriangle },
      { label: 'Reviews', href: '/admin/reviews', icon: FileCheck },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Access Control', href: '/admin/access-control', icon: ShieldCheck },
      { label: 'Audit Logs', href: '/admin/settings/audit-logs', icon: FileText },
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <aside className={`flex-shrink-0 flex flex-col gap-2 h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-full md:w-64'}`}>
      <div className="glass-panel p-4 flex-1 overflow-y-auto hidden-scrollbar flex flex-col">
        <div className="flex items-center justify-between px-2 mb-6 mt-2">
          {!isCollapsed && <h2 className="text-xl font-black text-foreground whitespace-nowrap overflow-hidden">{title}</h2>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={`p-1.5 rounded-md hover:bg-foreground/10 text-muted hover:text-foreground transition-all ${isCollapsed ? 'mx-auto' : ''}`}>
             <Menu size={20} />
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups.includes(group.title);
            const hasActiveChild = group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

            return (
              <div key={group.title} className="flex flex-col">
                <button 
                  onClick={() => !isCollapsed && toggleGroup(group.title)}
                  title={isCollapsed ? group.title : undefined}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                    isOpen || hasActiveChild ? 'text-foreground' : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  {!isCollapsed ? (
                    <>
                      <span className="opacity-80 whitespace-nowrap overflow-hidden">{group.title}</span>
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                      />
                    </>
                  ) : (
                    <span className="opacity-80 text-[10px] w-full text-center truncate">{group.title.substring(0, 3)}</span>
                  )}
                </button>
                
                <div 
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen || isCollapsed ? 'grid-rows-[1fr] opacity-100 mt-1 mb-2' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <nav className={`flex flex-col gap-1 overflow-hidden ${isCollapsed ? 'px-0' : 'px-2'}`}>
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={isCollapsed ? item.label : undefined}
                          className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            isActive 
                              ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner' 
                              : 'text-muted hover:bg-foreground/5 hover:text-foreground'
                          } ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
                        >
                          <Icon size={18} className={isActive ? 'text-[var(--color-brand-green)] shrink-0' : 'opacity-70 shrink-0'} />
                          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
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
          className={`flex w-full items-center gap-3 py-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all text-sm ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
