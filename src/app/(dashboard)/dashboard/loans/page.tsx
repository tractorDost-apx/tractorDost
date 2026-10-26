'use client';

import React from 'react';
import {
  Landmark,
  FileText,
  CheckCircle2,
  Clock,
  Calculator,
  ShieldCheck,
  ArrowRight,
  IndianRupee,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

export default function LoansPage() {
  const loans = [
    {
      id: 'LN-2024-8472',
      amount: '₹4,50,000',
      tractor: 'Mahindra 575 DI SP Plus',
      financier: 'HDFC Bank Agri Finance',
      date: '12 Oct 2024',
      status: 'In Verification',
      currentStep: 2, // 1: Submitted, 2: Docs, 3: Inspection, 4: Sanctioned, 5: Disbursed
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      id: 'LN-2024-9183',
      amount: '₹3,20,000',
      tractor: 'Swaraj 744 FE',
      financier: 'Mahindra Finance',
      date: '05 Sep 2024',
      status: 'Approved & Sanctioned',
      currentStep: 4,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
  ];

  const steps = [
    'Application Submitted',
    'Document Verification',
    'Tractor Inspection',
    'Credit Sanction',
    'Disbursal',
  ];

  return (
    <div className="animate-fade-in flex h-full flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground mb-1 text-3xl font-black">Tractor Loans & Finance</h1>
          <p className="text-muted text-xs font-medium sm:text-sm">
            Track your active tractor financing applications and partner approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/emi-calculator"
            className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-background px-4 py-2.5 text-xs font-bold text-foreground transition-colors hover:border-[var(--color-brand-green)]"
          >
            <Calculator size={16} /> Calculate EMI
          </Link>
          <Link
            href="/loan"
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 active:scale-95"
          >
            <Landmark size={18} /> Apply for Loan
          </Link>
        </div>
      </div>

      {/* Loan Journey Stepper Information Banner */}
      <div className="glass-panel overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-6">
        <h3 className="text-foreground mb-1 text-base font-black">Tractor Loan Process at TractorDost</h3>
        <p className="text-muted mb-6 text-xs font-medium">
          Fast approval with minimal paperwork for farmers in Maharashtra.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-foreground/5 flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] p-3.5 text-center"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-[10px] font-black text-white">
                {idx + 1}
              </span>
              <p className="text-foreground mt-2 text-xs font-bold leading-tight">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Loan Applications List */}
      <div className="space-y-4">
        {loans.map((loan) => (
          <div
            key={loan.id}
            className="glass-panel flex flex-col justify-between gap-6 rounded-3xl border border-[var(--border-subtle)] p-6 transition-all hover:border-[var(--color-brand-green)]/40 hover:shadow-md md:flex-row md:items-center"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                <Landmark size={24} />
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-foreground text-lg font-black">{loan.tractor}</h3>
                  <span className="text-muted rounded-md bg-foreground/5 px-2 py-0.5 text-xs font-mono font-bold">
                    {loan.id}
                  </span>
                </div>
                <p className="text-muted text-xs font-bold">
                  Financier: {loan.financier} • Applied on: {loan.date}
                </p>

                {/* Progress Bar */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 w-36 overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className="h-full bg-[var(--color-brand-green)] rounded-full transition-all"
                      style={{ width: `${(loan.currentStep / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-muted text-[11px] font-bold">
                    Step {loan.currentStep} of 5
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-4 md:flex-col md:items-end md:border-t-0 md:pt-0">
              <p className="text-foreground text-2xl font-black">{loan.amount}</p>
              <div
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black uppercase ${loan.bg} ${loan.color}`}
              >
                <Clock size={14} /> {loan.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
