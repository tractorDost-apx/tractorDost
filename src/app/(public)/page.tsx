'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Search,
    ChevronRight,
    Flame,
    ArrowRightLeft,
    Star,
    ShieldCheck,
    Calculator,
    Banknote,
    Store,
    Wrench,
    Tractor as TractorIcon,
    Sparkles,
    Calendar,
    Clock,
    MapPin,
} from 'lucide-react';
import { tractorAPI, Tractor } from '@/lib/api/tractors';
import { brandAPI, Brand } from '@/lib/api/brands';
import { compareAPI, CompareFrequencyRecord } from '@/lib/api/compare';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import type { UsedTractorListing } from '@/types/models/used-listing';
import { formatINR } from '@/lib/utils/format-currency';

export default function PublicHomePage() {
    const router = useRouter();
    const [tractors, setTractors] = useState<Tractor[]>([]);
    const [usedTractors, setUsedTractors] = useState<UsedTractorListing[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [comparisons, setComparisons] = useState<CompareFrequencyRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Smart Matcher State
    const [searchQuery, setSearchQuery] = useState('');
    const [budget, setBudget] = useState('');
    const [hp, setHp] = useState('');

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                const [tractorsRes, brandsRes, compareRes, usedRes] = await Promise.allSettled([
                    tractorAPI.getAllTractors({ limit: 6 }), // Fetch latest for featured
                    brandAPI.getAllBrands({ limit: 8 }),
                    compareAPI.getFrequencyOfCompare({ limit: 6, sort: 'desc' }),
                    usedTractorListingAPI.getAllListings({ limit: 4, sortBy: 'newest' }),
                ]);

                if (tractorsRes.status === 'fulfilled' && tractorsRes.value.success) {
                    const list = (tractorsRes.value.data as any)?.tractors || (tractorsRes.value.data as any)?.data || [];
                    setTractors(list);
                }
                if (brandsRes.status === 'fulfilled' && brandsRes.value.success) {
                    const list = brandsRes.value.data?.data || (brandsRes.value.data as any)?.brands || [];
                    setBrands(list);
                }
                if (compareRes.status === 'fulfilled' && compareRes.value.success) {
                    const records = compareRes.value.data?.records || [];
                    setComparisons(records.filter((r: any) => r.tractorLeft && r.tractorRight));
                }
                if (usedRes.status === 'fulfilled' && usedRes.value.success && usedRes.value.data) {
                    setUsedTractors(usedRes.value.data.data || []);
                }
            } catch (error) {
                console.error('Failed to load home data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    const handleFindNow = () => {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (budget) params.set('price', budget);
        if (hp) params.set('hp', hp);
        router.push(`/tractors${params.toString() ? `?${params.toString()}` : ''}`);
    };

    const formatPrice = (price: number | null | undefined) => {
        if (!price) return 'Price on Request';
        if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakh`;
        return `₹ ${price.toLocaleString()}`;
    };

    const maxFreq = comparisons.length > 0 ? Math.max(...comparisons.map((c) => c.frequency)) : 1;

    return (
        <div className="animate-fade-in flex w-full flex-col gap-16 overflow-hidden pb-20">
            {/* 1. HERO SECTION WITH SMART MATCHER */}
            <section className="relative flex h-[600px] w-full items-center justify-center overflow-hidden bg-black">
                {/* Background Overlay & Gradient */}
                <div className="to-background absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/40" />

                {/* Abstract shapes / Image placeholder (In real app, a tractor video/image goes here) */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[var(--color-brand-green)] blur-[120px]" />
                    <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-[var(--color-brand-orange)] blur-[120px]" />
                </div>

                <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 text-center">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-5xl leading-tight font-black tracking-tight text-white uppercase md:text-7xl">
                            Find Your <span className="text-[var(--color-brand-orange)]">Perfect</span> Tractor
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg font-medium text-white/80 md:text-xl">
                            India's most trusted platform for comparing, finding, and buying the best tractors at
                            the exact on-road price.
                        </p>
                    </div>

                    {/* Smart Tractor Matcher Wizard */}
                    <div className="bg-background/20 flex w-full max-w-4xl flex-col items-center gap-4 rounded-3xl border border-[var(--border-subtle)] p-4 shadow-2xl backdrop-blur-xl md:flex-row md:p-6">
                        <div className="bg-background/50 flex w-full flex-1 items-center rounded-2xl border border-[var(--border-subtle)] px-4 py-3 transition-colors focus-within:border-[var(--color-brand-green)]/50">
                            <Search className="mr-3 text-[var(--color-brand-green)]" size={20} />
                            <input
                                type="text"
                                placeholder="Search by brand or model (e.g., Mahindra 575)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleFindNow();
                                }}
                                className="w-full border-none bg-transparent text-lg font-bold text-white placeholder:text-white/40 focus:outline-none"
                            />
                        </div>

                        <div className="flex w-full gap-4 md:w-auto">
                            <select
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="bg-background/50 appearance-none rounded-2xl border border-[var(--border-subtle)] px-6 py-3 font-bold text-white outline-none focus:border-[var(--color-brand-green)]/50"
                            >
                                <option value="" className="bg-background text-foreground">
                                    Any Budget
                                </option>
                                <option value="under5" className="bg-background text-foreground">
                                    Under 5 Lakh
                                </option>
                                <option value="5to8" className="bg-background text-foreground">
                                    5 - 8 Lakh
                                </option>
                                <option value="over8" className="bg-background text-foreground">
                                    Above 8 Lakh
                                </option>
                            </select>

                            <select
                                value={hp}
                                onChange={(e) => setHp(e.target.value)}
                                className="bg-background/50 appearance-none rounded-2xl border border-[var(--border-subtle)] px-6 py-3 font-bold text-white outline-none focus:border-[var(--color-brand-green)]/50"
                            >
                                <option value="" className="bg-background text-foreground">
                                    Any HP
                                </option>
                                <option value="under30" className="bg-background text-foreground">
                                    Under 30 HP
                                </option>
                                <option value="30to50" className="bg-background text-foreground">
                                    30 - 50 HP
                                </option>
                                <option value="over50" className="bg-background text-foreground">
                                    Above 50 HP
                                </option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleFindNow}
                            className="w-full shrink-0 rounded-2xl bg-[var(--color-brand-green)] px-8 py-4 text-lg font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/30 shadow-lg transition-all hover:bg-[var(--color-brand-orange)] md:w-auto"
                        >
                            Find Now
                        </button>
                    </div>
                </div>
            </section>

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-24 px-6">
                {/* 2. TOP BRANDS CAROUSEL */}
                <section className="flex flex-col gap-8">
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-foreground text-3xl font-black tracking-tight uppercase">
                                Explore Top Brands
                            </h2>
                            <p className="text-muted font-bold">
                                Discover the most trusted manufacturers in India.
                            </p>
                        </div>
                        <Link
                            href="/brands"
                            className="hidden items-center gap-2 text-sm font-bold tracking-wider text-[var(--color-brand-green)] uppercase transition-colors hover:text-[var(--color-brand-orange)] md:flex"
                        >
                            View All Brands <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
                        {loading
                            ? Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-foreground/5 aspect-square animate-pulse rounded-2xl"
                                />
                            ))
                            : brands.map((brand) => (
                                <Link
                                    key={brand.id}
                                    href={`/tractors?brand=${brand.id}`}
                                    className="group relative flex aspect-square flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-white p-3.5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-lg dark:border-white/10 dark:bg-card"
                                >
                                    <div className="relative mb-2.5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white p-2.5 shadow-xs transition-all duration-300 group-hover:scale-108 group-hover:shadow-md dark:border-white/10 dark:bg-white/95">
                                        {brand.logoUrl ? (
                                            <img
                                                src={brand.logoUrl}
                                                alt={brand.name}
                                                className="h-full w-full object-contain rounded-xl transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-green)]/15 to-[var(--color-brand-green)]/5 text-lg sm:text-xl font-black text-[var(--color-brand-green)]">
                                                {brand.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-foreground group-hover:text-[var(--color-brand-green)] text-center text-xs font-black tracking-wider uppercase transition-colors line-clamp-1">
                                        {brand.name}
                                    </span>
                                </Link>
                            ))}
                    </div>
                </section>

                {/* 3. FEATURED TRACTORS */}
                <section className="flex flex-col gap-8">
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-foreground text-3xl font-black tracking-tight uppercase">
                                Featured Tractors
                            </h2>
                            <p className="text-muted font-bold">
                                Handpicked high-performance machines for your farm.
                            </p>
                        </div>
                        <Link
                            href="/tractors"
                            className="hidden items-center gap-2 text-sm font-bold tracking-wider text-[var(--color-brand-green)] uppercase transition-colors hover:text-[var(--color-brand-orange)] md:flex"
                        >
                            View Inventory <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {loading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-foreground/5 h-96 animate-pulse rounded-3xl" />
                            ))
                            : tractors.map((tractor) => (
                                <Link
                                    key={tractor.id}
                                    href={`/tractors/${tractor.id}`}
                                    className="glass-panel group relative flex flex-col overflow-hidden rounded-3xl shadow-sm transition-all hover:border-[var(--color-brand-green)]/30 hover:shadow-xl"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-56 w-full overflow-hidden bg-foreground/5">
                                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-[var(--color-brand-orange)] px-2.5 py-0.5 text-[9px] font-black tracking-widest text-white uppercase shadow-md backdrop-blur-md">
                                            <Star size={10} className="fill-white" /> Top Rated
                                        </div>
                                        <img
                                            src={
                                                tractor.media && tractor.media.length > 0
                                                    ? tractor.media.find((m) => m.isPrimary)?.url || tractor.media[0].url
                                                    : '/TD%20White.png'
                                            }
                                            alt={tractor.modelName}
                                            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/TD%20White.png';
                                            }}
                                        />
                                    </div>

                                    {/* Content Section */}
                                    <div className="bg-background flex flex-1 flex-col p-6">
                                        <span className="mb-1 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
                                            {tractor.brand?.name || 'Brand'}
                                        </span>
                                        <h3 className="text-foreground mb-4 line-clamp-1 text-xl font-black">
                                            {tractor.modelName}
                                        </h3>

                                        {/* Quick Specs Grid */}
                                        <div className="mb-6 grid grid-cols-3 gap-2">
                                            <div className="bg-foreground/5 flex flex-col gap-1 rounded-xl p-2 text-center">
                                                <span className="text-foreground text-lg font-black">
                                                    {tractor.hp || '--'}
                                                </span>
                                                <span className="text-muted text-[9px] font-bold tracking-widest uppercase">
                                                    Engine HP
                                                </span>
                                            </div>
                                            <div className="bg-foreground/5 flex flex-col gap-1 rounded-xl p-2 text-center">
                                                <span className="text-foreground text-lg font-black">
                                                    {tractor.fuelType === 'DIESEL' ? 'DSL' : tractor.fuelType}
                                                </span>
                                                <span className="text-muted text-[9px] font-bold tracking-widest uppercase">
                                                    Fuel
                                                </span>
                                            </div>
                                            <div className="bg-foreground/5 flex flex-col gap-1 rounded-xl p-2 text-center">
                                                <span className="text-foreground text-lg font-black">
                                                    {tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}
                                                </span>
                                                <span className="text-muted text-[9px] font-bold tracking-widest uppercase">
                                                    Drive
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                                            <div className="flex flex-col">
                                                <span className="text-muted text-[10px] font-bold tracking-wider uppercase">
                                                    Starting Price
                                                </span>
                                                <span className="text-lg font-black text-[var(--color-brand-green)]">
                                                    {formatPrice(tractor.exShowroomPriceMin)}
                                                </span>
                                            </div>
                                            <div className="bg-foreground/5 flex h-10 w-10 items-center justify-center rounded-full transition-colors group-hover:bg-[var(--color-brand-green)] group-hover:text-white">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </section>

                {/* 4. FARMER ECOSYSTEM & SERVICES HUB */}
                <section className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-3.5 py-1 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
                            <Sparkles size={14} /> Comprehensive Agro Hub
                        </div>
                        <h2 className="text-foreground text-3xl font-black tracking-tight uppercase">
                            Everything For Your Farm Machinery
                        </h2>
                        <p className="text-muted font-bold">
                            From instant financing to verified second-hand tractors and doorstep workshop services.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* 1. Used Tractors */}
                        <Link
                            href="/used-tractors"
                            className="group bg-card relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-green)]/50 hover:shadow-xl"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110">
                                    <ShieldCheck size={28} />
                                </div>
                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black text-emerald-500 uppercase">
                                    120-Pt Check
                                </span>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-foreground text-xl font-black tracking-tight group-hover:text-[var(--color-brand-green)] transition-colors">
                                    Certified Used Tractors
                                </h3>
                                <p className="text-muted mt-2 text-xs leading-relaxed font-semibold">
                                    Browse verified second-hand tractors with RC book verification, health scores, and fair market prices.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-1.5 text-xs font-black text-[var(--color-brand-green)]">
                                Explore Market <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        {/* 2. Tractor Valuation */}
                        <Link
                            href="/used-tractor-valuation"
                            className="group bg-card relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-xl"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-110">
                                    <Calculator size={28} />
                                </div>
                                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black text-amber-500 uppercase">
                                    AI Estimator
                                </span>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-foreground text-xl font-black tracking-tight group-hover:text-amber-500 transition-colors">
                                    Used Tractor Valuation
                                </h3>
                                <p className="text-muted mt-2 text-xs leading-relaxed font-semibold">
                                    Get an instant, data-backed resale value calculation before selling or buying any pre-owned tractor.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-1.5 text-xs font-black text-amber-500">
                                Check True Value <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        {/* 3. Tractor Loans & EMI */}
                        <Link
                            href="/loan"
                            className="group bg-card relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110">
                                    <Banknote size={28} />
                                </div>
                                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black text-blue-500 uppercase">
                                    From 8.95%
                                </span>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-foreground text-xl font-black tracking-tight group-hover:text-blue-500 transition-colors">
                                    Tractor Loans & Finance
                                </h3>
                                <p className="text-muted mt-2 text-xs leading-relaxed font-semibold">
                                    Instant loan eligibility, low interest rates, seasonal crop-cycle repayment schedules, and fast disbursals.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-1.5 text-xs font-black text-blue-500">
                                Apply For Loan <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        {/* 4. Showrooms & Authorized Dealers */}
                        <Link
                            href="/showrooms"
                            className="group bg-card relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-xl"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 transition-transform group-hover:scale-110">
                                    <Store size={28} />
                                </div>
                                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-black text-purple-500 uppercase">
                                    1400+ Outlets
                                </span>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-foreground text-xl font-black tracking-tight group-hover:text-purple-500 transition-colors">
                                    Dealers & Showrooms
                                </h3>
                                <p className="text-muted mt-2 text-xs leading-relaxed font-semibold">
                                    Locate verified authorized tractor brand dealerships and schedule test drives in your district.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-1.5 text-xs font-black text-purple-500">
                                Find Dealerships <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        {/* 5. Service Centers */}
                        <Link
                            href="/service-centers"
                            className="group bg-card relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/50 hover:shadow-xl"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 transition-transform group-hover:scale-110">
                                    <Wrench size={28} />
                                </div>
                                <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black text-rose-500 uppercase">
                                    Doorstep Repair
                                </span>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-foreground text-xl font-black tracking-tight group-hover:text-rose-500 transition-colors">
                                    Service Centers & Vans
                                </h3>
                                <p className="text-muted mt-2 text-xs leading-relaxed font-semibold">
                                    Book regular maintenance, genuine parts, hydraulic troubleshooting, and emergency mobile workshop vans.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-1.5 text-xs font-black text-rose-500">
                                Book Servicing <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        {/* 6. Farm Implements & Harvesters */}
                        <Link
                            href="/harvesters"
                            className="group bg-card relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/50 hover:shadow-xl"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500 transition-transform group-hover:scale-110">
                                    <TractorIcon size={28} />
                                </div>
                                <span className="rounded-full bg-teal-500/10 px-3 py-1 text-[11px] font-black text-teal-500 uppercase">
                                    Multi-Crop
                                </span>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-foreground text-xl font-black tracking-tight group-hover:text-teal-500 transition-colors">
                                    Harvesters & Implements
                                </h3>
                                <p className="text-muted mt-2 text-xs leading-relaxed font-semibold">
                                    Self-propelled combine harvesters, paddy track harvesters, rotavators, seeders, and agricultural attachments.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-1.5 text-xs font-black text-teal-500">
                                View Machinery <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </section>

                {/* 5. VERIFIED USED TRACTORS SECTION */}
                {usedTractors.length > 0 && (
                    <section className="flex flex-col gap-8">
                        <div className="flex items-end justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-0.5 text-xs font-black text-lime-400 uppercase">
                                    <ShieldCheck size={13} /> Verified Second Hand
                                </div>
                                <h2 className="text-foreground text-3xl font-black tracking-tight uppercase">
                                    Latest Certified Used Tractors
                                </h2>
                                <p className="text-muted font-bold">
                                    Inspected pre-owned machines with transparent condition ratings and direct farmer sellers.
                                </p>
                            </div>
                            <Link
                                href="/used-tractors"
                                className="hidden items-center gap-2 text-sm font-bold tracking-wider text-[var(--color-brand-green)] uppercase transition-colors hover:text-[var(--color-brand-orange)] md:flex"
                            >
                                Browse All Used Tractors <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {usedTractors.map((tractor) => {
                                const cover =
                                    tractor.media?.[0]?.url ||
                                    (Array.isArray((tractor as any).documents) && (tractor as any).documents[0]?.url) ||
                                    null;
                                const title = `${tractor.yearOfManufacture} ${tractor.tractorBrand} ${tractor.tractorModel}`;
                                return (
                                    <Link
                                        key={tractor.id}
                                        href={`/used-tractors/details/${tractor.id}`}
                                        className="group bg-card relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-xl"
                                    >
                                        <div>
                                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-foreground/5">
                                                {cover ? (
                                                    <img
                                                        src={cover}
                                                        alt={title}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center text-muted">
                                                        <TractorIcon size={36} className="stroke-[1.5]" />
                                                        <span className="mt-1 text-[11px] font-medium">Tractor</span>
                                                    </div>
                                                )}
                                                {tractor.isCertified && (
                                                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full border border-lime-400/30 bg-black/80 px-2 py-0.5 text-[10px] font-bold text-lime-400 backdrop-blur-sm">
                                                        <ShieldCheck size={11} /> Certified
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3.5">
                                                <h3 className="text-foreground group-hover:text-[var(--color-brand-green)] text-base font-black tracking-tight line-clamp-1 transition-colors">
                                                    {title}
                                                </h3>
                                                <p className="text-muted mt-1 flex items-center gap-1 text-xs font-bold">
                                                    <MapPin size={12} className="text-[var(--color-brand-green)]" />
                                                    <span>{tractor.district}, {tractor.state}</span>
                                                </p>
                                            </div>

                                            <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-2 text-center text-xs">
                                                <div>
                                                    <span className="text-muted text-[9px] font-bold block">Year</span>
                                                    <span className="text-foreground font-black">{tractor.yearOfManufacture}</span>
                                                </div>
                                                <div className="border-x border-[var(--border-subtle)]">
                                                    <span className="text-muted text-[9px] font-bold block">Owner</span>
                                                    <span className="text-foreground font-black">
                                                        {tractor.ownership === 1 ? '1st' : tractor.ownership === 2 ? '2nd' : `${tractor.ownership}th`}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted text-[9px] font-bold block">Hours</span>
                                                    <span className="text-foreground font-black">
                                                        {tractor.hoursUsed ? `${tractor.hoursUsed}h` : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-baseline justify-between border-t border-[var(--border-subtle)] pt-2.5">
                                            <div>
                                                <span className="text-base font-black text-[var(--color-brand-green)] block">
                                                    {formatINR(tractor.askingPrice)}
                                                </span>
                                                {tractor.negotiable && (
                                                    <span className="text-muted text-[9px] font-bold uppercase">Negotiable</span>
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-[var(--color-brand-green)] group-hover:translate-x-1 transition-transform">
                                                View &rarr;
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 6. TRENDING COMPARISONS (HOT VS BATTLES) */}
                <section className="from-foreground/5 relative flex flex-col gap-8 overflow-hidden rounded-[3rem] border border-[var(--border-subtle)] bg-gradient-to-br to-transparent p-8 md:p-12">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-orange)]/5 blur-[100px]" />

                    <div className="mb-4 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                            <Flame size={24} className="animate-pulse text-red-500" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-foreground text-3xl font-black tracking-tight uppercase">
                                Hot Comparisons
                            </h2>
                            <p className="text-muted font-bold">
                                See which tractors other farmers are comparing right now.
                            </p>
                        </div>
                    </div>

                    <div className="z-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {loading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-background/50 h-48 animate-pulse rounded-3xl" />
                            ))
                            : comparisons.map((comp, idx) => {
                                const hotness = (comp.frequency / maxFreq) * 100;
                                return (
                                    <Link
                                        key={idx}
                                        href={`/compare?ids=${comp.tractorLeft?.id},${comp.tractorRight?.id}`}
                                        className="bg-background group flex cursor-pointer flex-col gap-4 rounded-3xl border border-[var(--border-subtle)] p-6 shadow-sm transition-all hover:border-[var(--color-brand-orange)]/50 hover:shadow-xl"
                                    >
                                        <div className="flex items-center justify-between">
                                            {/* Left Tractor */}
                                            <div className="flex w-5/12 flex-col items-center text-center">
                                                <div className="bg-foreground/5 mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-transparent p-2 transition-colors group-hover:border-[var(--border-subtle)]">
                                                    {comp.tractorLeft?.primaryMedia?.url ? (
                                                        <img
                                                            src={comp.tractorLeft.primaryMedia.url}
                                                            alt="L"
                                                            className="h-full w-full object-contain transition-transform group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="bg-foreground/20 h-8 w-8 rounded" />
                                                    )}
                                                </div>
                                                <span className="w-full truncate text-[10px] font-black text-[var(--color-brand-green)] uppercase">
                                                    {comp.tractorLeft?.brand?.name}
                                                </span>
                                                <span className="text-foreground w-full truncate text-xs leading-tight font-black">
                                                    {comp.tractorLeft?.modelName}
                                                </span>
                                            </div>

                                            {/* VS Icon */}
                                            <div className="flex w-2/12 flex-col items-center justify-center">
                                                <div className="bg-foreground/5 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black text-[var(--color-brand-orange)] italic">
                                                    VS
                                                </div>
                                                <div className="bg-foreground/10 absolute z-0 h-[1px] w-full" />
                                            </div>

                                            {/* Right Tractor */}
                                            <div className="flex w-5/12 flex-col items-center text-center">
                                                <div className="bg-foreground/5 mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-transparent p-2 transition-colors group-hover:border-[var(--border-subtle)]">
                                                    {comp.tractorRight?.primaryMedia?.url ? (
                                                        <img
                                                            src={comp.tractorRight.primaryMedia.url}
                                                            alt="R"
                                                            className="h-full w-full object-contain transition-transform group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="bg-foreground/20 h-8 w-8 rounded" />
                                                    )}
                                                </div>
                                                <span className="w-full truncate text-[10px] font-black text-[var(--color-brand-green)] uppercase">
                                                    {comp.tractorRight?.brand?.name}
                                                </span>
                                                <span className="text-foreground w-full truncate text-xs leading-tight font-black">
                                                    {comp.tractorRight?.modelName}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-1">
                                            <div className="text-muted flex justify-between text-[9px] font-black tracking-widest uppercase">
                                                <span>Popularity Match</span>
                                                <span>{Math.max(20, Math.round(hotness))}%</span>
                                            </div>
                                            <div className="bg-foreground/5 h-1 w-full overflow-hidden rounded-full">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-green)] to-[var(--color-brand-orange)] transition-all duration-1000"
                                                    style={{ width: `${Math.max(20, hotness)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                    </div>
                </section>
            </div>
        </div>
    );
}
