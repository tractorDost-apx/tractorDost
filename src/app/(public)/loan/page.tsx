'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Banknote,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Percent,
  Clock,
  FileText,
  BadgeCheck,
  ChevronDown,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { loanAPI, LOAN_PARTNERS, LoanPartner } from '@/lib/api/loan';
import { TractorLoader } from '@/components/ui/TractorLoader';

const LOAN_TYPES = [
  {
    id: 'NEW_TRACTOR',
    slug: 'new-tractor',
    title: 'New Tractor Loan',
    subtitle: 'Finance brand new tractors with lowest interest rates',
    fundingPct: 'Up to 90%',
    tenure: 'Up to 7 Years (84 Mo)',
    rate: 'Starting @ 8.95% p.a.',
    popular: true,
  },
  {
    id: 'USED_TRACTOR',
    slug: 'used-tractor',
    title: 'Used Tractor Loan',
    subtitle: 'Affordable financing for certified second-hand tractors',
    fundingPct: 'Up to 80%',
    tenure: 'Up to 5 Years (60 Mo)',
    rate: 'Starting @ 10.5% p.a.',
    popular: false,
  },
  {
    id: 'LOAN_AGAINST_TRACTOR',
    slug: 'loan-against-tractor',
    title: 'Loan Against Tractor',
    subtitle: 'Unlock instant cash by mortgaging your existing tractor',
    fundingPct: 'Up to 75% Value',
    tenure: 'Up to 3 Years (36 Mo)',
    rate: 'Starting @ 11.25% p.a.',
    popular: false,
  },
  {
    id: 'IMPLEMENT',
    slug: 'implement',
    title: 'Farm Implement Loan',
    subtitle: 'Credit for rotavators, seeders, harvesters & trailers',
    fundingPct: 'Up to 85%',
    tenure: 'Up to 4 Years (48 Mo)',
    rate: 'Starting @ 9.75% p.a.',
    popular: false,
  },
];

