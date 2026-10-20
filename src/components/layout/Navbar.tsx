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

  const isDashboardRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dealer') ||
    pathname?.startsWith('/agent');

  if (isDashboardRoute) {
    return <DashboardNavbar />;
  }

  return (
    <>
      <div
        className={`pointer-events-none fixed top-4 right-0 left-0 z-50 flex justify-center px-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-6 ${scrolled ? 'top-2' : 'top-5'}`}
      >
        <nav
          className={`pointer-events-auto flex w-full max-w-[1380px] items-center justify-between !rounded-2xl px-6 py-2 transition-all duration-300 border backdrop-blur-2xl ${
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
              label="Used Tractors"
              pathname={pathname}
              items={[
                {
                  title: 'Buy Used Tractors',
                  desc: 'Verified second-hand tractors',
                  href: '/used-tractors',
                },
                {
                  title: 'Sell Your Tractor',
                  desc: 'Get the best market price',
                  href: '/sell-used-tractor',
                },
                {
                  title: 'Valuation Tool',
                  desc: 'Check true market value',
                  href: '/used-tractor-valuation',
                },
              ]}
            />

            <NavLink href="/compare" label="Compare" pathname={pathname} highlight={true} />

            <NavDropdownMenu
              label="Finance"
              pathname={pathname}
              items={[
                { title: 'Tractor Loan', desc: 'Low interest financing', href: '/loan' },
                {
                  title: 'EMI Calculator',
                  desc: 'Calculate monthly payments',
                  href: '/emi-calculator',
                },
              ]}
            />

            <NavDropdownMenu
              label="Implements"
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
            {/* Primary Sell CTA */}
            <Link
              href="/sell-used-tractor"
              className="hidden items-center gap-1.5 rounded-full border border-[#ba5b34]/40 bg-[#ba5b34]/10 px-4 py-1.5 text-xs font-black tracking-wider text-[#ba5b34] uppercase transition-all duration-200 hover:border-[#ba5b34] hover:bg-[#ba5b34] hover:text-white hover:shadow-[0_4px_16px_rgba(186,91,52,0.35)] active:scale-95 sm:flex dark:border-[#ea580c]/50 dark:bg-[#ea580c]/15 dark:text-[#fb923c] dark:hover:border-[#ea580c] dark:hover:bg-[#ea580c] dark:hover:text-white dark:hover:shadow-[0_4px_16px_rgba(234,88,12,0.4)]"
            >
              <span className="mb-[1px] text-sm leading-none font-black">+</span> SELL
            </Link>

            <div className="ml-1 hidden sm:block">
              <ThemeToggle />
            </div>

            <button
              aria-label="Search"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition-all duration-200 hover:scale-105 hover:bg-black/5 hover:text-black sm:flex dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>

            <div className="mx-1 hidden h-5 w-[1px] bg-black/10 sm:block dark:bg-white/15" />

            {isAuthenticated ? (
              <div className="ml-1 flex items-center gap-1 sm:gap-2">
                {/* Notification Bell */}
                <button className="text-foreground/80 hover:text-foreground hover:bg-foreground/10 relative hidden h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 sm:flex">
                  <Bell size={18} strokeWidth={2.5} />
                  <span className="border-background absolute top-2 right-2 h-2 w-2 rounded-full border bg-[var(--color-brand-orange)] shadow-sm" />
                </button>

                <div className="group relative">
                  <button
                    onClick={() =>
                      router.push(
                        user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPER_ADMIN'
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

                    {/* Dashboard Link based on role */}
                    <Link
                      href={
                        user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPER_ADMIN'
                          ? '/admin/dashboard'
                          : user?.role?.name === 'DEALER'
                            ? '/dealer/dashboard'
                            : '/dashboard'
                      }
                      className="text-foreground hover:bg-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
                    >
                      <LayoutDashboard size={16} /> My Dashboard
                    </Link>

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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)}
                  className="shrink-0 rounded-full bg-[var(--color-brand-green)] px-6 py-2 text-sm font-bold text-white whitespace-nowrap shadow-md transition-all duration-200 hover:bg-[var(--color-brand-green-dark)] hover:shadow-lg active:scale-95"
                >
                  Login
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-zinc-700 transition-all hover:bg-black/10 hover:text-black xl:hidden dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[var(--background)]/95 px-6 pt-24 backdrop-blur-3xl transition-all duration-500 xl:hidden ${mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div className="flex flex-col gap-5 text-2xl font-black">
          <Link
            href="/tractors"
            className="transition-colors hover:text-[var(--color-brand-green)]"
          >
            New Tractors
          </Link>
          <Link
            href="/used-tractors"
            className="transition-colors hover:text-[var(--color-brand-green)]"
          >
            Used Tractors
          </Link>
          <Link
            href="/implements"
            className="transition-colors hover:text-[var(--color-brand-green)]"
          >
            Implements & Tyres
          </Link>
          <Link href="/dealers" className="transition-colors hover:text-[var(--color-brand-green)]">
            Find Dealers
          </Link>
          <Link href="/loan" className="transition-colors hover:text-[var(--color-brand-green)]">
            Finance & EMI
          </Link>
          <Link href="/news" className="transition-colors hover:text-[var(--color-brand-green)]">
            News & Reviews
          </Link>

          <div className="my-2 h-[1px] bg-[var(--border-subtle)]" />
          <Link
            href="/sell-used-tractor"
            className="flex items-center gap-2 text-[var(--color-brand-orange)]"
          >
            <span>+</span> Sell Your Tractor
          </Link>
        </div>
        <div className="mt-auto mb-10 flex items-center justify-between border-t border-[var(--border-subtle)] pt-6">
          <ThemeToggle />
          {!isAuthenticated ? (
            <button
              onClick={() => {
                router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
                setMobileMenuOpen(false);
              }}
              className="text-lg font-bold text-[var(--color-brand-green)]"
            >
              Log In to Account →
            </button>
          ) : (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="text-lg font-bold text-red-500"
            >
              Log Out
            </button>
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
    if (label === 'Implements') {
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

            if (label === 'Implements') {
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
