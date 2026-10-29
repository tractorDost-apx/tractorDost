'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Banknote,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Percent,
  Clock,
  FileText,
  BadgeCheck,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  UserCheck,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import { loanAPI, LOAN_PARTNERS } from '@/lib/api/loan';
import { TractorLoader } from '@/components/ui/TractorLoader';

type LoanConfig = {
  id: 'NEW_TRACTOR' | 'USED_TRACTOR' | 'LOAN_AGAINST_TRACTOR' | 'IMPLEMENT';
  title: string;
  badge: string;
  tagline: string;
  description: string;
  defaultAmount: number;
  minAmount: number;
  maxAmount: number;
  defaultRate: number;
  minRate: number;
  maxRate: number;
  defaultTenureYears: number;
  maxTenureYears: number;
  fundingPct: string;
  benefits: string[];
  documents: string[];
};

const LOAN_CONFIGS: Record<string, LoanConfig> = {
  'new-tractor': {
    id: 'NEW_TRACTOR',
    title: 'New Tractor Loan',
    badge: 'Lowest Interest Rates',
    tagline: 'Turn your farming ambition into reality with up to 90% funding on brand new tractors.',
    description: 'Get instant sanction on new tractors across all major brands including Mahindra, Swaraj, Sonalika, John Deere, Massey Ferguson, and Kubota. Enjoy subsidized government interest schemes and fast disbursal.',
    defaultAmount: 600000,
    minAmount: 150000,
    maxAmount: 2500000,
    defaultRate: 8.95,
    minRate: 8.0,
    maxRate: 14.0,
    defaultTenureYears: 5,
    maxTenureYears: 7,
    fundingPct: 'Up to 90% on-road price',
    benefits: [
      'Up to 90% on-road funding including insurance & RTO charges',
      'Flexible seasonal repayment aligned with Kharif & Rabi harvest cycles',
      'Special subvention & subsidy under central/state farm mechanization schemes',
      'Zero pre-payment penalties after 12 completed EMIs',
    ],
    documents: [
      'Aadhaar Card, PAN Card & 2 Passport Photos',
      '7/12 (Saat Baara) or Khasra/Khatauni land ownership records',
      'Bank passbook or statement for the last 6 months',
      'Proforma Invoice / quotation from authorized tractor dealer',
    ],
  },
  'used-tractor': {
    id: 'USED_TRACTOR',
    title: 'Used Tractor Loan',
    badge: 'Affordable Second-Hand Credit',
    tagline: 'Finance verified, certified second-hand tractors with minimal paperwork and fair valuations.',
    description: 'Looking to purchase a quality pre-owned tractor? TractorDost partners with top banks and NBFCs to provide high-valuation financing, ensuring smooth RC transfer and peace of mind.',
    defaultAmount: 350000,
    minAmount: 100000,
    maxAmount: 1500000,
    defaultRate: 10.5,
    minRate: 9.5,
    maxRate: 16.0,
    defaultTenureYears: 4,
    maxTenureYears: 5,
    fundingPct: 'Up to 80% market valuation',
    benefits: [
      'Financing available for tractors up to 10-12 years of age',
      'Free 120-point technical & valuation inspection report',
      'Complete RC transfer and hypothecation assistance handled end-to-end',
      'Low initial down-payment options starting at just 20%',
    ],
    documents: [
      'Aadhaar Card, PAN Card & Proof of Residence',
      'Land ownership records (Minimum 1.5 acres required)',
      'Original RC Book copy of the used tractor being purchased',
      'Inspection & Valuation certificate verified by TractorDost',
    ],
  },
  'loan-against-tractor': {
    id: 'LOAN_AGAINST_TRACTOR',
    title: 'Loan Against Tractor (Mortgage / Refinance)',
    badge: 'Instant Working Capital',
    tagline: 'Unlock instant cash up to 75% of your tractor value for farm expenses, seeds, or borewells.',
    description: 'Already own a tractor? Use it as collateral to obtain immediate liquidity without selling your vehicle. Keep working your fields while enjoying quick funds in your bank account within 24-48 hours.',
    defaultAmount: 250000,
    minAmount: 80000,
    maxAmount: 1200000,
    defaultRate: 11.25,
    minRate: 10.0,
    maxRate: 17.0,
    defaultTenureYears: 3,
    maxTenureYears: 4,
    fundingPct: 'Up to 75% current market value',
    benefits: [
      'Fast disbursal in 24 to 48 hours directly into your bank account',
      'Continue using your tractor on your farm without any interruption',
      'No complex income tax returns required; approval based on vehicle equity',
      'Ideal for urgent agricultural inputs, tubewell drilling, or family ceremonies',
    ],
    documents: [
      'Aadhaar Card, PAN Card & Active Bank Account',
      'Original RC Book in the applicant’s name (clear ownership, no active hypothecation)',
      'Valid Tractor Insurance policy and Fitness Certificate (if applicable)',
      'Tractor current physical inspection photos',
    ],
  },
  'implement': {
    id: 'IMPLEMENT',
    title: 'Farm Implement & Machinery Loan',
    badge: 'Mechanize Your Farm',
    tagline: 'Finance modern farm equipment like rotavators, seed drills, laser levelers, and combine harvesters.',
    description: 'Boost agricultural productivity with modern mechanization. TractorDost offers dedicated equipment financing with low interest rates and flexible tenures suited for high-value farm implements.',
    defaultAmount: 200000,
    minAmount: 50000,
    maxAmount: 1800000,
    defaultRate: 9.75,
    minRate: 8.75,
    maxRate: 15.0,
    defaultTenureYears: 3,
    maxTenureYears: 5,
    fundingPct: 'Up to 85% invoice value',
    benefits: [
      'Covers top implements: Rotavator, Super Seeder, Disc Plough, Power Tiller',
      'Compatible with Central & State Farm Machinery Subsidies (DBT portal)',
      'Quick digital verification with minimal documentation',
      'Both bundled packages (Tractor + Implements) and standalone financing available',
    ],
    documents: [
      'Aadhaar Card, PAN Card & KYC verification',
      'Agricultural Land record (7/12 or Khasra)',
      'Proforma invoice and manufacturer warranty card from implement dealer',
      'Bank statement for the last 3 months',
    ],
  },
};