export default function LoanPage() {
  // Calculator state
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [tenureYears, setTenureYears] = useState<number>(5);

  // Application form state
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    state: '',
    district: '',
    loanType: 'NEW_TRACTOR' as const,
    tractorBrand: '',
    tractorModel: '',
    landHoldingAcres: 3,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate live EMI
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
        loanType: formData.loanType,
        tractorBrand: formData.tractorBrand || undefined,
        tractorModel: formData.tractorModel || undefined,
        loanAmountRequested: loanAmount,
        tenureMonths,
        landHoldingAcres: Number(formData.landHoldingAcres) || undefined,
        sourcePage: '/loan',
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit loan application:', err);
      setErrorMessage(
        err?.response?.data?.message || 'Failed to submit application. Please check your details.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="relative flex flex-col items-center justify-center pt-8 pb-14 text-center">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <Banknote size={14} /> Tractor Finance & Loans
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Tractor Loans with <span className="text-[var(--color-brand-green)]">Instant Approval</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Low interest rates starting at 8.95%, up to 90% on-road funding, and flexible seasonal repayment schedules tailored for Indian farmers.
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Loan Types Grid */}
      <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {LOAN_TYPES.map((type) => (
          <div
            key={type.id}
            className={`group relative flex flex-col rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1.5 ${
              type.popular
                ? 'border-[var(--color-brand-green)]/50 bg-card shadow-lg shadow-[var(--color-brand-green)]/10'
                : 'border-border/50 bg-card/40 hover:border-border'
            }`}
          >
            {type.popular && (
              <span className="absolute -top-3 right-6 rounded-full bg-[var(--color-brand-green)] px-3 py-1 text-[10px] font-black text-white uppercase shadow-md">
                Most Popular
              </span>
            )}
            <h3 className="text-foreground mb-1 text-xl font-black">{type.title}</h3>
            <p className="text-muted-foreground mb-4 text-xs leading-relaxed">{type.subtitle}</p>

            <div className="mt-auto space-y-2 border-t border-border/40 pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Funding:</span>
                <span className="font-bold text-foreground">{type.fundingPct}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tenure:</span>
                <span className="font-bold text-foreground">{type.tenure}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest:</span>
                <span className="font-bold text-[var(--color-brand-green)]">{type.rate}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, loanType: type.id as any }));
                document.getElementById('loan-application-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground/5 py-2.5 text-xs font-bold text-foreground transition-all group-hover:bg-[var(--color-brand-green)] group-hover:text-white"
            >
              Apply for {type.title} <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Main Two-Column: Interactive Calculator + Application Form */}
      <div id="loan-application-form" className="mb-20 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left: EMI Calculator Widget */}
        <div className="rounded-3xl border border-border/50 bg-card/60 p-8 shadow-xl backdrop-blur-xl lg:col-span-6">
          <div className="mb-8 flex items-center gap-3 border-b border-border/40 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <Calculator size={24} />
            </div>
            <div>
              <h2 className="text-foreground text-2xl font-black">EMI Calculator</h2>
              <p className="text-muted-foreground text-xs">Customize amount, interest rate and tenure</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Amount Slider */}
            <div>
              <div className="mb-2 flex justify-between">
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Loan Amount
                </label>
                <span className="text-foreground text-lg font-black">
                  ₹ {loanAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={2500000}
                step={25000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="accent-[var(--color-brand-green)] h-2 w-full cursor-pointer rounded-lg bg-secondary"
              />
              <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
                <span>₹1 Lakh</span>
                <span>₹25 Lakhs</span>
              </div>
            </div>

            {/* Interest Rate Slider */}
            <div>
              <div className="mb-2 flex justify-between">
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Interest Rate (p.a.)
                </label>
                <span className="text-foreground text-lg font-black">{interestRate}%</span>
              </div>
              <input
                type="range"
                min={8}
                max={16}
                step={0.25}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="accent-[var(--color-brand-green)] h-2 w-full cursor-pointer rounded-lg bg-secondary"
              />
              <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
                <span>8%</span>
                <span>16%</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div>
              <div className="mb-2 flex justify-between">
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Loan Tenure
                </label>
                <span className="text-foreground text-lg font-black">
                  {tenureYears} Years ({tenureMonths} Months)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="accent-[var(--color-brand-green)] h-2 w-full cursor-pointer rounded-lg bg-secondary"
              />
              <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
                <span>1 Year</span>
                <span>7 Years</span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="mt-8 rounded-2xl bg-secondary/30 p-6">
            <div className="mb-6 flex items-baseline justify-between border-b border-border/40 pb-4">
              <div>
                <span className="text-muted-foreground block text-xs font-bold uppercase tracking-wider">
                  Monthly EMI
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
                <span className="text-muted-foreground block">Total Interest:</span>
                <span className="text-foreground font-bold">₹ {totalInterest.toLocaleString('en-IN')}</span>
              </div>
              <div className="col-span-2 border-t border-border/30 pt-2">
                <span className="text-muted-foreground block">Total Payable:</span>
                <span className="text-foreground text-sm font-black">
                  ₹ {totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Instant Loan Application Form */}
        <div className="rounded-3xl border border-border/50 bg-card/60 p-8 shadow-xl backdrop-blur-xl lg:col-span-6">
          <div className="mb-8 flex items-center gap-3 border-b border-border/40 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-foreground text-2xl font-black">Apply Online</h2>
              <p className="text-muted-foreground text-xs">Get pre-approved without impacting credit score</p>
            </div>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)]">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-foreground mb-2 text-2xl font-black">Application Submitted!</h3>
              <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                Our tractor loan specialist will contact you on <span className="text-foreground font-bold">+91 {formData.mobile}</span> within 2 hours with pre-approved bank offers.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 rounded-full border border-border/50 px-6 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/40"
              >
                Submit Another Application
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
                  placeholder="e.g. Ramesh Patil"
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
                    Loan Purpose
                  </label>
                  <select
                    value={formData.loanType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, loanType: e.target.value as any }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  >
                    <option value="NEW_TRACTOR">New Tractor Loan</option>
                    <option value="USED_TRACTOR">Used Tractor Loan</option>
                    <option value="LOAN_AGAINST_TRACTOR">Loan Against Tractor</option>
                    <option value="IMPLEMENT">Implement Loan</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Land Holding (Acres)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="e.g. 4"
                    value={formData.landHoldingAcres || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, landHoldingAcres: Number(e.target.value) }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Preferred Tractor Brand
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
                    Model (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 575 DI, 744 FE"
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
                    <TractorLoader size={18} /> Submitting Application...
                  </>
                ) : (
                  <>
                    Check Pre-Approved Offers <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Partner Banks Comparison Section */}
      <section className="mb-20">
        <div className="mb-8 text-center">
          <h2 className="text-foreground text-3xl font-black">Official Banking & NBFC Partners</h2>
          <p className="text-muted-foreground text-sm">Compare rates and features from India's leading agricultural lenders</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {LOAN_PARTNERS.map((partner) => (
            <div
              key={partner.id}
              className="rounded-2xl border border-border/50 bg-card/40 p-6 shadow-sm transition-all duration-300 hover:border-[var(--color-brand-green)]/40 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-foreground font-black">{partner.name}</h4>
                <Building2 size={24} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4 text-xs">{partner.popularFor}</p>

              <div className="space-y-2 border-t border-border/30 pt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate:</span>
                  <span className="font-bold text-[var(--color-brand-green)]">
                    {partner.minRate}% - {partner.maxRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Funding:</span>
                  <span className="font-bold text-foreground">{partner.maxFundingPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Tenure:</span>
                  <span className="font-bold text-foreground">{partner.maxTenureMonths} Months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Fee:</span>
                  <span className="font-bold text-foreground">{partner.processingFeePct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Documents & Eligibility */}
      <section className="rounded-3xl border border-border/50 bg-card/40 p-8 md:p-12">
        <h2 className="text-foreground mb-8 text-center text-3xl font-black">Eligibility & Documents Checklist</h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Eligibility */}
          <div className="space-y-4">
            <h3 className="text-foreground flex items-center gap-2 text-xl font-bold">
              <UserCheck size={20} className="text-[var(--color-brand-green)]" /> Eligibility Criteria
            </h3>
            <ul className="text-muted-foreground space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-green)] mt-0.5 shrink-0" />
                <span><strong>Age:</strong> Minimum 18 years, Maximum 65 years at loan maturity.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-green)] mt-0.5 shrink-0" />
                <span><strong>Land Holding:</strong> Minimum 2 acres of cultivable agricultural land.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-green)] mt-0.5 shrink-0" />
                <span><strong>Income:</strong> Minimum annual farm or supplementary income of ₹1.5 Lakhs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-green)] mt-0.5 shrink-0" />
                <span><strong>Nationality:</strong> Resident Indian citizen with valid Aadhaar & PAN.</span>
              </li>
            </ul>
          </div>

          {/* Required Documents */}
          <div className="space-y-4">
            <h3 className="text-foreground flex items-center gap-2 text-xl font-bold">
              <FileText size={20} className="text-[var(--color-brand-green)]" /> Required Documents
            </h3>
            <ul className="text-muted-foreground space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-green)] mt-0.5 shrink-0" />
                <span><strong>KYC:</strong> Aadhaar Card, PAN Card, Voter ID, or Passport.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-green)] mt-0.5 shrink-0" />
                <span><strong>Land Proof:</strong> 7/12 Extract (Saat Baara), 8A, Khasra/Khatauni documents.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-green)] mt-0.5 shrink-0" />
                <span><strong>Bank Statement:</strong> Past 6 months bank account statement or passbook.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-green)] mt-0.5 shrink-0" />
                <span><strong>Tractor Quotation:</strong> Proforma invoice from an authorized dealer.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
