import React from 'react';
import { Metadata } from 'next';
import { EmiCalculator } from '@/components/emi/emi-calculator';

// Export SEO metadata for Next.js crawler and search engine indexing
export const metadata: Metadata = {
  title: 'Tractor EMI Calculator | Tractor Dost',
  description:
    'Calculate tractor loan EMIs easily. Adjust loan amount, down payment, interest rate, and tenure. View month-by-month repayment schedules and yearly summaries.',
  keywords:
    'tractor emi calculator, farm loan calculator, agricultural finance, tractor dost, tractor price emi',
};

export default function EmiCalculatorPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center py-12 md:py-20">
      <div className="animate-fade-in relative z-10 mx-auto w-full max-w-7xl px-6">
        {/* Glow orb backdrop decoration */}
        <div className="pointer-events-none absolute top-0 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-[var(--color-brand-orange)]/5 blur-[120px]" />

        <EmiCalculator />
      </div>
    </div>
  );
}