export default function LoanTypePage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const typeKey = resolvedParams.type.toLowerCase();
  const config = LOAN_CONFIGS[typeKey];

  if (!config) {
    notFound();
  }

  // Calculator state
  const [loanAmount, setLoanAmount] = useState<number>(config.defaultAmount);
  const [interestRate, setInterestRate] = useState<number>(config.defaultRate);
  const [tenureYears, setTenureYears] = useState<number>(config.defaultTenureYears);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    state: '',
    district: '',
    tractorBrand: '',
    tractorModel: '',
    landHoldingAcres: 3,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Math for EMI
  const tenureMonths = tenureYears * 12;
  const monthlyRate = interestRate / 12 / 100;
  const monthlyEmi = Math.round(
    monthlyRate === 0
      ? loanAmount / tenureMonths
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
          (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );
  const totalPayable = monthlyEmi * tenureMonths;
  const totalInterest = totalPayable - loanAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await loanAPI.applyForLoan({
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email || undefined,
        state: formData.state,
        district: formData.district || undefined,
        loanType: config.id,
        tractorBrand: formData.tractorBrand || undefined,
        tractorModel: formData.tractorModel || undefined,
        loanAmountRequested: loanAmount,
        tenureMonths,
        landHoldingAcres: Number(formData.landHoldingAcres) || undefined,
        sourcePage: `/loan/${typeKey}`,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit loan application:', err);
      setErrorMessage(
        err?.response?.data?.message || 'Failed to submit application. Please verify your details.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <Link
          href="/loan"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to All Loan Options
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative mb-14 text-center">
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <Sparkles size={14} /> {config.badge}
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-5xl">
            {config.title}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            {config.tagline}
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Feature Highlights Grid */}
      <div className="mb-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {config.benefits.map((benefit, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-border/50 bg-card/40 p-5 shadow-sm transition-all hover:border-[var(--color-brand-green)]/40"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-foreground text-sm font-semibold leading-snug">{benefit}</p>
          </div>
        ))}
      </div>

      {/* Main Interactive Section: Calculator + Application Form */}
      <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left: EMI Calculator */}
        <div className="rounded-3xl border border-border/50 bg-card/60 p-8 shadow-xl backdrop-blur-xl lg:col-span-6">
          <div className="mb-8 flex items-center gap-3 border-b border-border/40 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <Calculator size={24} />
            </div>
            <div>
              <h2 className="text-foreground text-2xl font-black">{config.title} Calculator</h2>
              <p className="text-muted-foreground text-xs">Simulate your exact monthly installments</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Amount Slider */}
            <div>
              <div className="mb-2 flex justify-between">
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Requested Amount
                </label>
                <span className="text-foreground text-lg font-black">
                  ₹ {loanAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={config.minAmount}
                max={config.maxAmount}
                step={25000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="accent-[var(--color-brand-green)] h-2 w-full cursor-pointer rounded-lg bg-secondary"
              />
              <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
                <span>₹{(config.minAmount / 100000).toFixed(1)} Lakh</span>
                <span>₹{(config.maxAmount / 100000).toFixed(1)} Lakhs</span>
              </div>
            </div>

            {/* Interest Rate Slider */}
            <div>
              <div className="mb-2 flex justify-between">
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Annual Interest Rate
                </label>
                <span className="text-foreground text-lg font-black">{interestRate}%</span>
              </div>
              <input
                type="range"
                min={config.minRate}
                max={config.maxRate}
                step={0.25}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="accent-[var(--color-brand-green)] h-2 w-full cursor-pointer rounded-lg bg-secondary"
              />
              <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
                <span>{config.minRate}%</span>
                <span>{config.maxRate}%</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div>
              <div className="mb-2 flex justify-between">
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Repayment Tenure
                </label>
                <span className="text-foreground text-lg font-black">
                  {tenureYears} Years ({tenureMonths} Months)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={config.maxTenureYears}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="accent-[var(--color-brand-green)] h-2 w-full cursor-pointer rounded-lg bg-secondary"
              />
              <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
                <span>1 Year</span>
                <span>{config.maxTenureYears} Years</span>
              </div>
            </div>
          </div>

          {/* EMI Calculation Box */}
          <div className="mt-8 rounded-2xl bg-secondary/30 p-6">
            <div className="mb-6 flex items-baseline justify-between border-b border-border/40 pb-4">
              <div>
                <span className="text-muted-foreground block text-xs font-bold uppercase tracking-wider">
                  Estimated Monthly EMI
                </span>
                <span className="text-3xl font-black text-[var(--color-brand-green)] md:text-4xl">
                  ₹ {monthlyEmi.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-muted-foreground text-xs font-medium">/ month</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block">Principal Amount:</span>
                <span className="text-foreground font-bold">₹ {loanAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Total Interest Payable:</span>
                <span className="text-foreground font-bold">₹ {totalInterest.toLocaleString('en-IN')}</span>
              </div>
              <div className="col-span-2 border-t border-border/30 pt-2">
                <span className="text-muted-foreground block">Total Repayment:</span>
                <span className="text-foreground text-sm font-black">
                  ₹ {totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dedicated Application Form */}
        <div className="rounded-3xl border border-border/50 bg-card/60 p-8 shadow-xl backdrop-blur-xl lg:col-span-6">
          <div className="mb-8 flex items-center gap-3 border-b border-border/40 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <Banknote size={24} />
            </div>
            <div>
              <h2 className="text-foreground text-2xl font-black">Apply for {config.title}</h2>
              <p className="text-muted-foreground text-xs">Direct submission to verified partner banks</p>
            </div>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)]">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-foreground mb-2 text-2xl font-black">Application Received!</h3>
              <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                Our agricultural finance desk will call you at <span className="text-foreground font-bold">+91 {formData.mobile}</span> shortly to review terms and coordinate document pickup.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 rounded-full border border-border/50 px-6 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/40"
              >
                Apply for Another Loan
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-500">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balasaheb Jadhav"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    District / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kolhapur"
                    value={formData.district}
                    onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Cultivable Land (Acres)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="e.g. 5"
                    value={formData.landHoldingAcres || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, landHoldingAcres: Number(e.target.value) }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Tractor / Equipment Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mahindra, Swaraj"
                    value={formData.tractorBrand}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tractorBrand: e.target.value }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Model or Specification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 575 DI / 744 FE"
                    value={formData.tractorModel}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tractorModel: e.target.value }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-4 text-sm font-black tracking-widest text-white uppercase shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:bg-[var(--color-brand-green)]/90 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <TractorLoader size={18} /> Processing Request...
                  </>
                ) : (
                  <>
                    Submit Loan Application <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Required Documents Section */}
      <section className="rounded-3xl border border-border/50 bg-card/40 p-8 md:p-10 mb-16">
        <h3 className="text-foreground text-2xl font-black mb-6 flex items-center gap-2">
          <FileText className="text-[var(--color-brand-green)]" size={24} />
          Required Documentation for {config.title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.documents.map((doc, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-xl bg-secondary/30 p-4 border border-border/40">
              <CheckCircle2 size={18} className="text-[var(--color-brand-green)] mt-0.5 shrink-0" />
              <span className="text-sm text-foreground font-medium">{doc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Other Loan Options Navigation */}
      <section className="text-center">
        <h3 className="text-foreground text-xl font-bold mb-6">Explore Other Financing Solutions</h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {Object.entries(LOAN_CONFIGS).map(([key, cfg]) => {
            if (key === typeKey) return null;
            return (
              <Link
                key={key}
                href={`/loan/${key}`}
                className="rounded-full border border-border/60 bg-card/60 px-5 py-2.5 text-xs font-bold text-foreground transition-all hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]"
              >
                {cfg.title} &rarr;
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
