import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Tractor,
  ShieldCheck,
  Users,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Cpu,
  Globe2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About TractorDost: Empowering Indian Farmers with Smart Mechanization',
  description:
    'Learn how TractorDost is transforming agricultural machinery in India with transparent pricing, certified used tractors, instant loans, and nationwide dealer networks.',
};

const STATS = [
  { label: 'Farmers Empowered', value: '5,00,000+' },
  { label: 'Authorized Dealers', value: '1,400+' },
  { label: 'Tractor Models Listed', value: '250+' },
  { label: 'States & UTs Covered', value: '28 States' },
];

const PILLARS = [
  {
    icon: Tractor,
    title: 'Transparent Pricing & Tech Specs',
    description:
      'We bring total clarity to ex-showroom vs on-road tractor pricing, engine displacement, PTO power, hydraulic capacity, and real-world fuel mileage without hidden showroom markups.',
  },
  {
    icon: ShieldCheck,
    title: 'Certified Second-Hand Marketplace',
    description:
      'Every certified pre-owned tractor undergoes a rigorous 120-point mechanical inspection by certified engineers, complete with genuine RC verification and hypothecation checks.',
  },
  {
    icon: HeartHandshake,
    title: 'Pre-Approved Agricultural Finance',
    description:
      'Direct integration with SBI, HDFC, Mahindra Finance, and leading rural NBFCs provides farmers instant loan eligibility, customized crop-cycle EMIs, and fast disbursals.',
  },
  {
    icon: Cpu,
    title: 'Ecosystem & Service Network',
    description:
      'From laser land levelers and combine harvesters to tyre replacement and doorstep breakdown mobile vans, TractorDost connects every piece of the farm mechanization puzzle.',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pb-12 text-center">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <Sparkles size={14} /> Our Mission & Story
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Mechanizing Bharat, <span className="text-[var(--color-brand-green)]">One Tractor</span> at a Time
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            TractorDost is India's leading digital agricultural machinery platform, bridging the gap between farmers, tractor manufacturers, authorized dealerships, and financial institutions.
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Metrics Banner */}
      <div className="mb-20 grid grid-cols-2 gap-4 rounded-3xl border border-border/50 bg-card/60 p-8 shadow-xl backdrop-blur-xl sm:grid-cols-4">
        {STATS.map((stat, idx) => (
          <div key={idx} className="text-center">
            <div className="text-3xl font-black text-[var(--color-brand-green)] md:text-4xl">
              {stat.value}
            </div>
            <div className="text-muted-foreground mt-1 text-xs font-bold uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Core Mission & Vision */}
      <section className="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)]">
            Why We Built TractorDost
          </span>
          <h2 className="text-foreground text-3xl sm:text-4xl font-extrabold leading-snug">
            Empowering the Hands that Feed the Nation
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            For decades, buying a tractor or farm implement in rural India meant traveling dozens of kilometers between dealerships, dealing with opaque price markups, and struggling with complex loan paperwork.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            TractorDost was founded with a singular conviction: every farmer deserves honest information, fair market prices, accessible credit, and reliable after-sales support. We put the power back in the hands of the Indian farmer through technology built specifically for rural needs.
          </p>

          <div className="pt-2">
            <Link
              href="/tractors"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-brand-green)] px-6 py-3.5 text-xs font-black uppercase text-white shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:bg-[var(--color-brand-green)]/90"
            >
              Explore Tractor Catalog <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 overflow-hidden rounded-3xl border border-border/50 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1000&auto=format&fit=crop"
            alt="Tractor in Indian Farm"
            className="h-full w-full object-cover max-h-[420px]"
          />
        </div>
      </section>

      {/* 4 Pillars of Excellence */}
      <section className="mb-20">
        <div className="mb-12 text-center">
          <h2 className="text-foreground text-3xl font-black">Our Core Pillars</h2>
          <p className="text-muted-foreground text-sm mt-1">
            How we solve end-to-end farm mechanization challenges
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-border/50 bg-card/40 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-green)]/50 hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <Icon size={24} />
                </div>
                <h3 className="text-foreground text-lg font-black mb-2 leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="rounded-3xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/5 p-8 md:p-14 text-center backdrop-blur-xl">
        <h2 className="text-foreground text-3xl md:text-4xl font-extrabold mb-4">
          Ready to Find Your Next Tractor?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm mb-8 leading-relaxed">
          Compare specifications, simulate customized EMI plans, check government subsidies, or speak with an agricultural expert today.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/loan"
            className="rounded-2xl bg-[var(--color-brand-green)] px-8 py-4 text-xs font-black uppercase text-white shadow-xl shadow-[var(--color-brand-green)]/20 transition-all hover:bg-[var(--color-brand-green)]/90"
          >
            Check Loan Eligibility
          </Link>
          <Link
            href="/contact"
            className="rounded-2xl border border-border/60 bg-card px-8 py-4 text-xs font-bold text-foreground transition-all hover:bg-secondary"
          >
            Contact Advisor
          </Link>
        </div>
      </section>
    </div>
  );
}

