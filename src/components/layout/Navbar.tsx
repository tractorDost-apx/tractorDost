"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useState, useEffect } from 'react';
import { User as UserIcon, LogOut, Heart, LayoutDashboard, Menu, X, Search, Bell } from 'lucide-react';
import { DashboardNavbar } from './DashboardNavbar';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isDashboardRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || pathname?.startsWith('/dealer');

  if (isDashboardRoute) {
    return <DashboardNavbar />;
  }

  return (
    <>
      <div className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-4 md:px-6 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'top-2' : 'top-6'}`}>
        <nav
          className={`spatial-panel !rounded-2xl flex items-center justify-between px-6 py-2.5 w-full max-w-[1380px] pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'shadow-[var(--nav-shadow-scrolled)] border-[var(--border-subtle)]' : 'shadow-none border-[var(--border-subtle)] bg-background/40 backdrop-blur-md'}`}
        >

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 mr-4 lg:mr-8 shrink-0">
            <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <img src="/TD%20Black.png" alt="TractorDost Logo" className="h-8 lg:h-9 w-auto logo-light" />
              <img src="/TD%20White.png" alt="TractorDost Logo" className="h-8 lg:h-9 w-auto logo-dark" />
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden xl:flex items-center gap-1 2xl:gap-2">
            <NavDropdownMenu 
              label="Tractors" 
              pathname={pathname}
              items={[
                { title: 'New Tractors', desc: 'Explore latest models', href: '/tractors' },
                { title: 'On-Road Price', desc: 'Check accurate pricing', href: '/on-road-price' },
                { title: 'Tractor Dealers', desc: 'Find trusted dealers', href: '/dealers' },
                { title: 'Showrooms', desc: 'Find authorized showrooms', href: '/showrooms' }
              ]}
            />
            
            <NavDropdownMenu 
              label="Used Tractors" 
              pathname={pathname}
              items={[
                { title: 'Buy Used Tractors', desc: 'Verified second-hand tractors', href: '/used-tractors' },
                { title: 'Sell Your Tractor', desc: 'Get the best market price', href: '/sell-used-tractor' },
                { title: 'Valuation Tool', desc: 'Check true market value', href: '/used-tractor-valuation' }
              ]}
            />

            <NavLink href="/compare" label="Compare" pathname={pathname} highlight={true} />
            
            <NavDropdownMenu 
              label="Finance" 
              pathname={pathname}
              items={[
                { title: 'Tractor Loan', desc: 'Low interest financing', href: '/loan' },
                { title: 'EMI Calculator', desc: 'Calculate monthly payments', href: '/emi-calculator' }
              ]}
            />

            <NavDropdownMenu 
              label="Implements" 
              pathname={pathname}
              items={[
                { title: 'Farm Implements', desc: 'Rotavators, Ploughs & more', href: '/implements' },
                { title: 'Harvesters', desc: 'Combine harvesters', href: '/harvesters' },
                { title: 'Tractor Tyres', desc: 'MRF, Apollo, BKT tyres', href: '/tyres' },
                { title: 'Service Centers', desc: 'Authorized repair & service', href: '/service-centers' }
              ]}
            />

            <NavLink href="/news" label="News" pathname={pathname} />

            <NavDropdownMenu 
              label="More" 
              pathname={pathname}
              align="right"
              items={[
                { title: 'Blogs', desc: 'Farming tips and guides', href: '/blogs' },
                { title: 'Web Stories', desc: 'Quick visual updates', href: '/web-stories' },
                { title: 'Videos', desc: 'Reviews and tutorials', href: '/videos' },
                { title: 'FAQ & Support', desc: 'Get your questions answered', href: '/faq' },
                { title: 'About Us', desc: 'Our mission and story', href: '/about' },
                { title: 'Contact', desc: 'Get in touch with us', href: '/contact' }
              ]}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-4 ml-auto shrink-0">

            {/* Primary Sell CTA */}
            <Link href="/sell-used-tractor" className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] border border-[var(--color-brand-orange)]/20 hover:bg-[var(--color-brand-orange)] hover:text-white hover:shadow-[0_10px_20px_rgba(186,91,52,0.3)] transition-all duration-300 text-sm font-black tracking-wide uppercase">
              <span className="text-base leading-none mb-[2px]">+</span> Sell
            </Link>

            <div className="hidden sm:block ml-1">
              <ThemeToggle />
            </div>

            <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-all hover:bg-foreground/10 hover:text-foreground hover:scale-110 active:scale-95">
              <Search size={18} strokeWidth={2.5} />
            </button>

            <div className="h-5 w-[1px] bg-foreground/20 mx-1 hidden sm:block" />

            {isAuthenticated ? (
              <div className="flex items-center gap-1 sm:gap-2 ml-1">
                {/* Notification Bell */}
                <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-all relative hover:scale-110 active:scale-95">
                  <Bell size={18} strokeWidth={2.5} />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--color-brand-orange)] border border-background shadow-sm" />
                </button>

                <div className="relative group">
                  <button onClick={() => router.push(user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPER_ADMIN' ? '/admin/dashboard' : user?.role?.name === 'DEALER' ? '/dealer/dashboard' : '/dashboard')} className="flex items-center justify-center rounded-full focus:outline-none cursor-pointer">
                    <UserAvatar photoUrl={user?.profilePhoto} name={user?.fullName} size={40} />
                  </button>
                  <div className="absolute top-full right-0 w-full h-3" />

                {/* Dropdown Menu */}
                <div 
                  className="absolute right-0 top-[120%] w-64 rounded-[1.5rem] opacity-0 translate-y-4 scale-95 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] p-2.5 flex flex-col gap-1 z-50 backdrop-blur-3xl"
                  style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--panel-shadow)' }}
                >
                  <div className="px-3 py-3 border-b border-[var(--border-subtle)] mb-1 bg-foreground/5 rounded-xl">
                      <p className="text-sm font-black text-foreground tracking-tight truncate">{user?.fullName || 'TractorDost User'}</p>
                      <p className="text-xs text-muted font-medium mt-0.5 truncate">{user?.mobile ? `+91 ${user.mobile}` : 'Welcome'}</p>
                  </div>
                  
                  {/* Dashboard Link based on role */}
                  <Link href={user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPER_ADMIN' ? '/admin/dashboard' : user?.role?.name === 'DEALER' ? '/dealer/dashboard' : '/dashboard'} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-foreground hover:bg-foreground/10 hover:text-[var(--color-brand-green)] rounded-xl transition-colors">
                    <LayoutDashboard size={16} /> My Dashboard
                  </Link>

                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-foreground hover:bg-foreground/10 hover:text-[var(--color-brand-green)] rounded-xl transition-colors">
                    <UserIcon size={16} /> My Profile
                  </Link>
                  <Link href="/wishlist" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-foreground hover:bg-foreground/10 hover:text-[var(--color-brand-green)] rounded-xl transition-colors">
                    <Heart size={16} /> Wishlist
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left w-full mt-1"
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
                </div>
              </div>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)}
                  className="spatial-button px-6 py-2 text-sm rounded-full shadow-lg shrink-0 whitespace-nowrap"
                >
                  Login
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="xl:hidden flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-all hover:bg-foreground/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-[var(--background)]/95 backdrop-blur-3xl transition-all duration-500 xl:hidden flex flex-col pt-24 px-6 overflow-y-auto ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex flex-col gap-5 text-2xl font-black">
          <Link href="/tractors" className="hover:text-[var(--color-brand-green)] transition-colors">New Tractors</Link>
          <Link href="/used-tractors" className="hover:text-[var(--color-brand-green)] transition-colors">Used Tractors</Link>
          <Link href="/implements" className="hover:text-[var(--color-brand-green)] transition-colors">Implements & Tyres</Link>
          <Link href="/dealers" className="hover:text-[var(--color-brand-green)] transition-colors">Find Dealers</Link>
          <Link href="/loan" className="hover:text-[var(--color-brand-green)] transition-colors">Finance & EMI</Link>
          <Link href="/news" className="hover:text-[var(--color-brand-green)] transition-colors">News & Reviews</Link>

          <div className="h-[1px] bg-[var(--border-subtle)] my-2" />
          <Link href="/sell-used-tractor" className="text-[var(--color-brand-orange)] flex items-center gap-2">
            <span>+</span> Sell Your Tractor
          </Link>
        </div>
        <div className="mt-auto mb-10 flex justify-between items-center border-t border-[var(--border-subtle)] pt-6">
          <ThemeToggle />
          {!isAuthenticated ? (
            <button onClick={() => { router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`); setMobileMenuOpen(false); }} className="text-lg font-bold text-[var(--color-brand-green)]">
              Log In to Account →
            </button>
          ) : (
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-lg font-bold text-red-500">
              Log Out
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function NavLink({ href, label, highlight = false, pathname }: { href: string; label: string, highlight?: boolean, pathname: string }) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`relative px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors rounded-full group ${isActive ? 'text-foreground bg-foreground/10' : highlight ? 'text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10' : 'text-muted hover:text-foreground hover:bg-foreground/10'}`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[var(--color-brand-green)] shadow-[0_0_8px_var(--color-brand-green)]" />
      )}
    </Link>
  );
}

function DropdownLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl transition-all">
      <span className="opacity-70">{icon}</span>
      {label}
    </Link>
  );
}

function NavDropdownMenu({ label, items, pathname, align = 'center' }: { label: string, items: { title: string, desc: string, href: string }[], pathname: string, align?: 'left' | 'center' | 'right' }) {
  const isActive = items.some(item => pathname === item.href);

  const alignmentClasses = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0'
  };

  return (
    <div className="relative group/nav">
      {/* Trigger */}
      <button className={`relative px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors rounded-full flex items-center gap-1.5 ${isActive ? 'text-foreground bg-foreground/10' : 'text-muted hover:text-foreground hover:bg-foreground/10'}`}>
        {label}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 opacity-50 group-hover/nav:rotate-180 transition-transform duration-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
        {isActive && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[var(--color-brand-green)] shadow-[0_0_8px_var(--color-brand-green)]" />
        )}
      </button>

      {/* Invisible Hover Bridge - w-full ensures it doesn't overlap other icons */}
      <div className="absolute top-full left-0 w-full h-5" />

      {/* Dropdown Content */}
      <div 
        className={`absolute ${alignmentClasses[align]} top-[calc(100%+1rem)] w-[280px] rounded-[1.5rem] opacity-0 translate-y-4 scale-95 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:scale-100 group-hover/nav:pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] p-2.5 flex flex-col gap-1 z-50 backdrop-blur-3xl`}
        style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--panel-shadow)' }}
      >
        {items.map((item, i) => (
          <Link key={i} href={item.href} className="flex flex-col px-4 py-3 rounded-xl hover:bg-foreground/10 transition-colors group/item">
            <span className="text-sm font-black text-foreground group-hover/item:text-[var(--color-brand-green)] transition-colors tracking-tight">{item.title}</span>
            <span className="text-[11px] font-bold text-muted mt-0.5 leading-tight">{item.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
