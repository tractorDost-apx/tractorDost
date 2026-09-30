import React, { useState } from 'react';
import { Copy, Check, Share2, Info, CloudUpload, AlertCircle } from 'lucide-react';
import { EmiCalculatorInputs, EmiCalculatorResults } from './emi-calculator.types';
import { formatIndianCurrency } from './emi-calculator.utils';

interface EmiCalculatorResultProps {
  inputs: EmiCalculatorInputs;
  results: EmiCalculatorResults;
}

export const EmiCalculatorResult: React.FC<EmiCalculatorResultProps> = ({ inputs, results }) => {
  const { vehiclePrice, downPayment, downPaymentPercent, interestRate, tenureValue, tenureUnit } =
    inputs;
  const { loanAmount, monthlyEmi, totalInterest, totalPayable } = results;

  const [copied, setCopied] = useState(false);

  const getTenureString = () => {
    if (tenureUnit === 'years') {
      return `${tenureValue} Year${tenureValue > 1 ? 's' : ''} (${tenureValue * 12} Months)`;
    }
    return `${tenureValue} Month${tenureValue > 1 ? 's' : ''}`;
  };

  const handleShare = () => {
    const shareText = `🚜 Tractor Dost - EMI Calculation Summary 🚜
---------------------------------------------
Tractor Price     : ${formatIndianCurrency(vehiclePrice)}
Down Payment      : ${formatIndianCurrency(downPayment)} (${downPaymentPercent}%)
Loan Amount       : ${formatIndianCurrency(loanAmount)}
Interest Rate     : ${interestRate}% P.A.
Tenure            : ${getTenureString()}
---------------------------------------------
Monthly EMI       : ${formatIndianCurrency(monthlyEmi)} / month
Total Interest    : ${formatIndianCurrency(totalInterest)}
Total Amount Paid : ${formatIndianCurrency(totalPayable)}
---------------------------------------------
Calculate your tractor loan at: ${typeof window !== 'undefined' ? window.location.href : 'https://tractordost.com/emi-calculator'}`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="relative flex w-full flex-col gap-6 overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--card-shadow)] backdrop-blur-md md:p-8">
      {/* Accent lighting glow */}
      <div className="pointer-events-none absolute right-0 bottom-0 h-32 w-32 rounded-full bg-[var(--color-brand-orange)]/5 blur-2xl" />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
        <h2 className="text-foreground text-xl font-black tracking-tight uppercase md:text-2xl">
          Calculation Result
        </h2>
        <div className="flex gap-2">
          {/* Share button */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
              copied
                ? 'border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]'
                : 'bg-foreground/5 text-muted border border-transparent hover:border-[var(--color-brand-green)]/20 hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)]'
            }`}
          >
            {copied ? (
              <>
                <Check size={13} /> Copied!
              </>
            ) : (
              <>
                <Share2 size={13} /> Share
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action status banners */}
      {copied && (
        <div className="animate-pulse rounded-xl border border-[var(--color-brand-green)]/25 bg-[var(--color-brand-green)]/10 px-4 py-2.5 text-center text-xs font-bold text-[var(--color-brand-green)]">
          Summary text has been copied to your clipboard.
        </div>
      )}

      {/* EMI CALCULATION HERO */}
      <div className="relative flex flex-col items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/10 bg-gradient-to-br from-[var(--color-brand-green)]/5 to-[var(--color-brand-green)]/15 p-6 text-center">
        <span className="mb-2 rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-[10px] font-black tracking-widest text-[var(--color-brand-green)] uppercase">
          Estimated Monthly Installment
        </span>
        <span className="text-3xl font-black tracking-tight text-[var(--color-brand-green)] md:text-4xl lg:text-5xl">
          {formatIndianCurrency(monthlyEmi)}
          <span className="text-muted text-xs font-black md:text-sm">/month</span>
        </span>
        <p className="text-muted mt-3 flex items-center gap-1 text-[10px] font-bold">
          <Info size={11} /> Actual interest rate and charges vary by bank.
        </p>
      </div>

      {/* RESULTS GRID */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Loan Amount */}
        <div className="bg-foreground/5 flex flex-col gap-1.5 rounded-2xl border border-[var(--border-subtle)] p-4">
          <span className="text-muted text-[10px] font-black tracking-wider uppercase">
            Loan Amount
          </span>
          <span className="text-foreground text-lg font-black">
            {formatIndianCurrency(loanAmount)}
          </span>
          <span className="text-muted text-[9px] font-bold">Price - Down Payment</span>
        </div>

        {/* Total Interest */}
        <div className="bg-foreground/5 flex flex-col gap-1.5 rounded-2xl border border-[var(--border-subtle)] p-4">
          <span className="text-muted text-[10px] font-black tracking-wider uppercase">
            Total Interest
          </span>
          <span className="text-lg font-black text-[var(--color-brand-orange)]">
            {formatIndianCurrency(totalInterest)}
          </span>
          <span className="text-muted text-[9px] font-bold">Interest portion of loan</span>
        </div>

        {/* Total Amount Paid */}
        <div className="bg-foreground/5 flex flex-col gap-1.5 rounded-2xl border border-[var(--border-subtle)] p-4">
          <span className="text-muted text-[10px] font-black tracking-wider uppercase">
            Total Payable
          </span>
          <span className="text-foreground text-lg font-black">
            {formatIndianCurrency(totalPayable)}
          </span>
          <span className="text-muted text-[9px] font-bold">Principal + Interest</span>
        </div>
      </div>
    </div>
  );
};
