'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  LogOut,
  Heart,
  LayoutDashboard,
  Menu,
  X,
  Search,
  Bell,
  Tractor as TractorIcon,
  Handshake,
  ArrowLeftRight,
  Landmark,
  Wrench,
  MapPin,
  Newspaper,
  Sparkles,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Flame,
  Zap,
  Clock,
  Compass,
  BookOpen,
  Film,
  Building2,
  Phone,
} from 'lucide-react';
import { DashboardNavbar } from './DashboardNavbar';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { brandAPI, Brand } from '@/lib/api/brands';
import { tractorFamilyAPI, TractorFamily } from '@/lib/api/tractorFamilies';
import { equipmentBrandAPI, EquipmentBrand } from '@/lib/api/equipmentBrands';
import { implementCategoryAPI, ImplementCategory } from '@/lib/api/implementCategories';
import { implementAPI, Implement } from '@/lib/api/implements';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [mobileBrands, setMobileBrands] = useState<Brand[]>([]);
  const [mobileEqBrands, setMobileEqBrands] = useState<EquipmentBrand[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    let isMounted = true;
    brandAPI
      .getAllBrands({ isActive: 'true', limit: 20 })
      .then((res) => {
        if (isMounted && res.success) {
          setMobileBrands(res.data.data || []);
        }
      })
      .catch(() => {});

    equipmentBrandAPI
      .getAllEquipmentBrands({ isActive: 'true', limit: 20 })
      .then((res) => {
        if (isMounted && res.success) {
          setMobileEqBrands(res.data.data || []);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleMobileSubmenu = (key: string) => {
    setExpandedMobileMenu((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedMobileMenu(null);
  }, [pathname]);

  const isDashboardRoute = /^\/(dashboard|admin|dealer|agent)(\/|$)/.test(pathname || '');

  if (isDashboardRoute) {
    return <DashboardNavbar />;
  }

  return (
    <>
      <div
        className={`pointer-events-none fixed top-3.5 right-0 left-0 z-50 flex justify-center px-3.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-6 ${
          mobileMenuOpen ? 'hidden xl:flex' : 'flex'
        } ${scrolled ? 'top-2' : 'top-3.5 sm:top-5'}`}
      >
        <nav
          className={`pointer-events-auto flex w-full max-w-[1380px] items-center justify-between rounded-full lg:rounded-2xl px-3.5 py-1.5 sm:px-6 sm:py-2 transition-all duration-300 border backdrop-blur-2xl ${
            scrolled
              ? 'border-black/10 bg-white/98 shadow-[0_15px_40px_-8px_rgba(0,0,0,0.18),0_2px_4px_rgba(0,0,0,0.06)] dark:border-white/20 dark:bg-[#0c100e]/98 dark:shadow-[0_20px_50px_-8px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.1)]'
              : 'border-black/10 bg-white/95 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.06)] dark:border-white/15 dark:bg-[#0c100e]/95 dark:shadow-[0_15px_45px_-8px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)]'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="group mr-4 flex shrink-0 items-center gap-3 lg:mr-8">
            <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <img
                src="/TD%20Black.png"
                alt="TractorDost Logo"
                className="logo-light h-8 w-auto lg:h-9"
              />
              <img
                src="/TD%20White.png"
                alt="TractorDost Logo"
                className="logo-dark h-8 w-auto lg:h-9"
              />
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-1 xl:flex 2xl:gap-2">
            <NavDropdownMenu
              label="Tractors"
              pathname={pathname}
              items={[
                { title: 'BRANDS', desc: '', href: '#brands' },
                { title: 'ALL TRACTORS', desc: '', href: '/tractors' },
                { title: 'POPULAR TRACTORS', desc: '', href: '/tractors/popular' },
                { title: 'UPCOMING TRACTORS', desc: '', href: '/tractors/upcoming' },
                { title: 'LATEST TRACTORS', desc: '', href: '/tractors/latest' },
                { title: 'ELECTRIC TRACTORS', desc: '', href: '/tractors/electric' },
                { title: 'CNG TRACTORS', desc: '', href: '/tractors/cng' },
              ]}
            />

            <NavDropdownMenu
              label="Farm Equipment"
              pathname={pathname}
              items={[
                { title: 'BRANDS', desc: '', href: '#brands' },
                { title: 'ALL IMPLEMENTS', desc: '', href: '/implements' },
                { title: 'POPULAR IMPLEMENTS', desc: '', href: '/implements/popular' },
                { title: 'LATEST IMPLEMENTS', desc: '', href: '/implements/latest' },
                { title: 'ELECTRIC IMPLEMENTS', desc: '', href: '/implements/electric' },
                { title: 'CNG IMPLEMENTS', desc: '', href: '/implements/cng' },
              ]}
            />

            <NavDropdownMenu
              label="Used Tractors"
              pathname={pathname}
              items={[
                {
                  title: 'Buy Used Tractors',
                  desc: 'Verified second-hand tractors',
                  href: '/used-tractors',
                },
                {
                  title: 'Valuation Tool',
                  desc: 'Check true market value',
                  href: '/used-tractor-valuation',
                },
              ]}
            />

            <NavLink href="/compare" label="Compare" pathname={pathname} highlight={true} />

            <NavLink href="/emi-calculator" label="EMI Calculator" pathname={pathname} />

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
                { title: 'Contact', desc: 'Get in touch with us', href: '/contact' },
              ]}
            />
          </div>

          {/* Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-2 lg:gap-4">
            <div className="ml-1 hidden sm:block">
              <ThemeToggle />
            </div>

            <button
              type="button"
              suppressHydrationWarning
              aria-label="Search"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition-all duration-200 hover:scale-105 hover:bg-black/5 hover:text-black sm:flex dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>

            <div className="mx-1 hidden h-5 w-[1px] bg-black/10 sm:block dark:bg-white/15" />

            {isAuthenticated ? (
              <div className="ml-1 flex items-center gap-1 sm:gap-2">
                {/* Notification Bell */}
                <button
                  type="button"
                  suppressHydrationWarning
                  className="text-foreground/80 hover:text-foreground hover:bg-foreground/10 relative hidden h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 sm:flex"
                >
                  <Bell size={18} strokeWidth={2.5} />
                  <span className="border-background absolute top-2 right-2 h-2 w-2 rounded-full border bg-[var(--color-brand-orange)] shadow-sm" />
                </button>

                <div className="group relative">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() =>
                      {
                        const r = user?.role?.name?.toUpperCase();
                        if (r === 'ADMIN' || r === 'SUPER_ADMIN') {
                          router.push('/admin/dashboard');
                        } else if (r === 'DEALER' || r === 'DEALER_STAFF' || r === 'SELLER') {
                          router.push('/dealer/dashboard');
                        } else if (r === 'AGENT') {
                          router.push('/agent/dashboard');
                        } else {
                          router.push('/dashboard');
                        }
                      }
                    }
                    className="flex cursor-pointer items-center justify-center rounded-full focus:outline-none"
                  >
                    <UserAvatar photoUrl={user?.profilePhoto} name={user?.fullName} size={40} />
                  </button>
                  <div className="absolute top-full right-0 h-3 w-full" />

                  {/* Dropdown Menu */}
                  <div className="nav-dropdown-glass pointer-events-none absolute top-[120%] right-0 z-50 flex w-64 translate-y-4 scale-95 flex-col gap-1 rounded-[1.5rem] p-2.5 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                    <div className="bg-foreground/5 mb-1 rounded-xl border-b border-[var(--border-subtle)] px-3 py-3">
                      <p className="text-foreground truncate text-sm font-black tracking-tight">
                        {user?.fullName || 'TractorDost User'}
                      </p>
                      <p className="text-muted mt-0.5 truncate text-xs font-medium">
                        {user?.mobile ? `+91 ${user.mobile}` : 'Welcome'}
                      </p>
                    </div>

                    {/* Role-Aware Dashboard Links */}
                    {(() => {
                      const r = user?.role?.name?.toUpperCase();
                      if (r === 'ADMIN' || r === 'SUPER_ADMIN') {
                        return (
                          <>
                            <Link
                              href="/admin/dashboard"
                              className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--color-brand-green)] transition-colors"
                            >
                              <LayoutDashboard size={16} /> Admin Panel
                            </Link>
                            <Link
                              href="/dashboard"
                              className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
                            >
                              <UserIcon size={16} /> Personal Customer Hub
                            </Link>
                          </>
                        );
                      }
                      if (r === 'DEALER' || r === 'DEALER_STAFF' || r === 'SELLER') {
                        return (
                          <>
                            <Link
                              href="/dealer/dashboard"
                              className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-blue-500 transition-colors"
                            >
                              <LayoutDashboard size={16} /> Dealer Hub
                            </Link>
                            <Link
                              href="/dashboard"
                              className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
                            >
                              <UserIcon size={16} /> Personal Customer Hub
                            </Link>
                          </>
                        );
                      }
                      if (r === 'AGENT') {
                        return (
                          <>
                            <Link
                              href="/agent/dashboard"
                              className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
                            >
                              <LayoutDashboard size={16} /> Agent Portal
                            </Link>
                            <Link
                              href="/dashboard"
                              className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
                            >
                              <UserIcon size={16} /> Personal Customer Hub
                            </Link>
                          </>
                        );
                      }
                      return (
                        <Link
                          href="/dashboard"
                          className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
                        >
                          <LayoutDashboard size={16} /> My Dashboard
                        </Link>
                      );
                    })()}

                    <Link
                      href="/profile"
                      className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
                    >
                      <UserIcon size={16} /> My Profile
                    </Link>
                    <Link
                      href="/wishlist"
                      className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
                    >
                      <Heart size={16} /> Wishlist
                    </Link>
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => logout()}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)}
                  className="shrink-0 rounded-full bg-[var(--color-brand-green)] px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm font-bold text-white whitespace-nowrap shadow-md transition-all duration-200 hover:bg-[var(--color-brand-green-dark)] hover:shadow-lg active:scale-95"
                >
                  Login
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              suppressHydrationWarning
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/5 text-zinc-700 transition-all hover:bg-black/10 hover:text-black xl:hidden dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background/98 px-5 pt-3.5 pb-8 backdrop-blur-3xl transition-all duration-300 xl:hidden dark:bg-[#0c100e]/98 ${
          mobileMenuOpen ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-4'
        }`}
      >
        {/* Top Header inside Drawer */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-3">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
            <img src="/TD%20Black.png" alt="TractorDost" className="logo-light h-7 w-auto" />
            <img src="/TD%20White.png" alt="TractorDost" className="logo-dark h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Menu"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 transition-colors hover:bg-black/10 active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Search inside Drawer */}
        <div className="relative mb-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
            <Search size={15} />
          </div>
          <input
            type="text"
            placeholder="Search tractors, brands, tools..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  router.push(`/tractors?search=${encodeURIComponent(target.value.trim())}`);
                  setMobileMenuOpen(false);
                }
              }
            }}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.04] py-2 pl-9 pr-3 text-xs font-medium placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        {/* Navigation Categories with Accordion Submenus */}
        <div className="flex flex-col gap-1 text-sm">
          {/* Tractors (Accordion) */}
          <div className="flex flex-col">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => toggleMobileSubmenu('tractors')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors cursor-pointer ${
                expandedMobileMenu === 'tractors'
                  ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] font-black'
                  : 'text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-bold'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <TractorIcon size={15} />
                </div>
                <span className="text-xs">New Tractors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted">
                  {expandedMobileMenu === 'tractors' ? 'Hide' : 'Explore'}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-muted transition-transform duration-300 ${
                    expandedMobileMenu === 'tractors'
                      ? 'rotate-180 text-[var(--color-brand-green)]'
                      : ''
                  }`}
                />
              </div>
            </button>

            {/* Submenu Content */}
            {expandedMobileMenu === 'tractors' && (
              <div className="ml-3 my-1 flex flex-col gap-1 border-l-2 border-[var(--color-brand-green)]/30 pl-3 py-1.5 animate-fadeIn">
                <Link
                  href="/tractors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg bg-[var(--color-brand-green)]/10 px-3 py-2 text-xs font-black text-[var(--color-brand-green)] transition-all hover:bg-[var(--color-brand-green)]/15 active:scale-98"
                >
                  <span>All Tractors Overview</span>
                  <ChevronRight size={14} />
                </Link>

                <Link
                  href="/tractors/popular"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Flame size={14} className="text-orange-500" />
                    <span>Popular Tractors</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/tractors/latest"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Latest Tractors</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/tractors/upcoming"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock size={14} className="text-blue-500" />
                    <span>Upcoming Tractors</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/tractors/electric"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap size={14} className="text-emerald-500" />
                    <span>Electric Tractors</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/tractors/cng"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap size={14} className="text-teal-500" />
                    <span>CNG Tractors</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                {/* Popular Brands Quick Chips */}
                <div className="mt-2 rounded-xl border border-black/5 bg-foreground/[0.02] p-2.5 dark:border-white/5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                      Popular Brands
                    </span>
                    <Link
                      href="/brands"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[10px] font-black text-[var(--color-brand-green)] hover:underline"
                    >
                      All Brands →
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(mobileBrands.length > 0
                      ? mobileBrands.slice(0, 8)
                      : [
                          { id: 1, name: 'Mahindra' },
                          { id: 2, name: 'Swaraj' },
                          { id: 3, name: 'Sonalika' },
                          { id: 4, name: 'John Deere' },
                          { id: 5, name: 'Massey Ferguson' },
                          { id: 6, name: 'Farmtrac' },
                          { id: 7, name: 'Kubota' },
                          { id: 8, name: 'Eicher' },
                        ]
                    ).map((b) => (
                      <Link
                        key={b.id}
                        href={`/tractors?brand=${b.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-lg border border-black/5 bg-background px-2.5 py-1 text-[11px] font-bold text-foreground/90 shadow-2xs transition-all hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] active:scale-95 dark:border-white/10 dark:bg-white/5"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Farm Equipment (Accordion) */}
          <div className="flex flex-col">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => toggleMobileSubmenu('implements')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors cursor-pointer ${
                expandedMobileMenu === 'implements'
                  ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] font-black'
                  : 'text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-bold'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <Wrench size={15} />
                </div>
                <span className="text-xs">Farm Equipment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted">
                  {expandedMobileMenu === 'implements' ? 'Hide' : 'Explore'}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-muted transition-transform duration-300 ${
                    expandedMobileMenu === 'implements'
                      ? 'rotate-180 text-[var(--color-brand-green)]'
                      : ''
                  }`}
                />
              </div>
            </button>

            {/* Submenu Content */}
            {expandedMobileMenu === 'implements' && (
              <div className="ml-3 my-1 flex flex-col gap-1 border-l-2 border-[var(--color-brand-green)]/30 pl-3 py-1.5 animate-fadeIn">
                <Link
                  href="/implements"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg bg-[var(--color-brand-green)]/10 px-3 py-2 text-xs font-black text-[var(--color-brand-green)] transition-all hover:bg-[var(--color-brand-green)]/15 active:scale-98"
                >
                  <span>All Implements Overview</span>
                  <ChevronRight size={14} />
                </Link>

                <Link
                  href="/implements/popular"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Flame size={14} className="text-orange-500" />
                    <span>Popular Implements</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/implements/latest"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Latest Implements</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/implements/electric"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap size={14} className="text-emerald-500" />
                    <span>Electric Implements</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/implements/cng"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap size={14} className="text-teal-500" />
                    <span>CNG Implements</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                {/* Popular Machinery Categories */}
                <div className="mt-2 rounded-xl border border-black/5 bg-foreground/[0.02] p-2.5 dark:border-white/5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                      Popular Machinery
                    </span>
                    <Link
                      href="/implements"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[10px] font-black text-[var(--color-brand-green)] hover:underline"
                    >
                      All Implements →
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Rotavator', href: '/implements/rotavator' },
                      { label: 'Cultivator', href: '/implements/cultivator' },
                      { label: 'Thresher', href: '/implements/thresher' },
                      { label: 'Harvester', href: '/implements/combine-harvester' },
                      { label: 'Plough', href: '/implements/plough' },
                      { label: 'Trailer', href: '/implements/trailer' },
                      { label: 'Straw Reaper', href: '/implements/straw-reaper' },
                    ].map((cat, idx) => (
                      <Link
                        key={idx}
                        href={cat.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-lg border border-black/5 bg-background px-2.5 py-1 text-[11px] font-bold text-foreground/90 shadow-2xs transition-all hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] active:scale-95 dark:border-white/10 dark:bg-white/5"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Used Tractors (Accordion) */}
          <div className="flex flex-col">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => toggleMobileSubmenu('used')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors cursor-pointer ${
                expandedMobileMenu === 'used'
                  ? 'bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] font-black'
                  : 'text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-bold'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]">
                  <Handshake size={15} />
                </div>
                <span className="text-xs">Used Tractors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted">
                  {expandedMobileMenu === 'used' ? 'Hide' : 'Explore'}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-muted transition-transform duration-300 ${
                    expandedMobileMenu === 'used'
                      ? 'rotate-180 text-[var(--color-brand-orange)]'
                      : ''
                  }`}
                />
              </div>
            </button>

            {/* Submenu Content */}
            {expandedMobileMenu === 'used' && (
              <div className="ml-3 my-1 flex flex-col gap-1 border-l-2 border-[var(--color-brand-orange)]/30 pl-3 py-1.5 animate-fadeIn">
                <Link
                  href="/used-tractors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg bg-[var(--color-brand-orange)]/10 px-3 py-2 text-xs font-black text-[var(--color-brand-orange)] transition-all hover:bg-[var(--color-brand-orange)]/15 active:scale-98"
                >
                  <div>
                    <span className="block">Buy Used Tractors</span>
                    <span className="text-[10px] font-normal opacity-80">Verified second-hand tractors</span>
                  </div>
                  <ChevronRight size={14} />
                </Link>

                <Link
                  href="/used-tractor-valuation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div>
                    <span className="block">Valuation Tool</span>
                    <span className="text-[10px] font-normal text-muted">Check true market price for free</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>
              </div>
            )}
          </div>

          {/* Direct Link: Compare Tractors */}
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-bold"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                <ArrowLeftRight size={15} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Compare Tractors</span>
                <span className="rounded-full bg-[var(--color-brand-orange)]/15 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-[var(--color-brand-orange)]">
                  HOT
                </span>
              </div>
            </div>
            <ChevronRight size={15} className="text-muted" />
          </Link>

          {/* Direct Link: Explore Brands */}
          <Link
            href="/brands"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-bold"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                <Sparkles size={15} />
              </div>
              <span className="text-xs">Explore Brands</span>
            </div>
            <ChevronRight size={15} className="text-muted" />
          </Link>

          {/* Direct Link: EMI Calculator */}
          <Link
            href="/emi-calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-bold"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]">
                <Landmark size={15} />
              </div>
              <span className="text-xs">EMI Calculator</span>
            </div>
            <ChevronRight size={15} className="text-muted" />
          </Link>

          {/* Direct Link: Find Verified Dealers */}
          <Link
            href="/dealers"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-bold"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]">
                <MapPin size={15} />
              </div>
              <span className="text-xs">Find Verified Dealers</span>
            </div>
            <ChevronRight size={15} className="text-muted" />
          </Link>

          {/* More & Resources (Accordion) */}
          <div className="flex flex-col">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => toggleMobileSubmenu('more')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors cursor-pointer ${
                expandedMobileMenu === 'more'
                  ? 'bg-foreground/10 text-foreground font-black'
                  : 'text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-bold'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-500">
                  <Compass size={15} />
                </div>
                <span className="text-xs">More & Resources</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted">
                  {expandedMobileMenu === 'more' ? 'Hide' : 'Explore'}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-muted transition-transform duration-300 ${
                    expandedMobileMenu === 'more' ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Submenu Content */}
            {expandedMobileMenu === 'more' && (
              <div className="ml-3 my-1 flex flex-col gap-1 border-l-2 border-zinc-400/30 pl-3 py-1.5 animate-fadeIn">
                <Link
                  href="/news"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Newspaper size={14} className="text-[var(--color-brand-green)]" />
                    <span>News & Industry Updates</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/blogs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={14} className="text-amber-500" />
                    <span>Farming Blogs & Tips</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/web-stories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={14} className="text-purple-500" />
                    <span>Web Stories</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/videos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Film size={14} className="text-rose-500" />
                    <span>Videos & Tutorials</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle size={14} className="text-blue-500" />
                    <span>FAQ & Support</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 size={14} className="text-emerald-500" />
                    <span>About TractorDost</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-foreground/85 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-indigo-500" />
                    <span>Contact Us</span>
                  </div>
                  <ChevronRight size={13} className="text-muted/60" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom User Account Section */}
        <div className="mt-6 border-t border-[var(--border-subtle)] pt-4">
          {!isAuthenticated ? (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <span>Log In to Account</span>
              <ChevronRight size={15} />
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-xl bg-foreground/[0.04] p-2.5">
                <div className="flex items-center gap-3">
                  <UserAvatar photoUrl={user?.profilePhoto} name={user?.fullName} size={36} />
                  <div>
                    <p className="text-xs font-bold text-foreground truncate max-w-[160px]">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-[10px] text-muted">
                      {user?.role?.name || 'Customer'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-500 rounded-lg px-2.5 py-1 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </div>

              {/* Quick Profile & Dashboard links for Mobile User */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {(() => {
                  const r = user?.role?.name?.toUpperCase();
                  let dashboardHref = '/dashboard';
                  let dashboardLabel = 'Dashboard';
                  if (r === 'ADMIN' || r === 'SUPER_ADMIN') {
                    dashboardHref = '/admin/dashboard';
                    dashboardLabel = 'Admin Panel';
                  } else if (r === 'DEALER' || r === 'DEALER_STAFF' || r === 'SELLER') {
                    dashboardHref = '/dealer/dashboard';
                    dashboardLabel = 'Dealer Hub';
                  } else if (r === 'AGENT') {
                    dashboardHref = '/agent/dashboard';
                    dashboardLabel = 'Agent Portal';
                  }
                  return (
                    <Link
                      href={dashboardHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-black/5 dark:border-white/5 bg-foreground/[0.02] py-2 text-[11px] font-bold text-foreground hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)] transition-all"
                    >
                      <LayoutDashboard size={13} />
                      <span>{dashboardLabel}</span>
                    </Link>
                  );
                })()}

                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-black/5 dark:border-white/5 bg-foreground/[0.02] py-2 text-[11px] font-bold text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  <UserIcon size={13} />
                  <span>My Profile</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NavLink({
  href,
  label,
  highlight = false,
  pathname,
}: {
  href: string;
  label: string;
  highlight?: boolean;
  pathname: string;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`group relative rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
        isActive
          ? 'bg-black/10 text-black dark:bg-white/15 dark:text-white'
          : highlight
            ? 'text-[#ba5b34] hover:bg-[#ba5b34]/10 hover:text-[#9e4622] dark:text-[#fb923c] dark:hover:bg-[#fb923c]/20 dark:hover:text-[#fdba74]'
            : 'text-zinc-800 hover:bg-black/5 hover:text-black dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white'
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-brand-green)] shadow-[0_0_8px_var(--color-brand-green)]" />
      )}
    </Link>
  );
}

function DropdownLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-700 transition-all hover:bg-black/5 hover:text-black dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <span className="opacity-70">{icon}</span>
      {label}
    </Link>
  );
}

function NavDropdownMenu({
  label,
  items,
  pathname,
  align = 'center',
}: {
  label: string;
  items: { title: string; desc: string; href: string }[];
  pathname: string;
  align?: 'left' | 'center' | 'right';
}) {
  const isActive = items.some((item) => pathname === item.href);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isBrandOpen, setIsBrandOpen] = useState(true);

  // Tractor Family dropdown states
  const [activeBrandId, setActiveBrandId] = useState<number | null>(null);
  const [familiesByBrand, setFamiliesByBrand] = useState<Record<number, TractorFamily[]>>({});
  const [loadingBrandId, setLoadingBrandId] = useState<number | null>(null);
  const [positionRight, setPositionRight] = useState(true);
  const brandsPanelRef = useRef<HTMLDivElement>(null);

  // Equipment Brand & Categories dropdown states (for Implements)
  const [eqBrands, setEqBrands] = useState<EquipmentBrand[]>([]);
  const [activeEqBrandId, setActiveEqBrandId] = useState<number | null>(null);
  const [categoriesByBrand, setCategoriesByBrand] = useState<Record<number, ImplementCategory[]>>(
    {}
  );
  const [loadingEqBrandId, setLoadingEqBrandId] = useState<number | null>(null);

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [implementsByBrandAndCategory, setImplementsByBrandAndCategory] = useState<
    Record<string, Implement[]>
  >({});
  const [loadingCategoryId, setLoadingCategoryId] = useState<number | null>(null);

  const [positionRightCategory, setPositionRightCategory] = useState(true);
  const [positionRightImplement, setPositionRightImplement] = useState(true);

  const categoryPanelRef = useRef<HTMLDivElement>(null);
  const implementsPanelRef = useRef<HTMLDivElement>(null);

  const handleBrandHover = async (brandId: number) => {
    setActiveBrandId(brandId);
    if (familiesByBrand[brandId] === undefined && loadingBrandId !== brandId) {
      setLoadingBrandId(brandId);
      try {
        const res = await tractorFamilyAPI.getFamiliesByBrand(brandId, {
          isActive: 'true',
          limit: 100,
        });
        if (res.success) {
          setFamiliesByBrand((prev) => ({ ...prev, [brandId]: res.data.items }));
        }
      } catch (err) {
        console.error('Failed to load families for brand', brandId, err);
      } finally {
        setLoadingBrandId(null);
      }
    }
  };

  const handleEqBrandHover = async (brandId: number) => {
    setActiveEqBrandId(brandId);
    setActiveCategoryId(null); // Reset category selection when changing brand
    if (categoriesByBrand[brandId] === undefined && loadingEqBrandId !== brandId) {
      setLoadingEqBrandId(brandId);
      try {
        const res = await implementCategoryAPI.getAllActiveCategoriesFlat({ brandId });
        if (res.success) {
          setCategoriesByBrand((prev) => ({ ...prev, [brandId]: res.data }));
        }
      } catch (err) {
        console.error('Failed to load categories for brand', brandId, err);
      } finally {
        setLoadingEqBrandId(null);
      }
    }
  };

  const handleCategoryHover = async (brandId: number, categoryId: number) => {
    setActiveCategoryId(categoryId);
    const key = `${brandId}_${categoryId}`;
    if (implementsByBrandAndCategory[key] === undefined && loadingCategoryId !== categoryId) {
      setLoadingCategoryId(categoryId);
      try {
        const res = await implementAPI.getAllImplements({
          brandId,
          categoryId,
          isActive: 'true',
          limit: 100,
        });
        if (res.success) {
          setImplementsByBrandAndCategory((prev) => ({ ...prev, [key]: res.data.data }));
        }
      } catch (err) {
        console.error('Failed to load implements for brand/category', brandId, categoryId, err);
      } finally {
        setLoadingCategoryId(null);
      }
    }
  };

  useEffect(() => {
    if (activeBrandId && brandsPanelRef.current) {
      const rect = brandsPanelRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.right;
      if (spaceOnRight < 348) {
        // 328px panel width + 20px padding
        setPositionRight(false);
      } else {
        setPositionRight(true);
      }
    }
  }, [activeBrandId]);

  useEffect(() => {
    if (activeEqBrandId && categoryPanelRef.current) {
      const rect = categoryPanelRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.right;
      if (spaceOnRight < 348) {
        setPositionRightCategory(false);
      } else {
        setPositionRightCategory(true);
      }
    }
  }, [activeEqBrandId]);

  useEffect(() => {
    if (activeCategoryId && implementsPanelRef.current) {
      const rect = implementsPanelRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.right;
      if (spaceOnRight < 348) {
        setPositionRightImplement(false);
      } else {
        setPositionRightImplement(true);
      }
    }
  }, [activeCategoryId]);

  useEffect(() => {
    if (label === 'Tractors') {
      const fetchActiveBrands = async () => {
        try {
          const res = await brandAPI.getAllBrands({ isActive: 'true', limit: 100 });
          if (res.success) {
            setBrands(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load active brands', err);
        }
      };
      fetchActiveBrands();
    }
  }, [label]);

  useEffect(() => {
    if (label === 'Implements' || label === 'Farm Equipment') {
      const fetchEqBrands = async () => {
        try {
          const res = await equipmentBrandAPI.getAllEquipmentBrands({
            isActive: 'true',
            limit: 100,
          });
          if (res.success) {
            setEqBrands(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load equipment brands', err);
        }
      };
      fetchEqBrands();
    }
  }, [label]);

  const alignmentClasses = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0',
  };

  return (
    <div className="group/nav relative">
      {/* Trigger */}
      <button
        type="button"
        suppressHydrationWarning
        className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
          isActive
            ? 'bg-black/10 text-black dark:bg-white/15 dark:text-white'
            : 'text-zinc-800 hover:bg-black/5 hover:text-black dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white'
        }`}
      >
        {label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className="h-3 w-3 text-zinc-400 group-hover/nav:text-zinc-800 dark:text-zinc-500 dark:group-hover/nav:text-zinc-200 transition-transform duration-300 group-hover/nav:rotate-180"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
        {isActive && (
          <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-brand-green)] shadow-[0_0_8px_var(--color-brand-green)]" />
        )}
      </button>

      {/* Invisible Hover Bridge - w-full ensures it doesn't overlap other icons */}
      <div className="absolute top-full left-0 h-5 w-full" />

      {/* Dropdown Content */}
      <div
        className={`absolute ${alignmentClasses[align]} nav-dropdown-glass pointer-events-none top-[calc(100%+1rem)] z-50 flex w-[280px] translate-y-4 scale-95 flex-col gap-1 rounded-[1.5rem] p-2.5 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nav:pointer-events-auto group-hover/nav:translate-y-0 group-hover/nav:scale-100 group-hover/nav:opacity-100`}
      >
        {items.map((item, i) => {
          if (item.title === 'BRANDS') {
            if (label === 'Tractors') {
              return (
                <div key={i} className="group/submenu relative flex flex-col">
                  {/* Trigger Row */}
                  <div className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-zinc-900 transition-all hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]">
                    <span className="text-sm font-black tracking-tight uppercase">Brands</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                      className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 transition-transform duration-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>

                  {/* Submenu Content */}
                  <div
                    ref={brandsPanelRef}
                    className="pointer-events-none absolute top-0 left-full z-[60] w-[328px] scale-95 pl-2 opacity-0 transition-all duration-300 group-hover/submenu:pointer-events-auto group-hover/submenu:scale-100 group-hover/submenu:opacity-100"
                  >
                    <div
                      className="nav-dropdown-glass relative flex w-full flex-col gap-1 rounded-[1.5rem] p-2.5"
                      onMouseLeave={() => setActiveBrandId(null)}
                    >
                      {/* Scrollable Brands List (displays exactly 3 complete items) */}
                      <div className="brand-scrollbar flex max-h-[112px] flex-col gap-0.5 overflow-x-hidden overflow-y-auto pr-1">
                        {brands.length === 0 ? (
                          <span className="block shrink-0 px-3 py-2.5 text-xs font-bold italic text-zinc-400 dark:text-zinc-500">
                            No active brands
                          </span>
                        ) : (
                          brands.map((brand) => {
                            const displayName = brand.name.toLowerCase().includes('tractor')
                              ? brand.name
                              : `${brand.name} Tractors`;
                            const isBrandActive = activeBrandId === brand.id;
                            return (
                              <Link
                                key={brand.id}
                                href={`/tractors?brand=${brand.id}`}
                                onMouseEnter={() => handleBrandHover(brand.id)}
                                className={`block w-full shrink-0 truncate rounded-lg px-3 py-2.5 text-xs leading-normal font-black whitespace-nowrap uppercase transition-colors ${
                                  isBrandActive
                                    ? 'bg-black/5 text-[var(--color-brand-green)] dark:bg-white/10'
                                    : 'text-zinc-700 hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]'
                                }`}
                              >
                                {displayName}
                              </Link>
                            );
                          })
                        )}
                      </div>

                      {/* Separator / Divider */}
                      <div className="my-1 h-[1px] shrink-0 bg-black/10 dark:bg-white/10" />

                      {/* ALL BRANDS (outside scroll) */}
                      <Link
                        href="/brands"
                        className="block w-full shrink-0 rounded-lg px-3 py-2.5 text-xs leading-normal font-black tracking-wider uppercase text-zinc-900 transition-colors hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]"
                      >
                        All Brands
                      </Link>

                      {/* Family Dropdown Panel (renders nested next to Brands panel) */}
                      <div
                        className={`absolute ${positionRight ? 'left-full pl-2' : 'right-full pr-2'} top-0 z-[70] w-[328px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          activeBrandId
                            ? 'pointer-events-auto scale-100 opacity-100'
                            : 'pointer-events-none scale-95 opacity-0'
                        }`}
                      >
                        <div className="nav-dropdown-glass flex w-full flex-col gap-1 rounded-[1.5rem] p-2.5">
                          {loadingBrandId === activeBrandId ? (
                            <div className="flex shrink-0 items-center justify-center py-6">
                              <span className="animate-pulse text-xs font-bold text-zinc-400 dark:text-zinc-500">
                                Loading families...
                              </span>
                            </div>
                          ) : activeBrandId && familiesByBrand[activeBrandId]?.length > 0 ? (
                            <>
                              {/* Scrollable Families List */}
                              <div className="brand-scrollbar flex max-h-[112px] flex-col gap-0.5 overflow-x-hidden overflow-y-auto pr-1">
                                {familiesByBrand[activeBrandId].map((family) => (
                                  <Link
                                    key={family.id}
                                    href={`/tractors?brand=${activeBrandId}&family=${family.id}`}
                                    className="block w-full shrink-0 truncate rounded-lg px-3 py-2.5 text-xs leading-normal font-black whitespace-nowrap uppercase text-zinc-700 transition-colors hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]"
                                  >
                                    {family.name}
                                  </Link>
                                ))}
                              </div>

                              {/* Separator / Divider */}
                              <div className="my-1 h-[1px] shrink-0 bg-black/10 dark:bg-white/10" />

                              {/* ALL FAMILIES button */}
                              <Link
                                href={`/tractors?brand=${activeBrandId}`}
                                className="flex w-full shrink-0 items-center justify-between rounded-lg px-3 py-2.5 text-xs leading-normal font-black tracking-wider uppercase text-zinc-900 transition-colors hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]"
                              >
                                <span>All Families</span>
                                <span className="text-xs leading-none">→</span>
                              </Link>
                            </>
                          ) : (
                            <div className="flex shrink-0 items-center justify-center px-3 py-6">
                              <span className="text-xs font-bold italic text-zinc-400 dark:text-zinc-500">
                                No families available
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (label === 'Implements' || label === 'Farm Equipment') {
              const activeBrandCategories =
                activeEqBrandId !== null ? categoriesByBrand[activeEqBrandId] || [] : [];
              const activeCategory =
                activeCategoryId !== null
                  ? activeBrandCategories.find((c: ImplementCategory) => c.id === activeCategoryId)
                  : undefined;
              const activeCategorySlug = activeCategory?.slug || '';
              const activeBrandSlug =
                activeEqBrandId !== null
                  ? eqBrands.find((b) => b.id === activeEqBrandId)?.slug || ''
                  : '';

              return (
                <div key={i} className="group/submenu relative flex flex-col">
                  {/* Trigger Row */}
                  <div className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-zinc-900 transition-all hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]">
                    <span className="text-sm font-black tracking-tight uppercase">Brands</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                      className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 transition-transform duration-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>

                  {/* Submenu Content */}
                  <div className="pointer-events-none absolute top-0 left-full z-[60] w-[328px] scale-95 pl-2 opacity-0 transition-all duration-300 group-hover/submenu:pointer-events-auto group-hover/submenu:scale-100 group-hover/submenu:opacity-100">
                    <div
                      className="nav-dropdown-glass relative flex w-full flex-col gap-1 rounded-[1.5rem] p-2.5"
                      onMouseLeave={() => setActiveEqBrandId(null)}
                    >
                      {/* Scrollable Brands List */}
                      <div className="brand-scrollbar flex max-h-[112px] flex-col gap-0.5 overflow-x-hidden overflow-y-auto pr-1">
                        {eqBrands.length === 0 ? (
                          <span className="block shrink-0 px-3 py-2.5 text-xs font-bold italic text-zinc-400 dark:text-zinc-500">
                            No active brands
                          </span>
                        ) : (
                          eqBrands.map((brand) => {
                            const displayName = brand.name.toLowerCase().includes('implement')
                              ? brand.name
                              : `${brand.name} Implements`;
                            const isBrandActive = activeEqBrandId === brand.id;
                            return (
                              <Link
                                key={brand.id}
                                href={`/implements?brand=${brand.slug}`}
                                onMouseEnter={() => handleEqBrandHover(brand.id)}
                                className={`block w-full shrink-0 truncate rounded-lg px-3 py-2.5 text-xs leading-normal font-black whitespace-nowrap uppercase transition-colors ${
                                  isBrandActive
                                    ? 'bg-black/5 text-[var(--color-brand-green)] dark:bg-white/10'
                                    : 'text-zinc-700 hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]'
                                }`}
                              >
                                {displayName}
                              </Link>
                            );
                          })
                        )}
                      </div>

                      {/* Separator / Divider */}
                      <div className="my-1 h-[1px] shrink-0 bg-black/10 dark:bg-white/10" />

                      {/* ALL BRANDS (outside scroll) */}
                      <Link
                        href="/implements"
                        className="block w-full shrink-0 rounded-lg px-3 py-2.5 text-xs leading-normal font-black tracking-wider uppercase text-zinc-900 transition-colors hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]"
                      >
                        All Brands
                      </Link>

                      {/* Category Dropdown Panel (renders nested next to Brands panel) */}
                      <div
                        ref={categoryPanelRef}
                        className={`absolute ${positionRightCategory ? 'left-full pl-2' : 'right-full pr-2'} top-0 z-[70] w-[328px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          activeEqBrandId
                            ? 'pointer-events-auto scale-100 opacity-100'
                            : 'pointer-events-none scale-95 opacity-0'
                        }`}
                      >
                        <div
                          className="nav-dropdown-glass flex w-full flex-col gap-1 rounded-[1.5rem] p-2.5"
                          onMouseLeave={() => setActiveCategoryId(null)}
                        >
                          {loadingEqBrandId === activeEqBrandId ? (
                            <div className="flex shrink-0 items-center justify-center py-6">
                              <span className="animate-pulse text-xs font-bold text-zinc-400 dark:text-zinc-500">
                                Loading categories...
                              </span>
                            </div>
                          ) : activeEqBrandId && activeBrandCategories.length > 0 ? (
                            <>
                              {/* Scrollable Categories List */}
                              <div className="brand-scrollbar flex max-h-[112px] flex-col gap-1 overflow-x-hidden overflow-y-auto pr-1">
                                {(() => {
                                  const parents = activeBrandCategories.filter(
                                    (c: ImplementCategory) => c.parentId === null
                                  );
                                  const childrenMap: Record<number, ImplementCategory[]> = {};
                                  activeBrandCategories.forEach((c: ImplementCategory) => {
                                    const pId = c.parentId;
                                    if (pId !== null && pId !== undefined) {
                                      if (!childrenMap[pId]) {
                                        childrenMap[pId] = [];
                                      }
                                      childrenMap[pId].push(c);
                                    }
                                  });

                                  return parents.map((parent) => {
                                    const children = childrenMap[parent.id] || [];
                                    if (children.length > 0) {
                                      return (
                                        <div
                                          key={parent.id}
                                          className="mt-1 flex shrink-0 flex-col gap-0.5"
                                        >
                                          <div className="px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                                            {parent.name}
                                          </div>
                                          {children.map((child) => {
                                            const isChildActive = activeCategoryId === child.id;
                                            return (
                                              <Link
                                                key={child.id}
                                                href={`/implements/${child.slug}?brand=${activeBrandSlug}`}
                                                onMouseEnter={() =>
                                                  handleCategoryHover(activeEqBrandId, child.id)
                                                }
                                                className={`block w-full shrink-0 truncate rounded-lg px-3 py-2 pl-5 text-xs leading-normal font-black whitespace-nowrap uppercase transition-colors ${
                                                  isChildActive
                                                    ? 'bg-black/5 text-[var(--color-brand-green)] dark:bg-white/10'
                                                    : 'text-zinc-700 hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]'
                                                }`}
                                              >
                                                {child.name}
                                              </Link>
                                            );
                                          })}
                                        </div>
                                      );
                                    } else {
                                      const isParentActive = activeCategoryId === parent.id;
                                      return (
                                        <Link
                                          key={parent.id}
                                          href={`/implements/${parent.slug}?brand=${activeBrandSlug}`}
                                          onMouseEnter={() =>
                                            handleCategoryHover(activeEqBrandId, parent.id)
                                          }
                                          className={`block w-full shrink-0 truncate rounded-lg px-3 py-2.5 text-xs leading-normal font-black whitespace-nowrap uppercase transition-colors ${
                                            isParentActive
                                              ? 'bg-black/5 text-[var(--color-brand-green)] dark:bg-white/10'
                                              : 'text-zinc-700 hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]'
                                          }`}
                                        >
                                          {parent.name}
                                        </Link>
                                      );
                                    }
                                  });
                                })()}
                              </div>
                            </>
                          ) : (
                            <div className="flex shrink-0 items-center justify-center px-3 py-6">
                              <span className="text-xs font-bold italic text-zinc-400 dark:text-zinc-500">
                                No categories available
                              </span>
                            </div>
                          )}

                          {/* Implement Models Dropdown Panel (renders nested next to Category panel) */}
                          <div
                            ref={implementsPanelRef}
                            className={`absolute ${positionRightImplement ? 'left-full pl-2' : 'right-full pr-2'} top-0 z-[80] w-[328px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                              activeCategoryId
                                ? 'pointer-events-auto scale-100 opacity-100'
                                : 'pointer-events-none scale-95 opacity-0'
                            }`}
                          >
                            <div className="nav-dropdown-glass flex w-full flex-col gap-1 rounded-[1.5rem] p-2.5">
                              {loadingCategoryId === activeCategoryId ? (
                                <div className="flex shrink-0 items-center justify-center py-6">
                                  <span className="animate-pulse text-xs font-bold text-zinc-400 dark:text-zinc-500">
                                    Loading implements...
                                  </span>
                                </div>
                              ) : activeCategoryId &&
                                implementsByBrandAndCategory[
                                  `${activeEqBrandId}_${activeCategoryId}`
                                ]?.length > 0 ? (
                                <>
                                  {/* Scrollable Implements List */}
                                  <div className="brand-scrollbar flex max-h-[112px] flex-col gap-0.5 overflow-x-hidden overflow-y-auto pr-1">
                                    {implementsByBrandAndCategory[
                                      `${activeEqBrandId}_${activeCategoryId}`
                                    ].map((implement) => (
                                      <Link
                                        key={implement.id}
                                        href={`/implements/${implement.category?.slug}/${implement.slug}`}
                                        className="block w-full shrink-0 truncate rounded-lg px-3 py-2.5 text-xs leading-normal font-black whitespace-nowrap uppercase text-zinc-700 transition-colors hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]"
                                      >
                                        {implement.modelName}
                                      </Link>
                                    ))}
                                  </div>

                                  {/* Separator / Divider */}
                                  <div className="my-1 h-[1px] shrink-0 bg-black/10 dark:bg-white/10" />

                                  {/* ALL ITEMS link */}
                                  <Link
                                    href={`/implements/${activeCategorySlug}?brand=${activeBrandSlug}`}
                                    className="flex w-full shrink-0 items-center justify-between rounded-lg px-3 py-2.5 text-xs leading-normal font-black tracking-wider uppercase text-zinc-900 transition-colors hover:bg-black/5 hover:text-[var(--color-brand-green)] dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-[var(--color-brand-green)]"
                                  >
                                    <span>All models</span>
                                    <span className="text-xs leading-none">→</span>
                                  </Link>
                                </>
                              ) : (
                                <div className="flex shrink-0 items-center justify-center px-3 py-6">
                                  <span className="text-xs font-bold italic text-zinc-400 dark:text-zinc-500">
                                    No implements available
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          }

          return (
            <Link
              key={i}
              href={item.href}
              className="group/item flex flex-col rounded-xl px-4 py-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="text-sm font-bold tracking-tight text-zinc-900 transition-colors group-hover/item:text-[var(--color-brand-green)] dark:text-zinc-100 dark:group-hover/item:text-[var(--color-brand-green)]">
                {item.title}
              </span>
              {item.desc && (
                <span className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {item.desc}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
