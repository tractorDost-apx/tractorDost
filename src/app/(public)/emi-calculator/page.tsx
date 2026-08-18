import React from 'react';
import { Metadata } from 'next';
import { EmiCalculator } from '@/components/emi/emi-calculator';

// Export SEO metadata for Next.js crawler and search engine indexing
export const metadata: Metadata = {
  title: 'Tractor EMI Calculator | Tractor Dost',
  description: 'Calculate tractor loan EMIs easily. Adjust loan amount, down payment, interest rate, and tenure. View month-by-month repayment schedules and yearly summaries.',
  keywords: 'tractor emi calculator, farm loan calculator, agricultural finance, tractor dost, tractor price emi',
};

export default function EmiCalculatorPage() {
  return (
    <div className="w-full min-h-screen py-12 md:py-20 flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto px-6 animate-fade-in relative z-10">
        
        {/* Glow orb backdrop decoration */}
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-[var(--color-brand-green)]/5 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-[var(--color-brand-orange)]/5 blur-[120px] pointer-events-none -z-10" />
        
        <EmiCalculator />
      </div>
    </div>
  );
}
